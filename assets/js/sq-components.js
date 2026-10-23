/* ==========================================================================
   State of Qualtrics: Shared Components (P0 §8)
   Injects: gov banner, header, global nav, agency sub-nav, notice, breadcrumbs,
   page feedback fallback, footer, demo controls. Load at end of <body>.
   ========================================================================== */
(function () {
  "use strict";
  var SQ = (window.SQ = window.SQ || {});
  var page = window.sqPage || {};
  var dl = window.sqDataLayer;
  var root = SQ.root;
  var agencyKey = dl.agency;
  var agency = SQ.agencies[agencyKey];
  var currentFile = (window.location.pathname.split("/").pop() || "index.html");
  var currentDir = window.location.pathname.split("/").slice(-2, -1)[0] || "";

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function url(agencyPath, file) { return root + agencyPath + file; }

  // ---------- Icons (original, simple line icons) ----------
  SQ.icons = {
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h14M3 13l2-6h14l2 6v4H3z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
    dollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
    id: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2.5"/><path d="M14 10h5M14 14h3"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
    tree: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2 5 12h4l-3 5h12l-3-5h4zM12 17v5"/></svg>'
  };

  // Fill <span data-sq-icon="car"></span> placeholders
  [].forEach.call(document.querySelectorAll("[data-sq-icon]"), function (el) {
    var svg = SQ.icons[el.getAttribute("data-sq-icon")];
    if (svg) { el.innerHTML = svg; el.setAttribute("aria-hidden", "true"); }
  });

  // ---------- Gov banner ----------
  var bannerHTML =
    '<section class="sq-govbanner" aria-label="Official demo website banner">' +
      '<div class="sq-container">' +
        '<span class="sq-govbanner__flag" aria-hidden="true"></span>' +
        '<span>An official <strong>demo</strong> website of the State of Qualtrics.</span>' +
        '<button type="button" aria-expanded="false" aria-controls="sq-govbanner-detail" id="sq-govbanner-btn">Here\'s how you know</button>' +
      '</div>' +
      '<div class="sq-govbanner__detail" id="sq-govbanner-detail">' +
        '<div class="sq-container">' +
          '<p><strong>This is a fictitious demo site.</strong> The State of Qualtrics is not a real government. ' +
          'No real services are provided and no information you enter is stored or sent anywhere. ' +
          'This site shows how Qualtrics Digital Experience works on a government website.</p>' +
        '</div>' +
      '</div>' +
    '</section>';

  // ---------- Header ----------
  var globalNav = [
    ["Home", url("", "index.html"), "portal"],
    ["Motor Vehicles", url("dmv/", "index.html"), "dmv"],
    ["Taxes & Revenue", url("revenue/", "index.html"), "revenue"],
    ["Health & Human Services", url("hhs/", "index.html"), "hhs"],
    ["Jobs & Unemployment", url("labor/", "index.html"), "labor"],
    ["All Agencies", url("", "agencies.html"), "agencies"],
    ["Contact", url("", "contact.html"), "contact"]
  ];

  function isGlobalCurrent(key) {
    if (key === "portal") return agencyKey === "portal" && currentFile === "index.html";
    if (key === "agencies") return agencyKey === "portal" && currentFile === "agencies.html";
    if (key === "contact") return agencyKey === "portal" && currentFile === "contact.html";
    return agencyKey === key;
  }

  var navItems = globalNav.map(function (n) {
    return '<li><a href="' + n[1] + '"' + (isGlobalCurrent(n[2]) ? ' aria-current="page"' : "") + ">" + esc(n[0]) + "</a></li>";
  }).join("");

  var subnav = "";
  if (agencyKey !== "portal" && agency.nav.length) {
    subnav = '<nav class="sq-subnav" aria-label="' + esc(agency.short) + ' navigation"><div class="sq-container"><ul>' +
      '<li class="sq-subnav__label">' + esc(agency.short) + ":</li>" +
      agency.nav.map(function (n) {
        var cur = currentDir === agency.path.replace("/", "") && currentFile === n[1];
        return '<li><a href="' + url(agency.path, n[1]) + '"' + (cur ? ' aria-current="page"' : "") + ">" + esc(n[0]) + "</a></li>";
      }).join("") +
      "</ul></div></nav>";
  }

  var headerHTML =
    bannerHTML +
    '<header class="sq-header" id="sq-site-header">' +
      '<div class="sq-container sq-header__top">' +
        '<a class="sq-brand" href="' + url(agency.path, "index.html") + '">' +
          '<img src="' + root + 'assets/img/seal.png" alt="" width="56" height="56">' +
          "<span><span class=\"sq-brand__name\">State of Qualtrics</span>" +
          (agencyKey !== "portal" ? '<span class="sq-brand__agency">' + esc(agency.name) + "</span>" : '<span class="sq-brand__agency">Official State Portal</span>') +
          "</span>" +
        "</a>" +
        '<form class="sq-search" role="search" action="' + root + 'search.html" method="get" id="sq-header-search">' +
          '<label for="sq-search-input" class="sq-visually-hidden">Search the State of Qualtrics</label>' +
          '<input id="sq-search-input" name="q" type="search" placeholder="Search services, forms, agencies">' +
          '<button type="submit">Search</button>' +
        "</form>" +
      "</div>" +
      '<nav class="sq-nav" aria-label="Primary" id="sq-primary-nav">' +
        '<button class="sq-nav__toggle" type="button" aria-expanded="false">☰ Menu</button>' +
        '<div class="sq-container"><ul>' + navItems + "</ul></div>" +
      "</nav>" +
      subnav +
      '<span id="sq-feedback-tab-anchor"></span>' +
    "</header>";

  var noticeHTML = page.notice
    ? '<div class="sq-notice" role="region" aria-label="Notice"><div class="sq-container"><span aria-hidden="true">⚠️</span><div>' + page.notice + "</div></div></div>"
    : "";

  var headerSlot = document.getElementById("sq-header");
  if (headerSlot) headerSlot.outerHTML = headerHTML + noticeHTML;

  // Banner toggle
  var gbBtn = document.getElementById("sq-govbanner-btn");
  if (gbBtn) gbBtn.addEventListener("click", function () {
    var d = document.getElementById("sq-govbanner-detail");
    var open = d.classList.toggle("is-open");
    gbBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  // Mobile nav toggle
  var nav = document.getElementById("sq-primary-nav");
  if (nav) nav.querySelector(".sq-nav__toggle").addEventListener("click", function (e) {
    var open = nav.classList.toggle("is-open");
    e.currentTarget.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---------- Breadcrumbs ----------
  var bcSlot = document.getElementById("sq-breadcrumbs");
  if (bcSlot) {
    var crumbs = page.breadcrumbs || (function () {
      var c = [["Home", url("", "index.html")]];
      if (agencyKey !== "portal" && dl.pageType !== "landing") c.push([agency.short, url(agency.path, "index.html")]);
      c.push([dl.pageName, null]);
      return c;
    })();
    bcSlot.outerHTML = '<nav class="sq-breadcrumbs" aria-label="Breadcrumb"><ol>' +
      crumbs.map(function (c) {
        return c[1] ? '<li><a href="' + c[1] + '">' + esc(c[0]) + "</a></li>" : '<li aria-current="page">' + esc(c[0]) + "</li>";
      }).join("") + "</ol></nav>";
  }

  // ---------- Page feedback fallback (#sq-page-feedback) ----------
  var fb = document.getElementById("sq-page-feedback");
  var cfg = window.SQ_DX_CONFIG || {};
  if (fb && cfg.nativeFeedbackFallback && dl.pageType !== "confirmation") {
    fb.innerHTML =
      '<div class="sq-feedback" data-sq-native-feedback>' +
        '<p class="sq-feedback__q" id="sq-fb-q">Was this page helpful?</p>' +
        '<div class="sq-btn-group" role="group" aria-labelledby="sq-fb-q">' +
          '<button type="button" class="sq-btn sq-btn--outline" data-fb="yes">Yes</button>' +
          '<button type="button" class="sq-btn sq-btn--outline" data-fb="no">No</button>' +
        "</div>" +
      "</div>";
    fb.addEventListener("click", function (e) {
      var b = e.target.closest("[data-fb]");
      if (b) {
        var val = b.getAttribute("data-fb");
        SQ.data.set("pageHelpful", val);
        SQ.emit("sq:feedback", { helpful: val });
        if (val === "yes") {
          fb.innerHTML = '<div class="sq-feedback"><p class="sq-feedback__thanks">Thanks for your feedback!</p></div>';
        } else {
          fb.innerHTML = '<div class="sq-feedback" style="display:block">' +
            '<label class="sq-label" for="sq-fb-text">What were you looking for?</label>' +
            '<textarea id="sq-fb-text" class="sq-textarea" style="max-width:40rem"></textarea>' +
            '<p style="margin-top:12px"><button type="button" class="sq-btn" data-fb-send>Send feedback</button></p></div>';
        }
      }
      if (e.target.closest("[data-fb-send]")) {
        fb.innerHTML = '<div class="sq-feedback"><p class="sq-feedback__thanks">Thanks. Your feedback helps us improve this page.</p></div>';
      }
    });
  }

  // ---------- Footer ----------
  var agencyLinks = ["dmv", "revenue", "hhs", "labor"].map(function (k) {
    return '<li><a href="' + url(SQ.agencies[k].path, "index.html") + '">' + esc(SQ.agencies[k].name) + "</a></li>";
  }).join("");

  var footerHTML =
    '<footer class="sq-footer" id="sq-site-footer">' +
      '<div class="sq-container sq-footer__top">' +
        '<div class="sq-footer__brand">' +
          '<img src="' + root + 'assets/img/seal.png" alt="Seal of the State of Qualtrics">' +
          "<div><h2>State of Qualtrics</h2><p style=\"margin:0\">Capitol Building, 100 Experience Way<br>Capitol City, SQ 84601<br>1-555-SQ-STATE (1-555-777-8283)</p></div>" +
        "</div>" +
        "<div><h2>Agencies</h2><ul>" + agencyLinks + "</ul></div>" +
        "<div><h2>Popular services</h2><ul>" +
          '<li><a href="' + url("dmv/", "license-renewal.html") + '">Renew a driver license</a></li>' +
          '<li><a href="' + url("revenue/", "refund-status.html") + '">Check refund status</a></li>' +
          '<li><a href="' + url("hhs/", "eligibility.html") + '">Check benefits eligibility</a></li>' +
          '<li><a href="' + url("labor/", "file-claim.html") + '">File for unemployment</a></li>' +
        "</ul></div>" +
        "<div><h2>About</h2><ul>" +
          '<li><a href="' + url("", "contact.html") + '">Contact us</a></li>' +
          '<li><a href="' + url("", "agencies.html") + '">Agency directory</a></li>' +
          '<li><a href="' + url("", "contact.html") + '#accessibility">Accessibility</a></li>' +
          '<li><a href="' + url("", "contact.html") + '#privacy">Privacy policy</a></li>' +
        "</ul></div>" +
      "</div>" +
      '<div class="sq-container sq-footer__bottom">' +
        "<span>© 2026 State of Qualtrics. A fictitious government created to demo Qualtrics Digital Experience.</span>" +
        '<button type="button" class="sq-footer__demo" id="sq-democtl-open">Demo controls</button>' +
      "</div>" +
    "</footer>";

  var footerSlot = document.getElementById("sq-footer");
  if (footerSlot) footerSlot.outerHTML = footerHTML;

  // ---------- Demo controls panel ----------
  function openDemoControls() {
    var existing = document.getElementById("sq-democtl");
    if (existing) { existing.remove(); return; }
    var p = document.createElement("div");
    p.className = "sq-democtl"; p.id = "sq-democtl";
    p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "Demo controls");
    var fOn = window.sqDataLayer.frictionMode === "on";
    p.innerHTML =
      "<h2>Demo controls</h2>" +
      "<p style=\"margin:0 0 8px\">Friction: <strong>" + (fOn ? "ON" : "OFF") + "</strong> · Qualtrics: <strong>" + (SQ.dx && SQ.dx.isLoaded() ? "loaded" : "not loaded") + "</strong></p>" +
      '<div class="sq-btn-group">' +
        '<button type="button" class="sq-btn" data-ctl="friction">' + (fOn ? "Turn friction off" : "Turn friction on") + "</button>" +
        '<button type="button" class="sq-btn sq-btn--outline" data-ctl="reset">Reset session</button>' +
      "</div>" +
      "<pre id=\"sq-democtl-dl\"></pre>" +
      '<button type="button" class="sq-btn sq-btn--link" data-ctl="close">Close</button>';
    document.body.appendChild(p);
    var pre = p.querySelector("#sq-democtl-dl");
    var render = function () { pre.textContent = "window.sqDataLayer = " + JSON.stringify(window.sqDataLayer, null, 2); };
    render();
    window.addEventListener("sq:datachange", render);
    p.addEventListener("click", function (e) {
      var c = e.target.getAttribute("data-ctl");
      if (c === "friction") { SQ.session.set("sqFriction", fOn ? "off" : "on"); window.location.reload(); }
      if (c === "reset") { try { sessionStorage.clear(); } catch (x) {} window.location.reload(); }
      if (c === "close") p.remove();
    });
  }
  var dcBtn = document.getElementById("sq-democtl-open");
  if (dcBtn) dcBtn.addEventListener("click", openDemoControls);
  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.shiftKey && (e.key === "D" || e.key === "d" || e.code === "KeyD")) openDemoControls();
  });
  if (new URLSearchParams(location.search).get("democtl") === "1") openDemoControls();

  // ---------- Exit-link tracking ([data-sq-exit]) ----------
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-sq-exit]");
    if (a) SQ.emit("sq:exitclick", { label: a.textContent.trim(), href: a.getAttribute("href") });
  });

  SQ.emit("sq:componentsready");
})();
