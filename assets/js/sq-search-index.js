/* ==========================================================================
   State of Qualtrics: Site Search Index (C1)
   Child packages APPEND entries to the matching agency block.
   url is relative to the site root. agency: portal | dmv | revenue | hhs | labor | other
   Deliberate gaps (should return 0 results): real id, hunting license, title transfer,
   property tax, voter registration, birth certificate
   ========================================================================== */
window.SQ_SEARCH_INDEX = [
  // ---------- Portal ----------
  { title: "State of Qualtrics home", url: "index.html", agency: "portal",
    desc: "The official portal for State of Qualtrics services, agencies, and news.",
    keywords: "home portal main state services" },
  { title: "Agency directory", url: "agencies.html", agency: "portal",
    desc: "A complete A–Z list of State of Qualtrics departments, boards, and offices.",
    keywords: "agencies departments directory list offices government" },
  { title: "Contact the State of Qualtrics", url: "contact.html", agency: "portal",
    desc: "Phone numbers, office hours, live chat, and a form to send us a question.",
    keywords: "contact help phone call email chat question support hours" },
  { title: "Accessibility statement", url: "contact.html#accessibility", agency: "portal",
    desc: "Our commitment to making state services usable for everyone.",
    keywords: "accessibility ada screen reader wcag disability" },
  { title: "Privacy policy", url: "contact.html#privacy", agency: "portal",
    desc: "How the State of Qualtrics collects and protects your information.",
    keywords: "privacy policy data cookies information security" },

  // ---------- DMV (C2 appends) ----------
  { title: "Renew your driver license online", url: "dmv/license-renewal.html", agency: "dmv",
    desc: "Renew a standard driver license online if it expires within 6 months or expired less than 1 year ago.",
    keywords: "renew renewal driver license drivers licence dl online expire expired" },
  { title: "Schedule a DMV appointment", url: "dmv/appointments.html", agency: "dmv",
    desc: "Book a visit to a DMV service center for road tests, ID cards, and in-person services.",
    keywords: "appointment schedule book dmv office visit road test driving test service center hours" },
  { title: "DMV fees and fee calculator", url: "dmv/fees.html", agency: "dmv",
    desc: "See license, ID card, and vehicle registration fees, and estimate what you'll owe.",
    keywords: "fees cost price calculator registration license id card how much" },
  { title: "Department of Motor Vehicles", url: "dmv/index.html", agency: "dmv",
    desc: "Driver licenses, ID cards, vehicle registration, and road tests.",
    keywords: "dmv motor vehicles driver license vehicle registration car id card" },
  { title: "Register your vehicle", url: "dmv/index.html#registration", agency: "dmv",
    desc: "Register a new or used vehicle, or renew your registration.",
    keywords: "vehicle registration register car truck tags plates renew" },

  // ---------- Revenue (C3 appends) ----------
  { title: "Where's my refund?", url: "revenue/refund-status.html", agency: "revenue",
    desc: "Check the status of your State of Qualtrics individual income tax refund.",
    keywords: "refund status where's my refund tax return check income" },
  { title: "File and pay individual income tax", url: "revenue/file-pay.html", agency: "revenue",
    desc: "File your state return online or make a payment.",
    keywords: "file pay tax taxes income return payment online owe" },
  { title: "Register a new business", url: "revenue/business-registration.html", agency: "revenue",
    desc: "Get a state tax ID and register your business to collect sales tax.",
    keywords: "business register registration tax id sales tax start company llc" },
  { title: "Department of Revenue", url: "revenue/index.html", agency: "revenue",
    desc: "Individual income tax, business taxes, refunds, and payments.",
    keywords: "revenue tax taxes department income business" },

  // ---------- HHS (C4 appends) ----------
  { title: "Check if you may qualify for benefits", url: "hhs/eligibility.html", agency: "hhs",
    desc: "Answer a few questions to see if you may qualify for SNAP, Medicaid, and other programs.",
    keywords: "eligibility eligible qualify benefits snap food stamps medicaid screener check" },
  { title: "Apply for SNAP, Medicaid, and cash assistance", url: "hhs/apply.html", agency: "hhs",
    desc: "Start one application for food, health coverage, and cash help.",
    keywords: "apply application snap food stamps medicaid cash assistance benefits health coverage tanf" },
  { title: "Department of Health & Human Services", url: "hhs/index.html", agency: "hhs",
    desc: "SNAP food benefits, Medicaid, child care help, and family services.",
    keywords: "hhs health human services snap medicaid child care family" },

  // ---------- Labor (C5 appends) ----------
  { title: "File an unemployment claim", url: "labor/file-claim.html", agency: "labor",
    desc: "Apply for unemployment insurance benefits if you lost your job through no fault of your own.",
    keywords: "unemployment claim file apply benefits ui lost job laid off insurance" },
  { title: "Weekly certification", url: "labor/weekly-certification.html", agency: "labor",
    desc: "Request your weekly unemployment benefit payment.",
    keywords: "weekly certification certify claim payment unemployment benefits" },
  { title: "Find a job", url: "labor/jobs.html", agency: "labor",
    desc: "Search thousands of open jobs across the State of Qualtrics.",
    keywords: "jobs job search find work employment hiring careers openings" },
  { title: "Department of Labor & Workforce", url: "labor/index.html", agency: "labor",
    desc: "Unemployment insurance, job search, and workforce training.",
    keywords: "labor workforce unemployment jobs training department" },

  // ---------- Other agencies (informational) ----------
  { title: "State parks and campground reservations", url: "agencies.html#parks", agency: "other",
    desc: "Department of Parks & Recreation: find a park and reserve a campsite.",
    keywords: "parks recreation camping campground reserve reservation trails" },
  { title: "Road conditions and construction", url: "agencies.html#transportation", agency: "other",
    desc: "Department of Transportation: live road conditions and closures.",
    keywords: "roads road conditions traffic construction closures transportation snow" },
  { title: "Find a public school", url: "agencies.html#education", agency: "other",
    desc: "State Board of Education: school directory and report cards.",
    keywords: "school schools education teachers report card k-12" },
  { title: "Veterans benefits", url: "agencies.html#veterans", agency: "other",
    desc: "Office of Veterans Affairs: benefits, housing, and support for veterans.",
    keywords: "veterans veteran military benefits va" }
];
