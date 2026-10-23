# P0 — Parent Master Spec: State of Qualtrics Demo Site

> **How to use this file:** Every child package (C1–C6) inherits everything here. When starting a new build session, provide this file first, then the child package. If a child package conflicts with this spec, this spec wins unless the child explicitly says "OVERRIDE P0".

---

## 1. Purpose

A fictitious state government website ("State of Qualtrics") used to demo **Qualtrics Digital Experience (DX)**:

- Feedback tab + embedded page feedback
- Behavioral intercepts (abandonment, exit, time-on-page, search failure)
- Embedded data via a JavaScript data layer
- DXA / session replay, with deliberate, toggleable friction

The site is a **static multi-page site** (HTML/CSS/vanilla JS, no build step) hosted on **GitHub Pages or Netlify**. Every meaningful screen has its own URL so intercepts can be targeted by URL.

**Not in scope:** real logins, back-end processing, real data storage. All visitors are anonymous.

---

## 2. Parent–Child Architecture

| Layer | What it is | Owns |
|---|---|---|
| **Parent** | Statewide portal (`/`) | Header, footer, global nav, design system, data layer, Qualtrics include, friction engine, form engine, page feedback component |
| **Child** | Agency sub-sites (`/dmv/`, `/revenue/`, `/hhs/`, `/labor/`) | Agency landing page, service pages, multi-step flows, agency-specific data layer values |

**Inheritance rules**

1. Children never redefine the header, footer, colors, fonts, or the Qualtrics include.
2. Children set their identity through the per-page `window.sqPage` object (see §6). The header automatically shows the agency name ("State of Qualtrics | Department of Motor Vehicles").
3. Children may add agency-scoped CSS only inside a `.sq-agency--{agency}` wrapper class and only for layout, never for brand tokens.

---

## 3. Brand & Design Tokens (USWDS-inspired)

### Color

| Token | Hex | Use |
|---|---|---|
| `--sq-navy` | `#1c2d5c` | Header bar, footer, headings, body text on light bg |
| `--sq-green` | `#3e7d60` | Primary buttons, links, focus accents, step indicator (active) |
| `--sq-green-light` | `#c7e1d5` | Cards, selected states, step indicator (complete), tags |
| `--sq-blue-light` | `#eef8fe` | Alternating section backgrounds, info alerts |
| `--sq-cream` | `#f7f7d5` | Notice/emergency banners, highlights, "new" badges |
| `--sq-white` | `#ffffff` | Page background |
| `--sq-gray-90` | `#1b1b1b` | Body text |
| `--sq-gray-50` | `#71767a` | Secondary text, borders |
| `--sq-gray-10` | `#e6e6e6` | Dividers, disabled |
| `--sq-error` | `#b50909` | Error text/borders (USWDS standard) |
| `--sq-green-dark` | `#2b5a45` | Button hover/active (derived) |

All text/background pairs must meet WCAG 2.1 AA (4.5:1). Green on white = 5.0:1 ✓. Navy on cream ✓.

### Typography

