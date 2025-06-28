<template>
  <div>
    <transition name="fade" appear>
      <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <LoadingSpinner />
      </div>
    </transition>
    <div v-show="!loading">
      <!-- Modern Hero Section -->
      <div class="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden" style="height:100vh;min-height:100vh;max-height:100vh;">
        <!-- Animated background pattern -->
        <div class="absolute inset-0 bg-pattern opacity-20"></div>
        
        <!-- Floating elements -->
        <div class="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-70 animate-pulse"></div>
        <div class="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-xl opacity-60 animate-pulse" style="animation-delay: 2s;"></div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center" style="height:100%;min-height:100%;max-height:100%;">
          <div class="text-center w-full">
            <!-- Badge -->
            <div class="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-8">
              <svg class="w-4 h-4 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
              </svg>
              <span class="text-purple-300 text-sm font-medium">{{ $t('home.badge') }}</span>
            </div>
            
            <!-- Main headline -->
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {{ $t('home.headline1') }}
              <span class="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                {{ $t('home.headline2') }}
              </span>
              <br>{{ $t('home.headline3') }}
            </h1>
            
            <!-- Subheadline -->
            <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              {{ $t('home.subheadline1') }}
              <span class="text-purple-400 font-semibold">{{ $t('home.subheadline2') }}</span>
            </p>
            
            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <RouterLink 
                v-if="!isAuthenticated"
                to="/register" 
                class="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <span class="relative z-10 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  {{ $t('home.ctaStart') }}
                  <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </span>
              </RouterLink>
              
              <div v-else class="flex flex-col sm:flex-row gap-4">
                <RouterLink 
                  to="/ingredients" 
                  class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ $t('home.ctaIngredients') }}
                </RouterLink>
                <RouterLink 
                  to="/recipes" 
                  class="px-8 py-4 border-2 border-purple-400 text-purple-400 rounded-2xl font-bold text-lg hover:bg-purple-400 hover:text-white transition-all duration-300"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  {{ $t('home.ctaRecipes') }}
                </RouterLink>
              </div>
            </div>
            
            <!-- Social proof -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
              <div class="flex items-center">
                <div class="flex -space-x-2 mr-3">
                  <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full border-2 border-white"></div>
                  <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white"></div>
                  <div class="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                    +5k
                  </div>
                </div>
                <span class="text-sm">Trusted by 5,000+ home chefs</span>
              </div>
              <div class="flex items-center text-yellow-400">
                <div class="flex mr-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span class="text-sm text-gray-400">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Value Proposition Section -->
      <div class="py-20 bg-white animate-fade-up" v-scroll-fade>
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {{ $t('home.why') }}
              <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FridgeWise?
              </span>
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              {{ $t('home.whyDesc') }}
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div class="group text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
              <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ $t('home.value1Title') }}</h3>
              <p class="text-gray-600 text-lg leading-relaxed">
                {{ $t('home.value1Desc') }}
              </p>
            </div>
            
            <div class="group text-center p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ $t('home.value2Title') }}</h3>
              <p class="text-gray-600 text-lg leading-relaxed">
                {{ $t('home.value2Desc') }}
              </p>
            </div>
            
            <div class="group text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
              <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ $t('home.value3Title') }}</h3>
              <p class="text-gray-600 text-lg leading-relaxed">
                {{ $t('home.value3Desc') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- DONATION SECTION -->
      <div class="py-20 bg-gradient-to-br from-yellow-50 to-yellow-100 animate-fade-up" v-scroll-fade>
        <div class="max-w-3xl mx-auto px-4 text-center">
          <h2 class="text-4xl md:text-5xl font-bold text-yellow-700 mb-6">
            {{ $t('home.donationTitle') }}
          </h2>
          <p class="text-xl text-yellow-800 max-w-2xl mx-auto mb-8">
            {{ $t('home.donationDesc1') }}<br>
            <span class="font-semibold">{{ $t('home.donationDesc2') }}</span>
          </p>
          <a href="https://www.paypal.com/donate/?hosted_button_id=DU757WK9EXN3Q" target="_blank" rel="noopener" class="inline-block px-8 py-4 bg-yellow-400 text-slate-900 font-bold text-lg rounded-2xl shadow-lg hover:bg-yellow-300 transition-all duration-200 mb-4">
            {{ $t('home.donationBtn') }}
          </a>
          <div class="mt-6 text-yellow-700 text-sm">
            {{ $t('home.donationThanks1') }}<br>
            <span class="font-semibold">{{ $t('home.donationThanks2') }}</span>
          </div>
        </div>
      </div>
      <!-- SPAM DONATION BANNER -->
      <div class="w-full bg-yellow-300 text-slate-900 text-center py-4 text-lg font-bold shadow-lg animate-fade-up">
        <a href="https://www.paypal.com/donate/?hosted_button_id=DU757WK9EXN3Q" target="_blank" rel="noopener" class="underline hover:text-yellow-900 transition">{{ $t('home.donationBanner') }}</a>
      </div>
      <!-- END DONATION SPAM -->

      <!-- How it Works Section -->
      <div class="py-20 bg-white animate-fade-up" v-scroll-fade>
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{{ $t('home.howTitle') }}</h2>
            <p class="text-xl text-gray-600">{{ $t('home.howDesc') }}</p>
          </div>
          <div class="grid md:grid-cols-3 gap-12">
            <div class="text-center">
              <div class="relative mb-8">
                <div class="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <span class="text-2xl font-bold text-white">1</span>
                </div>
              </div>
              <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ $t('home.howStep1Title') }}</h3>
              <p class="text-gray-600 text-lg leading-relaxed">
                {{ $t('home.howStep1Desc') }}
              </p>
            </div>
            
            <div class="text-center">
              <div class="relative mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-cyan-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <span class="text-2xl font-bold text-white">2</span>
                </div>
              </div>
              <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ $t('home.howStep2Title') }}</h3>
              <p class="text-gray-600 text-lg leading-relaxed">
                {{ $t('home.howStep2Desc') }}
              </p>
            </div>
            
            <div class="text-center">
              <div class="relative mb-8">
                <div class="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <span class="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ $t('home.howStep3Title') }}</h3>
              <p class="text-gray-600 text-lg leading-relaxed">
                {{ $t('home.howStep3Desc') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Social Proof Section -->
      <div class="py-20 bg-gradient-to-br from-purple-50 to-pink-50 animate-fade-up" v-scroll-fade>
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-6">{{ $t('home.socialTitle') }}</h2>
            <p class="text-xl text-gray-600">{{ $t('home.socialDesc') }}</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-2xl shadow-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <div class="font-bold">Sofia M.</div>
                  <div class="text-gray-600">{{ $t('home.social1Role') }}</div>
                </div>
              </div>
              <div class="flex text-yellow-400 mb-4">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <p class="text-gray-700 italic">
                {{ $t('home.social1Quote') }}
              </p>
            </div>
            
            <div class="bg-white p-8 rounded-2xl shadow-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  M
                </div>
                <div>
                  <div class="font-bold">Marco R.</div>
                  <div class="text-gray-600">{{ $t('home.social2Role') }}</div>
                </div>
              </div>
              <div class="flex text-yellow-400 mb-4">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <p class="text-gray-700 italic">
                {{ $t('home.social2Quote') }}
              </p>
            </div>
            
            <div class="bg-white p-8 rounded-2xl shadow-lg">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  L
                </div>
                <div>
                  <div class="font-bold">Luca T.</div>
                  <div class="text-gray-600">{{ $t('home.social3Role') }}</div>
                </div>
              </div>
              <div class="flex text-yellow-400 mb-4">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <p class="text-gray-700 italic">
                {{ $t('home.social3Quote') }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- ROI Section -->
      <div class="py-20 bg-white animate-fade-up" v-scroll-fade>
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {{ $t('home.roiTitle1') }}
              <span class="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {{ $t('home.roiTitle2') }}
              </span>
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              {{ $t('home.roiDesc') }}
            </p>
          </div>
          <div class="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div class="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
              <div class="text-4xl font-bold text-red-600 mb-2">€150</div>
              <div class="text-sm text-gray-600">{{ $t('home.roi1') }}</div>
            </div>
            
            <div class="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100">
              <div class="text-4xl font-bold text-yellow-600 mb-2">70%</div>
              <div class="text-sm text-gray-600">{{ $t('home.roi2') }}</div>
            </div>
            
            <div class="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
              <div class="text-4xl font-bold text-green-600 mb-2">€105</div>
              <div class="text-sm text-gray-600">{{ $t('home.roi3') }}</div>
            </div>
            
            <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <div class="text-4xl font-bold text-purple-600 mb-2">10x</div>
              <div class="text-sm text-gray-600">{{ $t('home.roi4') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final CTA Section -->
      <div class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 animate-fade-up" v-scroll-fade>
        <div class="max-w-4xl mx-auto text-center px-4">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
            {{ $t('home.finalCtaTitle') }}
          </h2>
          <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {{ $t('home.finalCtaDesc') }}
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <RouterLink 
              v-if="!isAuthenticated"
              to="/register" 
              class="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {{ $t('home.ctaStart') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Enhanced Minimal Footer -->
      <footer class="w-full py-8 bg-slate-900 text-gray-300 text-center mt-0 border-t border-slate-800">
        <div class="flex flex-col items-center justify-center gap-2">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl font-bold text-white">FridgeWise</span>
            <span class="inline-block px-2 py-1 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-semibold text-white ml-2">{{ $t('home.footerBadge') }}</span>
          </div>
          <div class="text-sm text-purple-200 mb-3">{{ $t('home.footerSlogan') }}</div>
          <div class="flex flex-wrap justify-center items-center gap-4 text-sm mb-2">
            <RouterLink to="/" class="hover:text-white transition-colors">{{ $t('home.footerHome') }}</RouterLink>
            <span class="hidden sm:inline">·</span>
            <a href="https://www.paypal.com/donate/?hosted_button_id=DU757WK9EXN3Q" target="_blank" rel="noopener" class="hover:text-white transition-colors">{{ $t('home.footerDonate') }}</a>
            <span class="hidden sm:inline">·</span>
            <a href="https://github.com/mircobabini/FridgeWise" target="_blank" rel="noopener" class="hover:text-white transition-colors">GitHub</a>
          </div>
          <div class="text-xs text-gray-500 mt-2">© 2025 FridgeWise. {{ $t('home.footerCopyright') }}</div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useIngredientsStore } from '@/stores/ingredients'
import { storeToRefs } from 'pinia'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const authStore = useAuthStore()
const ingredientsStore = useIngredientsStore()

const { isAuthenticated } = storeToRefs(authStore)
const { categories } = storeToRefs(ingredientsStore)

const loading = ref(true)

const stats = ref({
  ingredients: 0,
  users: 5000,
  recipes: 10000
})

const totalIngredients = computed(() => {
  return categories.value.reduce((sum, cat) => sum + cat.count, 0)
})

onMounted(async () => {
  await ingredientsStore.loadCategories()
  stats.value.ingredients = totalIngredients.value
  setTimeout(() => { loading.value = false }, 600)
})
</script>

<style scoped>
@keyframes fade-up {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
[v-scroll-fade] {
  opacity: 0;
  transition: opacity 0.8s, transform 0.8s;
  transform: translateY(40px);
}
[v-scroll-fade].is-visible {
  opacity: 1;
  transform: none;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.animate-pulse {
  animation: pulse 3s ease-in-out infinite;
}

.bg-pattern {
  background-image: radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.1) 1px, transparent 0);
  background-size: 60px 60px;
}
</style>
