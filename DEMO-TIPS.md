# Demo Tips Log (source for the final Demo Guide)

> **Rule:** demo tips are **never shown on the site**. Every child package adds its tips here as it's built. In Phase 6 this log becomes the Demo Guide.
> The site does keep a few safety notices (for example, "Demo site: don't enter a real card") and the footer "Demo controls" button. Neither is a tip.

---

## Global controls (every page)

| What | How | Notes |
|---|---|---|
| Turn friction off / on | Add `?friction=off` or `?friction=on` to any URL | Persists for the browser session |
| Demo controls panel | Footer "Demo controls" button, or **Alt + Shift + D** | Shows friction state, whether Qualtrics is loaded, and the live `sqDataLayer`; also has a "Reset session" button |
| Console logging | Add `?sqdebug=1` | Logs every data layer change and `SQ.dx.refresh()` call. `?sqdebug=0` turns it off |
| Reset abandonment / page counts | Demo controls → Reset session | Clears sessionStorage |
| Trigger abandonment | Start any multi-step form, then go to another page | Sets `lastAbandonedForm` and `lastAbandonedStep` on the next page view |

---

## C1 — Portal

| Page | Do this | What happens | Signal / Intercept |
|---|---|---|---|
| Home `index.html` | Wait 1.5 s after load | The "Skip the line" banner appears and pushes content down | F6 layout shift (DXA) |
| Home | Click any "Services for life events" card | Nothing happens (friction ON) | F1 dead click (DXA) |
| Home | Stay 45 s on the first or second page view | — | Q4 site visit intent |
| Search `search.html` | Search for anything | 3 s "Searching…" with no spinner (friction ON) | F4 slow search |
| Search | Search **renew license**, **refund**, **snap**, or **unemployment** | Results with agency filter tabs | `searchTerm`, `searchResultsCount` |
| Search | Search **real id**, **hunting license**, **title transfer**, **property tax**, **voter registration**, or **birth certificate** | Zero-results page | Q3 search failure (`searchResultsCount == 0`) |
| Agencies `agencies.html` | Type in the filter box | The list narrows live | `directoryFilter`, `directoryResultsCount` |
| Agencies | Click **Department of Parks & Recreation** | Goes to the 404 page (friction ON) | F5 broken link |
| Contact `contact.html` | Click **Start a chat** several times quickly | 4 s with no response, then "All agents are busy" | F2 rage clicks; Q7 (`chatAttempts >= 3`) |
| Contact | Submit the contact form | Confirmation number | Q6 contact CSAT |

---

## C2 — DMV

| Page | Do this | What happens | Signal / Intercept |
|---|---|---|---|
| DMV home `dmv/index.html` | Click the "View interactive map" graphic | Nothing happens (friction ON) | F1 dead click |
| DMV home | Open the FAQ "driver handbook" item → click the PDF link | 404 page (friction ON) | F5 broken link |
| DMV home | Arrive after abandoning the renewal | — | D8 cross-page abandonment |
| License renewal `dmv/license-renewal.html` | Step 1: choose **expired more than 1 year ago** (or **more than 6 months from now**, or **Yes** to vision/medical) → Continue | Stop panel blocks progress | D3 (`formBlockedReason == "renewal-ineligible"`) |
| License renewal | Step 2: enter license number **123** | "Invalid entry" with no format hint (friction ON) | F3; D2 (`errorCount >= 2`) |
| License renewal | Valid license number format | **D12345678** (1 letter + 8 digits) | — |
| License renewal | Step 1 **Address changed = Yes** | Address fields appear in step 3 | Conditional logic |
| License renewal | Step 3: choose **Expedited** | Fee becomes $42; the button reads "Pay $42 and renew" | `deliveryMethod` |
| License renewal | Payment test values | Card **4111111111111111**, exp **04/28**, CVV **123** | Masked on the review step |
| License renewal | Submit | Confirmation | D4 renewal CSAT |
| License renewal | Leave mid-form (exit intent) | — | D1 renewal abandonment |
| Appointments `dmv/appointments.html` | Step 2: click **Find available times** repeatedly | 3.5 s with no feedback (friction ON) | F2 rage clicks |
| Appointments | Click Continue before times load | Blocked | D5 (`formBlockedReason == "no-time-selected"`) |
| Appointments | Choose **Ridgeview** + any **Friday** (or any weekend) | "No times available" | `noTimesAvailable` |
| Appointments | Choose any other center + weekday | Time slots appear | `timesLoaded` |
| Appointments | Submit | Confirmation with location, date, and time | D6 appointment booked |
| Fees `dmv/fees.html` | Use the calculator (for example, State ID + "65 or older") | Live total | D7 fee clarity (`calculatorUsed`) |

