/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 08 — particles.js
   Procedural cinematic hero particle atmosphere.
   No external assets required.
   ========================================================= */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const canvasSelector =
    "[data-particles], #particles, .hero-particles";

  let canvas = null;
  let ctx = null;
  let particles = [];
  let animationId = null;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const pointer = {
    x: 0.5,
    y: 0.5,
    active: false
  };

  function findCanvas() {
    canvas = document.querySelector(canvasSelector);

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "hero-particles";
      canvas.setAttribute("aria-hidden", "true");

      const hero =
        document.querySelector(".hero") ||
        document.querySelector("#hero") ||
        document.querySelector("main");

      if (hero) {
        hero.style.position =
          hero.style.position || "relative";

        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "0";

        hero.prepend(canvas);
      } else {
        return false;
      }
    }

    ctx = canvas.getContext("2d", {
      alpha: true
    });

    return !!ctx;
  }

  function resize() {
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();

    width = Math.max(
      1,
      Math.floor(rect.width || window.innerWidth)
    );

    height = Math.max(
      1,
      Math.floor(rect.height || window.innerHeight)
    );

    dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.35,
      speed: Math.random() * 0.22 + 0.04,
      drift: Math.random() * 0.45 - 0.225,
      phase: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.12
    };
  }

  function buildParticles() {
    const area = width * height;

    const count = Math.round(
      Math.min(
        150,
        Math.max(
          40,
          area / 13000
        )
      )
    );

    particles = Array.from(
      { length: count },
      createParticle
    );
  }

  function drawParticle(particle, time) {
    const wave =
      Math.sin(
        time * 0.00035 +
        particle.phase
      ) * 0.35;

    particle.y -=
      particle.speed + wave * 0.02;

    particle.x +=
      particle.drift * 0.18;

    if (particle.y < -10) {
      particle.y = height + 10;
      particle.x = Math.random() * width;
    }

    if (particle.x < -10) {
      particle.x = width + 10;
    }

    if (particle.x > width + 10) {
      particle.x = -10;
    }

    let x = particle.x;
    let y = particle.y;

    if (pointer.active) {
      const dx = x - pointer.x * width;
      const dy = y - pointer.y * height;
      const distance = Math.sqrt(
        dx * dx + dy * dy
      );

      if (distance < 180) {
        const force =
          (1 - distance / 180) * 8;

        x += (dx / (distance || 1)) * force;
        y += (dy / (distance || 1)) * force;
      }
    }

    const pulse =
      0.75 +
      Math.sin(
        time * 0.001 +
        particle.phase
      ) * 0.25;

    ctx.beginPath();
    ctx.arc(
      x,
      y,
      particle.size,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `rgba(199,255,61,${(
        particle.opacity * pulse
      ).toFixed(3)})`;

    ctx.fill();
  }

  function draw(time) {
    if (!ctx) return;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    particles.forEach((particle) => {
      drawParticle(
        particle,
        time
      );
    });

    animationId =
      requestAnimationFrame(draw);
  }

  function bindPointer() {
    if (!canvas) return;

    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.x =
          event.clientX /
          Math.max(
            window.innerWidth,
            1
          );

        pointer.y =
          event.clientY /
          Math.max(
            window.innerHeight,
            1
          );

        pointer.active = true;
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        pointer.active = false;
      }
    );
  }

  function addStyles() {
    if (document.getElementById(
      "cbs-particles-styles"
    )) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "cbs-particles-styles";

    style.textContent = `
      .hero-particles {
        display: block;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: .9;
        mix-blend-mode: screen;
      }
    `;

    document.head.appendChild(style);
  }

  function init() {
    if (reducedMotion) {
      return;
    }

    if (!findCanvas()) {
      return;
    }

    addStyles();
    resize();
    buildParticles();
    bindPointer();

    window.addEventListener(
      "resize",
      () => {
        resize();
        buildParticles();
      },
      { passive: true }
    );

    animationId =
      requestAnimationFrame(draw);

    if (window.CrazyBizSites) {
      window.CrazyBizSites.emit(
        "particles:ready"
      );
    }
  }

  function refresh() {
    resize();
    buildParticles();
  }

  function destroy() {
    if (animationId) {
      cancelAnimationFrame(
        animationId
      );
    }

    particles = [];
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

  window.CrazyBizParticles = {
    refresh,
    destroy
  };
})();
