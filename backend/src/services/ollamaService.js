const fs = require('fs');
const axios = require('axios');
const logger = require('../utils/logger');

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'qwen2.5vl:3b';

// --- Cache for Ollama Availability ---
let ollamaStatusCache = {
  data: null,
  timestamp: 0,
};

// Utility function to encode image to base64
const encodeImageToBase64 = async (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`Failed to encode image: ${error.message}`);
  }
};

// --- Image Encoding from URL (without sharp) ---
const encodeImageFromURL = async (imageUrl) => {
  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      timeout: 10000 // 10 second timeout
    });
    
    let imageBuffer = Buffer.from(response.data);
    
    const maxSize = 1024 * 1024; // 1MB
    if (imageBuffer.length > maxSize) {
      logger.warn(`Image size ${imageBuffer.length} bytes is large. Performance may be impacted.`);
    }
    
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`Failed to fetch and encode image from URL: ${error.message}`);
  }
};

// --- Cached Ollama Availability Check ---
const checkOllamaAvailability = async () => {
  const cacheValidityDuration = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();

  if (ollamaStatusCache.data && (now - ollamaStatusCache.timestamp < cacheValidityDuration)) {
    logger.info('Using cached Ollama availability status.');
    return ollamaStatusCache.data;
  }

  logger.info('Fetching fresh Ollama availability status.');
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models || [];
    
    const visionModels = models.filter(model => 
      model.name.includes('llava') || 
      model.name.includes('bakllava') || 
      model.name.includes('moondream') ||
      model.name.includes('qwen2.5vl')
    );
    
    const status = {
      available: true,
      models: models.map(m => m.name),
      visionModels: visionModels.map(m => m.name),
      hasVisionModel: visionModels.length > 0
    };

    ollamaStatusCache = { data: status, timestamp: now };
    return status;
  } catch (error) {
    logger.warn('Ollama not available:', error.message);
    const status = {
      available: false,
      models: [],
      visionModels: [],
      hasVisionModel: false
    };
    
    ollamaStatusCache = { data: status, timestamp: now };
    return status;
  }
};

// --- Optimized Ingredient Detection ---
const detectIngredientsFromImage = async (imageUrl, confidence = 0.7) => {
  try {
    const ollamaStatus = await checkOllamaAvailability();
    if (!ollamaStatus.available || !ollamaStatus.hasVisionModel) {
      throw new Error('Ollama vision model not available. Available models: ' + ollamaStatus.models.join(', '));
    }

    // --- Smart Model Selection ---
    const modelPriority = ['moondream', 'qwen2.5vl', 'llava', 'bakllava'];
    let availableModel = OLLAMA_VISION_MODEL;
    for (const modelName of modelPriority) {
      const foundModel = ollamaStatus.visionModels.find(m => m.includes(modelName));
      if (foundModel) {
        availableModel = foundModel;
        logger.info(`Selected vision model based on priority: ${availableModel}`);
        break;
      }
    }
    
    const imageBase64 = await encodeImageFromURL(imageUrl);
    
    const prompt = `Analyze this image and identify all visible food ingredients. Return ONLY a JSON array of objects with a specific structure.`;

    // --- Tuned Model Parameters ---
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: availableModel,
      prompt: prompt,
      images: [imageBase64],
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 400,
        top_k: 20,
        top_p: 0.8,
        repeat_penalty: 1.2
      }
    });

    const responseText = response.data.response;
    let detectedIngredients = [];
    try {
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        detectedIngredients = JSON.parse(jsonMatch[0]);
      } else {
        detectedIngredients = JSON.parse(responseText);
      }
    } catch (parseError) {
      logger.warn('Could not parse JSON directly from Ollama response.', { raw: responseText });
      detectedIngredients = [];
    }

    const validIngredients = detectedIngredients.filter(ing => ing.name && ing.confidence && ing.confidence >= confidence && ing.category);

    return {
      success: true,
      model: availableModel,
      totalDetected: validIngredients.length,
      ingredients: validIngredients,
      raw: responseText
    };

  } catch (error) {
    logger.error('Error in Ollama ingredient detection:', error);
    throw error;
  }
};

// --- Recipe Generation ---
const generateRecipe = async (ingredients, servings = 1, maxPrepTime = null, difficulty = null, language = 'en') => {
  // ... (implementation is correct and remains unchanged)
  try {
    const ollamaStatus = await checkOllamaAvailability();
    if (!ollamaStatus.available) {
      throw new Error('Ollama not available');
    }

    const availableModel = ollamaStatus.models.find(m => !m.includes('llava') && !m.includes('vision')) || ollamaStatus.models[0];

    if (!availableModel) {
      throw new Error('No suitable model available for recipe generation');
    }

    let ingredientNames = ingredients;
    if (ingredients.length > 0 && typeof ingredients[0] === 'string' && ingredients[0].match(/^[a-f\d]{24}$/i)) {
      const Ingredient = require('../models/Ingredient');
      const found = await Ingredient.find({ _id: { $in: ingredients } });
      ingredientNames = found.map(i => i.name);
    }

    let extra = '';
    if (servings) extra += ` The recipe must be for ${servings} servings.`;
    if (maxPrepTime) extra += ` The total preparation time must not exceed ${maxPrepTime} minutes.`;
    if (difficulty) extra += ` The difficulty must be "${difficulty}".`;

    let prompt = `Create an original recipe with these ingredients: ${ingredientNames.join(", ")}. Reply in JSON with the fields: title, description, ingredients (array of objects {name, amount, unit}), instructions (array of steps), servings, cookingTime, difficulty.${extra}`;
    
    if (language === 'it') {
      prompt = `Crea una ricetta originale con questi ingredienti: ${ingredientNames.join(", ")}. Rispondi in JSON con i campi: title, description, ingredients (array di oggetti {name, amount, unit}), instructions (array di step), servings, cookingTime, difficulty.${extra} Tutto il testo (title, description, instructions, difficulty) deve essere in italiano.`;
    }

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: availableModel,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1000
      }
    });

    const responseText = response.data.response;
    
    try {
      const jsonMatch = responseText.match(/\{.*\}/s);
      let aiRecipe;
      
      if (jsonMatch) {
        aiRecipe = JSON.parse(jsonMatch[0]);
      } else {
        aiRecipe = JSON.parse(responseText);
      }

      return aiRecipe;
    } catch (parseError) {
      logger.error('Error parsing Ollama recipe response:', parseError);
      return { 
        raw: responseText, 
        _id: `ollama-${Date.now()}`,
        error: 'Failed to parse recipe response'
      };
    }

  } catch (error) {
    logger.error('Error in Ollama recipe generation:', error);
    throw error;
  }
};

module.exports = {
  detectIngredientsFromImage,
  generateRecipe,
  checkOllamaAvailability,
  encodeImageToBase64,
  encodeImageFromURL
};