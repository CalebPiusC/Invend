# Invend — hero and interactive integrations

## Outcome

Implemented the two consecutive opening sections on **`arena/eb88ea34-selvora`**, without publishing or changing the approved navbar implementation.

- A centred, content-sized hero uses the supplied copy and existing auth/workflow destinations. A prominent mobile workspace overlaps a supporting dashboard at the front/right.
- A discreet PWA installation control uses a real browser-provided prompt when available, otherwise dismissible platform-specific instructions.
- The interactive integration network now follows the hero immediately. Channels, Invend’s own companion and portable-file formats have distinct, explicit readiness boundaries.
- Existing feature demonstrations, pricing disclosures, owner/payment safeguards, application behaviour and unrelated work remain intact.

**No commit, push, pull request, merge, deployment or database migration was performed.** HEAD remains `b03c8f04e288acd3ff3a62a0796ae2a0b6ee7ca7`.

## 1. Audit before implementation

A guarded baseline was created before this task’s edits at `/tmp/invend-hero-integrations-baseline.json`: **372 file hashes**, including the finished navigation work, earlier website work, pre-existing API/application/onboarding changes and 19 protected historical documents. This is a separate baseline from the previous navigation task and was not overwritten.

The audit inspected the actual homepage, showcase, navigation and integration components; local fonts; manifest and service worker; workspace install handling; receipt PDF implementation; WhatsApp helper permissions/confirmation flow; and existing unit/browser tests. Before-state screenshots at 1440px and 390px are under `.next/invend-hero-integrations/audit/`.

Findings that governed the work:

- The navbar already complied: desktop begins at **1100px**, with the logo, central links and account actions always visible. Scrolling only changes pill styling/padding. Its runtime/CSS did not need another redesign.
- The previous opening was a full-viewport copy-only hero followed by a separate laptop section. Integrations appeared much later. The new task explicitly superseded that composition.
- The homepage had no installation control. The existing workspace already registered `/sw.js` and captured `beforeinstallprompt`.
- Receipt PDF download was implemented. No implemented CSV/XLSX exporter or direct Google Sheets/Docs connector was found in the inspected source.
- Gmail/WhatsApp source and sandbox flows were not evidence of accepted live-provider availability. The WhatsApp helper was a separate, permission-bound companion, not the vendor’s business inbox.

## 2. Hero and product illustration

The opening uses:

> YOUR BUSINESS, BETTER CONNECTED
>
> Every customer conversation. Every order. One workspace.
>
> Bring your customer conversations, product catalogue and orders together. Let AI handle routine enquiries while you stay in control of your business.

**Get started** still goes to `/app?auth=sign-up`; **See how it works** still goes to `#how-it-works`. The former `#workspace` destination remains on the illustration inside the hero. The illustration also retains the `/app` sample-workspace link.

`home-hero.tsx` and its CSS module provide the centred copy, CTA layout and scoped near-white/emerald palette. `product-showcase.tsx` and its CSS module provide:

- A supporting inbox dashboard behind/left, with a selected conversation, owner-review boundary and relevant product/order context—not unrelated charts or invented business metrics.
- A deliberately mobile interface in a realistically proportioned, prominent phone at the front/right. It is not a reduced desktop screenshot.
- The existing fictional Tola/Amaka/adire-tote narrative and product image. The below-floor offer still requires review; a proposed reply is visibly **not sent** and the conversation is **not an order yet**.
- Explicit illustrative/fictional disclosures. Illustrated Approve/Edit/navigation items are noninteractive spans, not fake live controls.
- Finite, staggered entrances and soft layered shadows. The phone is simplified to a fade on small screens; reduced-motion preferences remove animation and hover scaling.

The opening does not force a full-viewport copy block. Desktop first-fold checks verify that copy, CTAs and the upper phone/dashboard are visible together. Mobile captions clear the phone rather than overlapping it.

