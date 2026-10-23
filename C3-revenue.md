# C3 — Department of Revenue Package
Inherits: **P0** (provide P0 first). Folder: `/revenue/`. `agency: "revenue"`. All pages use `data-root="../"`.

---

## 1. Pages

| File | pageType | pageName | Purpose |
|---|---|---|---|
| `revenue/index.html` | `landing` | Revenue Home | Top tasks, filing season dates, tax forms, FAQ |
| `revenue/refund-status.html` | `service` | Where's My Refund? | Single-screen lookup tool with 4 possible outcomes |
| `revenue/file-pay.html` | `form` | File & Pay | 4-step payment form (`tax-payment`) |
| `revenue/business-registration.html` | `form` | Business Registration | 5-step new business tax registration (`business-registration`) |

## 2. Content Outline

**revenue/index.html**
- Page header plus buttons (Check my refund, Make a payment)
- Notice: "2026 filing deadline: April 15, 2027. Extension deadline: October 15, 2027."
- Top tasks (4 tiles): refund status, file & pay, register a business, tax forms
- Key dates table
- A "Tax estimator" promo graphic (**F1** dead click)
- `#forms` section: list of forms. "2026 Individual Income Tax Booklet (PDF)" is **F5**.
- FAQ accordion

**revenue/refund-status.html**
- Fields: last 4 SSN (4 digits), tax year (select 2025/2024/2023), refund amount in whole dollars (**F3**: rejects `$` and cents with "Invalid entry" while friction is ON; when OFF it accepts `$` and commas and shows a specific hint)
- "Check status" button (**F2**, 3 s with no feedback)
- Result panel `#refund-result` with a status tracker (Received → Processing → Approved → Sent)

| Rule (demo logic) | Result | `refundLookupResult` |
|---|---|---|
| Amount ends in **0** | Approved; direct deposit sent in 3–5 days | `approved` |
| Amount ends in **5** | Action needed: verify your identity (letter TAX-ID-1) | `action-needed` |
| Amount ends in any other digit, year 2025 | Processing; expect a decision within 14 days | `processing` |
| Year 2023, **or** last 4 SSN = `0000` | We can't find a return matching that information | `not-found` |

The `not-found` rule is checked first.

**revenue/file-pay.html**
- Sidebar: "Want to file your return? Use free e-file through an approved provider" (informational)

**revenue/business-registration.html**
- Sidebar: "Before you start" checklist (EIN, business address, start date)

## 3. Flows

### Tax payment (`tax-payment`): 4 steps

| # | Step | Fields | Notes |
|---|---|---|---|
| 1 | Payment type | Radio: balance due / estimated payment / extension payment | |
| 2 | Taxpayer & amount | Last 4 SSN, tax year (select), amount (number, min 1) | |
| 3 | Payment method | Radio: bank account (free) / card (**2.5% fee**) | Bank: routing (9 digits), account (4–17 digits), account type. Card: number, expiration, security code. The fee and total are shown live. |
| 4 | Review | Auto review | Submit label: "Pay $X.XX" |

### Business registration (`business-registration`): 5 steps

| # | Step | Fields | Notes |
|---|---|---|---|
| 1 | Business type | Radio: sole proprietor / LLC / corporation / partnership | An LLC, corporation, or partnership shows "State filing number" in step 2 |
| 2 | Business details | Legal name, DBA (optional), FEIN (**F3**: `12-3456789` format, hint hidden while friction is ON), state filing number (conditional), NAICS industry (select), email | |
| 3 | Location | Street, city, ZIP, county (select), start date | |
| 4 | Tax accounts | Checkboxes: sales & use tax, employer withholding, unemployment insurance, transient room tax. **At least one is required.** Withholding shows "number of employees". | Uses the new `data-sq-require-one` engine feature |
| 5 | Review | Auto review | Submit label: "Submit registration". Confirmation shows a mock account ID like `SQ-BUS-XXXX-XXXX` |

### Form engine addition (P0 §9 extension)
`data-sq-require-one="Error message"` on a container of checkboxes. Validation fails unless at least one visible checkbox inside is checked.

## 4. Data Layer Values

| Page | Values |
|---|---|
| refund-status | `refundLookupAttempts` (number), `refundLookupResult`, `refundTaxYear`, `errorCount` (F3 errors counted) |
| file-pay | `formName: tax-payment`, `paymentType`, `paymentMethod` (`bank`/`card`), `paymentAmount`, `paymentFee` |
| business-registration | `formName: business-registration`, `businessType`, `taxAccounts` (comma list) |

## 5. Qualtrics Opportunities

| # | Name | Creative | Logic | Embedded data |
|---|---|---|---|---|
| R1 | Refund lookup failure | Slider | `refundLookupResult == "not-found"` AND `refundLookupAttempts >= 2` | `refundTaxYear`, `refundLookupAttempts` |
| R2 | Action-needed clarity | Embedded or Slider | `refundLookupResult == "action-needed"` | `refundTaxYear` |
| R3 | Refund CSAT | Slider | `refundLookupResult == "approved"` | `refundTaxYear` |
| R4 | Payment abandonment | Pop Over on exit intent | `formName == "tax-payment"` AND `formStatus == "in-progress"` | `formStepName`, `paymentMethod` |
| R5 | Card fee reaction | Slider | `formName == "tax-payment"` AND `paymentMethod == "card"` AND `formStep == 3` (after 20 s) | `paymentAmount`, `paymentFee` |
| R6 | Registration struggle | Slider | `formName == "business-registration"` AND `errorCount >= 2` | `formStepName`, `businessType` |
| R7 | Registration CES | Slider on confirmation | `formName == "business-registration"` AND `formStatus == "submitted"` | `businessType`, `taxAccounts` |

## 6. Friction Placements

| Code | Page | Element | ON | OFF |
|---|---|---|---|---|
| F1 | index | Tax estimator promo `#rev-estimator` | Looks clickable, does nothing | Goes to `refund-status.html` |
| F5 | index | Tax booklet PDF link `#rev-booklet-link` | Goes to 404 | Goes to `#forms` |
| F2 | refund-status | "Check status" `#refund-check` | 3 s with no feedback | Spinner, 0.4 s |
| F3 | refund-status | Refund amount `#rf-amount` | "Invalid entry" for `$` or cents | Accepts `$` and commas; specific hint |
| F3 | business-registration | FEIN `#br-fein` | "Invalid entry", hint hidden | Hint shown, specific error |

## 7. Acceptance Checklist
- [ ] Refund: all 4 outcomes reachable; `refundLookupAttempts` increments
- [ ] Refund: F3 behavior differs between friction ON and OFF
- [ ] Payment: the card method shows a 2.5% fee and updates the submit label
- [ ] Business: Continue fails with no tax account checked; conditional fields appear correctly
- [ ] All confirmations show IDs and set `formStatus = submitted`
