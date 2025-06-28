// Script to add missing ingredients from test.json to spoonacular-ingredients.json
const fs = require('fs');

const test = JSON.parse(fs.readFileSync('test.json', 'utf-8'));
const train = JSON.parse(fs.readFileSync('train.json', 'utf-8'));
const db = JSON.parse(fs.readFileSync('spoonacular-ingredients.json', 'utf-8'));

const dbNames = new Set(db.map(i => i.name.toLowerCase()));
const trainIngredients = new Set();
train.forEach(r => r.ingredients.forEach(i => trainIngredients.add(i.toLowerCase())));

const testIngredients = new Set();
test.forEach(r => r.ingredients.forEach(i => testIngredients.add(i.toLowerCase())));

const missing = Array.from(testIngredients).filter(i => !dbNames.has(i));

if (missing.length === 0) {
  console.log('No missing ingredients to add.');
  process.exit(0);
}

console.log(`Adding ${missing.length} missing ingredients to database...`);
missing.forEach(name => {
  db.push({
    name,
    aisle: null,
    category: 'other',
    nutritionPer100g: {},
    commonNames: [name],
    shelfLife: 0,
    storageType: 'pantry'
  });
});

fs.writeFileSync('spoonacular-ingredients.json', JSON.stringify(db, null, 2));
console.log('Done.');
