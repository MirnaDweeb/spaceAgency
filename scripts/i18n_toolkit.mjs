/* global console, process */

/**
 * Space Agency i18n Toolkit
 * 
 * Functions:
 * 1. Audit: Compare any language against English master
 * 2. Export: Extract missing keys into a format for translation (AI/Local API)
 * 3. Import: Inject translated keys back into the project
 */

import { translations } from "../js/data/translations.js";
import fs from "fs";

const MASTER_LANG = "en";

/**
 * Flatten an object to dot-path keys
 */
function flatten(obj, prefix = "", out = {}) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return out;
  for (const [key, value] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flatten(value, nextKey, out);
    } else {
      out[nextKey] = value;
    }
  }
  return out;
}

/**
 * Audit a language against English
 */
export function auditLanguage(langCode) {
    if (!translations[langCode]) {
        return { error: `Language ${langCode} not found in translations.` };
    }

    const enFlat = flatten(translations[MASTER_LANG]);
    const targetFlat = flatten(translations[langCode]);
    
    const missing = [];
    const fallback = []; // Keys that exist but match English (likely untranslated)

    for (const key in enFlat) {
        if (!Object.prototype.hasOwnProperty.call(targetFlat, key)) {
            missing.push(key);
        } else if (targetFlat[key] === enFlat[key] && enFlat[key].length > 3) {
            // Heuristic: If it's the same and > 3 chars, it's likely a fallback
            // (Ignoring short strings like "s", "p", "+1")
            fallback.push(key);
        }
    }

    return { langCode, missing, fallback };
}

/**
 * Create a translation request block
 */
export function generateRequest(langCode, keys) {
    const enFlat = flatten(translations[MASTER_LANG]);
    const requestList = keys.map(key => ({
        key,
        en: enFlat[key]
    }));

    return JSON.stringify(requestList, null, 2);
}

// ── CLI Runner ──

const [action, lang] = process.argv.slice(2);

if (action === "audit") {
    const { missing, fallback } = auditLanguage(lang);
    console.log(`\n--- Audit for [${lang}] ---`);
    console.log(`Missing keys: ${missing.length}`);
    console.log(`Untranslated (fallback): ${fallback.length}`);
    
    if (missing.length > 0) {
        console.log("\nTop 10 missing:");
        missing.slice(0, 10).forEach(k => console.log(` - ${k}`));
    }
}

if (action === "export") {
    const { missing, fallback } = auditLanguage(lang);
    const keysToTranslate = [...missing, ...fallback];
    const enFlat = flatten(translations[MASTER_LANG]);
    
    const output = keysToTranslate.reduce((acc, key) => {
        acc[key] = enFlat[key];
        return acc;
    }, {});

    const filename = `translation_request_${lang}.json`;
    fs.writeFileSync(filename, JSON.stringify(output, null, 2));
    console.log(`Exported ${keysToTranslate.length} keys to ${filename}`);
}

if (action === "help") {
    console.log("Usage:");
    console.log("  node scripts/i18n_toolkit.mjs audit <lang>");
    console.log("  node scripts/i18n_toolkit.mjs export <lang>");
}
