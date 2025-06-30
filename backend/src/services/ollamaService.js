const fs = require('fs');
const axios = require('axios');
const logger = require('../utils/logger');

// Ollama API configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'llava:7b';

// Utility function to encode image to base64
const encodeImageToBase64 = async (imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`Failed to encode image: ${error.message}`);
  }
};

// Utility function to encode image from URL to base64
const encodeImageFromURL = async (imageUrl) => {
  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer'
    });
    const imageBuffer = Buffer.from(response.data);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`Failed to fetch and encode image from URL: ${error.message}`);
  }
};

// Check if Ollama is available and models are installed
const checkOllamaAvailability = async () => {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    const models = response.data.models || [];
    
    // Check for vision models
    const visionModels = models.filter(model => 
      model.name.includes('llava') || 
      model.name.includes('bakllava') || 
      model.name.includes('moondream')
    );
    
    return {
      available: true,
      models: models.map(m => m.name),
      visionModels: visionModels.map(m => m.name),
      hasVisionModel: visionModels.length > 0
    };
  } catch (error) {
    logger.warn('Ollama not available:', error.message);
    return {
      available: false,
      models: [],
      visionModels: [],
      hasVisionModel: false
    };
  }
};

// Detect ingredients from image using Ollama Vision
const detectIngredientsFromImage = async (imageUrl, confidence = 0.7) => {
  try {
    // Check Ollama availability
    const ollamaStatus = await checkOllamaAvailability();
    if (!ollamaStatus.available || !ollamaStatus.hasVisionModel) {
      throw new Error('Ollama vision model not available. Available models: ' + ollamaStatus.models.join(', '));
    }

    // Select best available vision model
    const availableModel = ollamaStatus.visionModels[0] || OLLAMA_VISION_MODEL;
    
    // Encode image to base64
    const imageBase64 = await encodeImageFromURL(imageUrl);
    
    // Prepare prompt for ingredient detection
    const prompt = `Analyze this image and identify all visible food ingredients. Return ONLY a JSON array of objects with this exact structure:
[
  {
    "name": "ingredient_name",
    "confidence": 0.95,
    "category": "vegetables|fruits|meat|poultry|seafood|dairy|grains|legumes|nuts-seeds|herbs-spices|oils-fats|condiments|pantry|beverages|other",
    "quantity_estimate": "approximate amount visible",
    "freshness": "fresh|good|questionable"
  }
]

Important rules:
- Only include ingredients you can clearly identify with confidence >= ${confidence}
- Use common ingredient names that people would search for in recipes
- Return ONLY the JSON array, no other text
- If you cannot identify any ingredients, return an empty array []`;

    // Call Ollama API
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: availableModel,
      prompt: prompt,
      images: [imageBase64],
      stream: false,
      options: {
        temperature: 0.1, // Low temperature for consistent results
        num_predict: 1000
      }
    });

    const responseText = response.data.response;
    
    // Parse JSON response
    let detectedIngredients = [];
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        detectedIngredients = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON brackets found, try parsing the entire response
        detectedIngredients = JSON.parse(responseText);
      }
    } catch (parseError) {
      logger.error('Error parsing Ollama response:', parseError);
      logger.error('Raw response:', responseText);
      throw new Error('Failed to parse ingredient detection results from Ollama');
    }

    // Validate and clean results
    const validIngredients = detectedIngredients.filter(ingredient => {
      return ingredient.name && 
             ingredient.confidence && 
             ingredient.confidence >= confidence &&
             ingredient.category;
    });

    return {
      success: true,
      model: availableModel,
      totalDetected: validIngredients.length,
      ingredients: validIngredients,
      raw: responseText // Keep raw response for debugging
    };

  } catch (error) {
    logger.error('Error in Ollama ingredient detection:', error);
    throw error;
  }
};

// Generate recipe using Ollama (alternative to OpenAI)
const generateRecipe = async (ingredients, servings = 1, maxPrepTime = null, difficulty = null, language = 'en') => {
  try {
    const ollamaStatus = await checkOllamaAvailability();
    if (!ollamaStatus.available) {
      throw new Error('Ollama not available');
    }

    // Use a general model for recipe generation (not vision model)
    const availableModel = ollamaStatus.models.find(m => 
      !m.includes('llava') && !m.includes('vision')
    ) || ollamaStatus.models[0];

    if (!availableModel) {
      throw new Error('No suitable model available for recipe generation');
    }

    // Prepare ingredients list
    let ingredientNames = ingredients;
    if (ingredients.length > 0 && typeof ingredients[0] === 'string' && ingredients[0].match(/^[a-f\d]{24}$/i)) {
      const Ingredient = require('../models/Ingredient');
      const found = await Ingredient.find({ _id: { $in: ingredients } });
      ingredientNames = found.map(i => i.name);
    }

    // Build prompt
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
      // Try to extract and parse JSON
      const jsonMatch = responseText.match(/\{.*\}/s);
      let aiRecipe;
      
      if (jsonMatch) {
        aiRecipe = JSON.parse(jsonMatch[0]);
      } else {
        aiRecipe = JSON.parse(responseText);
      }

      // Normalize recipe for frontend compatibility
      aiRecipe._id = `ollama-${Date.now()}`;
      aiRecipe.imageUrl = aiRecipe.imageUrl || null;
      aiRecipe.nutritionInfo = aiRecipe.nutritionInfo || { calories: 0 };
      aiRecipe.difficulty = typeof aiRecipe.difficulty === 'string' ? aiRecipe.difficulty : (aiRecipe.difficulty?.level || 'medium');
      aiRecipe.ingredients = (aiRecipe.ingredients || []).map(ing =>
        typeof ing === 'string'
          ? { name: ing, amount: null, unit: '', ingredientId: null, required: true }
          : { name: ing.name, amount: ing.amount, unit: ing.unit, ingredientId: null, required: true }
      );
      aiRecipe.instructions = (aiRecipe.instructions || []).map((step, idx) => 
        typeof step === 'string' ? step : step.instruction || step.text || `Step ${idx+1}`
      );
      aiRecipe.servings = aiRecipe.servings || servings;
      aiRecipe.cookingTime = aiRecipe.cookingTime || aiRecipe.cookTime || 20;
      
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