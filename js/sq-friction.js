/* ==========================================================================
   State of Qualtrics: DXA Friction Engine (P0 §10)
   Toggle: ?friction=off | ?friction=on  (persists for the session)
   Mark elements with data-sq-friction="F1".."F6". With friction off, each behaves normally.
   ========================================================================== */
(function () {
  "use strict";
  var SQ = (window.SQ = window.SQ || {});
  var on = window.sqDataLayer.frictionMode === "on";
  var root = SQ.root;

  SQ.friction = {
    on: on,
    // F4 helper: returns a delay in ms for slow operations (e.g. search)
    delay: function (msOn, msOff) { return on ? msOn : (msOff || 0); },
    wait: function (msOn, msOff) { var ms = SQ.friction.delay(msOn, msOff); return new Promise(function (r) { setTimeout(r, ms); }); }
  };

  function all(code) { return [].slice.call(document.querySelectorAll('[data-sq-friction="' + code + '"]')); }
  function note(code, el) { SQ.emit("sq:friction", { code: code, id: el.id || "", text: (el.textContent || "").trim().slice(0, 60) }); }

  // F1: Dead click. Looks clickable, does nothing (when ON).
  all("F1").forEach(function (el) {
    el.style.cursor = "pointer";
    el.addEventListener("click", function (e) {
      if (on) { e.preventDefault(); note("F1", el); return; }
      var href = el.getAttribute("data-href");
      if (href) window.location.href = href;
    });
  });

  // F2: Rage-click bait. Long delay with no feedback (when ON); quick + spinner (when OFF).
  all("F2").forEach(function (el) {
    var busy = false;
    el.addEventListener("click", function (e) {
      e.preventDefault();
      note("F2", el);
      if (busy) return;                       // extra clicks pile up as rage clicks
      busy = true;
      var delay = on ? parseInt(el.getAttribute("data-delay") || "3000", 10) : 400;
      var original = el.innerHTML;
      if (!on) el.innerHTML = '<span class="sq-spinner" aria-hidden="true"></span> Loading…';
      setTimeout(function () {
        busy = false;
        el.innerHTML = original;
        var href = el.getAttribute("href") || el.getAttribute("data-href");
        var target = el.getAttribute("data-target");
        if (target) {
          var t = document.querySelector(target);
          if (t) { t.hidden = false; t.scrollIntoView({ behavior: "smooth", block: "start" }); }
        }
        SQ.emit("sq:frictionresolved", { code: "F2", id: el.id || "" });
        if (href && href !== "#") window.location.href = href;
      }, delay);
    });
  });

  // F5: Broken link. Goes to 404 when ON, correct page when OFF.
  all("F5").forEach(function (el) {
    var fixed = el.getAttribute("data-fixed-href") || el.getAttribute("href");
    if (on) {
      el.setAttribute("href", root + "404.html?from=" + encodeURIComponent(window.location.pathname));
      el.addEventListener("click", function () { note("F5", el); });
    } else {
      el.setAttribute("href", fixed);
    }
  });

  // F6: Late layout shift. Element pops in after a delay and pushes content down.
  all("F6").forEach(function (el) {
    if (on) {
      el.hidden = true;
      setTimeout(function () { el.hidden = false; note("F6", el); }, parseInt(el.getAttribute("data-delay") || "1500", 10));
    } else {
      el.hidden = false;
    }
  });

  // F7: Session timeout on a form. Idle warning, countdown, then expiry and a cleared form.
  all("F7").forEach(function (form) {
    var formName = form.getAttribute("data-form-name") || "form";

    // After an expiry reload: show the alert (regardless of friction mode)
    if (window.sqDataLayer.sessionExpiredForm === formName) {
      var a = document.createElement("div");
      a.className = "sq-alert sq-alert--error"; a.id = "sq-session-expired"; a.setAttribute("role", "alert");
      a.innerHTML = '<p class="sq-alert__heading">Your session expired</p><p>For your security, we signed you out after a period of inactivity, and your answers were cleared. Please start again.</p>';
      form.parentNode.insertBefore(a, form);
    }
    if (!on) return;

    var idleMs = parseInt(form.getAttribute("data-idle") || "60", 10) * 1000;
    var grace = parseInt(form.getAttribute("data-grace") || "30", 10);
    var idleTimer = null, tick = null, modal = null, done = false;

    function reset() {
      if (done || modal) return;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(warn, idleMs);
    }
    function close() {
      clearInterval(tick); tick = null;
      if (modal) { modal.remove(); modal = null; }
      reset();
    }
    function warn() {
      var left = grace;
      modal = document.createElement("div");
      modal.className = "sq-modal-backdrop"; modal.id = "sq-timeout-modal";
      modal.innerHTML =
        '<div class="sq-modal" role="alertdialog" aria-modal="true" aria-labelledby="sq-to-title" aria-describedby="sq-to-desc">' +
          '<h2 id="sq-to-title">Your session is about to expire</h2>' +
          '<p id="sq-to-desc">For your security, you\'ll be signed out in <strong><span id="sq-to-count">' + left + "</span> seconds</strong>. Any answers you haven't submitted will be lost.</p>" +
          '<div class="sq-btn-group"><button type="button" class="sq-btn" id="sq-to-stay">Stay signed in</button>' +
          '<button type="button" class="sq-btn sq-btn--outline" id="sq-to-out">Sign out</button></div>' +
        "</div>";
      document.body.appendChild(modal);
      modal.querySelector("#sq-to-stay").focus();
      modal.querySelector("#sq-to-stay").addEventListener("click", function () { SQ.emit("sq:sessionextended", { form: formName }); close(); });
      modal.querySelector("#sq-to-out").addEventListener("click", expire);
      SQ.data.set("sessionTimeoutWarned", true, { refresh: true });
      note("F7", form);
      tick = setInterval(function () {
        left--;
        var c = document.getElementById("sq-to-count"); if (c) c.textContent = left;
        if (left <= 0) expire();
      }, 1000);
    }
    function expire() {
      if (done) return;
      done = true; clearInterval(tick);
      SQ.session.set("sqSessionExpired", formName);
      SQ.emit("sq:sessionexpired", { form: formName });
      // Fallback if navigation is blocked (e.g. some embedded previews): show the expired state in the modal
      if (modal) {
        modal.querySelector(".sq-modal").innerHTML = '<h2>Your session expired</h2><p>Your answers were cleared for your security.</p>' +
          '<a class="sq-btn" href="' + window.location.pathname + window.location.search + '">Start again</a>';
      }
      // pagehide in sq-forms.js records lastAbandonedForm if the form was in progress
      window.location.replace(window.location.pathname + window.location.search);
    }
    ["input", "change", "click", "keydown"].forEach(function (ev) { document.addEventListener(ev, reset, true); });
    reset();
  });

  // F3 (vague validation) is handled in sq-forms.js; F4 (slow search) uses SQ.friction.wait().
  SQ.log("friction", on ? "ON" : "OFF");
})();
