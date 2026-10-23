# State of Qualtrics: Step-by-Step Build Plan

Each phase has a **context package** (the spec) and a **build** (the code). We finish and verify one phase before starting the next. Who does what: **Claude** = me, **You** = Sydney.

---

## Phase 0: Parent Foundation ✅ built (awaiting your review, step 0.2)

| Step | Owner | Task | Done when |
|---|---|---|---|
| 0.1 | Claude | Write `P0-parent-master-spec.md` | Spec covers brand, structure, data layer, DX include, friction |
| 0.2 | You | Review P0, flag changes (colors, naming, data layer keys) | Approved |
| 0.3 | Claude | Build `sq.css` (design tokens + UI kit) | All components render |
| 0.4 | Claude | Build `sq-datalayer.js`, `qualtrics-dx.js`, `sq-components.js`, `sq-friction.js`, `sq-forms.js` | `window.sqDataLayer` populates; header/footer inject |
| 0.5 | Claude | Create `seal.png`, `404.html`, `_template.html` | Template ready for child pages |
| 0.6 | Claude | Build portal homepage as the reference page | Screenshot verified at desktop + mobile |

## Phase 1: C1 Portal ✅ built (awaiting your review)

| Step | Owner | Task |
|---|---|---|
| 1.1 | Claude | Write `C1-portal.md` (pages, intercepts, friction F4/F6) |
| 1.2 | You | Approve |
| 1.3 | Claude | Build `search.html` (fake index, zero-results state), `agencies.html`, `contact.html`; finish `index.html` |

## Phases 2–5: Agency Children (same loop for each). Phase 2 DMV ✅ · Phase 3 Revenue ✅ · Phase 4 HHS ✅ · Phase 5 Labor ✅

| Phase | Package | Key flows |
|---|---|---|
| 2 | `C2-dmv.md` | License renewal (5 steps), appointment booking (4 steps), fee calculator |
| 3 | `C3-revenue.md` | Refund status lookup, file & pay (4 steps), business registration (5 steps) |
| 4 | `C4-hhs.md` | Eligibility screener (branching), benefits application (5 steps) |
| 5 | `C5-labor.md` | Unemployment claim (5 steps, session timeout F7), weekly certification (3 steps), job board |

Loop per agency: **Claude writes package → You approve → Claude builds → Claude verifies (screenshots + data layer check) → Claude adds the agency's tips to `DEMO-TIPS.md` → You spot-check.**

## Phase 6: C6 Deploy & Demo Kit

| Step | Owner | Task |
|---|---|---|
| 6.1 | Claude | Write `C6-deploy-demo.md` with GitHub Pages and Netlify steps |
| 6.2 | You | Create the GitHub repo and upload the site folder (or drag it into Netlify Drop) |
| 6.3 | Claude | Produce the **Intercept Targeting Cheat Sheet**: every URL, selector, data layer key, and suggested trigger |
| 6.4 | You | Build Qualtrics DX projects; paste the zone code into `assets/js/qualtrics-dx.js`; set `nativeFeedbackFallback = false` |
| 6.5 | You + Claude | Smoke test: each intercept fires, embedded data lands, DXA captures friction |
| 6.6 | Claude | Turn `DEMO-TIPS.md` into the **Demo Guide**: a 10-minute storyline across a resident journey, plus a full trigger reference |

---

## Your Qualtrics checklist (run in parallel from Phase 2 onward)

- [ ] Create a DX zone; copy the deployment code
- [ ] Global feedback tab (all pages)
- [ ] Embedded "Was this page helpful?" creative targeting `#sq-page-feedback`
- [ ] Abandonment intercept: `sqDataLayer.lastAbandonedForm` is not empty
- [ ] Search-failure intercept: `sqDataLayer.searchResultsCount == 0`
- [ ] Form error intercept: `sqDataLayer.errorCount >= 2`
- [ ] Confirmation-page CSAT: `pageType == "confirmation"`
- [ ] Embedded data mapped from every `sqDataLayer` key
- [ ] DXA enabled with session replay

## Conventions

- Context packages live in `/_context/` (Jekyll doesn't publish this folder on GitHub Pages).
- Never rename the stable IDs listed in P0 §7. Your Qualtrics targeting depends on them.
- Add `?friction=off` for clean walkthroughs and `?sqdebug=1` to watch the data layer in the console.
