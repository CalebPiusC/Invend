# Invend website redesign — implementation and verification record

**Status: implemented and locally verified; ready for review. Not committed, pushed, deployed or approved for live-provider release.**

The public marketing experience has been redesigned without rebuilding the application. The initial repository audit and design plan preceded implementation. This record retains those findings and adds the completed implementation, executed checks, visual review and remaining boundaries.

## 1. Scope and initial audit

Work is restricted to the public marketing experience, its shared brand assets and relevant tests. Existing application behaviour, auth, onboarding, APIs, schemas and business rules are preserved. The baseline records 355 existing files on `arena/eb88ea34-selvora` at `b03c8f04e288acd3ff3a62a0796ae2a0b6ee7ca7`. The 19 protected historical audit/design documents remain untouched and untracked.

### Architecture

- npm workspace: Next.js 16.4.6 App Router, React 19, TypeScript, Tailwind and scoped CSS Modules.
- Existing local Inter and Plus Jakarta Sans, Lucide icons, Sharp/fontkit asset generation, Vitest, Playwright/axe and Prettier were reused. No dependencies were added.
- `/` is the public marketing route. `/app`, `/app?auth=sign-in`, `/app?auth=sign-up`, `/auth/callback`, `/invitations/accept` and `/receipts/shared` retain their existing behaviour. Marketing does not mount a tenant provider or fetch business data.
- The application backend is FastAPI with Supabase/PostgreSQL and Redis. No backend or schema changes belong to this redesign. Backend/onboarding files already modified at the baseline remain byte-for-byte unchanged by this task.
- Reusable code includes the shared brand component/generator, labelled local product demonstrations, integer-kobo pricing checks and the existing sample product image.

### Evidence and truthful positioning

Repository source, the status matrix and the rendered sample workspace were inspected. Sample inbox, approval, catalogue, historical insights, team and billing screens are evidence of UI behaviour, not live-provider acceptance. Initial audit capture scripts used two incorrect selectors; corrected runs captured the loaded inbox, insights and team screens. Those selector timeouts were audit-script errors, not application failures.

| Category                      | Evidence and public treatment                                                                                                                                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented, locally tested   | Tenant/role isolation; inbox/manual replies; deterministic fact lookup and minimum-price checks; approvals/edit/reject/human takeover; order drafts/lifecycle; explicit vendor payment confirmation; immutable/shared receipts. Demonstrate the supported workflow without claiming a production release. |
| Partial or acceptance pending | Hosted auth/onboarding, Gmail/WhatsApp live acceptance, catalogue storage/extraction/CRUD, general settings, event-based insights, team/invitations and subscription billing. Clearly disclose relevant limits.                                                                                           |
| Planned/research              | Instagram/Facebook messaging; TikTok research; live photo extraction; Gemini wording writer; full multilingual generation. Do not depict these as available integrations.                                                                                                                                 |

Customers pay vendors directly. A customer claim or screenshot is not verification. Receipt examples follow explicit sample vendor confirmation. Paystack is for Invend subscriptions in the stated product positioning; the existing conflicting customer-checkout implementation was not silently rewritten by this marketing task.

No confirmed public subscription tiers, prices, limits or trial terms were found. Sample billing offers are not commercial offers. No official public privacy/terms, social profile or contact/support destinations were found. The footer therefore uses real existing product/company/auth links, not invented destinations.

### Assets and references

At audit, the bag icon was shared by React and generated SVG/PNG/ICO assets. The requested chat-bubble/cart symbol supersedes it while preserving all existing asset URLs. The manifest identity `/`, scope `/` and start URL `/app` were retained. Only the existing Home and Onboarding reference images were available; no separate laptop or Zella reference was supplied or reviewed.

## 2. Design system and page composition

