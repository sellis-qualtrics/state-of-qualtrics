# C5 — Department of Labor & Workforce Package
Inherits: **P0** (provide P0 first). Folder: `/labor/`. `agency: "labor"`. All pages use `data-root="../"`.

---

## 1. Pages

| File | pageType | pageName | Purpose |
|---|---|---|---|
| `labor/index.html` | `landing` | Labor Home | Unemployment overview, claim timeline, job seeker services, labor market snapshot, FAQ |
| `labor/file-claim.html` | `form` | File an Unemployment Claim | 5-step initial claim (`unemployment-claim`) with a **session timeout** (F7) |
| `labor/weekly-certification.html` | `form` | Weekly Certification | 3-step weekly benefit request (`weekly-certification`) |
| `labor/jobs.html` | `search` | Find a Job | Job board with keyword, location, and filters (15 fictitious jobs) |

## 2. Content Outline

**labor/index.html**
- Page header plus buttons (File a claim, Weekly certification)
- "How unemployment works" 4-step timeline: File → Wait week → Certify weekly → Get paid
- Benefit facts: maximum weekly benefit $712, up to 26 weeks, 1 waiting week
- "Labor market snapshot" chart graphic (**F1** dead click)
- Resources, including "Claimant Handbook (PDF)" (**F5**)
- FAQ accordion

**labor/jobs.html**
- Keyword input, location select (all, Capitol City, Provo Falls, Lehi Junction, Ridgeview, Lakeside, Remote), checkboxes (full time only, remote only)
- Result count and job cards (title, employer, location, pay, type, posted date). "View details" expands the description, and "Apply on employer site" shows an in-page "You're leaving this site" confirmation (no external navigation).
- Zero-results state with tips
- Keywords that return 0 results: `pilot`, `astronaut`, `marine biologist`, `blockchain`

## 3. Flows

### Unemployment claim (`unemployment-claim`): 5 steps

| # | Step | Fields | Notes |
|---|---|---|---|
| 1 | Eligibility | Why did your job end? (laid off/lack of work, hours cut, fired/discharged, quit, still working full time), worked in the state in the last 18 months (y/n) | **Still working full time** or **didn't work in the state** shows a stop panel `unemployment-ineligible`. **Quit** or **fired** shows an info note about an adjudication review. |
| 2 | About you | First name, last name, date of birth, last 4 SSN, phone, email, ZIP | |
| 3 | Work history | Employer name, employer phone (**F3**: `555-555-0100` format), start date, last day worked, gross wages in the last 12 months. If quit or fired: an explanation (min 30 chars). | F3 hides the hint while friction is ON |
| 4 | Payment | Payment method (direct deposit / State of Qualtrics debit card). Direct deposit shows routing and account fields. Federal tax withholding 10% (y/n). | |
| 5 | Review & certify | Auto review, certify checkbox | Submit = "Submit claim". Prefix `SQ-UI`. The confirmation shows the estimated weekly benefit and the first certification date. |

Estimated weekly benefit = `min(712, round(wages ÷ 52 × 0.55))`

### Weekly certification (`weekly-certification`): 3 steps

| # | Step | Fields | Notes |
|---|---|---|---|
| 1 | This week | Week ending (select the last 2 Saturdays), able and available to work (y/n), did you work (y/n). If yes: hours and gross earnings. Refused a job offer (y/n). | "Not able/available" or "refused a job" shows a warning note (not blocking) |
| 2 | Work search | Number of employer contacts (0–10). **Fewer than 3 shows a stop panel** `work-search-incomplete`. 3 or more: contacts log textarea (required). | |
| 3 | Review & certify | Auto review, certify | Prefix `SQ-WC`. The confirmation shows the estimated payment. |

Estimated payment = `max(0, 412 − max(0, earnings − 100))` (demo weekly benefit $412)