---

## C3 — Revenue

| Page | Do this | What happens | Signal / Intercept |
|---|---|---|---|
| Revenue home `revenue/index.html` | Click the "Refund estimator" banner | Nothing happens (friction ON) | F1 dead click |
| Revenue home | Click "2026 Individual Income Tax Booklet (PDF)" | 404 page (friction ON) | F5 broken link |
| Refund status `revenue/refund-status.html` | Click **Check status** repeatedly | 3 s with no feedback (friction ON) | F2 rage clicks |
| Refund status | Enter the amount as **$1,250** | "Invalid entry" (friction ON); accepted with friction OFF | F3 |
| Refund status | Amount ending in **0** (for example 1250), year 2025 | **Approved** | R3 refund CSAT |
| Refund status | Amount ending in **5** (for example 1255) | **Action needed: verify identity** | R2 action-needed clarity |
| Refund status | Amount ending in any other digit (for example 1253), year 2025 | **Processing** | — |
| Refund status | Year **2023**, **or** SSN last 4 = **0000** (do this twice) | **Not found** | R1 (`not-found` AND `refundLookupAttempts >= 2`) |
| Tax payment `revenue/file-pay.html` | Step 3: choose **Credit or debit card** | 2.5% fee shown; the button reads "Pay $205.00" for $200 | R5 card fee reaction |
| Tax payment | Leave mid-form | — | R4 payment abandonment |
| Tax payment | Bank test values | Routing **123456789**, account **12345678** | — |
| Business registration `revenue/business-registration.html` | Step 1: choose **LLC** | "State filing number" appears in step 2 (format **1234567-0160**) | Conditional logic |
| Business registration | FEIN **123456789** | "Invalid entry" (friction ON). Valid format: **12-3456789** | F3; R6 (`errorCount >= 2`) |
| Business registration | Step 4: Continue with no boxes checked | "Select at least one tax account" | errorCount |
| Business registration | Check **Employer withholding** | The "number of employees" question appears | `taxAccounts` |
| Business registration | Submit | Account ID `SQ-BUS-XXXX-XXXX` | R7 registration CES |

---

## C4 — Health & Human Services

| Page | Do this | What happens | Signal / Intercept |
|---|---|---|---|
| HHS home `hhs/index.html` | Click **🌐 Español** | Nothing happens (friction ON) | F1 dead click; H8 language need |
| HHS home | Click **Find a Medicaid provider** | 404 page (friction ON) | F5 broken link |
| Screener `hhs/eligibility.html` | Step 1: **Children under 18 = No** | The Children step is skipped (4 steps instead of 5) | Branching (`formTotalSteps`) |
| Screener | Step 3: Continue with no income source checked | "Select at least one income source" | errorCount |
| Screener | **"Qualifies for a lot"** story: household **3**, children **Yes**, youngest **1 to 4**, needs child care **Yes**, income **2400**, source **A job**, rent **1100**, pays utilities **Yes** | 5 programs: SNAP, Medicaid, WIC, Child care, Energy (108% of guideline) | H2 screener helpfulness |
| Screener | **"Over the limit"** story: household **1**, no children, income **6000**, pays utilities **No** | "You may not qualify right now" | H1 (`screenerProgramsCount == 0`) |
| Screener | **"Cash assistance"** story: household **3**, children **Yes**, income **1000** | Adds Cash assistance (TANF) | — |
| Screener | **"Pregnant"** story: household **2**, pregnant **Yes**, income **3200** | Medicaid + WIC (181% of guideline, above the SNAP limit) | — |
| Screener results | Leave without clicking "Apply for these programs" | — | H3 screener-to-apply drop-off |
| Screener results | Click **Apply for these programs** | Opens the application with programs pre-checked and a green "pre-selected" banner | `fromScreener = true` |
| Apply `hhs/apply.html` | Step 2: date of birth **4/15/88** | "Invalid entry", no hint (friction ON). Valid: **04/15/1988** | F3; H6 (`errorCount >= 2`) |
| Apply | Step 3: **Anyone else applying = Yes** | A household members box appears (required) | Conditional logic |
| Apply | Step 4: click **Upload proof of income** without choosing a file | 4 s wait (friction ON), then "We couldn't upload your document" | F2; H5 (`docsUploadAttempts >= 2`) |
| Apply | Step 4: Continue with no upload and "later" unchecked | Blocked | H5 (`formBlockedReason == "documents-required"`) |
| Apply | Step 4: choose any PDF/JPG, then Upload | "✓ Uploaded: filename" | `documentsUploaded = true` |
| Apply | Shortcut: check **I'll mail or bring my documents later** | Unblocks step 4 | `docsLater = true` |
| Apply | Step 5: type a name + certify → Submit | Application number `SQ-HHS-XXXX-XXXX` | H7 application CES |
| Apply | Leave mid-application, then go to the HHS home | — | H4 abandonment (`lastAbandonedForm = benefits-application`) |

