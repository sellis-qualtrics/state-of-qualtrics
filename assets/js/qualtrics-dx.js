/* ==========================================================================
   State of Qualtrics: Qualtrics DX Deployment Include (P0 §7)
   ⭐ THIS IS THE ONLY FILE YOU EDIT TO CONNECT QUALTRICS ⭐
   Every page loads this file in <head>, right after sq-datalayer.js.
   ========================================================================== */

window.SQ_DX_CONFIG = {
  // Show the built-in "Was this page helpful?" fallback in #sq-page-feedback.
  // Set to false once your Qualtrics Embedded Feedback creative targets #sq-page-feedback.
  nativeFeedbackFallback: false,

  // If your deployment code includes <div id="ZN_xxxxxxxx"><!--DO NOT REMOVE-CONTENTS PLACED HERE--></div>,
  // put that ID here (e.g. "ZN_abc123XYZ") and this file will create the div for you.
  zoneDivId: "ZN_2wugdyRUDVHGFFW",

  // Re-run intercept evaluation when form steps, errors, or search results change.
  refreshOnStateChange: true
};

/* --------------------------------------------------------------------------
   PASTE QUALTRICS DEPLOYMENT CODE BELOW
   1. In Qualtrics: Digital Experience > your zone/project > Deployment > copy the code.
   2. Paste ONLY the JavaScript that sits BETWEEN <script type="text/javascript"> and </script>.
      Do not paste the <script> tags themselves, the <div id="ZN_..."> line, or any HTML comments.
   3. Save, commit, and redeploy.
   -------------------------------------------------------------------------- */

/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>  BEGIN QUALTRICS CODE  <<<<<<<<<<<<<<<<<<<<<<<<<<<< */
/* Zone: ZN_2wugdyRUDVHGFFW (qdemo) */

(function(){var g=function(g){

this.go=function(){var a=document.createElement("script");a.type="text/javascript";a.src=g;document.body&&document.body.appendChild(a)};

this.start=function(){var t=this;"complete"!==document.readyState?window.addEventListener?window.addEventListener("load",function(){t.go()},!1):window.attachEvent&&window.attachEvent("onload",function(){t.go()}):t.go()};};

try{(new g("https://zn2wugdyrudvhgffw-qdemo.siteintercept.qualtrics.com/SIE/?Q_ZID=ZN_2wugdyRUDVHGFFW")).start()}catch(i){}})();

/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>   END QUALTRICS CODE  <<<<<<<<<<<<<<<<<<<<<<<<<<<<< */


/* --------------------------------------------------------------------------
   Helpers (do not edit)
   -------------------------------------------------------------------------- */
(function () {
  "use strict";
  var SQ = (window.SQ = window.SQ || {});
  var cfg = window.SQ_DX_CONFIG;

  // Create the zone target div if the deployment code requires one.
  if (cfg.zoneDivId) {
    var make = function () {
      if (document.getElementById(cfg.zoneDivId)) return;
      var d = document.createElement("div");
      d.id = cfg.zoneDivId;
      d.innerHTML = "<!--DO NOT REMOVE-CONTENTS PLACED HERE-->";
      document.body.appendChild(d);
    };
    if (document.body) make(); else document.addEventListener("DOMContentLoaded", make);
  }

  // ---------- Safe intercept re-evaluation ----------
  // Rules that keep intercepts stable:
  //  1. Never re-evaluate until Qualtrics has finished its own first load + run (ready + grace period).
  //  2. Never re-evaluate while a Qualtrics survey is open on screen (unload would close it and
  //     can leave creatives removed). Wait until it's closed, then re-evaluate once.
  //  3. Never overlap: one unload → load → run cycle at a time; extra requests are merged.
  var log = function () { if (SQ.log) SQ.log.apply(null, arguments); };
  var ready = false, busy = false, pending = null, timer = null;
  var GRACE_MS = 2000, DEBOUNCE_MS = 600, SURVEY_RECHECK_MS = 2000;

  function qsiPresent() { return !!(window.QSI && window.QSI.API && typeof window.QSI.API.load === "function"); }

  var readyScheduled = false;
  function markReady(source) {
    if (ready || readyScheduled) return;
    readyScheduled = true;
    setTimeout(function () { ready = true; log("dx ready (" + source + ")"); if (pending) schedule(0); }, GRACE_MS);
  }
  window.addEventListener("qsi_js_loaded", function () { markReady("qsi_js_loaded"); });
  // Fallback if the event isn't fired: poll for the API for up to 30 s
  (function poll(n) {
    if (ready) return;
    if (qsiPresent()) { markReady("poll"); return; }
    if (n < 120) setTimeout(function () { poll(n + 1); }, 250);
  })(0);

  // Is a Qualtrics survey currently visible (responsive dialog, feedback button panel, embedded feedback)?
  function surveyOpen() {
    var frames = document.querySelectorAll("iframe");
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i], src = f.getAttribute("src") || "";
      if (src.indexOf("qualtrics.com") === -1) continue;
      var r = f.getBoundingClientRect();
      if (r.width > 40 && r.height > 40 && getComputedStyle(f).visibility !== "hidden") return true;
    }
    return false;
  }

  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(cycle, ms);
  }

  function cycle() {
    if (!pending) return;
    if (!ready || !qsiPresent()) { log("dx.refresh waiting (Qualtrics not ready)", pending); return; } // markReady re-schedules
    if (busy) { schedule(300); return; }
    if (surveyOpen()) { log("dx.refresh deferred (survey open)", pending); schedule(SURVEY_RECHECK_MS); return; }

    var reason = pending; pending = null; busy = true;
    var done = function () { busy = false; if (pending) schedule(DEBOUNCE_MS); };
    var safety = setTimeout(done, 6000);
    try {
      log("dx.refresh →", reason);
      window.QSI.API.unload();
      setTimeout(function () {
        try {
          var p = window.QSI.API.load();
          var finish = function () { try { window.QSI.API.run(); } catch (e) {} clearTimeout(safety); done(); };
          if (p && typeof p.then === "function") p.then(finish, function () { clearTimeout(safety); done(); });
          else finish();
        } catch (e) { clearTimeout(safety); done(); if (window.console) console.warn("[SQ] dx load failed", e); }
      }, 150);
    } catch (e) { clearTimeout(safety); done(); if (window.console) console.warn("[SQ] dx.refresh failed", e); }
  }

  SQ.dx = {
    isLoaded: qsiPresent,
    isReady: function () { return ready; },
    isSurveyOpen: surveyOpen,
    // Ask for intercepts to be re-evaluated after an in-page state change.
    refresh: function (reason) {
      if (!cfg.refreshOnStateChange) return;
      // Changes made before Qualtrics loads are already included in its first evaluation
      if (!qsiPresent()) { log("dx.refresh ignored (Qualtrics not loaded yet)", reason || ""); return; }
      pending = (pending ? pending + "," : "") + (reason || "change");
      schedule(DEBOUNCE_MS);
    }
  };
})();
