# Invend — premium navigation redesign

**Status: implemented, visually reviewed and locally verified. No commit, push, PR or deployment.**

This is a focused navigation/identity change. The completed marketing page design, authenticated application theme, business logic and pre-existing onboarding/API/schema work are preserved. The CTA uses white text as an explicit contrast exception, explained below.

## 1. Audit before implementation

- Working branch: `arena/eb88ea34-invend`; unchanged HEAD: `b03c8f04e288acd3ff3a62a0796ae2a0b6ee7ca7`.
- A new preservation baseline was captured **before navigation changes**: 365 SHA-256 file hashes in `/tmp/invend-navigation-baseline.json`, including 19 protected historical documents. The previous website task's baseline was not used as this task's allowlist.
- The original header was full-width, with seven links, a late hero-exit solid state and a native mobile dialog. It already provided section tracking, background locking and real authentication destinations; these behaviours were retained or deliberately extended rather than replaced with a new routing system.
- Existing stack: Next.js App Router, React 19, TypeScript, CSS Modules and Lucide. Local Plus Jakarta Sans 500/600/700 and Inter 400/500/600 were already loaded. **No dependency, font file, external script or public route was added.**
- The eight-feature tour already provided labelled frontend demonstrations and `feature-panel-0` through `feature-panel-7` IDs. The menu uses those existing destinations. Its previews share the existing fictional sale data and sample product photo, not account data.
- Shared symbol geometry, React rendering and the Sharp/fontkit asset generator were inspected. The previous cart-first silhouette did not meet the message-first brief. Existing asset URLs and PWA installation identity were retained.
- Top, scrolled, phone and open-drawer before states were captured and inspected under `.next/invend-navigation/audit/`.

## 2. What changed

### Floating navigation

- Three genuinely balanced zones: **Invend** identity on the left; **Home, Features, How it works, Pricing, About** centred; **Sign in / Get started** on the right.
- The centre group is geometrically centred, not merely placed between unequal brand/action widths. Browser checks verify centring within one CSS pixel and separation between all three zones.
- Transparent at the top, with no heavy container. After approximately 24px of scrolling, the header becomes a floating `#FFFEFC` pill with a `#EAEAEA` border, restrained shadow and slightly reduced padding. It remains fixed and returns to transparency at the top.
- An IntersectionObserver sentinel replaces a scroll handler for the compact state. Section tracking still observes all eleven main sections, including intervening content, so footer-to-workspace jumps do not leave a stale active destination.
- The header uses existing local Jakarta; regular compact descriptions reuse Inter. Typography outside navigation is unchanged.
- The requested emerald CTA, dark emerald border, 11px radius, subtle shadow and 200ms scaling are implemented: **1 → 1.035 on hover/focus → 0.98 when pressed**. Sign in remains a plain-text action.

### Feature mega menu

- Four horizontal categories, eight feature links and a roughly **70/30 feature-grid/product-preview split**.
- Every feature has a Lucide icon, useful description, emerald hover treatment and visible keyboard focus.
- Pointer hover opens the menu; a padded hover bridge and 220ms delayed dismissal allow travel into it. Clicking pins it open. Outside interaction, Escape and destination selection dismiss it.
- Enter, Space and Up/Down open it from the keyboard. Arrow keys, Home/End and ordinary Tab traversal work inside it. Shift-Tab from the first item returns to Features; Tab after the last item continues to How it works. This is a disclosure containing ordinary navigation links, **not an incorrectly modelled application menubar**.
- Hover/focus updates the read-only product example. A polite caption exposes the feature's readiness to assistive technology. The preview graphics themselves are decorative and do not duplicate the spoken description.
- Entrance and exit use a short fade/small vertical translation. During exit, the panel is immediately inert and hidden from the accessibility tree before its visual removal.
- Links select/focus the correct existing feature panel, including repeated hashes after a manual tour change, direct links and Back/Forward. The only tour-style addition is a 104px panel scroll margin, aligning native hash navigation with the floating header. Existing legacy feature anchors still work.

