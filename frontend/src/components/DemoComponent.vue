<template>
  <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
    <!-- Demo Header -->
    <div class="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white relative">
      <button 
        @click="$emit('close')"
        class="absolute top-4 right-4 text-white hover:text-gray-200 text-2xl"
      >
        ✕
      </button>
      <h3 class="text-2xl font-bold mb-2">🎬 FridgeWise Interactive Demo</h3>
      <p class="text-green-100">Discover how it works in a few simple steps!</p>
    </div>

    <!-- Demo Steps -->
    <div class="p-8">
      <!-- Step Navigation -->
      <div class="flex justify-center mb-8">
        <div class="flex space-x-4">
          <div 
            v-for="(step, index) in demoSteps" 
            :key="index"
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer transition-all',
              currentStep === index 
                ? 'bg-green-500 text-white scale-110' 
                : currentStep > index 
                  ? 'bg-green-200 text-green-700' 
                  : 'bg-gray-200 text-gray-500'
            ]"
            @click="goToStep(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="min-h-96">
        <!-- Step 1: Add Ingredients -->
        <div v-if="currentStep === 0" class="text-center">
          <div class="text-6xl mb-6">📸</div>
          <h4 class="text-2xl font-bold mb-4 text-gray-900">Add Your Ingredients</h4>
          <p class="text-gray-600 mb-8">Start by adding the ingredients you have available</p>
          
          <div class="max-w-md mx-auto">
            <div class="bg-gray-50 rounded-2xl p-6 mb-6">
              <h5 class="font-semibold mb-4">Demo: Select some ingredients</h5>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="ingredient in availableIngredients"
                  :key="ingredient"
                  @click="toggleIngredient(ingredient)"
                  :class="[
                    'p-3 rounded-lg border-2 transition-all',
                    selectedIngredients.includes(ingredient)
                      ? 'bg-green-100 border-green-500 text-green-700'
                      : 'bg-white border-gray-200 hover:border-green-300'
                  ]"
                >
                  {{ ingredient }}
                </button>
              </div>
            </div>
            
            <div v-if="selectedIngredients.length > 0" class="mb-6">
              <h6 class="font-semibold mb-2">Selected ingredients:</h6>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="ingredient in selectedIngredients"
                  :key="ingredient"
                  class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {{ ingredient }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: AI Analysis -->
        <div v-if="currentStep === 1" class="text-center">
          <div class="text-6xl mb-6">🤖</div>
          <h4 class="text-2xl font-bold mb-4 text-gray-900">AI Analysis in Progress</h4>
          <p class="text-gray-600 mb-8">Our artificial intelligence is analyzing your ingredients...</p>
          
          <div class="max-w-md mx-auto">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div class="flex items-center justify-center mb-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <div class="space-y-2 text-left">
                <div :class="['flex items-center transition-all duration-500', analysisStep >= 1 ? 'text-green-600' : 'text-gray-400']">
                  <span class="mr-2">{{ analysisStep >= 1 ? '✅' : '⏳' }}</span>
                  Identifying ingredients...
                </div>
                <div :class="['flex items-center transition-all duration-500', analysisStep >= 2 ? 'text-green-600' : 'text-gray-400']">
                  <span class="mr-2">{{ analysisStep >= 2 ? '✅' : '⏳' }}</span>
                  Searching compatible recipes...
                </div>
                <div :class="['flex items-center transition-all duration-500', analysisStep >= 3 ? 'text-green-600' : 'text-gray-400']">
                  <span class="mr-2">{{ analysisStep >= 3 ? '✅' : '⏳' }}</span>
                  Calculating compatibility...
                </div>
                <div :class="['flex items-center transition-all duration-500', analysisStep >= 4 ? 'text-green-600' : 'text-gray-400']">
                  <span class="mr-2">{{ analysisStep >= 4 ? '✅' : '⏳' }}</span>
                  Personalizing suggestions...
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Recipe Suggestions -->
        <div v-if="currentStep === 2" class="text-center">
          <div class="text-6xl mb-6">🍳</div>
          <h4 class="text-2xl font-bold mb-4 text-gray-900">Suggested Recipes</h4>
          <p class="text-gray-600 mb-8">Here are the perfect recipes for your ingredients!</p>
          
          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div
              v-for="recipe in suggestedRecipes"
              :key="recipe.name"
              class="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 text-left hover:shadow-lg transition-all cursor-pointer"
              @click="selectRecipe(recipe)"
            >
              <div class="text-4xl mb-3">{{ recipe.emoji }}</div>
              <h5 class="text-xl font-bold mb-2">{{ recipe.name }}</h5>
              <p class="text-gray-600 text-sm mb-3">{{ recipe.description }}</p>
              <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>🕒 {{ recipe.time }} min</span>
                <span>👥 {{ recipe.servings }} servings</span>
              </div>
              <div class="text-green-600 font-semibold">
                {{ recipe.match }}% match
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Recipe Details -->
        <div v-if="currentStep === 3" class="text-center">
          <div class="text-6xl mb-6">👨‍🍳</div>
          <h4 class="text-2xl font-bold mb-4 text-gray-900">Recipe Details</h4>
          <p class="text-gray-600 mb-8">Follow the instructions to prepare your dish!</p>
          
          <div v-if="selectedRecipe" class="max-w-2xl mx-auto text-left">
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6">
              <div class="flex items-center mb-4">
                <div class="text-4xl mr-4">{{ selectedRecipe.emoji }}</div>
                <div>
                  <h5 class="text-2xl font-bold">{{ selectedRecipe.name }}</h5>
                  <p class="text-gray-600">{{ selectedRecipe.description }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="text-center p-3 bg-white rounded-lg">
                  <div class="font-bold">{{ selectedRecipe.time }}</div>
                  <div class="text-sm text-gray-600">minutes</div>
                </div>
                <div class="text-center p-3 bg-white rounded-lg">
                  <div class="font-bold">{{ selectedRecipe.servings }}</div>
                  <div class="text-sm text-gray-600">servings</div>
                </div>
              </div>
              
              <div class="mb-6">
                <h6 class="font-bold mb-3">Ingredients:</h6>
                <ul class="space-y-1 text-sm">
                  <li v-for="ingredient in selectedRecipe.ingredients" :key="ingredient">
                    • {{ ingredient }}
                  </li>
                </ul>
              </div>
              
              <div>
                <h6 class="font-bold mb-3">Instructions:</h6>
                <ol class="space-y-2 text-sm">
                  <li v-for="(step, index) in selectedRecipe.steps" :key="index" class="flex">
                    <span class="bg-green-100 text-green-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      {{ index + 1 }}
                    </span>
                    {{ step }}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex justify-between items-center mt-8">
        <button
          @click="previousStep"
          :disabled="currentStep === 0"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all"
        >
          ← Back
        </button>
        
        <div class="text-sm text-gray-500">
          Step {{ currentStep + 1 }} of {{ demoSteps.length }}
        </div>
        
        <button
          v-if="currentStep < demoSteps.length - 1"
          @click="nextStep"
          :disabled="currentStep === 0 && selectedIngredients.length === 0"
          class="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
        
        <RouterLink
          v-else
          to="/register"
          class="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
        >
          Start Now! 🚀
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'

defineEmits(['close'])

const currentStep = ref(0)
const analysisStep = ref(0)
const selectedIngredients = ref<string[]>([])
const selectedRecipe = ref<any>(null)

const demoSteps = [
  'Add Ingredients',
  'AI Analysis',
  'Suggested Recipes',
  'Recipe Details'
]

const availableIngredients = [
  'Tomatoes 🍅',
  'Mozzarella 🧀',
  'Basil 🌿',
  'Pasta 🍝',
  'Garlic 🧄',
  'Olive Oil 🫒'
]

const suggestedRecipes = [
  {
    name: 'Caprese Pasta',
    emoji: '🍝',
    description: 'A classic Italian dish, fresh and flavorful',
    time: 15,
    servings: 4,
    match: 95,
    ingredients: [
      'Pasta (320g)',
      'Fresh tomatoes (400g)',
      'Mozzarella (200g)',
      'Fresh basil',
      'Garlic (2 cloves)',
      'Olive oil'
    ],
    steps: [
      'Bring a pot of salted water to boil',
      'Cook pasta according to package instructions',
      'In a pan, sauté garlic with olive oil',
      'Add diced tomatoes and cook for 5 minutes',
      'Drain pasta and toss with the sauce',
      'Add diced mozzarella and fresh basil',
      'Serve immediately while hot!'
    ]
  },
  {
    name: 'Gourmet Bruschetta',
    emoji: '🥖',
    description: 'Perfect appetizer for any occasion',
    time: 10,
    servings: 6,
    match: 88,
    ingredients: [
      'Bread (6 slices)',
      'Tomatoes (3 medium)',
      'Mozzarella (150g)',
      'Fresh basil',
      'Garlic (1 clove)',
      'Olive oil'
    ],
    steps: [
      'Toast bread slices until golden',
      'Rub garlic on the toasted slices',
      'Dice tomatoes into small cubes',
      'Season tomatoes with oil, salt and basil',
      'Distribute mixture on bruschetta',
      'Add mozzarella pieces',
      'Serve immediately!'
    ]
  }
]

const toggleIngredient = (ingredient: string) => {
  const index = selectedIngredients.value.indexOf(ingredient)
  if (index > -1) {
    selectedIngredients.value.splice(index, 1)
  } else {
    selectedIngredients.value.push(ingredient)
  }
}

const nextStep = () => {
  if (currentStep.value < demoSteps.length - 1) {
    currentStep.value++
    
    // Start analysis animation when entering step 2
    if (currentStep.value === 1) {
      startAnalysis()
    }
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    analysisStep.value = 0
  }
}

const goToStep = (step: number) => {
  // Only allow going to completed steps or the next step
  if (step <= currentStep.value + 1) {
    currentStep.value = step
    if (step === 1) {
      startAnalysis()
    } else {
      analysisStep.value = 0
    }
  }
}

const startAnalysis = () => {
  analysisStep.value = 0
  const interval = setInterval(() => {
    analysisStep.value++
    if (analysisStep.value >= 4) {
      clearInterval(interval)
    }
  }, 800)
}

const selectRecipe = (recipe: any) => {
  selectedRecipe.value = recipe
  nextStep()
}

onMounted(() => {
  // Auto-select some ingredients for demo
  selectedIngredients.value = ['Tomatoes 🍅', 'Mozzarella 🧀', 'Basil 🌿']
})
</script>