- **Font stack:** `"Source Sans 3", "Source Sans Pro", -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (system fallback; no web-font dependency required)
- **Headings:** `"Merriweather", Georgia, serif` for H1/H2 only (USWDS convention), sans-serif for H3+
- **Scale:** 16px base; H1 2.5rem, H2 2rem, H3 1.5rem, H4 1.25rem; line-height 1.5 body / 1.2 headings
- **Measure:** max 68ch for body copy

### Spacing & layout

- 8px spacing scale (`--sq-space-1` = 8px … `--sq-space-8` = 64px)
- Grid container max-width 1200px, 24px gutters
- Breakpoints: mobile < 640px, tablet 640–1023px, desktop ≥ 1024px
- Border radius: 4px (inputs/buttons), 8px (cards)

### Seal / logo

An original PNG seal (`/assets/img/seal.png`, 512×512, transparent background): circular navy ring, "STATE OF QUALTRICS" around the edge, a stylized green leaf and star in the center, "EST. 2002". No real state or company marks.

---

## 4. File Structure

```
/ (repo root = site root)
├── index.html                 Portal home (C1)
├── search.html                Site search (C1)
├── agencies.html              Agency directory (C1)
├── contact.html               Contact (C1)
├── 404.html
├── dmv/        index.html, license-renewal.html, appointments.html, fees.html            (C2)
├── revenue/    index.html, refund-status.html, file-pay.html, business-registration.html (C3)
├── hhs/        index.html, eligibility.html, apply.html                                  (C4)
├── labor/      index.html, file-claim.html, weekly-certification.html, jobs.html         (C5)
├── assets/
│   ├── css/sq.css             Entire design system
│   ├── js/sq-datalayer.js     Builds window.sqDataLayer (load in <head>)
│   ├── js/qualtrics-dx.js     ⭐ THE ONE PLACE to paste the Qualtrics zone code
│   ├── js/sq-components.js    Injects header/footer/feedback, nav state
│   ├── js/sq-forms.js         Multi-step form engine
│   ├── js/sq-friction.js      Toggleable DXA friction
│   └── img/seal.png
├── _context/                  These context packages (not published by GitHub Pages/Jekyll)
└── README.md
```

All internal links and asset paths are **relative**, so the site works at `username.github.io/state-of-qualtrics/` and on a Netlify root domain.

---

## 5. Page Template (every page)

```html
<!DOCTYPE html>
<html lang="en" data-root="../">  <!-- "./" at root, "../" in agency folders -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{Page Title} | {Agency} | State of Qualtrics</title>
  <link rel="icon" type="image/png" href="../assets/img/seal.png">
  <link rel="stylesheet" href="../assets/css/sq.css">
  <script>
    window.sqPage = { agency: "dmv", pageType: "service", pageName: "License Renewal", formName: "license-renewal" };
  </script>
  <script src="../assets/js/sq-datalayer.js"></script>   <!-- 1. data layer FIRST -->
  <script src="../assets/js/qualtrics-dx.js"></script>   <!-- 2. Qualtrics SECOND -->
</head>
<body>
  <a class="sq-skip" href="#main">Skip to main content</a>
  <div id="sq-header"></div>
  <main id="main" class="sq-main">
    <!-- page content -->
    <div id="sq-page-feedback"></div>
  </main>
  <div id="sq-footer"></div>
  <script src="../assets/js/sq-components.js"></script>
  <script src="../assets/js/sq-friction.js"></script>
  <script src="../assets/js/sq-forms.js"></script>  <!-- only on pages with forms -->
