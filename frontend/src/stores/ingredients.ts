import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ingredientsAPI } from '@/services/api'
import type { Ingredient, DetectedIngredient } from '@/types'

export const useIngredientsStore = defineStore('ingredients', () => {
  const myIngredients = ref<DetectedIngredient[]>([])
  const searchResults = ref<Ingredient[]>([])
  const categories = ref<{ name: string; count: number }[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadCategories = async () => {
    try {
      const response = await ingredientsAPI.getCategories()
      if (response.success && response.data) {
        categories.value = response.data.categories
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  const searchIngredients = async (query: string, category?: string) => {
    if (query.length < 2) return
    
    loading.value = true
    try {
      const response = await ingredientsAPI.search(query, category)
      if (response.success && response.data) {
        searchResults.value = response.data.ingredients
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const detectFromImage = async (imageUrl: string, confidence = 0.7) => {
    loading.value = true
    try {
      const response = await ingredientsAPI.detectFromImage(imageUrl, confidence)
      if (response.success && response.data) {
        // Add detected ingredients to my ingredients
        myIngredients.value.push(...response.data.matched, ...response.data.unknown)
        return response.data
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addIngredient = (ingredient: DetectedIngredient) => {
    const existing = myIngredients.value.find(ing => ing.name === ingredient.name)
    if (!existing) {
      myIngredients.value.push(ingredient)
    }
  }

  const removeIngredient = (ingredientName: string) => {
    const index = myIngredients.value.findIndex(ing => ing.name === ingredientName)
    if (index > -1) {
      myIngredients.value.splice(index, 1)
    }
  }

  const clearMyIngredients = () => {
    myIngredients.value = []
  }

  return {
    myIngredients,
    searchResults,
    categories,
    loading,
    error,
    loadCategories,
    searchIngredients,
    detectFromImage,
    addIngredient,
    removeIngredient,
    clearMyIngredients
  }
})
