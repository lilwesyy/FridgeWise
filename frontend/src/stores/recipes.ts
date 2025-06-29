import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recipesAPI } from '@/services/api'
import type { Recipe } from '@/types'

export const useRecipesStore = defineStore('recipes', () => {
  const recommendations = ref<Recipe[]>([])
  const searchResults = ref<Recipe[]>([])
  const savedRecipes = ref<Recipe[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Supporta sia chiamata semplice (solo ingredienti) sia avanzata (con filtri)
  const getRecommendations = async (params: { ingredientIds: string[], servings?: number, maxTime?: number, difficulty?: string }) => {
    const { ingredientIds, servings, maxTime, difficulty } = params
    if (!ingredientIds || ingredientIds.length === 0) return
    loading.value = true
    try {
      const response = await recipesAPI.getRecommendations({
        ingredients: ingredientIds,
        servings,
        maxPrepTime: maxTime,
        difficulty
      })
      if (response.success && response.data) {
        recommendations.value = response.data.recipes
        return response.data
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const searchRecipes = async (query: string, filters?: any) => {
    if (query.length < 2) return
    
    loading.value = true
    try {
      const response = await recipesAPI.search(query, filters)
      if (response.success && response.data) {
        searchResults.value = response.data.recipes
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Cerca SOLO tra le ricette salvate dall'utente
  const searchSavedRecipes = async (query: string) => {
    if (query.length < 2) {
      searchResults.value = []
      return
    }
    loading.value = true
    try {
      // Assicurati di avere le ricette salvate caricate
      if (savedRecipes.value.length === 0) {
        await loadSavedRecipes()
      }
      // Filtro locale tra le ricette salvate
      const q = query.toLowerCase()
      searchResults.value = savedRecipes.value.filter(r =>
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      )
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const saveRecipe = async (recipeId: string, aiRecipe?: any) => {
    try {
      let response
      if (aiRecipe) {
        // Use the new method for AI recipes
        response = await recipesAPI.saveRecipeWithData(recipeId, aiRecipe)
      } else {
        // Use the standard method for regular recipes
        response = await recipesAPI.saveRecipe(recipeId)
      }
      
      if (response.success) {
        // Reload saved recipes to reflect the change
        await loadSavedRecipes()
        return response.data
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to save recipe'
      throw err
    }
  }

  const loadSavedRecipes = async () => {
    try {
      const response = await recipesAPI.getSavedRecipes()
      if (response.success && response.data) {
        savedRecipes.value = response.data.recipes
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  return {
    recommendations,
    searchResults,
    savedRecipes,
    loading,
    error,
    getRecommendations,
    searchRecipes, // ricerca globale (se serve altrove)
    searchSavedRecipes, // ricerca solo tra le salvate
    saveRecipe,
    loadSavedRecipes
  }
})
