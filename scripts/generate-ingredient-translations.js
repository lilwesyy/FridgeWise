// Script to generate ingredientTranslations.ts from spoonacular-ingredients.json
// This script will output a partial translation object with empty strings for missing translations.
// You can then fill in the translations manually or with an external service.

const fs = require('fs');
const path = require('path');

const inputPath = path.resolve(__dirname, '../spoonacular-ingredients.json');
const outputPath = path.resolve(__dirname, '../frontend/src/utils/ingredientTranslations.ts');

const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Only unique ingredient names
const uniqueNames = Array.from(new Set(data.map(i => i.name.trim().toLowerCase())));

// Existing translations (if any)
let existing = {};
try {
  existing = require(outputPath).ingredientTranslations;
} catch (e) {}

const obj = {};
for (const name of uniqueNames) {
  obj[name] = existing[name] || { it: '', fr: '', de: '' };
}

const out = `// Ingredient translations for main supported languages\n// Auto-generated. Fill in missing translations.\nexport const ingredientTranslations = ${JSON.stringify(obj, null, 2)};\n`;

fs.writeFileSync(outputPath, out);
console.log('ingredientTranslations.ts generated with', uniqueNames.length, 'ingredients.');
