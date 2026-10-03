/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 11 — atmosphere.js
   Ambient environmental motion and cinematic depth layer.
   ========================================================= */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const root = document.documentElement;

  let rafId = null;
  let lastTime = 0;

  const state = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    scroll: 0
  };

  function clamp(value, min, max) {
    return Math.min(
      Math.max(value, min),
      max
    );
  }

  function addStyles() {
    if (
      document.getElementById(
        "cbs-atmosphere-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "cbs-atmosphere-styles";

    style.textContent = `
      .cbs-atmosphere {
        position: fixed;
        inset: -12%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
        opacity: .7;
      }

      .cbs-orbit {
        position: absolute;
        width: 38vw;
        height: 38vw;
        min-width: 280px;
        min-height: 280px;
        max-width: 720px;
        max-height: 720px;
        border: 1px solid
          rgba(199,255,61,.08);
        border-radius: 50%;
        filter: blur(.2px);
        transform:
          translate3d(
            var(--orbit-x, 0px),
            var(--orbit-y, 0px),
            0
          )
          rotate(
            var(--orbit-rotation, 0deg)
          );
      }

      .cbs-orbit::before,
      .cbs-orbit::after {
        content: "";
        position: absolute;
        border-radius: 50%;
        background:
          rgba(199,255,61,.8);
        box-shadow:
          0 0 18px
            rgba(199,255,61,.45),
          0 0 50px
            rgba(199,255,61,.12);
      }

      .cbs-orbit::before {
        width: 5px;
        height: 5px;
        top: 18%;
        left: 8%;
      }

      .cbs-orbit::after {
        width: 3px;
        height: 3px;
        bottom: 12%;
        right: 14%;
      }

      .cbs-ambient-glow {
        position: absolute;
        width: 55vw;
        height: 55vw;
        min-width: 420px;
        min-height: 420px;
        max-width: 900px;
        max-height: 900px;
        border-radius: 50%;
        background:
          radial-gradient(
            circle,
            rgba(199,255,61,.055),
            transparent 68%
          );
        transform:
          translate3d(
            var(--glow-x, 0px),
            var(--glow-y, 0px),
            0
          );
        filter: blur(18px);
      }

      .cbs-ambient-line {
        position: absolute;
        width: 140vw;
        height: 1px;
        left: -20vw;
        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(199,255,61,.09),
            transparent
          );
        transform:
          translateY(
            var(--line-y, 0px)
          )
          rotate(-7deg);
      }

      @media (max-width: 700px) {
        .cbs-atmosphere {
          opacity: .45;
        }

        .cbs-orbit {
          width: 85vw;
          height: 85vw;
        }

        .cbs-ambient-glow {
          width: 110vw;
          height: 110vw;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cbs-atmosphere {
          display: none;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  function createLayer() {
    if (
      document.querySelector(
        ".cbs-atmosphere"
      )
    ) {
      return;
    }

    const layer =
      document.createElement("div");

    layer.className =
      "cbs-atmosphere";

    layer.setAttribute(
      "aria-hidden",
      "true"
    );

    const orbit =
      document.createElement("div");

    orbit.className =
      "cbs-orbit";

    const glow =
      document.createElement("div");

    glow.className =
      "cbs-ambient-glow";

    const line =
      document.createElement("div");

    line.className =
      "cbs-ambient-line";

    layer.appendChild(
      glow
    );

    layer.appendChild(
      orbit
    );

    layer.appendChild(
      line
    );

    document.body.prepend(
      layer
    );
  }

  function bindPointer() {
    window.addEventListener(
      "pointermove",
      (event) => {
        state.targetX =
          (event.clientX /
            Math.max(
              window.innerWidth,
              1
            ) -
            0.5) *
          2;

        state.targetY =
          (event.clientY /
            Math.max(
              window.innerHeight,
              1
            ) -
            0.5) *
          2;
      },
      { passive: true }
    );
  }

  function bindScroll() {
    window.addEventListener(
      "scroll",
      () => {
        state.scroll =
          window.scrollY || 0;
      },
      { passive: true }
    );
  }

  function animate(time) {
    if (!lastTime) {
      lastTime = time;
    }

    state.x +=
      (state.targetX - state.x) *
      0.035;

    state.y +=
      (state.targetY - state.y) *
      0.035;

    const orbitX =
      state.x * 22;

    const orbitY =
      state.y * 16;

    const glowX =
      state.x * -34;

    const glowY =
      state.y * -24;

    const rotation =
      time * 0.004;

    const lineY =
      (state.scroll * 0.08) %
      (window.innerHeight * 1.2);

    root.style.setProperty(
      "--orbit-x",
      `${orbitX.toFixed(2)}px`
    );

    root.style.setProperty(
      "--orbit-y",
      `${orbitY.toFixed(2)}px`
    );

    root.style.setProperty(
      "--orbit-rotation",
      `${rotation.toFixed(2)}deg`
    );

    root.style.setProperty(
      "--glow-x",
      `${glowX.toFixed(2)}px`
    );

    root.style.setProperty(
      "--glow-y",
      `${glowY.toFixed(2)}px`
    );

    root.style.setProperty(
      "--line-y",
      `${lineY.toFixed(2)}px`
    );

    rafId =
      requestAnimationFrame(
        animate
      );
  }

  function init() {
    if (reducedMotion) {
      return;
    }

    addStyles();
    createLayer();
    bindPointer();
    bindScroll();

    rafId =
      requestAnimationFrame(
        animate
      );

    if (
      window.CrazyBizSites
    ) {
      window.CrazyBizSites.emit(
        "atmosphere:ready"
      );
    }
  }

  function refresh() {
    if (!document.querySelector(
      ".cbs-atmosphere"
    )) {
      createLayer();
    }
  }

  function destroy() {
    if (rafId) {
      cancelAnimationFrame(
        rafId
      );
    }

    const layer =
      document.querySelector(
        ".cbs-atmosphere"
      );

    if (layer) {
      layer.remove();
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

  window.CrazyBizAtmosphere = {
    refresh,
    destroy
  };
})();
