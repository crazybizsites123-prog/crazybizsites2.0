/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 12 — analytics.js
   Lightweight first-party interaction tracking.
   Uses browser storage only.
   No external analytics dependency.
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY =
    "crazybizsites_analytics_v2";

  const MAX_EVENTS = 250;

  const state = {
    sessionId:
      "cbs-" +
      Date.now().toString(36) +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 8),

    startedAt:
      new Date().toISOString(),

    events: []
  };

  function readStore() {
    try {
      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!raw) return null;

      return JSON.parse(raw);
    } catch (error) {
      console.warn(
        "[CrazyBizSites] Analytics storage read failed.",
        error
      );

      return null;
    }
  }

  function writeStore(data) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn(
        "[CrazyBizSites] Analytics storage write failed.",
        error
      );
    }
  }

  function saveEvent(
    name,
    detail = {}
  ) {
    const event = {
      name,
      detail,
      timestamp:
        new Date().toISOString(),
      sessionId:
        state.sessionId,
      path:
        window.location.pathname
    };

    state.events.push(
      event
    );

    if (
      state.events.length >
      MAX_EVENTS
    ) {
      state.events =
        state.events.slice(
          -MAX_EVENTS
        );
    }

    const existing =
      readStore() || {
        firstSeen:
          state.startedAt,
        sessions: 0,
        events: []
      };

    existing.sessions =
      Number(
        existing.sessions || 0
      ) + 1;

    existing.events = [
      ...(existing.events || []),
      event
    ].slice(
      -MAX_EVENTS
    );

    writeStore(
      existing
    );

    return event;
  }

  function track(
    name,
    detail = {}
  ) {
    return saveEvent(
      name,
      detail
    );
  }

  function bindExperienceEvents() {
    if (
      !window.CrazyBizSites
    ) {
      return;
    }

    const trackedEvents = [
      "experience:ready",
      "experience:settled",
      "interaction:click",
      "showcase:selected",
      "showcase:concierge",
      "concierge:submitted",
      "concierge:validation",
      "navigation:anchor",
      "reveal:visible"
    ];

    trackedEvents.forEach(
      (eventName) => {
        window.CrazyBizSites.on(
          eventName,
          (detail) => {
            let payload =
              detail;

            if (
              eventName ===
              "interaction:click"
            ) {
              payload = {
                action:
                  detail.action ||
                  "",
                element:
                  detail.target?.tagName ||
                  ""
              };
            }

            if (
              eventName ===
              "reveal:visible"
            ) {
              payload = {
                element:
                  detail.element?.className ||
                  detail.element?.tagName ||
                  ""
              };
            }

            track(
              eventName,
              payload
            );
          }
        );
      }
    );
  }

  function bindCTATracking() {
    document.addEventListener(
      "click",
      (event) => {
        const element =
          event.target.closest(
            "a, button"
          );

        if (!element) return;

        const text =
          (
            element.innerText ||
            element.textContent ||
            ""
          )
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 120);

        const href =
          element.getAttribute(
            "href"
          ) || "";

        const isCTA =
          element.matches(
            "[data-cta]"
          ) ||
          /preview|book|start|launch|explore|get|contact|approve/i.test(
            text
          );

        if (!isCTA) return;

        track(
          "cta:click",
          {
            text,
            href
          }
        );
      },
      { passive: true }
    );
  }

  function bindSectionTracking() {
    if (
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const sections =
      document.querySelectorAll(
        "section[id], [data-analytics-section]"
      );

    if (!sections.length) {
      return;
    }

    const seen =
      new Set();

    const observer =
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

              const id =
                section.id ||
                section.dataset
                  .analyticsSection ||
                section.className;

              if (
                seen.has(id)
              ) {
                return;
              }

              seen.add(id);

              track(
                "section:view",
                {
                  section:
                    id
                }
              );
            }
          );
        },
        {
          threshold: 0.35
        }
      );

    sections.forEach(
      (section) =>
        observer.observe(
          section
        )
    );
  }

  function init() {
    track(
      "page:view",
      {
        referrer:
          document.referrer || "",
        viewport: {
          width:
            window.innerWidth,
          height:
            window.innerHeight
        }
      }
    );

    bindExperienceEvents();
    bindCTATracking();
    bindSectionTracking();

    if (
      window.CrazyBizSites
    ) {
      window.CrazyBizSites.emit(
        "analytics:ready"
      );
    }
  }

  function getData() {
    return (
      readStore() || {
        events: []
      }
    );
  }

  function clearData() {
    try {
      localStorage.removeItem(
        STORAGE_KEY
      );

      state.events = [];
    } catch (error) {
      console.warn(
        "[CrazyBizSites] Analytics storage clear failed.",
        error
      );
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

  window.CrazyBizAnalytics = {
    track,
    getData,
    clearData
  };
})();
