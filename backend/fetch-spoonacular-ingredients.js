require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
const fs = require('fs');

const API_KEY = process.env.SPOONACULAR_API_KEY;
console.log('Spoonacular API KEY:', API_KEY); // Debug: mostra la chiave letta
const PAGE_SIZE = 100;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Mappa Spoonacular aisle -> categoria standardizzata
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

async function fetchIngredients() {
  let allIngredients = [];
  let existing = [];
  let existingMap = {};
  const fsPath = 'spoonacular-ingredients.json';
  if (fs.existsSync(fsPath)) {
    existing = JSON.parse(fs.readFileSync(fsPath, 'utf-8'));
    existingMap = Object.fromEntries(existing.map(i => [i.name, i]));
    console.log(`Loaded ${existing.length} existing ingredients with possible aisle info.`);
  }

  for (const letter of ALPHABET) {
    let offset = 0;
    let keepGoing = true;
    while (keepGoing) {
      const url = `https://api.spoonacular.com/food/ingredients/search?apiKey=${API_KEY}&number=${PAGE_SIZE}&offset=${offset}&query=${letter}`;
      try {
        const res = await axios.get(url);
        if (res.data && res.data.results && res.data.results.length > 0) {
          allIngredients.push(...res.data.results);
          offset += res.data.results.length;
          if (res.data.results.length < PAGE_SIZE) keepGoing = false;
        } else {
          keepGoing = false;
        }
      } catch (err) {
        console.error('Error fetching:', err.response ? err.response.data : err.message);
        keepGoing = false;
      }
    }
  }

  // Rimuovi duplicati per nome
  const unique = {};
  allIngredients.forEach(i => { unique[i.name] = i; });

  // Merge with existing data
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const formatted = [];
  let count = 0;
  for (const i of Object.values(unique)) {
    // If already have aisle, reuse
    if (existingMap[i.name] && existingMap[i.name].aisle) {
      formatted.push(existingMap[i.name]);
      continue;
    }
    let aisle = null;
    try {
      const detailUrl = `https://api.spoonacular.com/food/ingredients/${i.id}/information?apiKey=${API_KEY}&amount=100&unit=gram`;
      const detailRes = await axios.get(detailUrl);
      aisle = detailRes.data.aisle || null;
    } catch (err) {
      if (err.response && err.response.status === 402) {
        console.error('Daily quota reached. Stopping.');
        break;
      }
      if (err.response && err.response.status === 429) {
        console.error('Rate limit hit. Waiting 65 seconds...');
        await delay(65000);
        continue;
      }
      console.error(`Error fetching details for ${i.name}:`, err.response ? err.response.data : err.message);
    }
    const entry = {
      name: i.name,
      aisle: aisle,
      category: aisleToCategory(aisle),
      nutritionPer100g: {},
      commonNames: [i.name],
      shelfLife: 0,
      storageType: 'pantry'
    };
    formatted.push(entry);
    existingMap[i.name] = entry;
    count++;
    if (count % 10 === 0) {
      fs.writeFileSync(fsPath, JSON.stringify([...Object.values(existingMap)], null, 2));
      console.log(`Progress saved after ${count} new fetches...`);
    }
    await delay(1100); // ~1 request/sec to avoid rate limit
  }

  // Save at the end
  fs.writeFileSync(fsPath, JSON.stringify([...Object.values(existingMap)], null, 2));
  console.log(`Saved ${Object.keys(existingMap).length} unique ingredients to spoonacular-ingredients.json`);
}

fetchIngredients();
