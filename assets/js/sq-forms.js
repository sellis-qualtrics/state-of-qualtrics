/* ==========================================================================
   State of Qualtrics: Multi-Step Form Engine (P0 §9)

   Markup:
   <form class="sq-form" data-form-name="license-renewal" data-cancel-href="index.html" novalidate>
     <fieldset class="sq-fieldset" data-sq-step data-step-name="Eligibility"> … </fieldset>
     <fieldset class="sq-fieldset" data-sq-step data-step-name="Review"><div data-sq-review></div></fieldset>
     <div data-sq-confirmation hidden> … <span data-sq-confirmation-number></span> … </div>
   </form>

   Field options:
     required / pattern / type=email etc.   Native constraints
     data-error="Message"                   Specific error message
     data-sq-friction="F3"                  Vague "Invalid entry" error + hint hidden while friction is ON
     data-sq-show-if="fieldName=value"      Conditional block (any element)
     data-sq-step-if="fieldName=value"      Conditional step (on a fieldset)
   ========================================================================== */
(function () {
  "use strict";
  var SQ = (window.SQ = window.SQ || {});
  var frictionOn = window.sqDataLayer.frictionMode === "on";

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function confNumber(prefix) {
    var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    for (var i = 0; i < 8; i++) s += c[Math.floor(Math.random() * c.length)];
    return (prefix || "SQ") + "-" + s.slice(0, 4) + "-" + s.slice(4);
  }

  function SQForm(form) {
    var self = this;
    this.form = form;
    this.name = form.getAttribute("data-form-name") || window.sqDataLayer.formName || "form";
    this.allSteps = [].slice.call(form.querySelectorAll("[data-sq-step]"));
    this.confirmation = form.querySelector("[data-sq-confirmation]");
    this.index = 0;
    this.maxReached = 0;
    this.status = "not-started";

    // Prepare F3 hints
    [].slice.call(form.querySelectorAll('[data-sq-friction="F3"]')).forEach(function (f) {
      var hint = form.querySelector('[data-f3-hint="' + f.id + '"]');
      if (hint) hint.hidden = frictionOn;
    });

    // Step indicator + counter
    this.indicator = document.createElement("div");
    form.insertBefore(this.indicator, form.firstChild);

    // Action bar
    this.actions = document.createElement("div");
    this.actions.className = "sq-form__actions";
    var cancelHref = form.getAttribute("data-cancel-href") || "index.html";
    this.actions.innerHTML =
      '<button type="button" class="sq-btn sq-btn--outline" data-sq-back>Back</button>' +
      '<button type="button" class="sq-btn" data-sq-next>Continue</button>' +
      '<a class="sq-btn sq-btn--link" href="' + cancelHref + '" data-sq-exit>Cancel and exit</a>';
    if (this.confirmation) form.insertBefore(this.actions, this.confirmation); else form.appendChild(this.actions);

    this.actions.querySelector("[data-sq-back]").addEventListener("click", function () { self.go(self.index - 1); });
    this.actions.querySelector("[data-sq-next]").addEventListener("click", function () { self.next(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); self.next(); });

    // Conditional fields
    form.addEventListener("change", function () { self.applyConditions(); });
    form.addEventListener("input", function () {
      if (self.status === "not-started") self.setStatus("in-progress");
    });
    this.applyConditions();

    // Browser back/forward via hash
    window.addEventListener("hashchange", function () {
      var m = location.hash.match(/^#step-(\d+)$/);
      if (!m) return;
      var target = parseInt(m[1], 10) - 1;
      if (target !== self.index && target <= self.maxReached) self.go(target, true);
    });

    // Abandonment
    window.addEventListener("pagehide", function () {
      if (self.status === "in-progress") {
        SQ.session.set("sqLastAbandonedForm", self.name);
        SQ.session.set("sqLastAbandonedStep", String(self.index + 1));
      }
    });

    // Restarting a previously abandoned form clears the flag for future pages
    if (window.sqDataLayer.lastAbandonedForm === this.name) {
      SQ.session.remove("sqLastAbandonedForm"); SQ.session.remove("sqLastAbandonedStep");
    }

    this.go(0, true);
  }

  SQForm.prototype.steps = function () {
    var form = this.form;
    return this.allSteps.filter(function (s) { return SQForm.test(form, s.getAttribute("data-sq-step-if")); });
  };

  SQForm.test = function (form, cond) {
    if (!cond) return true;
    var parts = cond.split("="), name = parts[0], vals = (parts[1] || "").split("|");
    var els = form.querySelectorAll('[name="' + name + '"]');
    var current = [];
    [].forEach.call(els, function (el) {
      if (el.type === "radio" || el.type === "checkbox") { if (el.checked) current.push(el.value); }
      else current.push(el.value);
    });
    if (!current.length) current = [""];
    return current.some(function (v) { return vals.indexOf(v) !== -1; });
  };

  SQForm.prototype.applyConditions = function () {
    var form = this.form;
    [].forEach.call(form.querySelectorAll("[data-sq-show-if]"), function (el) {
      var show = SQForm.test(form, el.getAttribute("data-sq-show-if"));
      el.hidden = !show;
      [].forEach.call(el.querySelectorAll("input,select,textarea"), function (i) { i.disabled = !show; });
    });
  };

  SQForm.prototype.setStatus = function (s) {
    this.status = s;
    SQ.data.set("formStatus", s, { refresh: true });
  };

  SQForm.prototype.renderIndicator = function () {
    var steps = this.steps(), idx = this.index;
    this.indicator.innerHTML =
      '<ol class="sq-steps" aria-label="Progress">' +
      steps.map(function (s, i) {
        var cls = i < idx ? "is-complete" : i === idx ? "is-current" : "";
        return '<li class="' + cls + '"' + (i === idx ? ' aria-current="step"' : "") + "><span>" + esc(s.getAttribute("data-step-name") || "Step " + (i + 1)) + "</span></li>";
      }).join("") + "</ol>" +
      '<div class="sq-steps__counter"><span>' + (idx + 1) + "</span>of " + steps.length + "</div>";
  };

  SQForm.prototype.go = function (i, silentHash) {
    var steps = this.steps();
    if (i < 0 || i >= steps.length) return;
    this.allSteps.forEach(function (s) { s.hidden = true; });
    steps[i].hidden = false;
    this.index = i;
    this.maxReached = Math.max(this.maxReached, i);
    this.clearErrors(steps[i]);

    this.actions.querySelector("[data-sq-back]").hidden = i === 0;
    this.updateLabel();

    if (steps[i].querySelector("[data-sq-review]")) this.renderReview(steps[i].querySelector("[data-sq-review]"));
    this.renderIndicator();

    var hash = "#step-" + (i + 1);
    var onStepHash = !location.hash || /^#step-\d+$/.test(location.hash);
    if (location.hash !== hash) {
      // On first load, keep any non-step anchor (e.g. #accessibility) so in-page links still work
      if (silentHash && i === 0) { if (onStepHash) history.replaceState(null, "", hash); }
      else history.pushState(null, "", hash);
    }

    SQ.data.merge({
      formName: this.name,
      formStep: i + 1,
      formStepName: steps[i].getAttribute("data-step-name") || "",
      formTotalSteps: steps.length
    });
    SQ.emit("sq:formstep", { form: this.name, step: i + 1, name: steps[i].getAttribute("data-step-name") });
    if (SQ.dx) SQ.dx.refresh("formStep");

    if (!silentHash) {
      var top = this.form.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: top, behavior: "smooth" });
      var legend = steps[i].querySelector("legend");
      if (legend) { legend.setAttribute("tabindex", "-1"); legend.focus({ preventScroll: true }); }
    }
  };

  // Re-read data-submit-label (pages may change it, e.g. to show a fee total)
  SQForm.prototype.updateLabel = function () {
    var isLast = this.index === this.steps().length - 1;
    this.actions.querySelector("[data-sq-next]").textContent = isLast ? (this.form.getAttribute("data-submit-label") || "Submit") : "Continue";
  };

  SQForm.prototype.next = function () {
    var steps = this.steps();
    if (!this.validate(steps[this.index])) return;
    // Stop panels: a visible [data-sq-stop] blocks progress (e.g. ineligible, missing time slot)
    var stop = [].filter.call(steps[this.index].querySelectorAll("[data-sq-stop]"), function (el) { return !el.closest("[hidden]"); })[0];
    if (stop) {
      var reason = stop.getAttribute("data-sq-stop");
      stop.classList.add("sq-alert--error", "is-blocking");
      stop.setAttribute("role", "alert"); stop.setAttribute("tabindex", "-1"); stop.focus();
      SQ.data.set("formBlockedReason", reason);
      SQ.emit("sq:formblocked", { form: this.name, step: this.index + 1, reason: reason });
      if (SQ.dx) SQ.dx.refresh("formBlocked");
      return;
    }
    if (this.status === "not-started") this.setStatus("in-progress");
    if (this.index === steps.length - 1) this.submit();
    else this.go(this.index + 1);
  };

  SQForm.prototype.clearErrors = function (step) {
    [].forEach.call(step.querySelectorAll(".sq-field.has-error"), function (f) { f.classList.remove("has-error"); });
    [].forEach.call(step.querySelectorAll(".sq-error-msg"), function (m) { m.remove(); });
    var sum = step.querySelector(".sq-alert--error[data-sq-summary]");
    if (sum) sum.remove();
  };

  SQForm.prototype.validate = function (step) {
    this.clearErrors(step);
    var errors = [], seenRadio = {};
    var inputs = [].slice.call(step.querySelectorAll("input,select,textarea")).filter(function (el) {
      return !el.disabled && el.closest("[hidden]") === null;
    });

    inputs.forEach(function (el) {
      if (el.type === "radio") {
        if (seenRadio[el.name]) return;
        seenRadio[el.name] = true;
        var group = step.querySelectorAll('input[type="radio"][name="' + el.name + '"]');
        var required = [].some.call(group, function (r) { return r.required; });
        var checked = [].some.call(group, function (r) { return r.checked; });
        if (required && !checked) errors.push({ el: group[0], msg: el.getAttribute("data-error") || "Select an option" });
        return;
      }
      if (!el.checkValidity()) {
        var isF3 = el.getAttribute("data-sq-friction") === "F3";
        var msg;
        if (isF3 && frictionOn) msg = "Invalid entry";
        else if (el.validity.valueMissing) msg = el.getAttribute("data-required-error") || "This field is required";
        else msg = el.getAttribute("data-error") || "Enter a valid value";
        errors.push({ el: el, msg: msg });
        if (isF3) SQ.emit("sq:friction", { code: "F3", id: el.id });
      }
    });

    // Checkbox groups: [data-sq-require-one="Error message"] needs at least one checked box
    [].forEach.call(step.querySelectorAll("[data-sq-require-one]"), function (grp) {
      if (grp.closest("[hidden]")) return;
      var boxes = [].filter.call(grp.querySelectorAll('input[type="checkbox"]'), function (b) { return !b.disabled; });
      if (boxes.length && !boxes.some(function (b) { return b.checked; })) {
        errors.push({ el: boxes[0], msg: grp.getAttribute("data-sq-require-one") || "Select at least one option" });
      }
    });

    if (!errors.length) return true;

    errors.forEach(function (er) {
      var field = er.el.closest(".sq-field") || er.el.parentElement;
      field.classList.add("has-error");
      var m = document.createElement("span");
      m.className = "sq-error-msg"; m.id = (er.el.id || er.el.name) + "-error"; m.textContent = er.msg;
      var label = field.querySelector(".sq-label, legend");
      if (label && label.nextSibling) field.insertBefore(m, label.nextSibling); else field.insertBefore(m, field.firstChild);
      er.el.setAttribute("aria-describedby", m.id);
      er.el.setAttribute("aria-invalid", "true");
    });

    var summary = document.createElement("div");
    summary.className = "sq-alert sq-alert--error";
    summary.setAttribute("data-sq-summary", "");
    summary.setAttribute("role", "alert");
    summary.setAttribute("tabindex", "-1");
    summary.innerHTML = '<p class="sq-alert__heading">There ' + (errors.length === 1 ? "is 1 problem" : "are " + errors.length + " problems") + " with this page</p><ul>" +
      errors.map(function (er) {
        var isChoice = er.el.type === "radio" || er.el.type === "checkbox";
        var lbl = isChoice ? null : step.querySelector('label[for="' + er.el.id + '"]');
        var groupFs = er.el.closest("fieldset");
        var name = lbl ? lbl.textContent.replace("*", "").trim()
          : (groupFs && groupFs.querySelector("legend") ? groupFs.querySelector("legend").textContent.replace("*", "").trim() : "Field");
        return '<li><a href="#' + (er.el.id || "") + '">' + esc(name) + ": " + esc(er.msg) + "</a></li>";
      }).join("") + "</ul>";
    var legend = step.querySelector("legend");
    if (legend && legend.nextSibling) step.insertBefore(summary, legend.nextSibling); else step.insertBefore(summary, step.firstChild);
    summary.focus();

    SQ.data.set("errorCount", (window.sqDataLayer.errorCount || 0) + errors.length);
    SQ.emit("sq:formerror", { form: this.name, step: this.index + 1, count: errors.length, fields: errors.map(function (e) { return e.el.name || e.el.id; }) });
    if (SQ.dx) SQ.dx.refresh("errorCount");
    return false;
  };

  SQForm.prototype.renderReview = function (target) {
    var form = this.form, rows = [], seen = {};
    this.steps().forEach(function (s) {
      if (s.contains(target)) return;
      [].forEach.call(s.querySelectorAll("input,select,textarea"), function (el) {
        if (el.disabled) return; // hidden conditional fields are disabled by applyConditions()
        if (!el.name) return;
        if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
        var opt = form.querySelector('label[for="' + el.id + '"]');
        // Tile options put the option name in <strong> and a hint after it; show only the name
        var optText = (opt ? (opt.querySelector("strong") || opt).textContent : el.value).trim();
        // Multiple checked checkboxes with the same name are combined into one row
        if (el.type === "checkbox" && seen[el.name] !== undefined) { rows[seen[el.name]][1] += ", " + optText; return; }
        if (seen[el.name] !== undefined) return;
        seen[el.name] = rows.length;
        var label;
        if (el.type === "radio" || el.type === "checkbox") {
          var fs = el.closest("fieldset.sq-field, .sq-field");
          label = fs && fs.querySelector("legend, .sq-label") ? fs.querySelector("legend, .sq-label").textContent : el.name;
          rows.push([label, optText]);
        } else {
          var l = form.querySelector('label[for="' + el.id + '"]');
          var val = el.tagName === "SELECT" ? (el.options[el.selectedIndex] || {}).text : el.value;
          if (el.type === "password") val = "••••";
          else if (el.hasAttribute("data-sq-mask") && val) val = "•••• " + val.replace(/\s/g, "").slice(-4);
          rows.push([l ? l.textContent : el.name, val || "—"]);
        }
      });
    });
    target.innerHTML = '<table class="sq-table"><tbody>' +
      rows.map(function (r) { return "<tr><th scope=\"row\">" + esc(r[0].replace("*", "").trim()) + "</th><td>" + esc(r[1]) + "</td></tr>"; }).join("") +
      "</tbody></table>";
  };

  SQForm.prototype.submit = function () {
    var num = confNumber(this.form.getAttribute("data-confirmation-prefix"));
    this.allSteps.forEach(function (s) { s.hidden = true; });
    this.actions.hidden = true;
    this.indicator.hidden = true;
    if (this.confirmation) {
      this.confirmation.hidden = false;
      [].forEach.call(this.confirmation.querySelectorAll("[data-sq-confirmation-number]"), function (n) { n.textContent = num; });
    }
    history.replaceState(null, "", "#confirmation");
    SQ.session.remove("sqLastAbandonedForm"); SQ.session.remove("sqLastAbandonedStep");
    this.status = "submitted";
    SQ.data.merge({ formStatus: "submitted", pageType: "confirmation", confirmationNumber: num });
    SQ.emit("sq:formsubmit", { form: this.name, confirmationNumber: num });
    if (SQ.dx) SQ.dx.refresh("formSubmit");
    var fb = document.getElementById("sq-page-feedback");
    if (fb && fb.querySelector("[data-sq-native-feedback]")) fb.innerHTML = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  SQ.forms = [];
  [].forEach.call(document.querySelectorAll("form.sq-form[data-form-name]"), function (f) { SQ.forms.push(new SQForm(f)); });
})();