No dependency or font was added. Existing local Plus Jakarta Sans/Inter, Lucide icons, the shared Invend symbol and existing photo are reused. The remaining homepage/application theme was not recoloured.

### CTA contrast exception

The requested charcoal label conflicts with normal-text AA contrast on the specified emerald backgrounds:

| Label / background     | Contrast | Normal-text AA |
| ---------------------- | -------- | -------------- |
| `#1C1C1C` on `#16845B` | 3.64:1   | Fails          |
| `#1C1C1C` on `#116B49` | 2.62:1   | Fails          |
| White on `#16845B`     | 4.68:1   | Passes         |
| White on `#116B49`     | 6.52:1   | Passes         |

The hero uses **white primary-button text**, consistent with the preserved navbar’s announced accessibility exception. The exact emerald background/dark border, 11px radius, comfortable target, visible focus and restrained hover/active behaviour remain. This exception was communicated before implementation; it is **not represented as an explicitly approved palette amendment**.

## 3. PWA installation

`hero-install.tsx`, its CSS module and `web/lib/pwa-install.ts` implement the marketing control without refactoring the existing workspace flow.

- The existing service worker is registered only in a secure context. Registration failure does not break manual guidance.
- A real `beforeinstallprompt` event is deferred and invoked only on deliberate activation. It is consumed once; the component never manufactures a native browser prompt.
- Accepted, dismissed and failed prompt outcomes are distinguished. “Installation requested” is not presented as installation success.
- The control hides on known installed signals: standalone/minimal-ui/window-controls-overlay display mode, iOS `navigator.standalone`, or `appinstalled`.
- iPhone/iPad, Android, Safari on Mac, Edge, Chrome/Chromium and generic-browser guidance are provided. Desktop wording distinguishes this device from a separate phone.
- Native dialog behaviour provides modal focus/inertness, Escape/backdrop/close dismissal and restoration of focus and the previous body scroll state. Mobile guidance is tap-accessible; desktop has hover/focus feedback and a tooltip.
- The instructions identify an **installed web app**, not a native Android/iOS app, and state that business use still needs an internet connection.

The manifest identity, `/app` start URL, `/` scope, install icons, service-worker version/policy and application theme are byte-preserved. Actual browser registration confirmed that the current cache contains only `/offline.html` and `/invend-icon-192.png`; no authenticated page or tenant API data was added.

**Detection boundary:** browsers do not universally expose an installation made elsewhere when a site is viewed in a normal tab. The control hides when installation is known; it does not invent certainty for unobservable installation state or store a potentially stale “installed” flag. Eligibility and native prompting remain browser/OS decisions. Embedded previews may withhold installation; use a supported browser with Invend opened directly in its own top-level tab for device acceptance.

## 4. Interactive integrations and truthful readiness

The section now immediately follows the hero:

> Your business tools, finally working together.
>
> Bring customer conversations into Invend, keep business operations connected, and take your important information wherever you need it.

`integration-data.ts` is the typed public-readiness registry. These are **readiness labels, not account connection states**.

| Item                           | Public label | Evidence and boundary                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gmail                          | Coming soon  | First planned live channel. OAuth/message pipeline exists; Google configuration and authorised live acceptance remain pending.                                                                                                                                          |
| WhatsApp Business              | Coming soon  | Visually emphasised, second major channel. Vendor’s own business account; Meta approval, business setup and live-delivery validation remain required.                                                                                                                   |
| Instagram                      | Planned      | Messaging implementation and Meta review still required. Fictional conversations are not a live connection.                                                                                                                                                             |
| Facebook                       | Planned      | Future Messenger conversations; no implemented/approved live messaging connection claimed.                                                                                                                                                                              |
| Invend WhatsApp Assistant      | Coming soon  | A separate companion for the vendor, using Invend’s own symbol. Limited source includes today’s order count and owner/manager stock or price instructions with explicit YES confirmation. Live setup/validation and wider assistant tasks are not claimed as available. |
| Receipt PDFs                   | Available    | Actual download of issued, payment-confirmed receipts. A file format, not a third-party connection or general report exporter. Sample receipts are watermarked.                                                                                                         |
| CSV / Excel-compatible exports | Planned      | CSV/XLSX export is not implemented. Future downloads are explicitly distinct from direct Google Sheets/Docs integration, which is not available or implied.                                                                                                             |

