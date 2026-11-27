"""Standalone runner for B10 claim checks. Used by Node native test."""

import asyncio
import json
import os
from uuid import UUID

import httpx
from redislite import Redis
from app.auth import Identity, current_user
from app.config import Settings, get_settings
from app.main import app
from app.pipeline.api import Runtime, runtime
from app.pipeline.crypto import b64
from app.pipeline.worker import Worker
import app.pipeline.worker as worker_module
from app.pipeline.tokens import adapter_for


async def main():
    redis = Redis(serverconfig={"port": "0"})
    socket = redis.connection_pool.connection_kwargs["path"]
    settings = Settings(
        database_url=os.environ["DATABASE_URL"],
        redis_url=f"unix://{socket}",
        pipeline_enabled=True,
        pipeline_keys=json.dumps({"v1": b64(b"k" * 32)}),
        identity_pepper=b64(b"p" * 32),
        pipeline_lease_seconds=2,
    )
    rt = Runtime(settings)
    fixtures = json.loads(os.environ["B2_FIXTURE"])
    f = fixtures["own"]
    vendor = UUID(f["vendor"])
    account = UUID(f["ids"]["channel_accounts"])
    other_vendor = UUID(fixtures["other"]["vendor"])
    user = UUID(f["users"]["owner"])
    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[runtime] = lambda: rt
    app.dependency_overrides[current_user] = lambda: Identity(id=user, email="test@example.test")
    try:
        worker = Worker(settings, db=rt.db, queue=rt.queue)
        # fake adapter so send jobs don't need real http
        class FakeGmail:
            sends = 0

            async def find_sent(self, rfc):
                return None

            async def send(self, outgoing):
                self.sends += 1
                return "provider-sent-b10"

        async def fake_adapter(*args):
            return FakeGmail()

        worker_module.adapter_for = fake_adapter

        # helper execute that uses real claim? But b10 run does claim itself; we provide a wrapper for legacy expects
        async def execute(jid):
            async with rt.db.transaction(vendor) as (conn, _):
                job = await conn.fetchrow(
                    "UPDATE jobs SET status='running',attempts=attempts+1,lease_token=$2,locked_until=now()+interval '60 seconds' WHERE id=$1 RETURNING *",
                    jid,
                    UUID(int=0),
                )
            await worker.run_job(job)

        headers = {"X-Vendor-Id": str(vendor), "Idempotency-Key": "b10-claim-0001"}
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="https://test", headers=headers) as client:
            from b10_claim_checks import run as b10

            await b10(rt, worker, vendor, account, client, execute, other_vendor)
        print("B10 claim parity and workflow verification passed via real claim")
    finally:
        await rt.queue.close()
        await rt.db.close()
        redis.shutdown()


asyncio.run(main())