</body>
</html>
```

**Order matters:** the data layer must exist before the Qualtrics code runs so intercept logic and embedded data can read it on the first evaluation.

---

## 6. Data Layer Schema — `window.sqDataLayer`

Flat object, so Qualtrics can read any value with a simple JavaScript expression like `window.sqDataLayer.agency`.

| Key | Type | Example | Set by |
|---|---|---|---|
| `site` | string | `"state-of-qualtrics"` | parent |
| `agency` | string | `portal` \| `dmv` \| `revenue` \| `hhs` \| `labor` | page |
| `agencyName` | string | `"Department of Motor Vehicles"` | parent (lookup) |
| `pageType` | string | `home` \| `landing` \| `service` \| `form` \| `search` \| `confirmation` \| `error` \| `directory` \| `contact` | page |
| `pageName` | string | `"License Renewal"` | page |
| `formName` | string | `"license-renewal"` or `""` | page |
| `formStep` | number | `0` (not started) … N | form engine |
| `formStepName` | string | `"Personal Information"` | form engine |
| `formTotalSteps` | number | `4` | form engine |
| `formStatus` | string | `not-started` \| `in-progress` \| `submitted` \| `abandoned` | form engine |
| `errorCount` | number | validation errors this page view | form engine |
| `sessionExpiredForm` | string | form cleared by F7 on the previous page view (shown once) | friction engine |
| `searchTerm` | string | last site search term | search page |
| `searchResultsCount` | number | `0` triggers the "search failure" intercept | search page |
| `pageViewsThisSession` | number | from sessionStorage | parent |
| `entryPage` | string | first page path this session | parent |
| `deviceType` | string | `mobile` \| `tablet` \| `desktop` | parent |
| `frictionMode` | string | `on` \| `off` | friction engine |
| `language` | string | `en` | parent |

**Events:** every change also dispatches a DOM event on `window` (`sq:formstep`, `sq:formerror`, `sq:formsubmit`, `sq:search`, `sq:feedback`) and calls `SQ.dx.refresh()` (see §7), so intercepts re-evaluate mid-page.

**Helper API:** `SQ.data.set(key, value)` updates the data layer and fires `sq:datachange`.

---

## 7. Qualtrics Deployment Include — `assets/js/qualtrics-dx.js`

- **One shared file.** Paste the **contents** of the Qualtrics project/zone deployment code (the JavaScript between the `<script>` tags) into the marked block. Every page picks it up automatically.
- If the zone code includes a `<div id="ZN_…">` target element, the file creates it in JS. Set `SQ_DX_CONFIG.zoneDivId`.
- `SQ.dx.refresh()` safely re-runs intercept evaluation for in-page state changes (form steps, search results):
  ```js
  if (window.QSI && QSI.API) { QSI.API.unload(); QSI.API.load().then(function(){ QSI.API.run(); }); }
  ```
- Debug: add `?sqdebug=1` to any URL to log data layer changes and DX refresh calls in the console.

### Qualtrics event bridges (added for the DX build guide)
Every `SQ.emit()` call also (1) dispatches a bubbling `CustomEvent` on `document` for DXA custom events and (2) pushes the same key to `window._qsie` for intercept Event Tracking. Keys: the hyphenated event name (`sq:formerror` → `sq-formerror`), plus `sq-<form>-step-<n>`, `sq-submit-<form>`, `sq-blocked-<reason>`, `sq-search-noresults`, `sq-jobsearch-noresults`, `sq-refund-<result>`, `sq-friction-F#`. See `State-of-Qualtrics-DX-Build-Guide.docx` §7.

### Element hooks for Qualtrics creatives (stable IDs — never rename)

| Selector | Purpose |
|---|---|
| `#sq-page-feedback` | Target for Embedded Feedback creative ("Was this page helpful?") |
| `#sq-feedback-tab-anchor` | Optional anchor for a custom feedback tab |
| `[data-sq-exit]` | Links that leave a flow (Cancel, Back to home) for exit-intent logic |
| `.sq-form` / `[data-sq-step]` | Multi-step form container / each step |
| `#sq-search-results[data-count]` | Search result count |
| `.sq-alert--error` | Rendered validation error summaries |

---

## 8. Shared Components (built in `sq-components.js` / `sq.css`)

1. **Official banner:** "An official demo website of the State of Qualtrics" (USWDS-style gov banner, with a "This is a fictitious demo site" disclosure).
2. **Header:** seal + "State of Qualtrics", agency name when inside a child, global search box, primary nav (Services, Agencies, Contact) plus agency nav from a lookup table.
3. **Alert banner (cream):** optional site-wide notice, set per page with `sqPage.notice`.
4. **Breadcrumbs:** generated from `sqPage.breadcrumbs`.
5. **Page feedback:** `#sq-page-feedback` region. Renders a native "Was this page helpful? Yes / No" fallback **only if** `SQ_DX_CONFIG.nativeFeedbackFallback = true`. Set it to false once the Qualtrics Embedded Feedback creative is live so the two never duplicate.
6. **Footer (navy):** agency links, "About this demo", accessibility, privacy (all fictitious), seal.
7. **UI kit (CSS):** buttons (primary/secondary/outline), cards, alerts (info/warning/error/success), step indicator, form controls (text, select, radio, checkbox, date), tables, tags, hero, service tiles, accordion.

---

## 9. Multi-Step Form Engine (`sq-forms.js`)

