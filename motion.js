/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 04 — motion.js
   Scroll, parallax and cinematic movement engine.
   ========================================================= */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const isCoarsePointer = window.matchMedia(
    "(pointer: coarse)"
  ).matches;

  const root = document.documentElement;
  const body = document.body;

  const state = {
    scrollY: window.scrollY || 0,
    targetScrollY: window.scrollY || 0,
    ticking: false
  };

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const lerp = (start, end, amount) =>
    start + (end - start) * amount;

  function setVar(name, value) {
    root.style.setProperty(name, value);
  }

  function updateScrollVariables() {
    const scrollY = window.scrollY || 0;
    const viewportHeight = window.innerHeight || 1;
    const documentHeight = Math.max(
      document.documentElement.scrollHeight - viewportHeight,
      1
    );

    const progress = clamp(scrollY / documentHeight, 0, 1);
    const viewportProgress = clamp(
      scrollY / viewportHeight,
      0,
      12
    );

    setVar("--scroll-progress", progress.toFixed(4));
    setVar("--scroll-y", `${scrollY.toFixed(2)}px`);
    setVar(
      "--viewport-progress",
      viewportProgress.toFixed(4)
    );

    state.targetScrollY = scrollY;
  }

  function updateHeroParallax() {
    if (prefersReducedMotion) return;

    const hero =
      document.querySelector(".hero") ||
      document.querySelector("#hero");

    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const vh = window.innerHeight || 1;

    if (rect.bottom < 0 || rect.top > vh) return;

    const distance = clamp(
      -rect.top / Math.max(vh, 1),
      0,
      1
    );

    setVar(
      "--hero-shift",
      `${(distance * 72).toFixed(2)}px`
    );

    setVar(
      "--hero-scale",
      (1 + distance * 0.025).toFixed(4)
    );

    setVar(
      "--hero-opacity",
      (1 - distance * 0.42).toFixed(4)
    );
  }

  function updateSectionMotion() {
    if (prefersReducedMotion) return;

    const sections = document.querySelectorAll(
      "section, .section, [data-motion-section]"
    );

    if (!sections.length) return;

    const vh = window.innerHeight || 1;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();

      if (
        rect.bottom < -vh * 0.25 ||
        rect.top > vh * 1.25
      ) {
        return;
      }

      const center = rect.top + rect.height / 2;
      const offset = (center - vh / 2) / vh;
      const drift = clamp(offset, -1.5, 1.5);

      section.style.setProperty(
        "--section-drift",
        drift.toFixed(4)
      );
    });
  }

  function updateBrowserPerspective() {
    if (prefersReducedMotion) return;

    const browsers = document.querySelectorAll(
      ".browser-preview, .browser-window, [data-browser-motion]"
    );

    if (!browsers.length) return;

    const vh = window.innerHeight || 1;

    browsers.forEach((browser) => {
      const rect = browser.getBoundingClientRect();

      if (
        rect.bottom < -100 ||
        rect.top > vh + 100
      ) {
        return;
      }

      const visibility = 1 - Math.abs(
        (rect.top + rect.height / 2 - vh / 2) / vh
      );

      const normalized = clamp(visibility, 0, 1);
      const rotation = (1 - normalized) * 2.5;
      const lift = (1 - normalized) * 10;

      browser.style.setProperty(
        "--browser-rotate",
        `${rotation.toFixed(2)}deg`
      );

      browser.style.setProperty(
        "--browser-lift",
        `${lift.toFixed(2)}px`
      );
    });
  }

  function animate() {
    state.scrollY = lerp(
      state.scrollY,
      state.targetScrollY,
      0.14
    );

    setVar(
      "--smooth-scroll-y",
      `${state.scrollY.toFixed(2)}px`
    );

    updateHeroParallax();
    updateSectionMotion();
    updateBrowserPerspective();

    requestAnimationFrame(animate);
  }

  function requestUpdate() {
    if (state.ticking) return;

    state.ticking = true;

    requestAnimationFrame(() => {
      updateScrollVariables();
      state.ticking = false;
    });
  }

  function bindScroll() {
    window.addEventListener(
      "scroll",
      requestUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestUpdate,
      { passive: true }
    );
  }

  function bindPointerBrowserMotion() {
    if (prefersReducedMotion || isCoarsePointer) return;

    const browsers = document.querySelectorAll(
      ".browser-preview, .browser-window, [data-browser-motion]"
    );

    browsers.forEach((browser) => {
      browser.addEventListener("pointermove", (event) => {
        const rect = browser.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) /
            rect.width -
          0.5;

        const y =
          (event.clientY - rect.top) /
            rect.height -
          0.5;

        browser.style.setProperty(
          "--pointer-x",
          x.toFixed(4)
        );

        browser.style.setProperty(
          "--pointer-y",
          y.toFixed(4)
        );
      });

      browser.addEventListener("pointerleave", () => {
        browser.style.setProperty(
          "--pointer-x",
          "0"
        );

        browser.style.setProperty(
          "--pointer-y",
          "0"
        );
      });
    });
  }

  function markReady() {
    body.classList.add("motion-ready");
  }

  function init() {
    updateScrollVariables();
    bindScroll();
    bindPointerBrowserMotion();
    markReady();

    if (!prefersReducedMotion) {
      requestAnimationFrame(animate);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

  window.CrazyBizMotion = {
    refresh: requestUpdate,

    getScrollProgress: () =>
      parseFloat(
        getComputedStyle(root)
          .getPropertyValue("--scroll-progress") ||
          "0"
      )
  };
})();
