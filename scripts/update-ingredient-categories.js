// Script per aggiornare le categorie in spoonacular-ingredients.json senza chiamare le API
const fs = require('fs');

const aisleToCategory = (aisle) => {
  if (!aisle) return 'unknown';
  const a = aisle.toLowerCase();
  if (a.includes('vegetable') || a.includes('greens') || a.includes('lettuce') || a.includes('potato')) return 'vegetables';
  if (a.includes('fruit') || a.includes('berries') || a.includes('citrus')) return 'fruits';
  if (a.includes('meat') || a.includes('beef') || a.includes('pork') || a.includes('veal') || a.includes('lamb')) return 'meat';
  if (a.includes('poultry') || a.includes('chicken') || a.includes('turkey') || a.includes('duck')) return 'poultry';
  if (a.includes('fish') || a.includes('seafood') || a.includes('shrimp') || a.includes('salmon') || a.includes('tuna')) return 'seafood';
  if (a.includes('dairy') || a.includes('milk') || a.includes('cheese') || a.includes('yogurt') || a.includes('cream') || a.includes('eggs')) return 'dairy';
  if (a.includes('grain') || a.includes('rice') || a.includes('pasta') || a.includes('bread') || a.includes('cereal') || a.includes('flour') || a.includes('oats')) return 'grains';
  if (a.includes('bean') || a.includes('legume') || a.includes('lentil') || a.includes('chickpea') || a.includes('peas')) return 'legumes';
  if (a.includes('nut') || a.includes('seed') || a.includes('almond') || a.includes('walnut') || a.includes('hazelnut') || a.includes('cashew') || a.includes('pistachio') || a.includes('pecan')) return 'nuts-seeds';
  if (a.includes('herb') || a.includes('spice') || a.includes('seasoning') || a.includes('basil') || a.includes('oregano') || a.includes('parsley') || a.includes('coriander') || a.includes('cilantro') || a.includes('rosemary') || a.includes('thyme')) return 'herbs-spices';
  if (a.includes('oil') || a.includes('fat') || a.includes('butter') || a.includes('margarine')) return 'oils-fats';
  if (a.includes('condiment') || a.includes('sauce') || a.includes('vinegar') || a.includes('ketchup') || a.includes('mustard') || a.includes('mayonnaise') || a.includes('soy')) return 'condiments';
  if (a.includes('pantry') || a.includes('baking') || a.includes('sweetener') || a.includes('sugar') || a.includes('salt')) return 'pantry';
  return 'other';
};

const filePath = './spoonacular-ingredients.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const updated = data.map(i => ({
  ...i,
  category: aisleToCategory(i.category || i.aisle),
}));

fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
console.log(`Categorie aggiornate per ${updated.length} ingredienti in spoonacular-ingredients.json`);
