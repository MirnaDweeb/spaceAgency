// =============================================================================
// Translations Module — Aggregator
// =============================================================================

import { enUI } from "./locales/ui/en.js";
import { arUI } from "./locales/ui/ar.js";
import { frUI } from "./locales/ui/fr.js";

/**
 * All UI translations organized by language code: EN, AR, FR.
 * Element and Ion data are loaded dynamically via langController.js.
 */
export const translations = {
  "en": enUI,
  "ar": arUI,
  "fr": frUI
};
