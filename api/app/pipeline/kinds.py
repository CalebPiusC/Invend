"""Single source of truth for background job kinds.

This set must exactly match ``Worker.handlers`` keys. Any drift is a
critical defect: jobs would be enqueued but never claimed. ``claim()``
and ``Worker`` both import this module; adding a new kind requires
updating this set **and** adding a handler — the startup assertion in
``Worker`` will fail otherwise.
"""

SUPPORTED_KINDS = frozenset(
    {
        "ingest",
        "gmail_sync",
        "gmail_watch",
        "send",
        "reply",
        "checkout",
        "payment",
        "refund",
        "order_message",
        "reservation_expiry",
        "takeover_timeout",
        "holding_reply",
        "followup",
        "restock",
        "billing_payment",
        "translation",
        "invitation_email",
    }
)
