/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 07 — tilt.js
   Interactive 3D showcase-card movement.
   ========================================================= */

(() => {
  "use strict";

  const finePointer = window.matchMedia(
    "(pointer: fine)"
  ).matches;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const cardsSelector = [
    ".showcase-card",
    ".showcase-item",
    ".category-card",
    "[data-tilt]"
  ].join(",");

  const cards = () =>
    document.querySelectorAll(cardsSelector);

  function addStyles() {
    if (document.getElementById("cbs-tilt-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "cbs-tilt-styles";

    style.textContent = `
      [data-tilt],
      .showcase-card,
      .showcase-item,
      .category-card {
        --tilt-x: 0deg;
        --tilt-y: 0deg;
        --tilt-z: 0deg;
        --tilt-scale: 1;
        --tilt-lift: 0px;

        transform:
          perspective(1100px)
          rotateX(var(--tilt-y))
          rotateY(var(--tilt-x))
          rotateZ(var(--tilt-z))
          translateY(var(--tilt-lift))
          scale(var(--tilt-scale));

        transform-style: preserve-3d;
        will-change: transform;
        transition:
          transform .35s cubic-bezier(.16,1,.3,1);
      }

      [data-tilt].cbs-tilt-active,
      .showcase-card.cbs-tilt-active,
      .showcase-item.cbs-tilt-active,
      .category-card.cbs-tilt-active {
        --tilt-scale: 1.025;
        --tilt-lift: -4px;
        transition: transform .08s linear;
      }

      [data-tilt]::after,
      .showcase-card::after,
      .showcase-item::after,
      .category-card::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
        opacity: 0;
        background:
          radial-gradient(
            360px circle at
            var(--tilt-glow-x, 50%)
            var(--tilt-glow-y, 50%),
            rgba(199,255,61,.14),
            transparent 62%
          );
        transition: opacity .3s ease;
      }

      [data-tilt].cbs-tilt-active::after,
      .showcase-card.cbs-tilt-active::after,
      .showcase-item.cbs-tilt-active::after,
      .category-card.cbs-tilt-active::after {
        opacity: 1;
      }

      @media (pointer: coarse),
             (prefers-reduced-motion: reduce) {
        [data-tilt],
        .showcase-card,
        .showcase-item,
        .category-card {
          transform: none !important;
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function reset(card) {
    card.classList.remove("cbs-tilt-active");

    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--tilt-z", "0deg");
    card.style.setProperty("--tilt-glow-x", "50%");
    card.style.setProperty("--tilt-glow-y", "50%");
  }

  function bindCard(card) {
    if (card.dataset.tiltBound === "true") {
      return;
    }

    card.dataset.tiltBound = "true";

    card.addEventListener("pointermove", (event) => {
      if (!finePointer || reducedMotion) return;

      const rect = card.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x =
        (event.clientX - rect.left) /
          rect.width -
        0.5;

      const y =
        (event.clientY - rect.top) /
          rect.height -
        0.5;

      const rotateX = y * -8;
      const rotateY = x * 10;

      card.style.setProperty(
        "--tilt-x",
        `${rotateY.toFixed(2)}deg`
      );

      card.style.setProperty(
        "--tilt-y",
        `${rotateX.toFixed(2)}deg`
      );

      card.style.setProperty(
        "--tilt-glow-x",
        `${((x + 0.5) * 100).toFixed(1)}%`
      );

      card.style.setProperty(
        "--tilt-glow-y",
        `${((y + 0.5) * 100).toFixed(1)}%`
      );

      card.classList.add("cbs-tilt-active");
    });

    card.addEventListener("pointerleave", () => {
      reset(card);
    });

    card.addEventListener("pointercancel", () => {
      reset(card);
    });
  }

  function init() {
    addStyles();

    if (!finePointer || reducedMotion) {
      return;
    }

    cards().forEach(bindCard);

    if (window.CrazyBizSites) {
      window.CrazyBizSites.emit(
        "tilt:ready",
        { count: cards().length }
      );
    }
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

  window.CrazyBizTilt = {
    refresh
  };
})();
