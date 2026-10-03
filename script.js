/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 03 — script.js
   Master experience orchestrator.
   ========================================================= */

(() => {
  "use strict";

  const CBS = {
    modules: {},
    ready: false,
    events: {},

    on(name, handler) {
      if (!this.events[name]) this.events[name] = [];
      this.events[name].push(handler);
    },

    emit(name, detail = {}) {
      (this.events[name] || []).forEach((handler) => {
        try {
          handler(detail);
        } catch (error) {
          console.warn(`[CrazyBizSites] Event "${name}" failed.`, error);
        }
      });
    },

    register(name, api) {
      this.modules[name] = api || {};
      this.emit("module:registered", { name, api });
    }
  };

  window.CrazyBizSites = CBS;

  const optionalModules = [
    ["motion", "CrazyBizMotion"],
    ["cursor", "CrazyBizCursor"],
    ["reveal", "CrazyBizReveal"],
    ["tilt", "CrazyBizTilt"],
    ["particles", "CrazyBizParticles"],
    ["showcase", "CrazyBizShowcase"],
    ["concierge", "CrazyBizConcierge"],
    ["atmosphere", "CrazyBizAtmosphere"],
    ["analytics", "CrazyBizAnalytics"],
    ["experience", "CrazyBizExperience"]
  ];

  function detectModules() {
    optionalModules.forEach(([name, globalName]) => {
      if (window[globalName]) {
        CBS.register(name, window[globalName]);
      }
    });
  }

  function bindGlobalInteractions() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest(
        "a, button, [data-action], [data-scroll-to]"
      );

      if (!target) return;

      CBS.emit("interaction:click", {
        target,
        action:
          target.dataset.action ||
          target.dataset.scrollTo ||
          target.getAttribute("href") ||
          ""
      });
    });

    document.addEventListener("pointerdown", (event) => {
      CBS.emit("interaction:pointerdown", {
        target: event.target
      });
    });
  }

  function bindAnchorNavigation() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest(
        'a[href^="#"], [data-scroll-to]'
      );

      if (!link) return;

      const selector =
        link.dataset.scrollTo ||
        link.getAttribute("href");

      if (!selector || selector === "#") return;

      const target = document.querySelector(selector);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "start"
      });

      history.replaceState(null, "", selector);

      CBS.emit("navigation:anchor", {
        selector,
        target
      });
    });
  }

  function bindVisibility() {
    document.addEventListener("visibilitychange", () => {
      CBS.emit(
        document.hidden ? "page:hidden" : "page:visible"
      );
    });
  }

  function exposeUtilityAPI() {
    CBS.scrollTo = (selector) => {
      const target =
        typeof selector === "string"
          ? document.querySelector(selector)
          : selector;

      if (!target) return false;

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      return true;
    };

    CBS.getModule = (name) =>
      CBS.modules[name] || null;

    CBS.refresh = () => {
      Object.values(CBS.modules).forEach((module) => {
        if (module && typeof module.refresh === "function") {
          try {
            module.refresh();
          } catch (error) {
            console.warn(
              "[CrazyBizSites] Module refresh failed.",
              error
            );
          }
        }
      });

      CBS.emit("experience:refresh");
    };
  }

  function init() {
    if (CBS.ready) return;

    bindGlobalInteractions();
    bindAnchorNavigation();
    bindVisibility();
    exposeUtilityAPI();
    detectModules();

    CBS.ready = true;

    document.documentElement.classList.add(
      "crazybizsites-ready"
    );

    document.body.classList.add(
      "experience-ready"
    );

    CBS.emit("experience:ready", {
      modules: Object.keys(CBS.modules)
    });

    window.setTimeout(() => {
      CBS.emit("experience:settled");
    }, 1200);
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

  window.addEventListener(
    "load",
    () => CBS.emit("page:loaded"),
    { once: true }
  );

  window.addEventListener(
    "resize",
    () => CBS.emit("viewport:resize", {
      width: window.innerWidth,
      height: window.innerHeight
    }),
    { passive: true }
  );
})();