## C5 — Labor & Workforce

| Page | Do this | What happens | Signal / Intercept |
|---|---|---|---|
| Labor home `labor/index.html` | Click the "Labor market snapshot" chart or "Explore the data" | Nothing happens (friction ON) | F1 dead click |
| Labor home | Click **Claimant Handbook (PDF)** | 404 page (friction ON) | F5 broken link |
| File a claim `labor/file-claim.html` | Step 1: **I'm still working full time** (or **No** to working in the state) → Continue | Stop panel blocks progress | L1 (`formBlockedReason == "unemployment-ineligible"`) |
| File a claim | Step 1: **I quit** or **Fired** | An "Your claim will need a review" note; step 3 adds a required "Tell us what happened" box (30+ characters) | `separationReason` |
| File a claim | Step 3: employer phone **5555550100** (no dashes) | "Invalid entry", no hint (friction ON). Valid: **555-555-0100** | F3; L4 (`errorCount >= 2`) |
| File a claim | Step 3: wages **52000** | The confirmation shows **$550 per week** (formula: wages ÷ 52 × 0.55, max $712) | `estimatedWeeklyBenefit` |
| File a claim | ⭐ **Stop typing or clicking for 60 seconds** (friction ON) | Warning modal with a 30 s countdown → "Stay signed in" resets; letting it reach 0 reloads the page with the form cleared and a red "Your session expired" alert | F7; L3 session-expired recovery (`sessionExpiredForm == "unemployment-claim"`) |
| File a claim | Submit | Claim number `SQ-UI-XXXX-XXXX`, weekly benefit, first certification date | L5 claim CES |
| File a claim | Leave mid-claim (exit intent) | — | L2 abandonment |
| Weekly certification `labor/weekly-certification.html` | Step 1: **Did you work = Yes**, earnings **180** | The confirmation shows **$332.00** (412 − (180 − 100)) | `certWorked`, `certEarnings`, `paymentEstimate` |
| Weekly certification | Step 1: **Not able/available** or **refused a job** | Warning note (not blocking); the confirmation says payment is on hold | — |
| Weekly certification | Step 2: **0, 1, or 2** contacts → Continue | Stop panel: "You need at least 3 job contacts" | L6 (`formBlockedReason == "work-search-incomplete"`) |
| Weekly certification | Step 2: **3+** contacts | A required contact log box appears | `certContacts` |
| Weekly certification | Submit | `SQ-WC-XXXX-XXXX` + estimated payment | L7 certification CSAT |
| Find a job `labor/jobs.html` | Type a keyword and click **Search jobs** | 3 s with no feedback (friction ON) | F2 rage clicks |
| Find a job | Search **nurse** (2), **driver** (2), **customer service** (3), **warehouse** (1); location **Remote** (2) | Results update; location and filter changes apply instantly | `jobSearchTerm`, `jobLocation`, `jobResultsCount` |
| Find a job | Search **pilot**, **astronaut**, **marine biologist**, or **blockchain** | "No jobs match your search" | L8 job search failure (`jobResultsCount == 0`) |
| Find a job | **View details** → **Apply on employer site** → **Continue** | "You're leaving" modal, then "Opening … careers site" | L9 (`jobApplyClicked`), `jobDetailsViewed` |

---

## Cross-agency demo stories (ideas for the Demo Guide)
- **Lost a job:** Home → "Losing a job" life event (dead click, F1) → search "unemployment" → file a claim → go idle (F7 timeout) → recovery intercept (L3) → jobs → weekly certification.
- **New parent:** HHS screener ("Qualifies for a lot" story) → apply with programs pre-filled → failed upload (F2) → H5 intercept → submit → H7 CES.
- **Small business owner:** Revenue → business registration (F3 FEIN) → R6 struggle intercept → submit → R7 CES.
- **Busy commuter:** DMV renewal → ineligible stop (D3) → appointments → Ridgeview Friday has no times → D5.
- **Search failure:** Search "real id" → zero results (Q3) → contact page → chat rage clicks (Q7).
