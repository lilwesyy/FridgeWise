// Script per sanificare spoonacular-ingredients.json per il seed
const fs = require('fs');

const allowedCategories = [
  'vegetables','fruits','meat','poultry','seafood','dairy','grains','legumes','nuts-seeds','herbs-spices','oils-fats','condiments','pantry','other'
];

const db = JSON.parse(fs.readFileSync('spoonacular-ingredients.json', 'utf-8'));

const fixed = db.map(i => {
  // Fix nutritionPer100g
  let n = i.nutritionPer100g;
  if (!n || typeof n !== 'object') n = {};
  const nutritionPer100g = {
    calories: Number.isFinite(n.calories) ? n.calories : 0,
    protein: Number.isFinite(n.protein) ? n.protein : 0,
    carbs: Number.isFinite(n.carbs) ? n.carbs : 0,
    fat: Number.isFinite(n.fat) ? n.fat : 0,
    fiber: Number.isFinite(n.fiber) ? n.fiber : 0
  };
  // Fix category
  let category = allowedCategories.includes(i.category) ? i.category : 'other';
  if (category === 'unknown') category = 'other';
  // Fix shelfLife
  let shelfLife = (typeof i.shelfLife === 'number' && i.shelfLife >= 1) ? i.shelfLife : 1;
  return {
    ...i,
    nutritionPer100g,
    category,
    shelfLife
  };
});

fs.writeFileSync('spoonacular-ingredients.json', JSON.stringify(fixed, null, 2));
console.log('Sanificazione completata.');