- **Palette:** charcoal `#1C1C1C`, gold `#F5B700`, cream `#FFF8E6`, warm white `#FFFEFA`, white `#FFFFFF`. Predominantly light surfaces, cream narrative sections and a distinct charcoal closing CTA. Neutral text/borders support readable hierarchy; gold is an accent, not low-contrast body text.
- **Typography:** locally bundled Plus Jakarta Sans for headings/wordmark and Inter for body/UI. Controlled fluid headings, comfortable line height and compact section labels.
- **Layout:** 1200px main content maximum, fluid 20–72px gutters and 80–128px section rhythm. The header has its own wider alignment. Fine borders and three elevation tokens distinguish subtle, elevated and floating surfaces.
- **Controls:** gold primary actions, charcoal/outlined secondary actions, visible focus, mobile-friendly controls and no hover-only information.
- **Motion:** short control transitions and hero entrance; native scrolling and CSS sticky panels. No scroll hijacking, animation dependency or continuous scroll loop. Reduced motion removes movement, smooth scrolling and overlapping panels.
- **Scope:** marketing styles are local. The existing authenticated application theme and global stylesheet were not redesigned.

Implemented sequence:

1. Full-screen, centred `100svh` hero with `100vh` fallback; copy, two CTAs and a scroll cue only.
2. Separate angled laptop illustration based on the inbox/approval workflow; exactly one connected floating benefit. The phone version recomposes into a readable conversation rather than shrinking a dashboard.
3. Scattered conversation fragments illustrating repetitive questions, follow-ups and unverified payment claims.
4. Connected solution: conversation → vendor facts → reviewed order → payment record/receipt, with the owner above the flow.
5. Eight coordinated interactive feature previews, rather than eight repeated cards.
6. Four progressively overlapping workflow panels: Connect your business; Manage customer conversations; Organise orders and payments; Understand your business.
7. Owner-control explanation and working approve/edit/reject demonstration.
8. Integration map and expandable readiness details: Gmail first, WhatsApp next, Instagram/Facebook later; TikTok research/external handling and SMS limits explicitly qualified.
9. Unpublished pricing, with real signup/sample-workspace destinations and no invented offers.
10. Product-grounded About and accessible FAQ disclosures.
11. Charcoal final CTA without artificial urgency.
12. Real-destination footer and back-to-top control.

## 3. Components, interactions and assets

| Area                 | Implementation                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composition          | `web/components/marketing/homepage.tsx` and `homepage.module.css`; route metadata in `web/app/page.tsx`.                                                               |
| Navigation           | `home-header.tsx`: exactly Home, Features, How it works, Pricing, About, Sign in, Get started, in that order. Section anchors and existing auth query routes retained. |
| Product illustration | New `product-showcase.tsx` and CSS Module; native HTML/CSS with perspective, refined shadow, one benefit and labelled fictional content.                               |
| Feature tour         | New `feature-tour.tsx` and CSS Module; desktop roving tabs with Arrow/Home/End keys, mobile select, coordinated preview state and retained legacy deep links.          |
| Workflow             | New `workflow-steps.tsx` and CSS Module; four CSS-sticky panels with earlier step headers still visible.                                                               |
| Owner demo           | New `owner-control.tsx` and CSS Module; guarded local approval/edit/rejection, explicit no-send results and keyboard focus restoration.                                |
| Shared identity      | `web/lib/brand-mark.ts`, `web/components/brand-icon.tsx` and `scripts/write-brand-assets.mjs`; one chat/cart silhouette and lowercase `invend` wordmark.               |
| Tests                | Updated homepage, brand, PWA and browser acceptance; retained older demonstration coverage in `web/tests/marketing-demos.test.tsx`.                                    |

### Navigation and accessibility

The fixed header starts transparent over the hero, transitions to a blurred/bordered solid surface at its lower boundary and returns to transparent at the top. A 160px boundary guard prevents the hero's bottom scroll cue from passing visibly behind the navigation. Two IntersectionObservers drive header and active-link state; viewport-height-derived section margins and a cancellable resize frame avoid continuous scroll handlers. All intervening sections are observed so a large native jump from the footer back to the workspace cannot leave “About” selected.