| Category      | Menu features                               | Destination / truth boundary                                                                                                              |
| ------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Conversations | Customer conversations; AI-assisted replies | Panels 0–1. Inbox example; live channels still need validation. Assistance is rule-bound and exceptions require owner review.             |
| Commerce      | Product catalogue; Order management         | Panels 2–3. Photo-first prototype with vendor review; live extraction/storage is not claimed. Orders remain reviewable workflow examples. |
| Operations    | Payment tracking; Digital receipts          | Panels 4–5. Customers pay vendors directly. A screenshot is not confirmation; a receipt requires confirmed payment.                       |
| Business      | Business insights; Team management          | Panels 6–7. Partial implementation, historical rather than predictive insights, and live invitation/role acceptance limitations.          |

All previews are explicitly labelled **fictional product examples**, not screenshots of live accounts. No conversion statistics, testimonials, pricing offers, provider success or bank-verification capabilities were invented. Existing page demonstrations and their payment/receipt gates remain functional.

### Mobile and tablet

- Below 1100px, the header switches to left-aligned identity and a comfortable 44px menu control rather than compressing desktop navigation.
- A near-white modal drawer has its own scrollable navigation area and persistent account actions. Features expands into the same categories/links without the desktop preview.
- Native modal semantics, focus containment, Escape/backdrop/close dismissal, background scroll locking and restoration are retained. Selecting a destination focuses the content rather than a hidden drawer link.
- Crossing the desktop/mobile breakpoint transfers focus to the visible corresponding control. A remembered desktop-focus flag handles browsers that blur a newly hidden control before firing the media-query change event.
- Modern browsers animate the drawer and native details expansion; older engines retain functional native controls. Reduced motion removes these animations and CTA/item translations.

### Shared identity and install assets

- One rounded conversation bubble is the primary silhouette. The smaller cart is integrated into its negative space, rather than placed alongside it. The navigation symbol is emerald and its wordmark remains charcoal.
- The navigation wordmark is capitalised **Invend**. Existing wordmark treatments outside navigation remain unchanged; shared React icons inherit their existing context colours to avoid restyling the application.
- All **13 generated identity assets** were updated: SVG icon/compact/horizontal/inverse variants, favicon SVG/ICO, Apple touch icon, 192/512px install icons and legacy URL aliases.
- Actual 16/24/32/48px favicon/symbol renderings, inverse artwork and circular mask crops were inspected. PWA raster tests confirm the symbol stays inside the maskable safe circle.
- The existing service-worker namespace advances from `invend-static-v4` to **`invend-static-v5`** to replace the cached icon. Cache cleanup preserves unrelated applications' caches. Authenticated pages and API responses remain uncached.
- Manifest ID/scope `/`, start URL `/app`, application theme `#242066`, background `#F8FAFC` and offline reconnection behaviour are unchanged. Asset regeneration was rerun and proved byte-for-byte deterministic.

## 3. Explicit contrast exception

The requested charcoal CTA label does not provide normal-text AA contrast on the specified emerald backgrounds:

| Label                       | Background | Contrast   |
| --------------------------- | ---------- | ---------- |
| `#1C1C1C`                   | `#16845B`  | 3.64:1     |
| `#1C1C1C`                   | `#116B49`  | 2.62:1     |
| **`#FFFFFF` — implemented** | `#16845B`  | **4.68:1** |
| **`#FFFFFF` — implemented** | `#116B49`  | **6.52:1** |

White text preserves the compact button proportions and exact requested emerald backgrounds while meeting AA contrast. This exception was communicated before implementation; it is **not represented as a user-approved palette amendment**. Other navigation and wordmark text remains charcoal. Focus rings use dark emerald, independently of hover.

## 4. Executed verification

These are fresh checks for this navigation task, not results borrowed from the completed website redesign.

