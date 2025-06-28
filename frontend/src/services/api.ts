import axios from 'axios'
import type { APIResponse, LoginData, RegisterData, User, Ingredient, Recipe, DetectedIngredient } from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  async login(data: LoginData): Promise<APIResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  async register(data: RegisterData): Promise<APIResponse<{ token: string; user: User }>> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async getProfile(): Promise<APIResponse<{ user: User }>> {
    const response = await api.get('/auth/profile')
    return response.data
  }
}

export const ingredientsAPI = {
  async getCategories(): Promise<APIResponse<{ categories: { name: string; count: number }[] }>> {
    const response = await api.get('/ingredients/categories')
    return response.data
  },

  async search(query: string, category?: string): Promise<APIResponse<{ ingredients: Ingredient[]; count: number; query: string }>> {
    const params = new URLSearchParams({ q: query })
    if (category) params.append('category', category)
    const response = await api.get(`/ingredients/search?${params}`)
    return response.data
  },

  async detectFromImage(imageUrl: string, confidence = 0.7): Promise<APIResponse<{
    totalDetected: number
    matched: DetectedIngredient[]
    unknown: DetectedIngredient[]
    imageUrl: string
  }>> {
    const response = await api.post('/ingredients/detect-from-image', { imageUrl, confidence })
    return response.data
  },

  async addCustom(name: string, category: string, estimatedNutrition?: any): Promise<APIResponse<{ ingredient: Ingredient; message: string }>> {
    const response = await api.post('/ingredients/custom-add', { name, category, estimatedNutrition })
    return response.data
  },

  async getById(id: string): Promise<APIResponse<{ ingredient: Ingredient }>> {
    const response = await api.get(`/ingredients/${id}`)
    return response.data
  }
}

export const recipesAPI = {
  async getRecommendations({ ingredients, servings, maxPrepTime, difficulty }: { ingredients: string[], servings?: number, maxPrepTime?: number, difficulty?: string }): Promise<APIResponse<{ recipes: Recipe[]; matchedIngredients: number; totalIngredients: number }>> {
    const response = await api.post('/recipes/suggest', {
      ingredients,
      servings,
      maxPrepTime,
      difficulty
    })
    return response.data
  },

  async search(query: string, filters?: any): Promise<APIResponse<{ recipes: Recipe[]; count: number; query: string }>> {
    const response = await api.get('/recipes/search', { params: { q: query, ...filters } })
    return response.data
  },

  async getById(id: string): Promise<APIResponse<{ recipe: Recipe }>> {
    const response = await api.get(`/recipes/${id}`)
    return response.data
  },

  async saveRecipe(recipeId: string): Promise<APIResponse<{ message: string }>> {
    const response = await api.post(`/recipes/${recipeId}/save`)
    return response.data
  },

  async getSavedRecipes(): Promise<APIResponse<{ recipes: Recipe[] }>> {
    const response = await api.get('/recipes/saved')
    return response.data
  }
}

export const uploadsAPI = {
  async uploadImage(file: File): Promise<APIResponse<{ imageUrl: string; publicId: string }>> {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export default api
