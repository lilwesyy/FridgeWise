<template>
  <div class="pt-20 px-2 sm:px-4 pb-8 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div class="max-w-xl w-full bg-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-md border border-white/20 animate-fade-up text-center">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-purple-100 mb-4 drop-shadow-lg">Go Premium</h1>
      <p class="text-lg text-purple-200 mb-6">Unlock unlimited photo uploads and more exclusive features!</p>
      <ul class="text-left text-purple-100 mb-8 space-y-3">
        <li class="flex items-center gap-2"><span class="text-purple-300">✔</span> Unlimited photo ingredient detection</li>
        <li class="flex items-center gap-2"><span class="text-purple-300">✔</span> Unlimited recipe suggestions</li>
        <li class="flex items-center gap-2"><span class="text-purple-300">✔</span> Advanced nutrition tracking</li>
        <li class="flex items-center gap-2"><span class="text-purple-300">✔</span> Meal planning & shopping lists</li>
        <li class="flex items-center gap-2"><span class="text-purple-300">✔</span> Dietary preference filters</li>
        <li class="flex items-center gap-2"><span class="text-purple-300">✔</span> Priority customer support</li>
      </ul>
      <div class="mb-6 flex items-center justify-center gap-2">
        <span class="text-4xl font-bold text-purple-200 align-middle">€9.99</span>
        <span class="text-purple-300 ml-2 align-middle">/ month</span>
      </div>
      <div class="text-sm opacity-80 mb-4 flex items-center justify-center gap-2">
        <span class="line-through text-purple-400 text-lg">€19.99</span>
        <span class="text-purple-200">- Limited time offer!</span>
      </div>
      <button
        class="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-500 transition-all duration-200 shadow-xl mb-3"
      >
        Upgrade Now
      </button>
      <p class="text-xs text-purple-300 opacity-80 mt-2">Cancel anytime. Secure payment coming soon.</p>
      <RouterLink to="/ingredients" class="block mt-6 text-purple-200 underline hover:text-white transition">Back to Ingredients</RouterLink>
      <footer class="mt-10 text-center text-xs text-purple-300 opacity-80 select-none">
        © 2025 FridgeWise · Made with ❤️ for food lovers
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
