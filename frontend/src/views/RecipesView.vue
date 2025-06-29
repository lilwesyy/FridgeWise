<template>
  <div class="pt-20 px-2 sm:px-4 pb-8 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div class="max-w-6xl mx-auto">
      <div class="mb-10 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">{{ $t('recipes.title') }}</h1>
        <p class="text-base sm:text-lg text-purple-200">{{ $t('recipes.subtitle') }}</p>
      </div>

      <!-- Ingredients Summary -->
      <div v-if="myIngredients.length > 0" class="relative bg-gradient-to-br from-green-400/30 via-emerald-400/20 to-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 mb-10 border border-white/30 backdrop-blur-xl animate-fade-up overflow-hidden">
        <div class="absolute -top-8 -right-8 opacity-20 pointer-events-none select-none">
          <svg width="120" height="120" fill="none" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#34d399"/></svg>
        </div>
        <div class="flex items-center gap-3 mb-4">
          <div class="bg-green-500/90 rounded-full p-3 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v7m-7-7h14"/></svg>
          </div>
          <h2 class="text-2xl font-extrabold text-white drop-shadow">{{ $t('recipes.yourIngredients') }} ({{ myIngredients.length }})</h2>
        </div>
        <div class="flex flex-wrap gap-3 mb-6">
          <span
            v-for="ingredient in myIngredients"
            :key="ingredient.name"
            class="bg-green-400/80 text-white px-4 py-2 rounded-full text-base font-bold shadow border border-green-300/60 hover:scale-105 transition-transform drop-shadow-md"
          >
            {{ formatIngredientName(ingredient.name) }}
          </span>
        </div>
        <div class="border-t border-green-200/40 my-6"></div>
        <form @submit.prevent="getRecommendations" class="flex flex-col sm:flex-row gap-6 mb-4 items-center justify-center">
          <div class="flex flex-col items-center">
            <label for="servings" class="text-white text-xs mb-1 font-semibold">{{ $t('recipes.servings') }}</label>
            <input id="servings" v-model.number="servings" type="number" min="1" max="20" class="w-20 px-2 py-1 rounded-lg border border-green-300 bg-white/90 text-gray-900 font-bold text-center shadow focus:ring-2 focus:ring-green-400" />
          </div>
          <div class="flex flex-col items-center">
            <label for="maxTime" class="text-white text-xs mb-1 font-semibold">{{ $t('recipes.maxTime') }}</label>
            <input id="maxTime" v-model.number="maxTime" type="number" min="5" max="240" class="w-24 px-2 py-1 rounded-lg border border-green-300 bg-white/90 text-gray-900 font-bold text-center shadow focus:ring-2 focus:ring-green-400" />
          </div>
          <div class="flex flex-col items-center">
            <label for="difficulty" class="text-white text-xs mb-1 font-semibold">{{ $t('recipes.difficulty') }}</label>
            <select id="difficulty" v-model="difficulty" class="px-2 py-1 rounded-lg border border-green-300 bg-white/90 text-gray-900 font-bold shadow focus:ring-2 focus:ring-green-400">
              <option value="">{{ $t('recipes.any') }}</option>
              <option value="facile">{{ $t('recipes.easy') }}</option>
              <option value="media">{{ $t('recipes.medium') }}</option>
              <option value="difficile">{{ $t('recipes.hard') }}</option>
            </select>
          </div>
        </form>
        <button
          @click="getRecommendations"
          :disabled="loading || !canUseRecipes"
          class="w-full sm:w-auto mx-auto block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-extrabold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 shadow-xl mt-2"
        >
          <span v-if="loading">{{ $t('recipes.searching') }}</span>
          <span v-else>{{ $t('recipes.getSuggestions') }}</span>
        </button>
        <div v-if="!canUseRecipes" class="mt-3 text-sm text-yellow-600 font-semibold text-center">
          {{ $t('recipes.limitWarning') }}
        </div>
      </div>

      <!-- No Ingredients Message -->
      <div v-else class="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-200/80 via-yellow-100/80 to-yellow-300/80 border border-yellow-300 rounded-2xl p-8 mb-8 shadow-xl animate-fade-up">
        <div class="flex flex-col items-center gap-3">
          <div class="bg-yellow-400/80 rounded-full p-3 mb-2 shadow-lg">
            <svg class="w-8 h-8 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-yellow-900">{{ $t('recipes.noIngredients') }}</h3>
          <p class="text-yellow-800 text-center max-w-xs">{{ $t('recipes.noIngredientsDesc') }}</p>
          <RouterLink to="/ingredients" class="mt-3 inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold px-6 py-2 rounded-xl shadow hover:from-yellow-500 hover:to-yellow-400 transition-all duration-200">
            {{ $t('recipes.addIngredients') }}
          </RouterLink>
        </div>
      </div>

      <!-- Recipe Card(s) -->
      <div v-if="recommendations.length > 0">
        <div class="flex flex-col items-center">
          <div
            v-for="recipe in recommendations"
            :key="recipe._id"
            class="bg-white/20 rounded-2xl shadow-2xl overflow-hidden hover:shadow-2xl transition-shadow border border-white/30 animate-fade-up backdrop-blur-md w-full mb-10"
            style="max-width: 100%;"
          >
            <div class="p-10">
              <h3 class="text-3xl font-extrabold mb-3 text-white">{{ recipe.title }}</h3>
              <p class="text-white/90 text-lg mb-5">{{ recipe.description }}</p>
              <div class="flex flex-wrap gap-6 items-center justify-between text-lg text-white/80 mb-6">
                <span>🕒 <span class="font-bold text-white">{{ recipe.cookingTime }}</span> {{ $t('recipes.min') }}</span>
                <span>👥 <span class="font-bold text-white">{{ recipe.servings }}</span> {{ $t('recipes.servings') }}</span>
                <span class="capitalize">📊 <span class="font-bold text-white">{{ $t('recipes.' + recipe.difficulty) }}</span></span>
                <span class="text-green-200 font-bold">{{ calculateMatchPercentage(recipe) }}% {{ $t('recipes.match') }}</span>
                <span class="text-purple-100">{{ recipe.nutritionInfo.calories }} {{ $t('recipes.cal') }}</span>
              </div>
              <div class="mb-8">
                <h4 class="text-2xl font-bold mb-3 text-green-100">{{ $t('recipes.ingredients') }}</h4>
                <ul class="space-y-2">
                  <li v-for="ingredient in recipe.ingredients" :key="ingredient.ingredientId || ingredient.name" class="flex justify-between text-white/90">
                    <span>{{ ingredient.name }}</span>
                    <span class="text-green-200 font-semibold">{{ ingredient.amount }} {{ ingredient.unit }}</span>
                  </li>
                </ul>
              </div>
              <div class="mb-8">
                <h4 class="text-2xl font-bold mb-3 text-green-100">{{ $t('recipes.instructions') }}</h4>
                <ol class="space-y-3">
                  <li v-for="(instruction, index) in recipe.instructions" :key="index" class="flex items-start text-white/90">
                    <span class="bg-green-400 text-green-900 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold mr-4 mt-1 flex-shrink-0">{{ index + 1 }}</span>
                    <span class="pt-1 leading-relaxed">{{ instruction }}</span>
                  </li>
                </ol>
              </div>
              <div class="flex space-x-4 mt-6">
                <button
                  @click="saveRecipe(recipe._id)"
                  class="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow"
                >
                  {{ $t('recipes.saveRecipe') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messaggio se nessuna ricetta trovata o generata -->
      <div v-else-if="myIngredients.length > 0 && !loading" class="flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-purple-800/80 border border-purple-400/30 rounded-2xl p-8 mb-8 shadow-xl animate-fade-up">
        <div class="flex flex-col items-center gap-3">
          <div class="bg-purple-400/80 rounded-full p-3 mb-2 shadow-lg">
            <svg class="w-8 h-8 text-purple-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-purple-100">{{ $t('recipes.noRecipeFound') }}</h3>
          <p class="text-purple-200 text-center max-w-xs">{{ $t('recipes.noRecipeFoundDesc') }}</p>
        </div>
      </div>

      <!-- Search Recipes -->
      <div v-if="savedRecipes.length > 0 || searchResults.length > 0" class="bg-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 backdrop-blur-md border border-white/20 animate-fade-up">
        <h2 class="text-xl font-semibold mb-4 text-white">{{ $t('recipes.searchAll') }}</h2>
        <div class="mb-4 flex flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              @input="debouncedSearch"
              type="text"
              :placeholder="$t('recipes.searchPlaceholder')"
              class="w-full pl-11 pr-4 py-2 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
            />
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg>
            </span>
          </div>
        </div>
        <div v-if="searchResults.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="recipe in searchResults"
            :key="recipe._id"
            class="bg-white/10 border border-purple-200 rounded-2xl p-4 hover:shadow-xl transition-shadow animate-fade-up"
          >
            <h3 class="font-semibold mb-2 text-white">{{ recipe.title }}</h3>
            <p class="text-purple-100 text-sm mb-2 line-clamp-2">{{ recipe.description }}</p>
            <div class="flex items-center justify-between text-sm text-purple-200 mb-2">
              <span>🕒 {{ recipe.cookingTime }} {{ $t('recipes.min') }}</span>
              <span>{{ recipe.nutritionInfo.calories }} {{ $t('recipes.cal') }}</span>
            </div>
            <button
              @click="viewRecipe(recipe)"
              class="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow"
            >
              {{ $t('recipes.viewRecipe') }}
            </button>
          </div>
        </div>
      </div>

      <footer class="mt-10 text-center text-xs text-purple-300 opacity-80 select-none">
        © 2025 FridgeWise · {{ $t('recipes.footer') }}
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useIngredientsStore } from '@/stores/ingredients'
import { useRecipesStore } from '@/stores/recipes'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { debounce } from '@/utils/debounce'
import type { Recipe } from '@/types'

const ingredientsStore = useIngredientsStore()
const recipesStore = useRecipesStore()
const authStore = useAuthStore()

const { myIngredients } = storeToRefs(ingredientsStore)
const { recommendations, searchResults, loading, savedRecipes } = storeToRefs(recipesStore)
const { canUseFeature } = authStore

const searchQuery = ref('')
const selectedRecipe = ref<Recipe | null>(null)

// Nuovi parametri per la richiesta
const servings = ref(2)
const maxTime = ref(30)
const difficulty = ref('')

const canUseRecipes = computed(() => canUseFeature('recipes'))

const getRecommendations = async () => {
  if (!canUseRecipes.value) return
  const ingredientIds = myIngredients.value.map(ing => ing.ingredientId || ing._id)
  // Mappa la difficoltà in inglese per il backend
  let difficultyBackend = ''
  if (difficulty.value === 'facile') difficultyBackend = 'easy'
  else if (difficulty.value === 'media') difficultyBackend = 'medium'
  else if (difficulty.value === 'difficile') difficultyBackend = 'hard'
  try {
    await recipesStore.getRecommendations({
      ingredientIds,
      servings: servings.value,
      maxTime: maxTime.value,
      ...(difficultyBackend ? { difficulty: difficultyBackend } : {})
    })
    authStore.updateUsage('recipes')
  } catch (error) {
    console.error('Error getting recommendations:', error)
  }
}

const searchRecipes = () => {
  if (searchQuery.value.length >= 2) {
    recipesStore.searchSavedRecipes(searchQuery.value)
  } else {
    recipesStore.searchResults = []
  }
}

const debouncedSearch = debounce(searchRecipes, 300)

const viewRecipe = (recipe: Recipe) => {
  selectedRecipe.value = recipe
}

const closeRecipeModal = () => {
  selectedRecipe.value = null
}

const saveRecipe = async (recipeId: string) => {
  try {
    // Find the recipe in recommendations to check if it's an AI recipe
    const recipe = recommendations.value.find(r => r._id === recipeId || r.id === recipeId)
    
    if (recipe && (recipeId.startsWith('ai-') || recipe.id?.startsWith('ai-'))) {
      // This is an AI recipe, pass the full recipe data
      await recipesStore.saveRecipe(recipeId, recipe)
    } else {
      // This is a regular recipe
      await recipesStore.saveRecipe(recipeId)
    }
    
    // Show success message (you can add a toast notification here)
    console.log('Recipe saved successfully!')
  } catch (error) {
    console.error('Error saving recipe:', error)
    // Show error message (you can add a toast notification here)
  }
}

const calculateMatchPercentage = (recipe: Recipe): number => {
  const myIngredientNames = myIngredients.value.map(ing => ing.name.toLowerCase())
  const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase())
  const matches = recipeIngredients.filter(name => myIngredientNames.includes(name)).length
  return Math.round((matches / recipeIngredients.length) * 100)
}

const formatIngredientName = (name: string) => {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

onMounted(() => {
  // RIMOSSO: chiamata automatica a getRecommendations
  // Ora l'AI viene chiamata solo quando l'utente preme il bottone
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.max-h-90vh {
  max-height: 90vh;
}

.animate-fade-up {
  animation: fade-up 1s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fade-up {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
