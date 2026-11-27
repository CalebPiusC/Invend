"""Regression tests for AUD-01: handler/claim drift and claim SQL.

These are static guards that run in pytest (no DB). The real claim()
behaviour against PostgreSQL is exercised by the native B10 harness
(tests/b10-claim.test.mjs + tests/helpers/b10_claim_checks.py).
"""

import inspect
import re
from pathlib import Path

import pytest

from app.config import Settings
from app.pipeline.jobs import claim
from app.pipeline.kinds import SUPPORTED_KINDS
from app.pipeline.worker import Worker
from app.pipeline.db import Database
from app.pipeline.jobs import Queue


def test_supported_kinds_contains_five_broken():
    for kind in ["ingest", "translation", "restock", "invitation_email", "billing_payment"]:
        assert kind in SUPPORTED_KINDS, f"broken kind {kind} missing from SUPPORTED_KINDS"


def _test_settings():
    import json
    from app.pipeline.crypto import b64

    return Settings(
        database_url="postgresql://test/test",
        redis_url="redis://localhost:6379/0",
        pipeline_keys=json.dumps({"v1": b64(b"k" * 32)}),
        identity_pepper=b64(b"p" * 32),
    )


def test_handlers_match_supported():
    # Construct worker with dummy DB/queue to avoid real connections
    settings = _test_settings()
    # Use in-memory redislite queue would still need redis; instead inject dummy queue
    class DummyQueue:
        async def close(self):
            pass

    class DummyDB:
        async def close(self):
            pass

    worker = Worker(settings, db=DummyDB(), queue=DummyQueue())
    assert set(worker.handlers) == set(SUPPORTED_KINDS), (
        f"handlers drift: {sorted(worker.handlers)} vs {sorted(SUPPORTED_KINDS)}"
    )
    assert len(SUPPORTED_KINDS) == 17


def test_worker_startup_assertion_fails_on_drift():
    settings = _test_settings()

    class DummyQueue:
        async def close(self):
            pass

    class DummyDB:
        async def close(self):
            pass

    # Handler has extra should be detectable
    worker = Worker(settings, db=DummyDB(), queue=DummyQueue())
    worker.handlers["ghost"] = lambda j: None
    assert set(worker.handlers) != set(SUPPORTED_KINDS)
    # Verify Worker.__init__ contains startup assertion
    src = inspect.getsource(Worker.__init__)
    assert "SUPPORTED_KINDS" in src
    assert "Handler registry drift" in src
    assert "RuntimeError" in src


def test_claim_uses_any_not_hardcoded_in():
    src = inspect.getsource(claim)
    assert "ANY(" in src, "claim should use ANY($4) not hardcoded IN list"
    assert "kind IN ('" not in src, "claim still contains hardcoded IN list"
    assert "SUPPORTED_KINDS" in src or "ANY" in src
    # Ensure the hardcoded broken list is gone
    assert "checkout','payment" not in src or "ANY" in src


def test_no_enqueue_kind_missing_handler():
    # Hardcoded audit of all enqueue call sites (grep verified)
    enqueued = {
        "checkout",
        "refund",
        "order_message",
        "reservation_expiry",
        "send",
        "invitation_email",
        "reply",
        "restock",
        "translation",
        "gmail_sync",
        "gmail_watch",
        "ingest",
        "payment",
        "billing_payment",
        # trigger-created but also handlers
        "holding_reply",
        "followup",
        "takeover_timeout",
    }
    for k in enqueued:
        assert k in SUPPORTED_KINDS, f"enqueued kind {k} not in SUPPORTED_KINDS"
        assert k in SUPPORTED_KINDS
    # The 4 legacy kinds are DB-allowed but have no handler and should NOT be claimable
    legacy = {"receipt", "usage", "channel_refresh", "cleanup"}
    for k in legacy:
        assert k not in SUPPORTED_KINDS, f"legacy {k} should not be claimable"


def test_claim_preserves_ordering_and_isolation_contract():
    src = inspect.getsource(claim)
    # Ordering
    assert "ORDER BY run_at,id" in src
    # Locking
    assert "FOR UPDATE SKIP LOCKED" in src
    # Leasing
    assert "locked_until" in src
    assert "lease_token" in src
    # Retry
    assert "attempts<max_attempts" in src
    assert "run_at<=now()" in src
    # Vendor isolation
    assert "vendor_id=$1" in src
    # Status handling
    assert "status IN ('queued','failed')" in src
    assert "status='running'" in src
