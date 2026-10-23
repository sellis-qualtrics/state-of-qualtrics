/* ==========================================================================
   State of Qualtrics: Qualtrics DX Deployment Include (P0 §7)
   ⭐ THIS IS THE ONLY FILE YOU EDIT TO CONNECT QUALTRICS ⭐
   Every page loads this file in <head>, right after sq-datalayer.js.
   ========================================================================== */

window.SQ_DX_CONFIG = {
  // Show the built-in "Was this page helpful?" fallback in #sq-page-feedback.
  // Set to false once your Qualtrics Embedded Feedback creative targets #sq-page-feedback.
  nativeFeedbackFallback: true,

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

  var timer = null;
  SQ.dx = {
    isLoaded: function () { return !!(window.QSI && window.QSI.API); },

    // Re-evaluate intercepts after in-page state changes (debounced).
    refresh: function (reason) {
      if (!cfg.refreshOnStateChange) return;
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!SQ.dx.isLoaded()) { SQ.log && SQ.log("dx.refresh skipped (QSI not loaded)", reason || ""); return; }
        try {
          SQ.log && SQ.log("dx.refresh →", reason || "");
          window.QSI.API.unload();
          var p = window.QSI.API.load();
          if (p && typeof p.then === "function") p.then(function () { window.QSI.API.run(); });
          else window.QSI.API.run();
        } catch (e) { if (window.console) console.warn("[SQ] dx.refresh failed", e); }
      }, 250);
    }
  };
})();