### New friction F7: session timeout (P0 §10 extension)
`data-sq-friction="F7"` on a form. With friction **ON**, after **60 s** with no typing or clicking, a modal warns "Your session will expire in 30 seconds" with a live countdown, plus **Stay signed in** and **Sign out** buttons. If the countdown reaches 0, the page reloads with the form cleared and an alert: "Your session expired and your answers were cleared." The next page view has `sessionExpiredForm = <formName>` (and `lastAbandonedForm` is set). With friction **OFF**, there is no timeout. Overrides: `data-idle="60"` and `data-grace="30"` (seconds).

## 4. Data Layer Values

| Page | Values |
|---|---|
| file-claim | `formName: unemployment-claim`, `separationReason`, `formBlockedReason` (`unemployment-ineligible`), `estimatedWeeklyBenefit`, `paymentMethod`, `sessionTimeoutWarned` (bool), `sessionExpiredForm` |
| weekly-certification | `formName: weekly-certification`, `certWorked`, `certEarnings`, `certContacts`, `paymentEstimate`, `formBlockedReason` (`work-search-incomplete`) |
| jobs | `jobSearchTerm`, `jobLocation`, `jobResultsCount`, `jobDetailsViewed` (count), `jobApplyClicked` (job id) |

## 5. Qualtrics Opportunities

| # | Name | Creative | Logic | Embedded data |
|---|---|---|---|---|
| L1 | Claim ineligible | Embedded or Slider | `formBlockedReason == "unemployment-ineligible"` | `separationReason` |
| L2 | Claim abandonment | Pop Over on exit intent | `formName == "unemployment-claim"` AND `formStatus == "in-progress"` | `formStepName` |
| L3 | **Session expired recovery** | Slider on load | `sessionExpiredForm != ""` | `sessionExpiredForm`, `lastAbandonedStep` |
| L4 | Claim struggle | Slider | `formName == "unemployment-claim"` AND `errorCount >= 2` | `formStepName` |
| L5 | Claim CES | Slider on confirmation | `formName == "unemployment-claim"` AND `formStatus == "submitted"` | `separationReason`, `paymentMethod`, `estimatedWeeklyBenefit` |
| L6 | Work search blocked | Slider | `formBlockedReason == "work-search-incomplete"` | `certContacts` |
| L7 | Certification CSAT | Slider on confirmation | `formName == "weekly-certification"` AND `formStatus == "submitted"` | `certWorked`, `paymentEstimate` |
| L8 | Job search failure | Slider | `pageName == "Find a Job"` AND `jobResultsCount == 0` | `jobSearchTerm`, `jobLocation` |
| L9 | Job board helpfulness | Slider after an apply click | `jobApplyClicked != ""` | `jobApplyClicked`, `jobSearchTerm` |

## 6. Friction Placements

| Code | Page | Element | ON | OFF |
|---|---|---|---|---|
| F1 | index | Labor market chart `#labor-chart` | Looks interactive, does nothing | Goes to `jobs.html` |
| F5 | index | "Claimant Handbook (PDF)" `#labor-handbook-link` | Goes to 404 | Goes to `#resources` |
| F3 | file-claim | Employer phone `#uc-emp-phone` | "Invalid entry", hint hidden | Hint shown, specific error |
| F7 | file-claim | The claim form | 60 s idle warning, then expiry and reset | No timeout |
| F2 | jobs | "Search jobs" button `#jobs-search-btn` | 3 s with no feedback | Spinner, 0.4 s |

## 7. Acceptance Checklist
- [ ] Claim: the ineligible stop panel works for both conditions; quit/fired shows the explanation field in step 3
- [ ] Claim: F7 warning appears after 60 s idle (friction ON), "Stay signed in" resets the timer, and expiry reloads with the alert and `sessionExpiredForm`
- [ ] Claim: the confirmation shows the estimated weekly benefit
- [ ] Certification: fewer than 3 contacts blocks; the earnings field appears when "worked = yes"; the payment estimate is correct
- [ ] Jobs: filters and keyword work; zero-results state; apply confirmation; data layer updates
