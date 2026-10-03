/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 06 — reveal.js
   Cinematic scroll-triggered reveal engine.
   ========================================================= */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const root = document.documentElement;

  let observer = null;

  function addStyles() {
    if (document.getElementById("cbs-reveal-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "cbs-reveal-styles";

    style.textContent = `
      [data-reveal],
      .reveal,
      .reveal-up,
      .reveal-left,
      .reveal-right,
      .reveal-scale {
        opacity: 0;
        will-change: transform, opacity;
        transition:
          opacity .9s cubic-bezier(.16,1,.3,1),
          transform 1s cubic-bezier(.16,1,.3,1);
      }

      [data-reveal],
      .reveal,
      .reveal-up {
        transform: translate3d(0, 48px, 0);
      }

      .reveal-left {
        transform: translate3d(-48px, 0, 0);
      }

      .reveal-right {
        transform: translate3d(48px, 0, 0);
      }

      .reveal-scale {
        transform: scale(.92);
      }

      [data-reveal].is-visible,
      .reveal.is-visible,
      .reveal-up.is-visible,
      .reveal-left.is-visible,
      .reveal-right.is-visible,
      .reveal-scale.is-visible {
        opacity: 1;
        transform: translate3d(0,0,0) scale(1);
      }

      [data-reveal][data-delay="1"] {
        transition-delay: .08s;
      }

      [data-reveal][data-delay="2"] {
        transition-delay: .16s;
      }

      [data-reveal][data-delay="3"] {
        transition-delay: .24s;
      }

      [data-reveal][data-delay="4"] {
        transition-delay: .32s;
      }

      [data-reveal][data-delay="5"] {
        transition-delay: .40s;
      }

      @media (prefers-reduced-motion: reduce) {
        [data-reveal],
        .reveal,
        .reveal-up,
        .reveal-left,
        .reveal-right,
        .reveal-scale {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function collectElements() {
    return document.querySelectorAll(
      [
        "[data-reveal]",
        ".reveal",
        ".reveal-up",
        ".reveal-left",
        ".reveal-right",
        ".reveal-scale"
      ].join(",")
    );
  }

  function revealImmediately(elements) {
    elements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  function createObserver(elements) {
    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);

          if (window.CrazyBizSites) {
            window.CrazyBizSites.emit(
              "reveal:visible",
              {
                element: entry.target
              }
            );
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) {
        observer.observe(element);
      }
    });
  }

  function init() {
    addStyles();

    const elements = collectElements();

    if (!elements.length) return;

    root.classList.add("reveal-engine-ready");

    if (reducedMotion) {
      revealImmediately(elements);
      return;
    }

    createObserver(elements);
  }

  function refresh() {
    init();
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

  window.CrazyBizReveal = {
    refresh,
    revealAll() {
      revealImmediately(collectElements());
    }
  };
})();
