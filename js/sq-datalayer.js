/* ==========================================================================
   State of Qualtrics — Data Layer (P0 §6)
   Load in <head> BEFORE qualtrics-dx.js so values exist on first intercept evaluation.
   Read in Qualtrics with JavaScript expressions, e.g.  window.sqDataLayer.agency
   ========================================================================== */
(function () {
  "use strict";

  var SQ = (window.SQ = window.SQ || {});

  // Agency registry: the single source of truth used by header/nav/footer.
  SQ.agencies = {
    portal:  { name: "State of Qualtrics", short: "Home", path: "",
               nav: [] },
    dmv:     { name: "Department of Motor Vehicles", short: "DMV", path: "dmv/",
               nav: [["Overview", "index.html"], ["Renew a License", "license-renewal.html"], ["Appointments", "appointments.html"], ["Fees", "fees.html"]] },
    revenue: { name: "Department of Revenue", short: "Revenue", path: "revenue/",
               nav: [["Overview", "index.html"], ["Where's My Refund?", "refund-status.html"], ["File & Pay", "file-pay.html"], ["Register a Business", "business-registration.html"]] },
    hhs:     { name: "Department of Health & Human Services", short: "Health & Human Services", path: "hhs/",
               nav: [["Overview", "index.html"], ["Check Eligibility", "eligibility.html"], ["Apply for Benefits", "apply.html"]] },
    labor:   { name: "Department of Labor & Workforce", short: "Labor", path: "labor/",
               nav: [["Overview", "index.html"], ["File a Claim", "file-claim.html"], ["Weekly Certification", "weekly-certification.html"], ["Find a Job", "jobs.html"]] }
  };

  // ---------- Session helpers (fail-safe) ----------
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function ssDel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  SQ.session = { get: ssGet, set: ssSet, remove: ssDel };

  var params = new URLSearchParams(window.location.search);
  SQ.debug = params.get("sqdebug") === "1" || ssGet("sqDebug") === "1";
  if (params.get("sqdebug") === "1") ssSet("sqDebug", "1");
  if (params.get("sqdebug") === "0") { ssDel("sqDebug"); SQ.debug = false; }
  SQ.log = function () {
    if (SQ.debug && window.console) console.log.apply(console, ["%c[SQ]", "color:#3e7d60;font-weight:bold"].concat([].slice.call(arguments)));
  };

  // ---------- Friction mode (resolved here so it's in the data layer at load) ----------
  var fParam = params.get("friction");
  if (fParam === "on" || fParam === "off") ssSet("sqFriction", fParam);
  var frictionMode = ssGet("sqFriction") || "on";

  // ---------- Session counters ----------
  var views = parseInt(ssGet("sqPageViews") || "0", 10) + 1;
  ssSet("sqPageViews", String(views));
  if (!ssGet("sqEntryPage")) ssSet("sqEntryPage", window.location.pathname);

  // Abandoned form from a previous page (set by sq-forms.js on pagehide)
  var lastAbandoned = ssGet("sqLastAbandonedForm") || "";
  var lastAbandonedStep = parseInt(ssGet("sqLastAbandonedStep") || "0", 10);

  // Session timeout (F7) from the previous page view: exposed once, then cleared
  var sessionExpiredForm = ssGet("sqSessionExpired") || "";
  ssDel("sqSessionExpired");

  function deviceType() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    return w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  }

  var page = window.sqPage || {};
  var agencyKey = SQ.agencies[page.agency] ? page.agency : "portal";

  window.sqDataLayer = {
    site: "state-of-qualtrics",
    agency: agencyKey,
    agencyName: SQ.agencies[agencyKey].name,
    pageType: page.pageType || "content",
    pageName: page.pageName || document.title,
    formName: page.formName || "",
    formStep: 0,
    formStepName: "",
    formTotalSteps: 0,
    formStatus: page.formName ? "not-started" : "",
    errorCount: 0,
    searchTerm: "",
    searchResultsCount: -1,          // -1 = no search performed on this page
    lastAbandonedForm: lastAbandoned,
    lastAbandonedStep: lastAbandonedStep,
    sessionExpiredForm: sessionExpiredForm,
    pageViewsThisSession: views,
    entryPage: ssGet("sqEntryPage"),
    deviceType: deviceType(),
    frictionMode: frictionMode,
    language: document.documentElement.lang || "en",
    pagePath: window.location.pathname
  };

  // ---------- Public API ----------
  SQ.data = {
    get: function (k) { return k ? window.sqDataLayer[k] : window.sqDataLayer; },
    set: function (k, v, opts) {
      var prev = window.sqDataLayer[k];
      window.sqDataLayer[k] = v;
      SQ.log("data:", k, "=", v);
      try { window.dispatchEvent(new CustomEvent("sq:datachange", { detail: { key: k, value: v, previous: prev } })); } catch (e) {}
      if (opts && opts.refresh && SQ.dx && SQ.dx.refresh) SQ.dx.refresh(k);
    },
    merge: function (obj, opts) {
      Object.keys(obj).forEach(function (k) { SQ.data.set(k, obj[k]); });
      if (opts && opts.refresh && SQ.dx && SQ.dx.refresh) SQ.dx.refresh(Object.keys(obj).join(","));
    },
    clearAbandoned: function () {
      ssDel("sqLastAbandonedForm"); ssDel("sqLastAbandonedStep");
      window.sqDataLayer.lastAbandonedForm = ""; window.sqDataLayer.lastAbandonedStep = 0;
    }
  };

  // Qualtrics bridges:
  //  - DXA custom events: a bubbling CustomEvent on `document` whose type equals the event key
  //  - Intercept Event Tracking: window._qsie.push('eventName') (counts stored per visitor)
  function qualtricsEvent(key) {
    try { document.dispatchEvent(new CustomEvent(key, { bubbles: true })); } catch (e) {}
    window._qsie = window._qsie || [];
    window._qsie.push(key);
    SQ.log("qualtrics event:", key);
  }
  SQ.qualtricsEvent = qualtricsEvent;

  SQ.emit = function (name, detail) {
    detail = detail || {};
    SQ.log("event:", name, detail);
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) {}

    // Hyphenated alias of every site event, e.g. "sq:formerror" -> "sq-formerror"
    qualtricsEvent(name.replace(/:/g, "-"));
    // Specific keys used for DXA funnels, conversions, and intercept event tracking
    if (name === "sq:formstep" && detail.form) qualtricsEvent("sq-" + detail.form + "-step-" + detail.step);
    if (name === "sq:formsubmit" && detail.form) qualtricsEvent("sq-submit-" + detail.form);
    if (name === "sq:formblocked" && detail.reason) qualtricsEvent("sq-blocked-" + detail.reason);
    if ((name === "sq:search" || name === "sq:jobsearch") && detail.count === 0) qualtricsEvent(name === "sq:search" ? "sq-search-noresults" : "sq-jobsearch-noresults");
    if (name === "sq:refundlookup" && detail.result) qualtricsEvent("sq-refund-" + detail.result);
    if (name === "sq:friction" && detail.code) qualtricsEvent("sq-friction-" + detail.code);
  };

  SQ.root = document.documentElement.getAttribute("data-root") || "./";

  SQ.log("data layer ready", window.sqDataLayer);
})();