Below 1100px, a native modal drawer contains all seven destinations. It locks background scrolling, wraps Tab and Shift+Tab, closes on Escape/selection, restores trigger focus and exits correctly when resized to desktop. Section targets clear the header. Skip-link activation, keyboard tabs/selects, confirmation/result focus, disclosure controls and reduced-motion behaviour were exercised in the browser.

### Meaningful but explicitly fictional demonstrations

- **Inbox:** selecting a customer changes the context and next step; Gmail/WhatsApp examples do not imply live connections.
- **AI assistance:** offers below the known minimum require owner review, not an invented automatic promise.
- **Catalogue:** vendor review is required. Changing stock invalidates confirmation. Review, confirmation and reset have intentional focus targets. No product/photo is persisted.
- **Orders:** agreed details become a reviewable sample draft; the illustration does not create an actual order.
- **Payments and receipts:** a screenshot remains an unverified claim. An explicit sample vendor-verification checkbox and confirmation unlock the receipt; reset relocks it. No bank verification is invented.
- **Insights:** switching metrics changes a labelled fictional dataset with text equivalents. These are historical examples, not performance claims or predictions.
- **Team:** sample assignment and human takeover preserve owner authority. Live invitation/role acceptance remains qualified.
- **Owner decisions:** the customer's ₦20,000 request is below the ₦22,000 minimum for two. Edits accept only ₦22,000–₦24,000, up to two decimals, using integer kobo. ₦1,500 delivery is separate. Approve, edit, reject and reset are local only. The fractional amount ₦23,000.50 is covered.

The laptop, workflow and receipt now share `Tola’s everyday store` and `INV-DEMO-014` from the marketing fixture. This fixes inconsistent illustrative identities without modifying any real business data.

### Brand and PWA assets

Regenerated horizontal/inverse wordmarks, compact/symbol SVGs, SVG/ICO favicon, Apple touch icon, 192/512px install icons and retained legacy asset aliases. The outlined wordmark requires no installed font. The shared mark uses chat lines, a speech tail, cart wheels and restrained gold detail; install assets have mask-safe padding.

The service worker cache advances to `selvora-static-v4`. The technical namespace, manifest identity/scope/start URL, existing application theme/background and offline retry behaviour remain intact. Cache-upgrade tests verify eviction of old Invend caches without deleting another app's cache, and private application pages remain uncached.

No new image generation or external image request is required for the laptop. The existing, labelled AI-generated sample tote is a 40,576-byte WebP, reused with explicit dimensions and lazy loading. Static page composition remains server-rendered; client behaviour is limited to navigation and interactive examples. No new libraries or tenant/API dependencies were introduced.

## 4. Responsive and visual review

Production browser acceptance passed at **320, 375, 390, 430, 768, 900, 1024, 1100, 1280, 1440 and 1920px**. No horizontal overflow was reported in the exercised states.

The feature selector becomes a native select below 900px. The laptop drops its sidebar/list on smaller screens and retains the actual conversation. Workflow panels use normal document flow below 900px, on viewports 719px high or shorter, and with reduced motion. On wider/taller screens they overlap progressively using 36px offsets; geometry tests verify real overlap, visible earlier panels and natural wheel scrolling, not just `position: sticky` declarations.

Rendered images were inspected, including:

- Desktop and phone full-page composition and section rhythm.
- Small-phone, tablet, navigation-breakpoint and large-desktop heroes.
- Actual angled-laptop and overlapping-panel viewport captures.
- All eight preview designs across phone/desktop, plus complex 768/1024px states.
- Catalogue review/confirmation, approved owner decision, gated/unlocked receipt and mobile drawer.
- Problem/solution, integrations, unpublished pricing, About, final CTA and footer.
- Light/inverse wordmarks, symbol at 16/24/32/48px, ICO frames, touch icon and circular mask preview.
- Sign-in, empty onboarding, retained dark application theme and offline screen with the shared symbol.

Full-page mosaics temporarily normalise the fixed header for composition review. Component-only crops omit fixed chrome and an unfocused offscreen skip link to avoid a bundled-headless compositor artefact in beyond-viewport captures. Independent viewport screenshots and assertions test real header/stacking behaviour; skip-link focus and activation were separately verified at four widths. Screenshot normalisation is not used as proof of sticky positioning.

