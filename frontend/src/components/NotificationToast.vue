<template>
  <div
    v-if="show"
    class="toast-item animate-in"
    :class="type"
  >
    <div class="flex items-center gap-3">
      <div class="icon">
        <svg v-if="type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-else-if="type === 'info'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01" />
        </svg>
        <svg v-else-if="type === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <span class="block leading-snug">{{ message }}</span>
      </div>
      <button @click="close" class="ml-2 text-white/80 hover:text-white focus:outline-none transition-colors" aria-label="Close notification">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 20 20">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l8 8M6 14L14 6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  show: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000
})

const emit = defineEmits<{
  close: []
}>()

const show = ref(props.show)

const close = () => {
  show.value = false
  emit('close')
}

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-item {
  display: flex;
  align-items: center;
  min-width: 260px;
  max-width: 360px;
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px 0 rgba(80, 0, 120, 0.22), 0 1.5px 8px 0 rgba(0,0,0,0.13);
  font-weight: 600;
  font-size: 1rem;
  color: #fff;
  background: #222;
  opacity: 0.97;
  transition: box-shadow 0.2s;
  transform: translateX(100%);
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .toast-item {
    min-width: 280px;
    max-width: calc(100vw - 2rem);
    margin-bottom: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    border-radius: 0.75rem;
  }
  
  .toast-item .icon {
    width: 2rem;
    height: 2rem;
    margin-right: 0.75rem;
  }
  
  .toast-item .icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.toast-item.animate-in {
  animation: slideIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.toast-item.success {
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.toast-item.error {
  background: linear-gradient(90deg, #ef4444 0%, #b91c1c 100%);
}

.toast-item.info {
  background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
}

.toast-item.warning {
  background: linear-gradient(90deg, #facc15 0%, #eab308 100%);
  color: #7c5700;
}

.toast-item .icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255,255,255,0.13);
  border-radius: 9999px;
  margin-right: 0.5rem;
}

@keyframes slideIn {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  60% {
    transform: translateX(-10px);
    opacity: 1;
  }
  80% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Stacking container (in App.vue) */
:global(.toast-stack-container) {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

/* Mobile responsive for container */
@media (max-width: 768px) {
  :global(.toast-stack-container) {
    top: 5rem; /* Below navbar on mobile */
    right: 0.75rem;
    left: 0.75rem;
    align-items: center; /* Center the toast items */
    width: auto; /* Let it size naturally */
  }
  
  :global(.toast-stack-container) .toast-item {
    min-width: auto;
    max-width: none;
    width: 100%; /* Full width of container */
  }
}

.toast-item {
  pointer-events: auto;
}
</style> 