Relevant source includes `api/app/channels/gmail.py`, `api/app/whatsapp/{api,service,signup,instructions}.py`, `web/components/orders/receipt-view.tsx` and `web/lib/receipts/pdf.ts`.

The diagram has four primary channels, a secondary Invend companion and two smaller file-format nodes. Google Sheets/Docs are not drawn as connected services. Paystack is not in the communication network. Existing billing/customer-payment boundaries remain unchanged. TikTok research and unsupported/exploratory SMS remain disclosed in the readiness details, without being promised rollout nodes.

### Interaction and motion

- Hover/focus reveals one information panel; click/Enter pins it. Only one is open.
- Arrow keys, Home/End, Tab, Escape, outside interaction and explicit close are supported. Close restores focus without reopening; leaving the network by keyboard dismisses without stealing focus.
- Pointer travel has a 180ms grace period. A stationary pointer exposed by closing a panel cannot immediately reopen an underlying node.
- Desktop panels anchor nearby and flip/clamp within the real viewport, including short windows. Close/change controls remain hittable above following page content and below the navbar.
- Below 700px the diagram reflows into a readable two-column network. A non-modal, bounded bottom panel offers close and previous/next controls; it does not lock the page or require selecting obscured nodes. Action targets are 44px.
- Two slow, ten-second illustrative dots run only while the network is in view. A visible pause/resume control is available. Reduced motion removes movement; the small-screen diagram uses simpler static connectors.
- Lines/dots are explicitly described as a roadmap, **not live sync or traffic**.

The section ends with the requested transition toward the existing product content, rather than building another unrelated feature section.

### Brand artwork

Four original SVGs are served locally, unchanged: WhatsApp green, Gmail’s established multicolour M, Instagram’s gradient and Facebook blue. Combined payload is **10,332 bytes**.

WhatsApp was sourced from its first-party Node.js SDK website repository. Gmail/Instagram/Facebook were sourced from pinned SVGL brand-artwork files, **not directly from Google/Meta brand portals**. The unverified recent Gmail gradient replacement was not used. No paths were AI-generated, redrawn, traced or recoloured.

Exact pinned URLs, hashes and trademark/provenance notes are in [`web/public/images/integrations/README.md`](../web/public/images/integrations/README.md). Browser tests verify all four checksums and reject active/external SVG resources. Logo use identifies the roadmap tools; it does not claim endorsement, partnership or provider approval.

## 5. Executed verification

These are local checks of the working tree/build, not deployment or live-provider acceptance.