| Check                                         | Result                                                                                                                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full frontend suite                           | **227 tests, 25 files passed**, including 21 dedicated navigation tests and the existing auth, onboarding, inbox, catalogue, orders and settings tests.         |
| TypeScript                                    | `npm run typecheck` passed.                                                                                                                                     |
| Production build                              | Passed. The existing prebuild safety evaluation also passed **120 messages: 50 auto / 70 approval, zero unbacked emitted prices or stock counts**.              |
| Dedicated production navigation browser suite | **12 widths: 320, 375, 390, 430, 768, 900, 1024, 1099, 1100, 1280, 1440, 1920px; 92 whole-document axe scans passed**.                                          |
| Existing production homepage browser suite    | **11 widths / 163 whole-document axe scans passed** with updated disclosure/account selectors and unchanged product-behaviour assertions.                       |
| Production branding/PWA journey               | 390px and 1440px passed: auth, registration, onboarding, workspace, theme compatibility, asset URLs, actual cache upgrade, offline fallback and reconnection.   |
| Production onboarding browser suite           | Seven widths / **70 whole-document axe scans passed**, including validation, back navigation, retained progress, optional fields and honest integration states. |
| Phone commerce regression                     | Existing sample onboarding → product → approval → takeover/handback → explicit payment → receipt journey passed.                                                |
| PWA tests                                     | **7 passed**, covering vector/raster assets, dimensions, aliases, mask safety, cache upgrade and private-data noncaching.                                       |
| Security / contract tests                     | **8 security + 1 contract test passed**.                                                                                                                        |
| Formatting and scope                          | Scoped Prettier, `git diff --check` and the exact baseline preservation audit passed.                                                                           |

The navigation browser suite exercises actual mouse travel, pinned click-open behaviour, keyboard focus/order, touch emulation, real auth destinations, same-hash reselection/history, all eight preview/destination mappings, section activity, hero clearance, fixed-header geometry, no layout displacement on compaction, short/landscape viewports and normal/reduced motion. Short viewport checks include **1440×600, 844×390 and 390×480**. Its final run recorded **zero runtime errors, console errors, failed assets or private tenant API requests**.

A supplemental normal-motion phone check verified the 180ms native dialog exit, restored focus/scrolling, and zero-duration reduced-motion drawer/details transitions. A repeated eight-cycle desktop/mobile focus diagnostic also passed. Earlier development runs provided 35 dedicated-navigation and 31 homepage accessibility scans; these overlap the final production coverage and are not counted as additional unique acceptance cases.

### Visual review

Actual viewport captures were inspected for the transparent and solid header, 320px phone, tablet drawer, 1100px desktop breakpoint, keyboard focus, expanded phone categories and their lower scroll position, short viewports, and **all eight desktop product previews**. The generated identity assets, sign-in, existing dark workspace, onboarding and offline screen were also inspected. The navigation palette is confined to navigation; existing gold/cream marketing sections and application theme remain visibly intact.

### Findings resolved during verification

- Native focus could be lost while crossing the breakpoint. Focus ownership is now retained until the visible control can receive it after modal closure; actual browser checks cover both directions.
- One early production measurement reached the feature panel before its hash-change scroll correction. Native panel scroll margins now provide header clearance directly; the test also waits for the selection effect before measuring. The final 12-width run passed without relaxing the clearance assertion.
- jsdom exposes descendants of closed native details differently from the browser. Unit assertions distinguish the six top-level links from expandable feature links; browser checks independently verify six exposed links when closed and fifteen when expanded.
- The bundled single-process Chromium exited during a second isolated touch context. The harness now uses a fresh browser process for touch, as the existing branding suite does. Application code and auth assertions were not replaced or weakened.
- The full-page screenshot helper now temporarily uses absolute, rather than static, positioning for this centred floating header. This avoids an artificial offset/layout change in mosaics. Real viewport captures and geometry checks, not mosaics, establish sticky/clearance behaviour.

## 5. Exact scope and preservation audit

Compared with the **365-file navigation baseline**:

- **27 intentionally modified files**: header; shared brand component/geometry/generator; feature-tour deep-link handler and its single scroll-margin rule; 13 generated assets; service-worker version; and relevant existing tests/screenshot helper.
- **338 baseline files preserved byte-for-byte**, including all unrelated pre-existing uncommitted work, main homepage composition/styles, auth/application/API/schema code, dependency/font configuration and `docs/invend-website-redesign.md`.
- **7 new files**: the navigation CSS module, feature registry, mega-menu component, compact preview component, navigation unit/browser tests and this report.
- All **19 protected `docs/audits/` / `docs/design/` documents** remain unchanged, untracked and excluded. None was staged.
- No file removal, unexpected change, new dependency, branch switch, commit, push, PR, merge, migration or deployment. The Git index is empty and HEAD is unchanged. Main and the unrelated draft PR were not operated on.

