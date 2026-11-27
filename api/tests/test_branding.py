"""Brand-facing copy only; all provider/database calls are mocked."""

import json
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.extras import providers
from app.main import app
from app.pipeline import api as pipeline_api
from app.whatsapp.service import helper_account, helper_instruction


def test_api_documentation_uses_invend():
    assert TestClient(app).get("/openapi.json").json()["info"]["title"] == "Invend API"


@pytest.mark.asyncio
async def test_invitation_email_rebrands_copy_without_changing_delivery_contract(monkeypatch):
    requests = []

    def handle(request):
        requests.append(request)
        return httpx.Response(200, json={"id": "fixture-invitation"})

    monkeypatch.setattr(
        providers, "client", lambda: httpx.AsyncClient(transport=httpx.MockTransport(handle))
    )
    settings = Settings(email_api_key="fixture-only", email_from="Invend <team@example.test>")
    url = "https://example.test/invitations/accept#fixture-token"
    result = await providers.email(
        settings, "member@example.test", "Tola", url, "fixture-idempotency"
    )
    assert result == "fixture-invitation"
    request = requests[0]
    message = json.loads(request.content)
    assert message["subject"] == "Your Invend team invitation"
    assert "invited to an Invend workspace" in message["text"]
    assert "expires in 7 days" in message["text"]
    assert url in message["text"]
    assert "selvora" not in message["text"].lower()
    assert message["to"] == ["member@example.test"]
    assert request.headers["Idempotency-Key"] == "fixture-idempotency"


@pytest.mark.asyncio
async def test_gmail_callback_names_invend_after_the_existing_oauth_completion(monkeypatch):
    complete = AsyncMock()
    monkeypatch.setattr(pipeline_api.oauth, "complete", complete)
    runtime = SimpleNamespace()
    response = await pipeline_api.callback(runtime, state="fixture-state", code="fixture-code")
    complete.assert_awaited_once_with(runtime, "fixture-state", "fixture-code")
    assert "Return to Invend" in response.body.decode()
    assert "Initial email sync is queued" in response.body.decode()


@pytest.mark.asyncio
async def test_linked_helper_names_invend_and_still_requires_confirmation():
    connection = SimpleNamespace(fetchrow=AsyncMock(return_value={"id": "fixture-link"}))
    reply = await helper_instruction(
        connection, "fixture-vendor", "fixture-member", "fixture-hash", "", True
    )
    assert reply.startswith("Your Invend helper is linked.")
    assert "every change needs YES confirmation" in reply


@pytest.mark.asyncio
async def test_new_helper_display_name_changes_without_changing_account_identity():
    connection = SimpleNamespace(fetchval=AsyncMock(return_value="fixture-account"))
    assert await helper_account(None, connection, "fixture-vendor") == "fixture-account"
    sql, vendor, external_id = connection.fetchval.call_args.args
    assert "'Invend helper'" in sql
    assert vendor == "fixture-vendor"
    assert external_id == "helper:fixture-vendor"
    assert "ON CONFLICT(channel,external_account_id)" in sql