| Check                                             | Actual result                                                                                                                                                                                                                            |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend suite                                    | **256 tests / 26 files passed**, including 29 new hero/PWA/integration tests; latest full run 89.34s.                                                                                                                                    |
| TypeScript                                        | Passed.                                                                                                                                                                                                                                  |
| Production build                                  | Passed. Existing prebuild safety evaluation: **120 messages, 50 auto / 70 approval, zero unbacked emitted prices or stock counts**.                                                                                                      |
| PWA / browser-environment security / API contract | **7 / 8 / 1 tests passed**.                                                                                                                                                                                                              |
| New hero/integration browser suite                | **15 widths / 162 whole-document axe scans passed**; keyboard, pointer, touch emulation, installed-state signals, synthetic prompt outcomes, real SW registration, short windows, pause/reduced motion, original assets and no overflow. |
| Preserved navigation regression                   | **12 widths / 92 whole-document axe scans passed**; desktop non-collapse, mega menu, mobile drawer, focus handoff, hashes/history, all eight feature previews and real destinations.                                                     |
| Homepage regression                               | **11 widths / 163 whole-document axe scans passed**; existing feature/owner/payment/receipt gates, disclosure/pricing honesty, normal/reduced motion, auth/utility routes and application destinations.                                  |
| Branding/offline regression                       | **390px and 1440px passed**; auth/application branding, helper distinction, cache upgrade, offline fallback and reconnection.                                                                                                            |
| Onboarding regression                             | **7 widths / 70 whole-document axe scans passed**; validation, retained entries, channel honesty, preview/finish/review/exit.                                                                                                            |
| Phone commerce journey                            | Passed: sample onboarding → photo product → approval → takeover/handback → explicit payment → receipt, keyboard and low-data behaviour.                                                                                                  |
| Receipt PDF                                       | Production browser generated/downloaded a real **182,438-byte, one-page PDF**, titled `Receipt #0013 · Adire by Tola`, with subject `Order order-1 · SAMPLE DATA · Not proof of payment`.                                                |
| Full receipt/share journey                        | Passed on the existing **`DATA_MODE=mock` development server**: explicit payment, restock, delivery, immutable receipt, PDF, fresh-session sample share and delivery message.                                                            |
| Scope / formatting                                | Guarded baseline audit and `git diff --check` passed; scoped Prettier check covers all 20 changed/new text files. Original SVG bytes are intentionally not reformatted.                                                                  |

Hero/integration widths: **320, 375, 390, 430, 640, 699, 700, 768, 900, 1024, 1099, 1100, 1280, 1440, 1920px**. Additional short-window cases: **1440×600, 844×390, 390×480**.

The four principal browser matrices account for **487 passing whole-document axe scans**. The marketing suites reported no runtime/console/asset failures or tenant API requests. Automated checks are not screen-reader certification.

### Receipt test environment distinction

The first complete orders-browser run against port 3001 passed payment/delivery/PDF assertions but stopped when it expected an unsigned sample receipt to load in a fresh session. That production process has no `DATA_MODE=mock`; `web/app/receipts/shared/page.tsx` correctly denies those samples by default. This was an environment mismatch, not fixed by weakening the receipt/privacy guard. The unchanged full suite then passed against port 3000, where mock mode was already explicitly configured. No receipt, order or backend source was modified.

### Issues found and corrected during verification

- Mobile phone/caption overlap: corrected the illustration’s reserved height.
- Accessible names omitting visible node text and the normal-motion pause label: aligned names with visible labels; added normal-motion scans.
- A closed panel reopening under a stationary pointer: suppressed synthetic re-entry until genuine pointer movement.
- Keyboard departure being cancelled by pointer travel: made definite external focus handoff dismiss immediately.
- A following readiness summary intercepting a panel close action at 375px: corrected the diagram’s stacking context and added actual hit-testing assertions.
- A 2px horizontal overflow at 900px caused by the ambient pseudo-element: bounded the background to its container, rather than masking overflow globally.
- Desktop/landscape panel clipping: added viewport-aware placement and bounded scrolling with a visible close control.

### Actual visual review

Reviewed rendered desktop/mobile heroes, the first fold at 320px, mobile/tablet/desktop network reflow, all seven desktop panels, mobile export/assistant panels, iPhone/Android instruction dialogs, short-window installation, normal-motion pause state, original logo artwork and the downloaded-receipt view. Pointer-neutral closed-diagram captures were also inspected; a hover-open diagnostic capture is not confused with the default touch state.

Evidence is under `.next/invend-hero-integrations/`: `production/`, `navigation/`, `homepage/`, `branding/`, `onboarding/`, `orders/`, `orders-mock/`, `visual/` and named test/build logs. These screenshots, logs, PDFs and the `/tmp` baseline are transient verification artifacts, intentionally excluded from Git/snapshots; source tests and this handoff are durable.

## 6. Scope and preservation

Final comparison against the before-task baseline:

