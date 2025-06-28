<template>
  <div class="pt-20 px-2 sm:px-4 pb-8 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div class="max-w-6xl mx-auto">
      <div class="mb-10 text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">{{ $t('ingredients.title') }}</h1>
        <p class="text-base sm:text-lg text-purple-200">{{ $t('ingredients.subtitle') }}</p>
      </div>
      <!-- Usage Limit Warning -->
      <transition name="fade">
        <div v-if="!canUsePhotos" class="bg-yellow-100/90 border border-yellow-400 text-yellow-900 px-4 py-3 rounded-xl mb-8 flex items-center justify-center gap-4 shadow-lg animate-fade-up">
          <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"/></svg>
          <div>
            <p class="font-semibold">{{ $t('ingredients.photoLimitTitle') }}</p>
            <p class="text-sm">{{ $t('ingredients.photoLimitDesc') }} <span class="font-bold text-yellow-700 underline cursor-pointer" @click="$router.push('/premium')">{{ $t('ingredients.upgrade') }}</span> {{ $t('ingredients.photoLimitDesc2') }}</p>
          </div>
        </div>
      </transition>

      <div class="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-10">
        <!-- Left Column: My Ingredients -->
        <div>
          <div class="bg-white/10 rounded-2xl shadow-2xl p-4 sm:p-8 backdrop-blur-md border border-white/20 animate-fade-up">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2 sm:gap-0">
              <h2 class="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg>
                {{ $t('ingredients.myIngredients') }} ({{ myIngredients.length }})
                <span class="ml-2 text-xs text-purple-200 font-normal">/ {{ totalIngredientsCount }}</span>
              </h2>
              <button
                v-if="myIngredients.length > 0"
                @click="clearAllIngredients"
                class="text-red-400 hover:text-red-600 text-sm font-semibold transition-colors"
              >
                {{ $t('ingredients.clearAll') }}
              </button>
            </div>
            <div v-if="myIngredients.length === 0" class="text-center py-8 sm:py-12 text-purple-200">
              <p class="text-base sm:text-lg font-semibold">{{ $t('ingredients.noIngredients') }}</p>
              <p class="text-xs sm:text-sm">{{ $t('ingredients.noIngredientsDesc') }}</p>
            </div>
            <div v-else class="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              <div
                v-for="ingredient in myIngredients"
                :key="ingredient.name"
                class="flex justify-between items-center p-3 sm:p-4 border border-purple-200 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-150"
              >
                <div>
                  <div class="font-semibold text-white">{{ formatIngredientName(ingredient.name) }}</div>
                  <div class="text-xs sm:text-sm text-purple-200">
                    {{ formatCategoryName(ingredient.category) }}
                    <span v-if="ingredient.confidence" class="ml-2">
                      ({{ Math.round(ingredient.confidence * 100) }}% {{ $t('ingredients.confident') }})
                    </span>
                  </div>
                </div>
                <button
                  @click="removeIngredient(ingredient.name)"
                  class="text-red-400 hover:text-red-600 text-lg font-bold px-2"
                  :title="$t('ingredients.remove')"
                >
                  ✕
                </button>
              </div>
            </div>
            <div v-if="myIngredients.length > 0" class="mt-6 sm:mt-8">
              <RouterLink
                to="/recipes"
                class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 block text-center text-base sm:text-lg shadow-xl"
              >
                {{ $t('ingredients.findRecipes') }} ({{ myIngredients.length }})
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Right Column: Add Ingredients (Tabs) -->
        <div class="space-y-6 sm:space-y-8 mt-6 lg:mt-0">
          <div class="bg-white/10 rounded-2xl shadow-2xl p-4 sm:p-8 backdrop-blur-md border border-white/20 animate-fade-up">
            <div class="flex gap-2 mb-6">
              <button
                :class="['flex-1 py-2 rounded-lg font-semibold', addTab === 'photo' ? 'bg-purple-500 text-white' : 'bg-white/20 text-purple-200']"
                @click="addTab = 'photo'"
              >
                <svg class="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h2l.4 2M7 13h10l1.4-4H6.6M7 13l-1.4 4M7 13l-4-8m14 8l1.4 4M17 13l4-8M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                {{ $t('ingredients.photoTab') }}
              </button>
              <button
                :class="['flex-1 py-2 rounded-lg font-semibold', addTab === 'search' ? 'bg-purple-500 text-white' : 'bg-white/20 text-purple-200']"
                @click="addTab = 'search'"
              >
                <svg class="inline w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg>
                {{ $t('ingredients.searchTab') }}
              </button>
            </div>
            <div v-if="addTab === 'photo'">
              <div class="border-2 border-dashed border-purple-400 rounded-xl p-6 sm:p-8 text-center bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer" @click="$refs.fileInput.click()">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                <div v-if="!selectedImage">
                  <svg class="mx-auto h-12 w-12 sm:h-14 sm:w-14 text-purple-300" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <p class="mt-3 text-purple-200 text-sm sm:text-base">{{ $t('ingredients.uploadPrompt') }}</p>
                  <button
                    @click.stop="$refs.fileInput.click()"
                    :disabled="!canUsePhotos || uploadLoading"
                    class="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 shadow-lg"
                  >
                    {{ $t('ingredients.selectImage') }}
                  </button>
                </div>
                <div v-else>
                  <img :src="selectedImage" alt="Selected" class="max-h-40 sm:max-h-48 mx-auto rounded-xl shadow-lg border border-purple-200" />
                  <div class="mt-4 flex flex-wrap gap-2 justify-center">
                    <button
                      @click.stop="analyzeImage"
                      :disabled="uploadLoading || ingredientsLoading || !canUsePhotos"
                      class="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 shadow"
                    >
                      <span v-if="ingredientsLoading">{{ $t('ingredients.analyzing') }}</span>
                      <span v-else>{{ $t('ingredients.analyzeImage') }}</span>
                    </button>
                    <button
                      @click.stop="clearImage"
                      class="bg-gray-500 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200 shadow"
                    >
                      {{ $t('ingredients.clear') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row gap-2">
                  <div class="relative flex-1">
                    <input
                      v-model="searchQuery"
                      @input="debouncedSearch"
                      type="text"
                      :placeholder="$t('ingredients.searchPlaceholder')"
                      class="w-full pl-11 pr-4 py-2 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200"
                    />
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg>
                    </span>
                  </div>
                  <div class="relative w-full sm:w-48">
                    <select
                      v-model="selectedCategory"
                      @change="performSearch"
                      class="w-full pl-10 pr-4 py-2 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/80 text-gray-900 transition-all duration-200 appearance-none shadow-sm"
                    >
                      <option value="">{{ $t('ingredients.allCategories') }}</option>
                      <option v-for="category in categories" :key="category.name" :value="category.name">
                        {{ formatCategoryName(category.name) }} ({{ category.count }})
                      </option>
                    </select>
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8l8 8 8-8"/></svg>
                    </span>
                  </div>
                </div>
                <!-- Ingredient Suggestions -->
                <div v-if="ingredientSuggestions.length > 0 && !searchQuery" class="mt-2">
                  <div class="flex flex-wrap gap-2">
                    <span class="text-xs text-purple-300 mr-2">{{ $t('ingredients.suggestions') }}</span>
                    <button
                      v-for="suggestion in ingredientSuggestions"
                      :key="suggestion"
                      @click="selectSuggestion(suggestion)"
                      class="px-3 py-1 rounded-full bg-purple-200 text-purple-800 font-semibold text-xs hover:bg-purple-300 transition"
                    >
                      {{ formatIngredientName(suggestion) }}
                    </button>
                  </div>
                </div>
                <div v-if="searchResults.length > 0" class="max-h-56 overflow-y-auto mt-2 rounded-xl bg-white/40 p-2 border border-purple-100 shadow-inner">
                  <div class="grid gap-2">
                    <div
                      v-for="ingredient in searchResults"
                      :key="ingredient._id"
                      @click="addSearchedIngredient(ingredient)"
                      class="flex items-center justify-between p-3 border border-purple-200 rounded-xl bg-white/80 hover:bg-purple-100/80 cursor-pointer transition-all duration-150 shadow-sm group"
                    >
                      <div>
                        <div class="font-semibold text-gray-900 group-hover:text-purple-900">{{ formatIngredientName(ingredient.name) }}</div>
                        <span class="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-200 text-purple-800 font-medium">{{ formatCategoryName(ingredient.category) }}</span>
                      </div>
                      <span class="text-purple-400 text-lg group-hover:text-purple-600">+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer class="mt-10 text-center text-xs text-purple-300 opacity-80 select-none">
        © 2025 FridgeWise · {{ $t('ingredients.footer') }}
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useIngredientsStore } from '@/stores/ingredients'
import { useAuthStore } from '@/stores/auth'
import { uploadsAPI } from '@/services/api'
import { storeToRefs } from 'pinia'
import { debounce } from '@/utils/debounce'
import type { Ingredient } from '@/types'
import { useI18n } from 'vue-i18n'
import { ingredientTranslations } from '@/utils/ingredientTranslations'

const ingredientsStore = useIngredientsStore()
const authStore = useAuthStore()
const { locale } = useI18n()

const { myIngredients, searchResults, categories, loading: ingredientsLoading, error } = storeToRefs(ingredientsStore)
const { canUseFeature } = authStore

const fileInput = ref<HTMLInputElement>()
const selectedImage = ref<string>('')
const uploadLoading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const addTab = ref<'photo' | 'search'>('photo')

const canUsePhotos = computed(() => canUseFeature('photos'))

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  selectedImage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const analyzeImage = async () => {
  if (!selectedImage.value || !canUsePhotos.value) return
  
  try {
    uploadLoading.value = true
    
    // Convert base64 to blob
    const response = await fetch(selectedImage.value)
    const blob = await response.blob()
    const file = new File([blob], 'ingredient-photo.jpg', { type: 'image/jpeg' })
    
    // Upload image
    const uploadResult = await uploadsAPI.uploadImage(file)
    if (uploadResult.success && uploadResult.data) {
      // Detect ingredients
      await ingredientsStore.detectFromImage(uploadResult.data.imageUrl)
      authStore.updateUsage('photos')
      clearImage()
    }
  } catch (err: any) {
    console.error('Error analyzing image:', err)
  } finally {
    uploadLoading.value = false
  }
}

const performSearch = () => {
  if (searchQuery.value.length >= 2) {
    ingredientsStore.searchIngredients(searchQuery.value, selectedCategory.value)
  } else {
    // Svuota i risultati e forza un update reattivo
    ingredientsStore.$patch({ searchResults: [] })
  }
}

watch([searchQuery, selectedCategory], ([val, cat]) => {
  if (!val) {
    ingredientsStore.$patch({ searchResults: [] })
  }
})

const debouncedSearch = debounce(performSearch, 300)

const addSearchedIngredient = (ingredient: Ingredient) => {
  ingredientsStore.addIngredient({
    name: ingredient.name,
    category: ingredient.category,
    confidence: 1,
    quantity_estimate: 'Unknown',
    freshness: 'good',
    ingredientId: ingredient._id,
    nutritionPer100g: ingredient.nutritionPer100g,
    storageType: ingredient.storageType,
    shelfLife: ingredient.shelfLife
  })
  // Svuota i risultati subito dopo l'aggiunta
  ingredientsStore.searchResults.value = []
}

const removeIngredient = (name: string) => {
  ingredientsStore.removeIngredient(name)
}

const clearAllIngredients = () => {
  ingredientsStore.clearMyIngredients()
}

const formatIngredientName = (name: string) => {
  const key = name.trim().toLowerCase()
  const lang = locale.value
  if (
    ingredientTranslations[key] &&
    ingredientTranslations[key][lang]
  ) {
    return ingredientTranslations[key][lang]
  }
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const formatCategoryName = (category: string) => {
  return category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const ingredientSuggestions = ref([
  'tomato', 'egg', 'chicken', 'milk', 'mozzarella', 'zucchini', 'salmon', 'potato', 'carrot', 'spinach', 'apple', 'banana', 'rice', 'pasta', 'bread'
])

function selectSuggestion(suggestion: string) {
  searchQuery.value = suggestion
  performSearch()
}

onMounted(() => {
  ingredientsStore.loadCategories()
})

const totalIngredientsCount = computed(() => {
  // If categories are loaded, sum their counts, else fallback to 0
  if (categories.value && categories.value.length > 0) {
    return categories.value.map(c => c.count).reduce((a, b) => a + b, 0)
  }
  return 0
})
</script>
