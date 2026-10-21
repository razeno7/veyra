(function () {
  "use strict";

  // ---- LaunchPass links (set in config.js) ----
  var cfg = window.VEYRA_CONFIG || {};
  function wire(selector, url) {
    if (!url) return;
    document.querySelectorAll(selector).forEach(function (a) {
      a.setAttribute("href", url);
      a.setAttribute("rel", "noopener");
    });
  }
  wire("[data-join]", cfg.JOIN_URL);
  wire("[data-member]", cfg.MEMBER_URL);

  // ---- Mobile menu ----
  var menuBtn = document.querySelector(".menu-btn");
  var mobileNav = document.getElementById("mobile-nav");
  if (menuBtn && mobileNav) {
    function setMenu(open) {
      mobileNav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    menuBtn.addEventListener("click", function () {
      setMenu(!mobileNav.classList.contains("is-open"));
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  // ---- FAQ accordion ----
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    var answer = btn.closest(".faq-item").querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      answer.hidden = open;
    });
  });

  // ---- Mobile sticky CTA: appears once the membership section is reached ----
  var cta = document.querySelector(".mobile-cta");
  var membership = document.getElementById("membership");
  if (cta && membership && "IntersectionObserver" in window) {
    var ctaLink = cta.querySelector("a");
    var shown = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var reached = entry.isIntersecting || entry.boundingClientRect.top < 0;
        // Hide the bar while the pricing card itself is on screen, show it after.
        var show = reached && !entry.isIntersecting;
        if (show !== shown) {
          shown = show;
          cta.classList.toggle("is-visible", show);
          cta.setAttribute("aria-hidden", show ? "false" : "true");
          ctaLink.setAttribute("tabindex", show ? "0" : "-1");
          document.body.classList.toggle("has-mobile-cta", show);
        }
      });
    }, { threshold: 0 });
    io.observe(membership);
  }
})();
