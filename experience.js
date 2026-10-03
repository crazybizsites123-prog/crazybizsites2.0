/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 13 — experience.js
   Final living-interface and section-awareness layer.
   ========================================================= */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const root = document.documentElement;
  const body = document.body;

  let sectionObserver = null;
  let spotlight = null;
  let rafId = null;

  const state = {
    currentSection: "",
    pointerX: 0,
    pointerY: 0,
    targetX: 0,
    targetY: 0
  };

  function addStyles() {
    if (
      document.getElementById(
        "cbs-experience-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "cbs-experience-styles";

    style.textContent = `
      .cbs-experience-spotlight {
        position: fixed;
        width: 420px;
        height: 420px;
        left: 0;
        top: 0;
        pointer-events: none;
        z-index: 1;
        border-radius: 50%;
        opacity: .18;
        background:
          radial-gradient(
            circle,
            rgba(199,255,61,.07),
            transparent 68%
          );
        transform:
          translate3d(
            var(--experience-x, -500px),
            var(--experience-y, -500px),
            0
          )
          translate(-50%, -50%);
        will-change: transform;
      }

      .cbs-section-counter {
        position: fixed;
        right: 22px;
        bottom: 22px;
        z-index: 50;
        display: flex;
        align-items: center;
        gap: 9px;
        font-family:
          "DM Sans",
          system-ui,
          sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .16em;
        text-transform: uppercase;
        color: rgba(255,255,255,.58);
        pointer-events: none;
        opacity: 0;
        transform: translateY(8px);
        transition:
          opacity .35s ease,
          transform .35s ease;
      }

      .cbs-section-counter.is-active {
        opacity: 1;
        transform: translateY(0);
      }

      .cbs-section-counter-line {
        width: 28px;
        height: 1px;
        background:
          rgba(199,255,61,.7);
        transform-origin: left center;
        transform:
          scaleX(
            var(--section-counter-progress, 0)
          );
        transition:
          transform .35s
          cubic-bezier(.16,1,.3,1);
      }

      section.cbs-section-active {
        --section-active: 1;
      }

      [data-experience-glow] {
        position: relative;
      }

      [data-experience-glow]::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0;
        background:
          radial-gradient(
            500px circle at
            var(--experience-local-x, 50%)
            var(--experience-local-y, 50%),
            rgba(199,255,61,.08),
            transparent 65%
          );
        transition: opacity .45s ease;
      }

      [data-experience-glow]:hover::after {
        opacity: 1;
      }

      @media (max-width: 700px) {
        .cbs-experience-spotlight {
          display: none;
        }

        .cbs-section-counter {
          right: 14px;
          bottom: 14px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cbs-experience-spotlight {
          display: none;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  function createSpotlight() {
    if (
      reducedMotion ||
      spotlight
    ) {
      return;
    }

    spotlight =
      document.createElement("div");

    spotlight.className =
      "cbs-experience-spotlight";

    spotlight.setAttribute(
      "aria-hidden",
      "true"
    );

    body.appendChild(
      spotlight
    );
  }

  function createCounter() {
    if (
      document.querySelector(
        ".cbs-section-counter"
      )
    ) {
      return;
    }

    const counter =
      document.createElement("div");

    counter.className =
      "cbs-section-counter";

    counter.setAttribute(
      "aria-hidden",
      "true"
    );

    counter.innerHTML = `
      <span class="cbs-section-counter-number">
        01
      </span>

      <span class="cbs-section-counter-line"></span>

      <span class="cbs-section-counter-total">
        01
      </span>
    `;

    body.appendChild(
      counter
    );
  }

  function getSections() {
    return Array.from(
      document.querySelectorAll(
        "main > section, section"
      )
    ).filter(
      (section) =>
        !section.matches(
          "[data-no-section-tracking]"
        )
    );
  }

  function sectionName(section) {
    if (!section) return "";

    return (
      section.dataset.section ||
      section.id ||
      section.querySelector(
        "h1, h2"
      )?.textContent ||
      ""
    )
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
  }

  function updateCounter(
    section,
    index,
    total
  ) {
    const counter =
      document.querySelector(
        ".cbs-section-counter"
      );

    if (!counter) return;

    const number =
      counter.querySelector(
        ".cbs-section-counter-number"
      );

    const totalEl =
      counter.querySelector(
        ".cbs-section-counter-total"
      );

    const progress =
      total > 1
        ? index / (total - 1)
        : 1;

    if (number) {
      number.textContent =
        String(index + 1)
          .padStart(2, "0");
    }

    if (totalEl) {
      totalEl.textContent =
        String(total)
          .padStart(2, "0");
    }

    counter.style.setProperty(
      "--section-counter-progress",
      progress.toFixed(3)
    );

    counter.classList.add(
      "is-active"
    );
  }

  function observeSections() {
    const sections =
      getSections();

    if (!sections.length) {
      return;
    }

    if (sectionObserver) {
      sectionObserver.disconnect();
    }

    sectionObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const section =
                entry.target;

              sections.forEach(
                (item) =>
                  item.classList.remove(
                    "cbs-section-active"
                  )
              );

              section.classList.add(
                "cbs-section-active"
              );

              state.currentSection =
                sectionName(
                  section
                );

              updateCounter(
                section,
                sections.indexOf(
                  section
                ),
                sections.length
              );

              if (
                window.CrazyBizSites
              ) {
                window.CrazyBizSites.emit(
                  "section:active",
                  {
                    section,
                    name:
                      state.currentSection,
                    index:
                      sections.indexOf(
                        section
                      ),
                    total:
                      sections.length
                  }
                );
              }
            }
          );
        },
        {
          threshold: 0.35,
          rootMargin:
            "-10% 0px -30% 0px"
        }
      );

    sections.forEach(
      (section) =>
        sectionObserver.observe(
          section
        )
    );
  }

  function bindPointerAtmosphere() {
    if (reducedMotion) {
      return;
    }

    window.addEventListener(
      "pointermove",
      (event) => {
        state.targetX =
          event.clientX;

        state.targetY =
          event.clientY;

        const target =
          event.target.closest(
            "[data-experience-glow]"
          );

        if (target) {
          const rect =
            target.getBoundingClientRect();

          const localX =
            ((event.clientX -
              rect.left) /
              rect.width) *
            100;

          const localY =
            ((event.clientY -
              rect.top) /
              rect.height) *
            100;

          target.style.setProperty(
            "--experience-local-x",
            `${localX.toFixed(1)}%`
          );

          target.style.setProperty(
            "--experience-local-y",
            `${localY.toFixed(1)}%`
          );
        }
      },
      { passive: true }
    );
  }

  function animate() {
    if (
      spotlight &&
      !reducedMotion
    ) {
      state.pointerX +=
        (state.targetX -
          state.pointerX) *
        0.08;

      state.pointerY +=
        (state.targetY -
          state.pointerY) *
        0.08;

      spotlight.style.setProperty(
        "--experience-x",
        `${state.pointerX}px`
      );

      spotlight.style.setProperty(
        "--experience-y",
        `${state.pointerY}px`
      );
    }

    rafId =
      requestAnimationFrame(
        animate
      );
  }

  function bindExperienceEvents() {
    if (
      !window.CrazyBizSites
    ) {
      return;
    }

    window.CrazyBizSites.on(
      "experience:ready",
      () => {
        root.classList.add(
          "cbs-experience-ready"
        );
      }
    );

    window.CrazyBizSites.on(
      "concierge:submitted",
      (payload) => {
        root.dataset.previewBusiness =
          payload.businessName ||
          "";

        root.dataset.previewType =
          payload.businessType ||
          "";
      }
    );
  }

  function init() {
    addStyles();
    createSpotlight();
    createCounter();
    observeSections();
    bindPointerAtmosphere();
    bindExperienceEvents();

    if (
      !reducedMotion
    ) {
      rafId =
        requestAnimationFrame(
          animate
        );
    }

    root.classList.add(
      "experience-layer-ready"
    );

    if (
      window.CrazyBizSites
    ) {
      window.CrazyBizSites.emit(
        "experience:layer-ready"
      );
    }
  }

  function refresh() {
    observeSections();
  }

  function destroy() {
    if (sectionObserver) {
      sectionObserver.disconnect();
    }

    if (rafId) {
      cancelAnimationFrame(
        rafId
      );
    }

    if (spotlight) {
      spotlight.remove();
      spotlight = null;
    }

    const counter =
      document.querySelector(
        ".cbs-section-counter"
      );

    if (counter) {
      counter.remove();
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }

  window.CrazyBizExperience = {
    refresh,
    destroy,
    getCurrentSection: () =>
      state.currentSection
  };
})();
