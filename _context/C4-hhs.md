# C4 — Department of Health & Human Services Package
Inherits: **P0** (provide P0 first). Folder: `/hhs/`. `agency: "hhs"`. All pages use `data-root="../"`.

---

## 1. Pages

| File | pageType | pageName | Purpose |
|---|---|---|---|
| `hhs/index.html` | `landing` | HHS Home | Programs overview, how to apply, open enrollment notice, offices, FAQ |
| `hhs/eligibility.html` | `form` | Benefits Eligibility Screener | Branching screener (`benefits-screener`) that ends in a personalized results page |
| `hhs/apply.html` | `form` | Apply for Benefits | 5-step combined application (`benefits-application`) with a document upload |

## 2. Content Outline

**hhs/index.html**
- Notice: "Open enrollment for 2027 health coverage begins November 1."
- Page header plus buttons (Check if you qualify, Apply now) and an **"Español"** language link (**F1** dead click)
- Programs grid (6 cards): SNAP, Medicaid, WIC, Cash assistance (TANF), Child care assistance, Energy assistance (LIHEAP)
- "How to apply" 3-step strip: Check eligibility → Apply online → Complete your interview
- Resources list, including "Find a Medicaid provider" (**F5**)
- FAQ accordion

**hhs/eligibility.html**
- Results replace the confirmation panel: a list of programs the user may qualify for, each with a reason, plus "Apply for these programs" (links to `apply.html?programs=snap,medicaid…`)
- Results with no likely programs: "You may not qualify right now", with other resources (211, food banks)

**hhs/apply.html**
- Reads `?programs=` and pre-checks those programs (`fromScreener = true`)
- Sidebar: "What you'll need" plus "Save time: check eligibility first"

## 3. Flows

### Eligibility screener (`benefits-screener`): up to 5 steps (branching)

| # | Step | Fields | Shown when |
|---|---|---|---|
| 1 | Household | County, household size (1–8), children under 18 (y/n), anyone pregnant (y/n), anyone 65+ or with a disability (y/n) | Always |
| 2 | Children | Ages of youngest child (under 1 / 1–4 / 5–12 / 13–17), need child care to work or attend school (y/n) | `hasChildren = yes` |
| 3 | Income | Monthly household income before taxes (number), income sources (checkboxes, at least one, including "No income") | Always |
| 4 | Housing & utilities | Monthly rent or mortgage, pays heating or cooling bills (y/n) | Always |
| 5 | Review | Auto review; submit = "See my results" | Always |

**Program rules** (demo logic; fictitious monthly guideline = `1305 + 460 × (size − 1)`)

| Program | May qualify if |
|---|---|
| SNAP | income ≤ 130% of the guideline |
| Medicaid | income ≤ 138%, **or** anyone is pregnant (≤ 200%), **or** anyone is 65+ / disabled (≤ 150%) |
| WIC | (pregnant **or** youngest child under 5) **and** income ≤ 185% |
| Cash assistance (TANF) | children = yes **and** income ≤ 50% |
| Child care assistance | needs child care = yes **and** income ≤ 200% |
| Energy assistance (LIHEAP) | pays utilities = yes **and** income ≤ 150% |

### Benefits application (`benefits-application`): 5 steps

| # | Step | Fields | Notes |
|---|---|---|---|
| 1 | Programs | Checkboxes: SNAP, Medicaid, Cash assistance, Child care assistance (`data-sq-require-one`) | Pre-checked from `?programs=` |
| 2 | About you | First name, last name, date of birth (**F3**: text `MM/DD/YYYY`), phone, email, street, city, ZIP, county | F3 hides the format hint while friction is ON |
| 3 | Household | Household size, others in the household applying (y/n). If yes, their names and relationships (textarea) | |
| 4 | Income & documents | Employment status (radio). If employed: employer name and monthly pay. **"Upload proof of income"** (**F2**, 4 s), or "I'll mail or bring my documents later" | Stop panel `documents-required` until a document is uploaded or "later" is checked |
| 5 | Review & sign | Auto review, electronic signature (type your full name), certify checkbox | Submit = "Submit application". Confirmation prefix `SQ-HHS` |

The confirmation explains next steps: an interview call within 10 business days and a decision within 30 days.

## 4. Data Layer Values

| Page | Values |
|---|---|
| eligibility | `formName: benefits-screener`, `householdSize`, `hasChildren`, `monthlyIncome`, `incomePctGuideline` (rounded %), `screenerPrograms` (comma list), `screenerProgramsCount`, `screenerApplyClicked` (bool) |
| apply | `formName: benefits-application`, `appliedPrograms` (comma list), `fromScreener` (bool), `documentsUploaded` (bool), `docsUploadAttempts`, `docsLater` (bool), `formBlockedReason` (`documents-required`) |

## 5. Qualtrics Opportunities

| # | Name | Creative | Logic | Embedded data |
|---|---|---|---|---|
| H1 | No programs found | Embedded or Slider | `formName == "benefits-screener"` AND `formStatus == "submitted"` AND `screenerProgramsCount == 0` | `householdSize`, `incomePctGuideline` |
| H2 | Screener helpfulness | Slider (after 10 s on results) | `formName == "benefits-screener"` AND `formStatus == "submitted"` AND `screenerProgramsCount > 0` | `screenerPrograms` |
| H3 | Screener-to-apply drop-off | Pop Over on exit intent | Screener submitted AND `screenerApplyClicked == false` | `screenerPrograms` |
| H4 | Application abandonment | Pop Over on exit intent; Slider on next page via `lastAbandonedForm` | `formName == "benefits-application"` AND `formStatus == "in-progress"` | `formStepName`, `appliedPrograms` |
| H5 | Document upload struggle | Slider | `formBlockedReason == "documents-required"` OR `docsUploadAttempts >= 2` | `docsUploadAttempts` |
| H6 | Application struggle | Slider | `formName == "benefits-application"` AND `errorCount >= 2` | `formStepName` |
| H7 | Application CES | Slider on confirmation | `formName == "benefits-application"` AND `formStatus == "submitted"` | `appliedPrograms`, `fromScreener`, `docsLater` |
| H8 | Language need | Slider | `agency == "hhs"` AND DXA dead-click on `#hhs-lang` (or use an event-based trigger) | — |

## 6. Friction Placements

| Code | Page | Element | ON | OFF |
|---|---|---|---|---|
| F1 | index | "Español" link `#hhs-lang` | Looks like a link, does nothing | Goes to `#languages` (language help section) |
| F5 | index | "Find a Medicaid provider" `#hhs-provider-link` | Goes to 404 | Goes to `#resources` |
| F3 | apply | Date of birth `#ap-dob` | "Invalid entry", hint hidden | Hint shown, specific error |
| F2 | apply | "Upload proof of income" `#ap-upload-btn` | 4 s with no feedback | Spinner, 0.4 s |

## 7. Acceptance Checklist
- [ ] Screener skips the Children step when `hasChildren = no`
- [ ] Screener results match the rules table; zero-program state works
- [ ] "Apply for these programs" pre-checks programs on apply.html and sets `fromScreener`
- [ ] Apply step 4 is blocked until a document is uploaded or "later" is checked
- [ ] F3 date of birth: vague error with friction ON, specific error with friction OFF
- [ ] Confirmation `SQ-HHS-XXXX-XXXX`
