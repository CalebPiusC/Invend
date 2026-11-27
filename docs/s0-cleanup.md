# S0 cleanup and unresolved work

[Status matrix](status-matrix.md) is the sole capability status authority.

## Completed in this audit

- Inventoried product/cross-cutting capabilities, every original frontend contract
  decision and every additional registered FastAPI route. Live/release columns
  remain no without actual provider evidence and explicit approval.
- Reconciled endpoint decisions against source handlers; removed obsolete proposed
  vendor order/reservation creation HTTP endpoints from the implementation target.
- Documented the full original B1 catalogue/settings gap list and S1 acceptance.
- Archived the old F0–F7 sample contract prose and B0 gap comparison as historical,
  not competing current-status documents. Current contract declarations stay generated.
- Replaced old roadmap sequencing/universal-cursor/universal-idempotency promises
  with current evidence and limitations. Updated phase guides to point to the matrix.
- Fixed hard-coded role-matrix test count generation to use the actual matrix size.
- Fixed editable API package discovery (`app*` only). Previously `pip install -e
  './api[test]'` failed with multiple top-level packages `app`/`evals`.

## Legacy-brand rename audit

Two earlier rename passes are recorded here. The first renamed the original internal
codename to the interim name; the second (current) pass removed the interim name
entirely so the product is only ever called **Invend**.

### Pass 2 — interim name → Invend (complete)

`selvora` no longer appears anywhere in tracked source, tests, scripts, migrations,
configuration or docs. No compatibility alias is kept for brand-facing strings:

- Package/workspace names: `selvora` → `invend`, `@selvora/web` → `@invend/web`,
  `selvora-api` → `invend-api`.
- Database and infrastructure identifiers: PostgreSQL role `selvora_service` →
  `invend_service`, login `selvora_pipeline` → `invend_pipeline`, Compose database
  and user `selvora` → `invend`, backup pg service `selvora_backup` → `invend_backup`.
  Migrations are edited in place; there is no separate compatibility migration
  because no production database exists yet.
- Redis key namespaces: `selvora:*` → `invend:*`.
- User-visible identifiers that migrate safely in code: the theme preference key
  `selvora-theme` → `invend-theme`, and the service-worker cache namespace
  `selvora-static-*` → `invend-static-v6` (activation evicts every legacy
  `selvora-static-*` and `invend-static-v5` cache).
- Generated Message-ID domains: `*@selvora.invalid` → `*@invend.invalid`.
- Internal logger name, SVG asset (`web/public/selvora-mark.svg` →
  `invend-mark.svg`), temporary directories and screenshot artifact paths.
- Test environment variables: `SELVORA_TEST_URL`, `SELVORA_HOME_URL`,
  `SELVORA_SCREENSHOT_DIR`, `SELVORA_*_WIDTHS` → `INVEND_*` equivalents.
- Branding assertions that used the interim name as the forbidden string now
  forbid the original codename and positively expect Invend.

Deliberate exceptions, documented rather than renamed:

- The historical names above appear only in this audit and in test fixtures that
  prove legacy service-worker caches are evicted and the theme key still migrates.
- Historical commit objects, branch names and PR URLs are immutable evidence.
  This document's own earlier pass-1 note about `arena/720fa19c-sift` and
  `/home/user/Sift` is retained as history.
- The checkout root `/home/user/Invend` and branch name are fixed by Arena and
  must not be renamed.

### Pass 1 — original codename → interim name

- `tests/insights-mobile.mjs`: `/tmp/sift-f6` → `/tmp/invend-f6`.
- `tests/restore-native.test.mjs`: temporary prefix `sift-restore-` → `invend-restore-`.

No customer history, receipts, provider references or encryption contexts were
rewritten, because none were keyed on the brand name.

## Unfinished — not silently included in S0

**S1:** new catalogue photo/storage/extraction/batch/detail/update/archive/variant/
stock endpoints, full settings/preferences and actual API-backed browser coverage.
Only the restricted typed-edit/policy subset exists. See B1 audit.

**S2:** Gemini wording-only writer, multilingual generation under unchanged B3
verifier/lanes, safe fallback, 200-message database-backed-number evaluations and
wording-call token/cost ledger. No such writer was added in S0.

**Existing release blockers:** physical retention/deletion, real provider acceptance,
paging/PITR configuration, actual mobile checks and real signup-to-receipt demo.
The no-go decision is unchanged. Do not remove a truthful Sample data banner merely
to make a sample-only screen look production-connected.
