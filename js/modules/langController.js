// =============================================================================
// Language Controller — global i18n for English (en), Arabic (ar), French (fr)
// =============================================================================

import { translations } from "../data/translations.js";

const STORAGE_KEY = "space_agency_lang";
const SUPPORTED = ["en", "ar", "fr"];
const DEFAULT = "en";

let lang = DEFAULT;
let callbacks = [];
let cacheCleanupFns = [];

export const elementLocales = {};
export const ionLocales = {};

const ELEMENT_LOCALE_LOADERS = {
  fr: async () => {
    const module = await import("../data/locales/fr.js");
    // Ensure element names remain English per scientific convention
    const localized = {};
    for (const [k, v] of Object.entries(module.fr_elements || {})) {
      const { name, ...rest } = v;
      localized[k] = rest;
    }
    return localized;
  },
};

const ION_LOCALE_LOADERS = {
  fr: async () => {
    const module = await import("../data/locales/ions/fr.js");
    return module.fr_ions;
  },
};

export async function fetchElementLocale(langCode) {
  if (langCode === "en" || langCode === "ar") return;
  if (elementLocales[langCode]) return;

  const loader = ELEMENT_LOCALE_LOADERS[langCode];
  if (!loader) return;

  try {
    elementLocales[langCode] = await loader();
  } catch (e) {
    console.warn("Could not load element locale for", langCode, e);
  }
}

export async function fetchIonLocale(langCode) {
  if (langCode === "en" || langCode === "ar") return;
  if (ionLocales[langCode]) return;

  const loader = ION_LOCALE_LOADERS[langCode];
  if (!loader) return;

  try {
    ionLocales[langCode] = await loader();
  } catch (e) {
    console.warn("Could not load ion locale for", langCode, e);
  }
}

function invalidateLocalizedCaches() {
  import("./chemToolContent.js")
    .then((module) => {
      module.invalidateChemToolContentCache?.();
    })
    .catch(() => {
      // Cache invalidation is best-effort and should never block language switching.
    });

  cacheCleanupFns.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("Cache cleanup function failed:", e);
    }
  });
}

// ── Public API ──

/** Lookup a translated string by dot-path key, e.g. t("nav.table", "Fallback") */
export function t(key, fallback, targetLang) {
  const parts = key.split(".");
  const useLang = targetLang || lang;
  let val = translations[useLang];
  for (const p of parts) {
    if (val == null) break;
    val = val[p];
  }
  if (val != null) return val;

  let fb = translations[DEFAULT];
  for (const p of parts) {
    if (fb == null) return fallback !== undefined ? fallback : key;
    fb = fb[p];
  }
  return fb != null ? fb : (fallback !== undefined ? fallback : key);
}

export function getLang() {
  return lang;
}

export async function setLang(code) {
  if (!SUPPORTED.includes(code) || code === lang) return;

  lang = code;
  localStorage.setItem(STORAGE_KEY, code);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  updateDropdown();
  applyStaticTranslations();

  await Promise.all([fetchElementLocale(lang), fetchIonLocale(lang)]);
  invalidateLocalizedCaches();

  callbacks.forEach((cb) => {
    try {
      cb(lang);
    } catch (e) {
      console.warn("Language callback error:", e);
    }
  });
}

export function onLangChange(cb) {
  callbacks.push(cb);
}

export function registerCacheCleanup(fn) {
  cacheCleanupFns.push(fn);
}

// ── DOM translation ──

export function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria-label")));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
  });
}

// ── Dropdown visual state ──

function updateDropdown() {
  document.querySelectorAll(".lang-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

// ── Init ──

export function initLangController() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved)) {
    lang = saved;
  } else {
    lang = DEFAULT;
  }

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

  // Toggle open/close
  const toggle = document.getElementById("lang-dropdown-toggle");
  const dropdown = document.getElementById("lang-dropdown");
  const menu = document.getElementById("lang-dropdown-menu");

  if (toggle && dropdown) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      document.body.classList.toggle("lang-menu-blur", isOpen);
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) {
        if (dropdown.classList.contains("open")) {
          dropdown.classList.remove("open");
          document.body.classList.remove("lang-menu-blur");
        }
      }
    });
  }

  // Language option clicks
  if (menu) {
    menu.addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-option");
      if (!btn) return;
      const code = btn.dataset.lang;
      if (dropdown) {
        dropdown.classList.remove("open");
        document.body.classList.remove("lang-menu-blur");
      }
      setLang(code);
    });
  }

  Promise.all([fetchElementLocale(lang), fetchIonLocale(lang)]).then(() => {
    applyStaticTranslations();
    updateDropdown();
    callbacks.forEach((cb) => {
      try {
        cb(lang);
      } catch (e) {
        console.warn("Language callback error:", e);
      }
    });
  });
}
