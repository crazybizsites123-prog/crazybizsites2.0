/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 09 — showcase.js
   Showcase interaction and conversion bridge.
   ========================================================= */

(() => {
  "use strict";

  const selector = [
    ".showcase-card",
    ".showcase-item",
    ".category-card",
    "[data-showcase]"
  ].join(",");

  const cards = () =>
    Array.from(
      document.querySelectorAll(selector)
    );

  function getType(card) {
    return (
      card.dataset.showcase ||
      card.dataset.type ||
      card.dataset.category ||
      card.querySelector(
        "[data-category]"
      )?.dataset.category ||
      ""
    ).toLowerCase();
  }

  function findConcierge() {
    return (
      document.querySelector(
        "#preview-concierge"
      ) ||
      document.querySelector(
        "#concierge"
      ) ||
      document.querySelector(
        ".preview-concierge"
      ) ||
      document.querySelector(
        "[data-concierge]"
      )
    );
  }

  function flash(card) {
    card.classList.remove(
      "showcase-flash"
    );

    void card.offsetWidth;

    card.classList.add(
      "showcase-flash"
    );

    window.setTimeout(() => {
      card.classList.remove(
        "showcase-flash"
      );
    }, 700);
  }

  function scrollToConcierge(type) {
    const concierge =
      findConcierge();

    if (!concierge) return;

    concierge.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    const typeField =
      document.querySelector(
        "#business-type, " +
        "[name='businessType'], " +
        "[name='business-type'], " +
        "[data-business-type]"
      );

    if (
      typeField &&
      type &&
      typeField.tagName === "SELECT"
    ) {
      const options =
        Array.from(
          typeField.options
        );

      const match =
        options.find((option) =>
          option.value
            .toLowerCase()
            .includes(type) ||
          option.textContent
            .toLowerCase()
            .includes(type)
        );

      if (match) {
        typeField.value =
          match.value;

        typeField.dispatchEvent(
          new Event(
            "change",
            { bubbles: true }
          )
        );
      }
    }

    if (window.CrazyBizSites) {
      window.CrazyBizSites.emit(
        "showcase:concierge",
        { type }
      );
    }
  }

  function bindCard(card) {
    if (
      card.dataset.showcaseBound ===
      "true"
    ) {
      return;
    }

    card.dataset.showcaseBound =
      "true";

    card.addEventListener(
      "click",
      () => {
        const type =
          getType(card);

        flash(card);

        if (window.CrazyBizSites) {
          window.CrazyBizSites.emit(
            "showcase:selected",
            {
              card,
              type
            }
          );
        }

        window.setTimeout(() => {
          scrollToConcierge(
            type
          );
        }, 180);
      }
    );

    card.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key !== "Enter" &&
          event.key !== " "
        ) {
          return;
        }

        event.preventDefault();
        card.click();
      }
    );

    if (
      !card.hasAttribute(
        "tabindex"
      )
    ) {
      card.setAttribute(
        "tabindex",
        "0"
      );
    }
  }

  function addStyles() {
    if (
      document.getElementById(
        "cbs-showcase-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id =
      "cbs-showcase-styles";

    style.textContent = `
      .showcase-card,
      .showcase-item,
      .category-card,
      [data-showcase] {
        position: relative;
        overflow: hidden;
        cursor: pointer;
      }

      .showcase-card::before,
      .showcase-item::before,
      .category-card::before,
      [data-showcase]::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0;
        background:
          radial-gradient(
            circle at 50% 50%,
            rgba(199,255,61,.18),
            transparent 55%
          );
        transform: scale(.75);
        transition:
          opacity .35s ease,
          transform .5s
          cubic-bezier(.16,1,.3,1);
      }

      .showcase-card:hover::before,
      .showcase-item:hover::before,
      .category-card:hover::before,
      [data-showcase]:hover::before,
      .showcase-flash::before {
        opacity: 1;
        transform: scale(1.2);
      }

      .showcase-flash {
        animation:
          cbsShowcaseFlash
          .7s cubic-bezier(.16,1,.3,1);
      }

      @keyframes cbsShowcaseFlash {
        0% {
          filter: brightness(1);
        }

        35% {
          filter: brightness(1.35);
        }

        100% {
          filter: brightness(1);
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  function init() {
    addStyles();

    cards().forEach(
      bindCard
    );

    if (
      window.CrazyBizSites
    ) {
      window.CrazyBizSites.emit(
        "showcase:ready",
        {
          count: cards().length
        }
      );
    }
  }

  function refresh() {
    init();
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

  window.CrazyBizShowcase = {
    refresh,
    getCards: cards
  };
})();
