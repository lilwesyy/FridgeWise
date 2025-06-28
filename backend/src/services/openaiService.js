// backend/src/services/openaiService.js
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateRecipe(ingredients, servings = 1, maxPrepTime = null, difficulty = null, language = 'en') {
  // If ingredients are IDs, resolve names from the database
  let ingredientNames = ingredients;
  if (ingredients.length > 0 && typeof ingredients[0] === 'string' && ingredients[0].match(/^[a-f\d]{24}$/i)) {
    // Import Ingredient model here to avoid circular require
    const Ingredient = require('../models/Ingredient');
    const found = await Ingredient.find({ _id: { $in: ingredients } });
    ingredientNames = found.map(i => i.name);
  }
  let extra = '';
  if (servings) extra += ` The recipe must be for ${servings} servings.`;
  if (maxPrepTime) extra += ` The total preparation time must not exceed ${maxPrepTime} minutes.`;
  if (difficulty) extra += ` The difficulty must be \"${difficulty}\".`;
  let prompt = `Create an original recipe with these ingredients: ${ingredientNames.join(", ")}. Reply in JSON with the fields: title, description, ingredients (array of objects {name, amount, unit}), instructions (array of steps), servings, cookingTime, difficulty.${extra}`;
  if (language === 'it') {
    prompt = `Crea una ricetta originale con questi ingredienti: ${ingredientNames.join(", ")}. Rispondi in JSON con i campi: title, description, ingredients (array di oggetti {name, amount, unit}), instructions (array di step), servings, cookingTime, difficulty.${extra} Tutto il testo (title, description, instructions, difficulty) deve essere in italiano.`;
  } else if (language === 'fr') {
    prompt = `Crée une recette originale avec ces ingrédients : ${ingredientNames.join(", ")}. Réponds en JSON avec les champs : title, description, ingredients (tableau d'objets {name, amount, unit}), instructions (tableau d'étapes), servings, cookingTime, difficulty.${extra} Tout le texte (title, description, instructions, difficulty) doit être en français.`;
  } else if (language === 'de') {
    prompt = `Erstelle ein originelles Rezept mit diesen Zutaten: ${ingredientNames.join(", ")}. Antworte im JSON-Format mit den Feldern: title, description, ingredients (Array von Objekten {name, amount, unit}), instructions (Array von Schritten), servings, cookingTime, difficulty.${extra} Der gesamte Text (title, description, instructions, difficulty) muss auf Deutsch sein.`;
  } else {
    prompt += ' All text (title, description, instructions, difficulty) must be in English.';
  }
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a creative chef assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 700
  });
  const text = response.choices[0].message.content;
  try {
    let aiRecipe = JSON.parse(text);
    // Normalization for frontend compatibility
    aiRecipe._id = `ai-${Date.now()}`;
    aiRecipe.imageUrl = aiRecipe.imageUrl || null;
    aiRecipe.nutritionInfo = aiRecipe.nutritionInfo || { calories: 0 };
    aiRecipe.difficulty = typeof aiRecipe.difficulty === 'string' ? aiRecipe.difficulty : (aiRecipe.difficulty?.level || 'medium');
    aiRecipe.ingredients = (aiRecipe.ingredients || []).map(ing =>
      typeof ing === 'string'
        ? { name: ing, amount: null, unit: '', ingredientId: null, required: true }
        : { name: ing.name, amount: ing.amount, unit: ing.unit, ingredientId: null, required: true }
    );
    aiRecipe.instructions = (aiRecipe.instructions || []).map((step, idx) => typeof step === 'string' ? step : step.instruction || step.text || `Step ${idx+1}`);
    aiRecipe.servings = aiRecipe.servings || servings;
    aiRecipe.cookingTime = aiRecipe.cookingTime || aiRecipe.cookTime || 20;
    return aiRecipe;
  } catch (e) {
    return { raw: text, _id: `ai-${Date.now()}` };
  }
}

module.exports = { generateRecipe };