### Runtime source map

- `web/components/marketing/home-header.tsx` — three-zone header, scroll/active state, disclosure and modal interactions.
- `web/components/marketing/home-header.module.css` — navigation-only palette, layout, previews, motion and responsive rules.
- `web/components/marketing/feature-navigation.ts` — four categories, eight truthful summaries and existing tour destinations.
- `web/components/marketing/feature-mega-menu.tsx` — grouped links, focus-driven selection and preview caption.
- `web/components/marketing/navigation-preview.tsx` — compact read-only excerpts using existing demonstration data.
- `web/components/marketing/feature-tour.tsx` / `.module.css` — narrow deep-link/focus/scroll-margin integration, not a tour redesign.
- `web/components/marketing/brand.tsx` — optional capitalised wordmark for navigation; default preserved.
- `web/lib/brand-mark.ts`, `web/components/brand-icon.tsx`, `scripts/write-brand-assets.mjs` — one shared vector geometry and deterministic asset generation.
- `web/public/sw.js` — static asset-cache version only.

## 6. Reproduction and evidence

Durable checks are in `web/tests/navigation.test.tsx`, `tests/navigation.mjs`, and the updated existing homepage/branding/PWA tests. The report and source are saved with this working tree. Files under `.next` and `/tmp` are **transient QA evidence**, not committed deliverables or guaranteed persistent storage.

```bash
npm test
npm run typecheck
npm run test:pwa
npm run test:security
npm run test:contract

# Rebuild only after stopping a production verification server serving the previous build.
# The healthy development preview on port 3000 does not need to be restarted.
npm run build
# In a separate terminal/process:
npm run start -w web -- --port 3001
```

With the production server running:

```bash
INVEND_HOME_URL=http://localhost:3001/ \
INVEND_SCREENSHOT_DIR=.next/invend-navigation/production \
node tests/navigation.mjs

INVEND_HOME_URL=http://localhost:3001/ \
INVEND_SCREENSHOT_DIR=.next/invend-navigation/homepage-production \
node tests/homepage.mjs

INVEND_TEST_URL=http://localhost:3001/app \
INVEND_SCREENSHOT_DIR=.next/invend-navigation/branding \
node tests/branding.mjs

INVEND_TEST_URL=http://localhost:3001/app \
INVEND_SCREENSHOT_DIR=.next/invend-navigation/onboarding \
node tests/onboarding.mjs

INVEND_TEST_URL=http://localhost:3001/app node tests/frontend-demo.mjs

# Regenerate the existing identity asset URLs after a geometry change:
node scripts/write-brand-assets.mjs
```

Current-session evidence:

- `.next/invend-navigation/production/results.json` and `production-browser.log` — final dedicated navigation acceptance.
- `.next/invend-navigation/homepage-production/` and `homepage-production.log` — full homepage regression/captures.
- `.next/invend-navigation/branding/`, `onboarding/`, `regressions.log` — unchanged application/onboarding flows and new identity compatibility.
- `.next/invend-navigation/frontend-tests.log`, `typecheck.log`, `production-build.log` — final frontend/type/build results.
- `.next/invend-navigation/visual/identity-assets.png`, `normal-motion-drawer.png`, `mobile-motion.json` — small-size identity inspection and actual motion diagnostic.
- `.next/invend-navigation/scope-audit.py` / `scope-audit.json` — exact file allowlists and baseline comparison. The same baseline must not be recreated after edits and mistaken for a before-state audit.

## 7. Preview and acceptance boundaries

The healthy development preview remains running on **0.0.0.0:3000**. The latest production verification build is running on **0.0.0.0:3001**. No preview host/origin configuration was changed, and browser-facing destinations remain relative.

These results establish **local build and browser acceptance**, not a deployment, external Arena iframe-access guarantee, physical-device test or screen-reader certification. Touch is browser-emulated. Live provider/OAuth availability, production payments, catalogue extraction/storage, team invitation acceptance and live insight data were not established by this task; the UI preserves those limitations. Backend/PostgreSQL suites were not rerun for this navigation-only change, and their source/schema files were hash-preserved.