- Markup: `<form class="sq-form" data-form-name="license-renewal">` containing `<fieldset data-sq-step="1" data-step-name="Eligibility">` blocks.
- The step indicator is rendered automatically.
- Each step change updates the URL hash (`#step-2`) **and** the data layer, then calls `SQ.dx.refresh()`. This lets intercepts target either the hash or `formStep`.
- Validation uses HTML5 `required`/`pattern` attributes plus an error summary at the top of the step (`.sq-alert--error`). It increments `errorCount`.
- **Abandonment signal:** on `beforeunload`/`pagehide`, if `formStatus === "in-progress"`, set `formStatus = "abandoned"` and store it in sessionStorage as `sqLastAbandonedForm`. The *next* page view exposes it as `sqDataLayer.lastAbandonedForm` so a "We noticed you didn't finish…" intercept can fire.
- **Stop panels** (added in C2): any element with `data-sq-stop="reason"` inside a step blocks Continue while it is visible. It is styled as an error, `formBlockedReason` is set, and `sq:formblocked` fires.
- **Checkbox groups** (added in C3): `data-sq-require-one="Error message"` on a container means at least one checkbox must be checked. Same-name checkboxes are combined into one row on the review step.
- **Confirmation prefix** (added in C3): `data-confirmation-prefix="SQ-BUS"` on the form changes the number format. Fields with `data-sq-mask` show only their last 4 characters on the review step.
- **Conditional logic:** `data-sq-show-if="field=value|value2"` (blocks) and `data-sq-step-if` (whole steps).
- Submit leads to a confirmation state with a fake confirmation number (`SQ-XXXX-XXXX`), `pageType = "confirmation"`, `formStatus = "submitted"`.

---

## 10. Friction Rules for DXA (`sq-friction.js`)

Friction is **ON by default** (so replays show something) and is **toggleable** for clean walkthroughs:

- `?friction=off` / `?friction=on` (persists in sessionStorage)
- A tiny "Demo controls" link in the footer

| Code | Friction type | Signal it creates | Where (defined in child packages) |
|---|---|---|---|
| F1 | **Dead click:** a styled element that looks clickable but isn't | Dead clicks | Each agency landing page |
| F2 | **Rage click bait:** a button with a 2–4 s delayed response and no spinner | Rage clicks | One button per agency |
| F3 | **Vague validation:** "Invalid entry" on a field with an unstated format rule | Error clicks, form re-entry | One field per form |
| F4 | **Slow search:** a 3 s delay on site search | Hesitation, back navigation | search.html |
| F5 | **Broken link:** one link goes to 404 | Error page view | One per agency |
| F6 | **Layout shift:** a banner that pushes content down after 1.5 s | Mis-clicks | Portal home |
| F7 | **Session timeout** (added in C5): 60 s idle warning with a 30 s countdown, then the form is cleared | Abandonment, frustration, `sessionExpiredForm` | Unemployment claim |

Mark every friction element with `data-sq-friction="F#"` so it's easy to find in DXA and to explain in the demo. With friction off, each element behaves normally.

---

## 11. Content & Tone

- Plain language, USWDS-style, about an 8th-grade reading level.
- Fictitious but realistic: city names (Capitol City, Provo Falls, Lehi Junction, Ridgeview), fees, phone numbers using 555 prefixes, and emails at `@qualtrics.state.example`.
- Every page shows a small "Demo site, not a real government service" disclosure in the gov banner.
- No real personal data. Form fields accept anything that passes format validation.

---

- **No demo tips on the site.** Test values, triggers, and walkthrough hints go in `_context/DEMO-TIPS.md`, never on a page. Safety notices ("Demo site: don't enter a real card") and the footer Demo controls button are allowed.

## 12. Accessibility & Quality Bar

- WCAG 2.1 AA: semantic landmarks, skip link, labels on every input, visible focus (3px green outline), and errors linked to fields with `aria-describedby`.
- Works without Qualtrics loaded (graceful degradation).
- No external dependencies besides optional Google Fonts. The site must run fully offline.
- Mobile-first and responsive; test at 375px, 768px, and 1280px.

---

## 13. Child Package Template (C1–C6 follow this)

```
# C# — {Agency} Package
Inherits: P0
1. Pages (filename, pageType, pageName, purpose)
2. Content outline per page
3. Flows & steps (form steps, fields, validation)
4. Data layer values per page
5. Qualtrics opportunities (intercept name, trigger logic, creative type, embedded data)
6. Friction placements (F-codes, element, behavior)
7. Acceptance checklist
```
