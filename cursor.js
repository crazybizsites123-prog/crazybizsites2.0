/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 05 — cursor.js
   Premium custom cursor and pointer-light experience.
   Desktop only. Touch devices are left clean.
   ========================================================= */

(() => {
  "use strict";

  const finePointer = window.matchMedia(
    "(pointer: fine)"
  ).matches;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!finePointer || reducedMotion) {
    window.CrazyBizCursor = {
      enabled: false,
      refresh() {}
    };
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  let cursor;
  let ring;
  let spotlight;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let ringX = mouseX;
  let ringY = mouseY;

  let active = false;
  let rafId = null;

  const interactiveSelector = [
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "[role='button']",
    "[data-cursor]"
  ].join(",");

  function createCursor() {
    cursor = document.createElement("div");
    cursor.className = "cbs-cursor";

    ring = document.createElement("div");
    ring.className = "cbs-cursor-ring";

    spotlight = document.createElement("div");
    spotlight.className = "cbs-cursor-spotlight";

    cursor.setAttribute("aria-hidden", "true");
    ring.setAttribute("aria-hidden", "true");
    spotlight.setAttribute("aria-hidden", "true");

    body.appendChild(spotlight);
    body.appendChild(ring);
    body.appendChild(cursor);

    root.classList.add("custom-cursor-ready");
  }

  function moveCursor(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!active) {
      active = true;
      root.classList.add("cursor-active");
    }
  }

  function animate() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    if (cursor) {
      cursor.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }

    if (ring) {
      ring.style.transform =
        `translate3d(${ringX}px, ${ringY}px, 0)`;
    }

    if (spotlight) {
      spotlight.style.setProperty(
        "--cursor-x",
        `${mouseX}px`
      );

      spotlight.style.setProperty(
        "--cursor-y",
        `${mouseY}px`
      );
    }

    rafId = requestAnimationFrame(animate);
  }

  function setHoverState(element, hovering) {
    if (!element) return;

    if (hovering) {
      root.classList.add("cursor-hover");

      const customType =
        element.dataset.cursor || "";

      if (customType) {
        root.dataset.cursorType = customType;
      }
    } else {
      root.classList.remove("cursor-hover");
      delete root.dataset.cursorType;
    }
  }

  function bindInteractions() {
    document.addEventListener(
      "pointermove",
      moveCursor,
      { passive: true }
    );

    document.addEventListener(
      "pointerover",
      (event) => {
        const target =
          event.target.closest(interactiveSelector);

        if (target) {
          setHoverState(target, true);
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerout",
      (event) => {
        const target =
          event.target.closest(interactiveSelector);

        if (!target) return;

        const related = event.relatedTarget;

        if (
          related &&
          target.contains(related)
        ) {
          return;
        }

        setHoverState(target, false);
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerdown",
      () => {
        root.classList.add("cursor-pressed");
      },
      { passive: true }
    );

    document.addEventListener(
      "pointerup",
      () => {
        root.classList.remove("cursor-pressed");
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseleave",
      () => {
        root.classList.remove("cursor-active");
      }
    );
  }

  function injectStyles() {
    if (document.getElementById("cbs-cursor-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "cbs-cursor-styles";

    style.textContent = `
      .cbs-cursor,
      .cbs-cursor-ring {
        position: fixed;
        top: 0;
        left: 0;
        width: 1px;
        height: 1px;
        pointer-events: none;
        z-index: 99999;
        transform: translate3d(-100px, -100px, 0);
      }

      .cbs-cursor::after {
        content: "";
        position: absolute;
        width: 7px;
        height: 7px;
        left: -3.5px;
        top: -3.5px;
        border-radius: 50%;
        background: currentColor;
        color: #c7ff3d;
        box-shadow:
          0 0 12px currentColor,
          0 0 28px currentColor;
        transition:
          transform .22s ease,
          opacity .22s ease;
      }

      .cbs-cursor-ring {
        width: 34px;
        height: 34px;
        margin-left: -17px;
        margin-top: -17px;
        border: 1px solid rgba(199,255,61,.65);
        border-radius: 50%;
        transition:
          width .25s ease,
          height .25s ease,
          margin .25s ease,
          border-color .25s ease,
          background .25s ease;
      }

      .cbs-cursor-spotlight {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        opacity: 0;
        background:
          radial-gradient(
            360px circle at
            var(--cursor-x, 50%)
            var(--cursor-y, 50%),
            rgba(199,255,61,.055),
            transparent 68%
          );
        transition: opacity .4s ease;
      }

      .custom-cursor-ready.cursor-active
      .cbs-cursor-spotlight {
        opacity: 1;
      }

      .custom-cursor-ready.cursor-hover
      .cbs-cursor-ring {
        width: 54px;
        height: 54px;
        margin-left: -27px;
        margin-top: -27px;
        border-color: rgba(199,255,61,.95);
        background: rgba(199,255,61,.045);
      }

      .custom-cursor-ready.cursor-hover
      .cbs-cursor::after {
        transform: scale(.7);
      }

      .custom-cursor-ready.cursor-pressed
      .cbs-cursor-ring {
        width: 44px;
        height: 44px;
        margin-left: -22px;
        margin-top: -22px;
      }

      @media (pointer: coarse) {
        .cbs-cursor,
        .cbs-cursor-ring,
        .cbs-cursor-spotlight {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function init() {
    if (!body) return;

    injectStyles();
    createCursor();
    bindInteractions();

    rafId = requestAnimationFrame(animate);
  }

  init();

  window.CrazyBizCursor = {
    enabled: true,

    refresh() {
      if (!cursor) {
        init();
      }
    },

    destroy() {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      [
        cursor,
        ring,
        spotlight
      ].forEach((element) => {
        if (element) element.remove();
      });

      root.classList.remove(
        "custom-cursor-ready",
        "cursor-active",
        "cursor-hover",
        "cursor-pressed"
      );
    }
  };
})();