## 5. Executed verification

These are checks performed for this redesign, not copied historical onboarding totals. The final production matrix was rerun after the navigation boundary/jump correction.

| Check                                      | Actual result                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                        | Passed; production build TypeScript also passed.                                                                                                                                                                                                                                                                                                                                                                      |
| `npm test`                                 | **205 tests across 24 files passed** on the final source. Includes 36 homepage, 3 brand and 6 retained marketing-demo tests, plus existing application/onboarding suites.                                                                                                                                                                                                                                             |
| `.venv/bin/python -m pytest api/tests -q`  | **148 passed**, one existing Starlette TestClient/httpx deprecation warning.                                                                                                                                                                                                                                                                                                                                          |
| `node --test tests/onboarding-db.test.mjs` | **10 passed**, including the parent suite and nine native PostgreSQL cases: draft/finish atomicity, compatibility, retries, owner/tenant isolation and invalid/unauthorised rejection.                                                                                                                                                                                                                                |
| `npm run test:pwa`                         | **7 passed**.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `npm run test:security`                    | **8 passed**.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `npm run test:contract`                    | **1 passed**.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `.venv/bin/ruff check api`                 | All checks passed.                                                                                                                                                                                                                                                                                                                                                                                                    |
| Scoped `prettier --check`                  | All 25 redesign text files passed. No ESLint script is configured.                                                                                                                                                                                                                                                                                                                                                    |
| `git diff --check`                         | Passed.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `npm run build`                            | Optimised production build passed; existing route set retained. Prebuild reply-safety evaluation: **120 cases, 50 auto / 70 approval, zero unbacked emitted prices or stock counts**.                                                                                                                                                                                                                                 |
| Production `tests/homepage.mjs`            | All **11 widths**, **163 whole-document axe scans**, no reported violations. Includes all eight previews, keyboard/drawer behaviour, actual sticky overlap, native-jump active navigation, header clearance, reduced motion, owner guardrails, receipt gating, disclosures, auth/utility routes and five app destinations. No reported page errors, failed asset responses or homepage private-business API requests. |
| Production `tests/branding.mjs`            | **390/1440px passed**: homepage/auth/onboarding/workspace/channel/helper/invitation identity, theme compatibility, actual cache upgrade, offline fallback and reconnection.                                                                                                                                                                                                                                           |
| Production `tests/onboarding.mjs`          | **Seven widths**: 320/375/390/430/768/1280/1440; **70 whole-document axe scans passed**. Empty fields, validation, optional values, back/progress retention, channel states, finish/review/exit and scoped theme verified.                                                                                                                                                                                            |
| Production `tests/frontend-demo.mjs`       | Phone onboarding → photo review → approval → takeover/handback → explicit simulated vendor payment → receipt passed. Also checks keyboard/dialog focus, both application themes, 640px low-data photo processing and text-first lists. No live transaction.                                                                                                                                                           |

Development also passed the full 11-width/163-scan matrix earlier, followed by a final 390/1440px targeted run with 31 scans after the header correction. Overlapping runs are not added into a unique-coverage total.

A separate final production console audit exercised 26 phone/desktop states: all eight feature previews and the sign-in, signup, sample workspace, invitation and shared-receipt routes at 390/1440px. It reported no browser console errors or runtime exceptions; its local result is `console-audit.json` in the evidence directory.

One final unit run executed concurrently with browser work exceeded the existing inbox test's 5-second timeout: 204 passed and one timed out. The unchanged complete suite was rerun without concurrent browser load and passed 205/205; no assertion was removed or timeout relaxed. This is recorded rather than treating the timed-out run as a pass.

### Issues found and resolved during acceptance

