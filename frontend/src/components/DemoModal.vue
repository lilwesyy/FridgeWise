<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      @click="$emit('close')"
    ></div>
    
    <!-- Modal Container -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white relative">
          <button
            @click="$emit('close')"
            class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          <div class="text-center">
            <div class="text-6xl mb-4">🎮</div>
            <h2 class="text-3xl font-bold mb-2">Interactive FridgeWise Demo</h2>
            <p class="text-green-100 text-lg">
              Discover how our artificial intelligence works
            </p>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <DemoComponent @close="$emit('close')" />
        </div>
        
        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t">
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              @click="$emit('close')"
              class="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Close Demo
            </button>
            <RouterLink
              to="/register"
              @click="$emit('close')"
              class="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              🚀 Sign Up Free
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DemoComponent from './DemoComponent.vue'

defineEmits<{
  close: []
}>()
</script>

<style scoped>
/* Custom scrollbar for modal content */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
