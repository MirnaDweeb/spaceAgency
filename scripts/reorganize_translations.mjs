/* global console */

/**
 * Reorganize translations.js into clean, separate modules
 */

import { translations } from "../js/data/translations.js";
import fs from "fs";
import path from "path";

const TARGET_DIR = "./js/data/locales/ui";

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 1. Export each language to its own file
for (const lang in translations) {
  const content = `export const ${lang.replace("-", "")}UI = ${JSON.stringify(translations[lang], null, 2)};\n`;
  fs.writeFileSync(path.join(TARGET_DIR, `${lang}.js`), content);
  console.log(`Exported ${lang} UI strings.`);
}

// 2. Prepare the new aggregator file
let aggregator = `// =============================================================================
// Centralized Translations Module
// =============================================================================

import { deepMerge } from "../utils/objects.js"; // We should move deepMerge here

`;

for (const lang in translations) {
  const varName = `${lang.replace("-", "")}UI`;
  aggregator += `import { ${varName} } from "./locales/ui/${lang}.js";\n`;
}

aggregator += `\nexport const translations = {\n`;
for (const lang in translations) {
  aggregator += `  "${lang}": ${lang.replace("-", "")}UI,\n`;
}
aggregator += `};\n`;

fs.writeFileSync("./js/data/translations_aggregator.js", aggregator);
console.log("Created aggregator file.");

