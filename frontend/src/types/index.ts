export interface User {
  id: string
  email: string
  name: string
  isSupporter: boolean // aggiunto per supporter badge
  subscription: {
    tier: 'free' | 'premium'
    usageCount: {
      photos: number
      recipes: number
      lastReset: string
    }
    validUntil: string | null
  }
}

export interface Ingredient {
  _id: string
  name: string
  category: string
  nutritionPer100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  commonNames: string[]
  shelfLife: number
  storageType: 'fridge' | 'pantry' | 'freezer' | 'room-temperature'
  isVerified?: boolean
}

export interface Recipe {
  _id: string
  title: string
  description: string
  ingredients: {
    ingredientId: string
    name: string
    amount: string
    unit: string
  }[]
  instructions: string[]
  cookingTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  imageUrl?: string
  source: string
  createdAt: string
}

export interface DetectedIngredient {
  name: string
  confidence: number
  category: string
  quantity_estimate: string
  freshness: 'fresh' | 'good' | 'questionable'
  ingredientId?: string
  nutritionPer100g?: Ingredient['nutritionPer100g']
  storageType?: string
  shelfLife?: number
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}
