/* =========================================================
   CRAZYBIZSITES 2.0
   FILE 10 — concierge.js
   Personalized Preview Concierge foundation.
   ========================================================= */

(() => {
  "use strict";

  const BUSINESS_PROFILES = {
    restaurant: {
      label: "Restaurant",
      direction: "Appetite + atmosphere",
      action: "Reserve a table",
      mood: "immersive, social, sensory",
      keywords: [
        "food",
        "menu",
        "dining",
        "reservations",
        "location"
      ]
    },

    barbershop: {
      label: "Barbershop",
      direction: "Style + identity",
      action: "Book a cut",
      mood: "confident, sharp, local",
      keywords: [
        "cuts",
        "barbers",
        "booking",
        "style",
        "location"
      ]
    },

    salon: {
      label: "Salon",
      direction: "Transformation + beauty",
      action: "Book an appointment",
      mood: "visual, expressive, aspirational",
      keywords: [
        "services",
        "beauty",
        "looks",
        "booking",
        "gallery"
      ]
    },

    dentist: {
      label: "Dentist",
      direction: "Trust + reassurance",
      action: "Book an appointment",
      mood: "clean, credible, reassuring",
      keywords: [
        "services",
        "appointments",
        "team",
        "reviews",
        "location"
      ]
    },

    fitness: {
      label: "Fitness",
      direction: "Energy + results",
      action: "Start today",
      mood: "energetic, motivating, bold",
      keywords: [
        "programs",
        "classes",
        "results",
        "membership",
        "location"
      ]
    },

    auto: {
      label: "Auto",
      direction: "Craftsmanship + trust",
      action: "Get a quote",
      mood: "precise, powerful, dependable",
      keywords: [
        "services",
        "vehicles",
        "repairs",
        "reviews",
        "contact"
      ]
    },

    other: {
      label: "Other",
      direction: "Clarity + local credibility",
      action: "Get started",
      mood: "distinctive, clear, trustworthy",
      keywords: [
        "services",
        "about",
        "reviews",
        "contact",
        "location"
      ]
    }
  };

  const state = {
    businessName: "",
    businessType: "",
    profile: null,
    submitted: false
  };

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function findField(selectors) {
    for (const selector of selectors) {
      const field =
        document.querySelector(selector);

      if (field) return field;
    }

    return null;
  }

  function findForm() {
    return (
      document.querySelector(
        "#preview-form"
      ) ||
      document.querySelector(
        "[data-preview-form]"
      ) ||
      document.querySelector(
        ".concierge-form"
      ) ||
      document.querySelector(
        "form"
      )
    );
  }

  function resolveProfile(type) {
    const normalized =
      normalize(type);

    if (
      BUSINESS_PROFILES[
        normalized
      ]
    ) {
      return BUSINESS_PROFILES[
        normalized
      ];
    }

    const aliases = {
      barber:
        "barbershop",
      hair:
        "salon",
      dental:
        "dentist",
      gym:
        "fitness",
      automotive:
        "auto"
    };

    return (
      BUSINESS_PROFILES[
        aliases[normalized] ||
        "other"
      ]
    );
  }

  function collectInput() {
    const nameField =
      findField([
        "#business-name",
        "[name='businessName']",
        "[name='business-name']",
        "[data-business-name]"
      ]);

    const typeField =
      findField([
        "#business-type",
        "[name='businessType']",
        "[name='business-type']",
        "[data-business-type]"
      ]);

    state.businessName =
      nameField
        ? nameField.value.trim()
        : "";

    state.businessType =
      typeField
        ? normalize(typeField.value)
        : "";

    state.profile =
      resolveProfile(
        state.businessType
      );

    return state;
  }

  function findResultState() {
    return (
      document.querySelector(
        "[data-preview-result]"
      ) ||
      document.querySelector(
        "#preview-result"
      ) ||
      document.querySelector(
        ".preview-result"
      ) ||
      document.querySelector(
        ".preview-queued"
      )
    );
  }

  function updateResult(result) {
    const resultState =
      findResultState();

    if (!resultState) return;

    const businessTarget =
      resultState.querySelector(
        "[data-business-result]"
      ) ||
      resultState.querySelector(
        ".preview-business-name"
      );

    const directionTarget =
      resultState.querySelector(
        "[data-preview-direction]"
      ) ||
      resultState.querySelector(
        ".preview-direction"
      );

    if (businessTarget) {
      businessTarget.textContent =
        result.businessName ||
        "YOUR BUSINESS";
    }

    if (directionTarget) {
      directionTarget.textContent =
        result.profile.direction;
    }

    resultState.dataset.previewType =
      normalize(
        result.businessType
      );

    resultState.classList.add(
      "preview-ready"
    );
  }

  function showQueuedState() {
    const form =
      findForm();

    const result =
      findResultState();

    if (form) {
      form.classList.add(
        "preview-submitted"
      );
    }

    if (result) {
      result.classList.add(
        "preview-visible"
      );
    }
  }

  function buildPreviewPayload() {
    return {
      businessName:
        state.businessName,

      businessType:
        state.businessType,

      profile:
        state.profile
          ? {
              label:
                state.profile.label,

              direction:
                state.profile.direction,

              primaryAction:
                state.profile.action,

              mood:
                state.profile.mood,

              keywords:
                [...state.profile.keywords]
            }
          : null,

      timestamp:
        new Date().toISOString()
    };
  }

  function submit() {
    collectInput();

    if (!state.businessName) {
      return {
        success: false,
        reason: "missing-name"
      };
    }

    if (!state.businessType) {
      return {
        success: false,
        reason: "missing-type"
      };
    }

    state.submitted = true;

    const payload =
      buildPreviewPayload();

    try {
      sessionStorage.setItem(
        "cbs_preview_request",
        JSON.stringify(
          payload
        )
      );
    } catch (error) {
      console.warn(
        "[CrazyBizSites] Preview request could not be stored.",
        error
      );
    }

    updateResult(state);
    showQueuedState();

    if (
      window.CrazyBizSites
    ) {
      window.CrazyBizSites.emit(
        "concierge:submitted",
        payload
      );
    }

    return {
      success: true,
      payload
    };
  }

  function bindForm() {
    const form =
      findForm();

    if (!form) return;

    if (
      form.dataset.conciergeBound ===
      "true"
    ) {
      return;
    }

    form.dataset.conciergeBound =
      "true";

    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const result =
          submit();

        if (
          !result.success &&
          window.CrazyBizSites
        ) {
          window.CrazyBizSites.emit(
            "concierge:validation",
            result
          );
        }
      }
    );
  }

  function init() {
    bindForm();

    if (
      window.CrazyBizSites
    ) {
      window.CrazyBizSites.register(
        "concierge",
        {
          submit,
          getState: () => ({
            ...state
          }),
          getProfile:
            resolveProfile
        }
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

  window.CrazyBizConcierge = {
    submit,
    getState: () => ({
      ...state
    }),
    getProfile:
      resolveProfile,
    profiles:
      BUSINESS_PROFILES
  };
})();
