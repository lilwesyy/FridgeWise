<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
    <div class="text-center animate-fade-up">
      <h1 class="text-7xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">404</h1>
      <h2 class="text-3xl md:text-4xl font-bold mb-4">Page Not Found</h2>
      <p class="text-lg text-gray-300 mb-8">Sorry, the page you are looking for does not exist or has been moved.</p>
      <RouterLink to="/" class="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl">
        Go to Homepage
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
@keyframes fade-up {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 1s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