- **372 / 372 baseline files present**.
- **10 modified**, **362 byte-preserved**, **14 new**.
- **19 protected historical documents unchanged and still untracked**.
- Approved navbar runtime/CSS, mega-menu/previews, shared brand geometry/assets, feature-tour implementation, service worker, manifest and workspace implementation byte-preserved.
- All unrelated pre-existing work and prior handoffs preserved. The repository’s cumulative diff is therefore larger than this task’s scoped changes.
- Empty Git index, unchanged HEAD and unchanged active branch. No operations against main or the unrelated draft PR #3.

The ten modified files are the homepage composition/metadata; showcase pair; integration pair; existing homepage/navigation unit tests; homepage browser test; and branding browser test. The branding test now seeds legacy caches **before** the first homepage worker registration, preserving its actual cache-upgrade assertion.

The fourteen new files are the hero pair, installation pair, platform helper, typed integration registry, unit/browser test files, this handoff, four SVG assets and their provenance note. No package/lockfile, backend, schema or application feature file was added or changed by this task.

The read-only verification script/output are `.next/invend-hero-integrations/scope-audit.py` and `scope-audit.json`; the guarded baseline was never recreated after edits.

## 7. Reproduction and preview

The healthy development server remains on **0.0.0.0:3000** with `DATA_MODE=mock`. The final production build remains on **0.0.0.0:3001**, labelled **Invend hero and integrations** in the preview UI. The development server was never restarted for embedded-preview diagnosis. Production processes were replaced only to load intentional new verification builds.

Do not start duplicate servers over the running ports. The production startup command, when needed in a fresh environment, is `npm run start -w web -- --port 3001` after `npm run build`.

```sh
npm test
npm run typecheck
npm run test:pwa
npm run test:security
npm run test:contract
npm run build

SELVORA_HOME_URL=http://localhost:3001/ \
  SELVORA_SCREENSHOT_DIR=.next/invend-hero-integrations/production \
  node tests/hero-integrations.mjs

SELVORA_HOME_URL=http://localhost:3001/ \
  SELVORA_SCREENSHOT_DIR=.next/invend-hero-integrations/navigation \
  node tests/navigation.mjs

SELVORA_HOME_URL=http://localhost:3001/ \
  SELVORA_SCREENSHOT_DIR=.next/invend-hero-integrations/homepage \
  node tests/homepage.mjs

SELVORA_TEST_URL=http://localhost:3001/app \
  SELVORA_SCREENSHOT_DIR=.next/invend-hero-integrations/branding \
  node tests/branding.mjs

SELVORA_TEST_URL=http://localhost:3001/app \
  SELVORA_SCREENSHOT_DIR=.next/invend-hero-integrations/onboarding \
  node tests/onboarding.mjs

SELVORA_TEST_URL=http://localhost:3001/app node tests/frontend-demo.mjs

# This complete unsigned-sample sharing test requires an explicitly mock-mode server.
SELVORA_TEST_URL=http://localhost:3000/app \
  SELVORA_SCREENSHOT_DIR=.next/invend-hero-integrations/orders-mock \
  node tests/orders-mobile.mjs
```

For focused reruns, the new browser script accepts `SELVORA_HERO_WIDTHS`; navigation/homepage retain their existing width controls. Their final acceptance runs used the full matrices, not narrowed substitutes.

### Remaining acceptance boundaries

- Native browser-install events/outcomes were simulated for deterministic lifecycle checks; real service-worker/cache behaviour was tested. No physical iPhone/Android installation or operating-system prompt approval is claimed.
- Chromium viewport, touch and user-agent emulation is not physical-device or Safari-engine testing. No screen-reader certification or deployed performance benchmark is claimed.
- No live Gmail/Meta/helper acceptance, provider approval or new export capability was introduced.
- No deployment or fresh success accessing the external Arena proxy/panel was established. Local HTTP/browser success and running preview ports do not prove external access.
- Full backend/Ruff/database suites were not rerun for this frontend task. Existing backend work and the undeployed onboarding migration remain preserved, not newly accepted or deployed.