- Completed owner-result/approval focus handling after an incomplete ref edit was caught by TypeScript.
- Included the visible scroll-cue wording in its accessible name.
- Added explicit forward/reverse Tab wrapping to the mobile modal.
- Restored legacy feature deep-link selection **and scrolling** after a fresh reload.
- Kept catalogue review/confirmation/reset and payment-to-receipt focus transitions usable.
- Preserved fractional-naira formatting and unified fictional store/order identity.
- Fixed stale active navigation after footer-to-workspace jumps and the transparent-header/hero-cue boundary collision exposed by visual review.
- Corrected the browser helper's handling of legitimate response-less same-document hash navigation without suppressing HTTP-status checks.

### Reproduction and evidence

Use the already-running production verification server for the browser suites:

```bash
SELVORA_HOME_URL=http://localhost:3001/ \
  SELVORA_SCREENSHOT_DIR=.next/invend-website-redesign/production \
  node tests/homepage.mjs

SELVORA_TEST_URL=http://localhost:3001/app \
  SELVORA_SCREENSHOT_DIR=.next/invend-website-redesign/production-brand \
  node tests/branding.mjs
SELVORA_TEST_URL=http://localhost:3001/app \
  SELVORA_SCREENSHOT_DIR=.next/invend-website-redesign/production-onboarding \
  node tests/onboarding.mjs
SELVORA_TEST_URL=http://localhost:3001/app node tests/frontend-demo.mjs
```

Transient local evidence is under `.next/invend-website-redesign/`: `production/`, `production-brand/`, `production-onboarding/`, `visual/`, `header-regression/`, `production-build.log`, `production-browser.log`, `production-regressions.log`, `frontend-final.log`, `frontend-concurrent-timeout.log`, `onboarding-db.log` and `scope-audit.json`. This ignored directory is not a published or durable evidence archive; tests can regenerate it. This report and source/tests are the durable handoff.

## 6. Preservation and review scope

The final SHA-256 audit against the 355-file pre-redesign baseline found:

- **28 existing files modified by this redesign**, restricted to marketing, route metadata, shared branding/assets and their tests.
- **10 new redesign files**: eight marketing component/CSS files, retained-demo tests and this report.
- **327 baseline files unchanged**, including the pre-existing onboarding/backend/application changes and all **19 protected historical documents**.
- Protected documents still untracked; no unrelated additions/deletions; index empty.
- Branch remains `arena/eb88ea34-selvora`; HEAD remains `b03c8f04e288acd3ff3a62a0796ae2a0b6ee7ca7`.

The cumulative worktree also contains the onboarding work that was present before this task. Those existing changes must not be mistaken for marketing-driven API/schema edits. No commit, push, pull request, merge, branch switch, history rewrite, database deployment or modification to main/draft PR #3 was performed for this redesign.

## 7. Remaining boundaries and preview

- **Local marketing completion is not production/live-provider approval.** Gmail/WhatsApp still need live acceptance; Instagram/Facebook are planned. TikTok external manual handling is not an integrated Invend fallback. SMS remains unsupported/investigative.
- Live catalogue extraction/storage/CRUD, general settings, some analytics/team acceptance, full multilingual generation and other release-readiness gaps remain outside this task. The public page discloses relevant limits rather than implying completion.
- Public subscription pricing and approved legal/social/contact destinations still require product-owner confirmation. None were invented.
- The pre-existing setup migration remains undeployed. The existing customer Paystack checkout conflict and legacy-null setup/reply-language behaviour were not changed.
- The fresh database regression is the 10-test onboarding subset, **not** a new full 839-test database run. Hosted OAuth, physical devices, real payments and deployed-provider journeys were not exercised.
- Browser testing used local headless Chromium. It is not physical-device, Safari/Firefox, field-performance or WCAG certification. Local synthetic timing diagnostics are not release performance guarantees; ResourceTiming byte counters were unavailable in this bundled browser, so no zero-JavaScript or transfer-size claim is made.
- Development preview remains running at **`http://localhost:3000`**; the verified production build remains running at **`http://localhost:3001`**, both bound to `0.0.0.0`. Both returned HTTP 200 with the new homepage title at handoff. Use the corresponding Arena live-preview port; local success does not establish access from the external Arena preview panel. No fresh external-panel success is claimed, and the healthy development server was not restarted to diagnose it.
