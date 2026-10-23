# C1 — Portal Package
Inherits: **P0** (provide P0 first). Scope: the statewide portal pages at the site root.

---

## 1. Pages

| File | pageType | pageName | Purpose |
|---|---|---|---|
| `index.html` | `home` | Home | Front door: hero search, popular services, life events, agencies, news *(built in P0)* |
| `search.html` | `search` | Search Results | Site-wide search with agency filters and a zero-results state |
| `agencies.html` | `directory` | Agency Directory | A–Z list of state agencies with a live filter |
| `contact.html` | `contact` | Contact Us | Agency phone and hours, live chat, a 2-step contact form, accessibility and privacy sections |
| `404.html` | `error` | Page Not Found (404) | Landing page for F5 broken links *(built in P0)* |

## 2. Content Outline

**search.html**
- Page header with the search box pre-filled from `?q=`
- Agency filter tabs: All, Motor Vehicles, Revenue, HHS, Labor, Other
- Result list: title, agency tag, description, URL
- **Zero-results state** (`#sq-search-noresults`): tips, popular links, and an empty slot `#sq-search-feedback` for a Qualtrics embedded creative
- The index lives in `assets/js/sq-search-index.js`. Child packages **append** their pages to it.

**agencies.html**
- Filter input ("Filter agencies by name"), live count
- Featured agencies (the 4 children) as cards linked to their sites
- Other agencies as an A–Z table (name, what they do, phone). These are informational only.

**contact.html**
- "Before you contact us" self-service links
- Agency contact table (phone, hours)
- Live chat card with a "Start a chat" button (F2), which reveals an "All agents are busy" panel
- Contact form (`contact-us`, 2 steps: *Your question*, then *Review & send*)
- `#accessibility` and `#privacy` sections (fictitious policy text)

## 3. Flows

**Search**
1. The user submits a query from the header, the hero, or the search page.
2. The page shows "Searching…" for 3 s with friction ON (F4) or 0.3 s with friction OFF.
3. Matching uses AND: every word in the query must appear in an entry's title, keywords, or description.
4. Deliberate gaps that return **0 results**: `real id`, `hunting license`, `title transfer`, `property tax`, `voter registration`, `birth certificate`.

**Contact form (`contact-us`)**

| Step | Fields | Validation |
|---|---|---|
| 1 Your question | Topic (select, required), Agency (select), Message (textarea, required, min 20 chars), Name (required), Email (required, email) | Standard messages |
| 2 Review & send | Auto-generated review table | — |

Submitting shows a confirmation with an `SQ-XXXX-XXXX` number and sets `pageType = confirmation`.

## 4. Data Layer Values

| Page | Values set |
|---|---|
| search | `searchTerm`, `searchResultsCount` (0+), `searchFilter` (`all`/agency key). Updated on every search and filter change, then `SQ.dx.refresh()` |
| agencies | `directoryFilter` (text typed), `directoryResultsCount` |
| contact | `formName = contact-us`, form engine keys, `chatAttempts` (clicks on the chat button), `chatUnavailableShown` (true/false) |

## 5. Qualtrics Opportunities

| # | Name | Creative | Target / Logic | Embedded data |
|---|---|---|---|---|
| Q1 | Global feedback tab | Feedback Button | All pages | all `sqDataLayer` keys |
| Q2 | Page helpfulness | Embedded Feedback | Element `#sq-page-feedback`, all pages | `pageName`, `agency`, `pageType` |
| Q3 | **Search failure** | Slider or Embedded in `#sq-search-feedback` | `sqDataLayer.pageType == "search"` AND `sqDataLayer.searchResultsCount == 0` | `searchTerm`, `searchFilter` |
| Q4 | Site visit intent | Pop Over (on exit intent or after 45 s) | `pageType == "home"` AND `pageViewsThisSession <= 2` | `entryPage`, `deviceType` |
| Q5 | Abandonment recovery | Slider | `sqDataLayer.lastAbandonedForm != ""` (any page) | `lastAbandonedForm`, `lastAbandonedStep` |
| Q6 | Contact CSAT | Embedded / Slider | `formName == "contact-us"` AND `formStatus == "submitted"` | `confirmationNumber` |
| Q7 | Chat frustration | Slider | `sqDataLayer.chatAttempts >= 3` OR `chatUnavailableShown == true` | `chatAttempts` |

## 6. Friction Placements

| Code | Page | Element | Behavior (ON) | Behavior (OFF) |
|---|---|---|---|---|
| F1 | index | Life-event cards `#life-*` | Look clickable, do nothing | Go to the agency |
| F6 | index | Promo banner `#sq-promo-banner` | Appears after 1.5 s and pushes content down | Shown immediately |
| F4 | search | Search execution | 3 s delay | 0.3 s |
| F5 | agencies | "Parks & Recreation" link `#agency-parks` | Goes to 404 | Goes to `search.html?q=parks` |
| F2 | contact | "Start a chat" `#sq-chat-btn` | 4 s delay with no feedback, then "agents busy" | Spinner, then "agents busy" |

## 7. Acceptance Checklist

- [ ] `search.html?q=renew+license` returns DMV results; `?q=real+id` returns 0 and shows the no-results state
- [ ] `searchResultsCount` and `searchTerm` update on each search; the filter tabs update the count
- [ ] Directory filter narrows the list live and shows the count
- [ ] The Parks link goes to 404 with friction ON and to search with friction OFF
- [ ] Chat button: rapid clicks increment `chatAttempts`; the busy panel appears
- [ ] Contact form validates, reviews, submits, and shows a confirmation number
- [ ] `#accessibility` and `#privacy` anchors work from the footer
- [ ] All pages render at 375px and 1280px
