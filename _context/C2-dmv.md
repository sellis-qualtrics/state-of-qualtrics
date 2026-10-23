# C2 — Department of Motor Vehicles Package
Inherits: **P0** (provide P0 first). Folder: `/dmv/`. `agency: "dmv"`. All pages use `data-root="../"`.

---

## 1. Pages

| File | pageType | pageName | Purpose |
|---|---|---|---|
| `dmv/index.html` | `landing` | DMV Home | Top tasks, vehicle registration, service center locations, FAQ |
| `dmv/license-renewal.html` | `form` | License Renewal | 5-step online renewal with an eligibility gate (`license-renewal`) |
| `dmv/appointments.html` | `form` | Book an Appointment | 4-step appointment booking (`dmv-appointment`) |
| `dmv/fees.html` | `service` | Fees & Fee Calculator | Fee table plus a live fee calculator |

## 2. Content Outline

**dmv/index.html**
- Page header: "Department of Motor Vehicles", lead text, two primary buttons (Renew a license, Book an appointment)
- Top tasks grid (4 tiles): renew, appointment, fees, register a vehicle
- `#registration` section: new and renewal registration, the documents you need
- `#offices` section: 6 service centers (Capitol City Central, Provo Falls, Lehi Junction, Ridgeview, Cedar Hollow, Lakeside) with hours. Ridgeview carries a weather-closure note.
- Service center map graphic (**F1** dead click)
- FAQ accordion, including `#handbook`. The "Driver handbook (PDF)" link is **F5**.

**dmv/license-renewal.html**
- Sidebar: "What you'll need" (license number, last 4 of SSN, a card for the $32 fee)

**dmv/appointments.html**
- Sidebar: "Can't make it? Many services are online."

**dmv/fees.html**
- Fee table: license, ID card, registration, and road test fees
- Calculator: service (select), applicant age, add-ons (expedited mail +$10, duplicate copy +$18), registration vehicle weight class. Shows a live total.

## 3. Flows

### License renewal (`license-renewal`): 5 steps

| # | Step | Fields | Notes |
|---|---|---|---|
| 1 | Eligibility | Expiration window (radio: within 6 months / expired < 1 year / expired > 1 year), name or address change (radio), vision or medical change (radio) | Expired > 1 year **or** a vision/medical change shows a stop panel (`data-sq-stop="renewal-ineligible"`) that blocks Continue and links to appointments |
| 2 | Your information | License number (**F3**: 1 letter + 8 digits), date of birth, last 4 SSN (4 digits), email | F3 hides the format hint and shows "Invalid entry" while friction is ON |
| 3 | Address & delivery | Street, city, ZIP (5 digits), delivery method (standard free / expedited +$10) | Address fields show only if step 1 answered "address changed: yes"; otherwise a "mailing to the address on file" note |
| 4 | Payment | Name on card, card number (16 digits, demo), expiration MM/YY, security code (3–4 digits) | Shows the fee total ($32, or $42 expedited) |
| 5 | Review | Auto review | Submit label: "Pay $32 and renew" |

Confirmation: "Your new license will arrive in 7–10 days" (3–5 if expedited) plus the confirmation number.

### Appointment (`dmv-appointment`): 4 steps

| # | Step | Fields | Notes |
|---|---|---|---|
| 1 | Service | Service type (radio): road test, REAL ID / first-time license, name change, out-of-state transfer, other | |
| 2 | Location & time | Service center (select), date (date, min = tomorrow), **"Find available times"** button (**F2**, 3.5 s delay), then time-slot radios | A stop panel (`data-sq-stop="no-time-selected"`) blocks Continue until times have loaded. Ridgeview shows "No times available on Fridays." |
| 3 | Contact | Name, email, phone (optional), reminder preference (email/text) | |
| 4 | Review | Auto review | Submit label: "Book appointment" |

### Fee calculator
- Recalculates on every change. The first interaction sets `calculatorUsed = true`. The total updates `calculatorTotal` (debounced 800 ms with refresh).

### Form engine addition (applies to all children; P0 §9 extension)
`data-sq-stop="reason"` on any element inside a step. When that element is visible, Continue is blocked. The element is styled as an error and focused, `formBlockedReason` is set, and `sq:formblocked` fires.

## 4. Data Layer Values

| Page | Values |
|---|---|
| index | `pageType: landing` |
| license-renewal | `formName: license-renewal`, form engine keys, `formBlockedReason` (`renewal-ineligible`), `deliveryMethod` |
| appointments | `formName: dmv-appointment`, form engine keys, `formBlockedReason` (`no-time-selected`), `appointmentService`, `appointmentOffice`, `timesLoaded` (bool) |
| fees | `calculatorUsed` (bool), `calculatorService`, `calculatorTotal` (number) |

## 5. Qualtrics Opportunities

| # | Name | Creative | Logic | Embedded data |
|---|---|---|---|---|
| D1 | Renewal abandonment (exit) | Pop Over on exit intent | `formName == "license-renewal"` AND `formStatus == "in-progress"` | `formStep`, `formStepName`, `errorCount` |
| D2 | Renewal struggle | Slider | `formName == "license-renewal"` AND `errorCount >= 2` | `formStepName`, `errorCount` |
| D3 | Ineligible renewal | Embedded or Slider | `formBlockedReason == "renewal-ineligible"` | `formBlockedReason` |
| D4 | Renewal CSAT/CES | Slider on confirmation | `formName == "license-renewal"` AND `formStatus == "submitted"` | `confirmationNumber`, `deliveryMethod` |
| D5 | Appointment friction | Slider | `formName == "dmv-appointment"` AND `formBlockedReason == "no-time-selected"` | `appointmentOffice` |
| D6 | Appointment booked | Slider | `formName == "dmv-appointment"` AND `formStatus == "submitted"` | `appointmentService`, `appointmentOffice` |
| D7 | Fee clarity | Slider after 30 s | `pageName == "Fees & Fee Calculator"` AND `calculatorUsed == true` | `calculatorService`, `calculatorTotal` |
| D8 | Cross-page abandonment | Slider on DMV landing | `agency == "dmv"` AND `lastAbandonedForm == "license-renewal"` | `lastAbandonedStep` |

## 6. Friction Placements

| Code | Page | Element | ON | OFF |
|---|---|---|---|---|
| F1 | index | Service center map `#dmv-map` | Looks clickable, does nothing | Goes to `#offices` |
| F5 | index | "Driver handbook (PDF)" `#dmv-handbook-link` | Goes to 404 | Goes to `#handbook` |
| F3 | license-renewal | License number `#r-license` | "Invalid entry", hint hidden | Hint shown, specific error |
| F2 | appointments | "Find available times" `#find-times` | 3.5 s with no feedback | Spinner, 0.4 s |

## 7. Acceptance Checklist
- [ ] Renewal: an "expired > 1 year" answer blocks Continue and sets `formBlockedReason`
- [ ] Renewal: F3 vague error with friction ON, specific error with friction OFF
- [ ] Renewal: address fields appear only when "address changed: yes"
- [ ] Renewal: the fee updates to $42 with expedited delivery; the submit label shows the total
- [ ] Appointments: Continue is blocked until times load; Ridgeview Friday shows no times
- [ ] Fees: the calculator total updates and the data layer updates
- [ ] Abandoning the renewal mid-way, then visiting the DMV home, shows `lastAbandonedForm = license-renewal`
