import { ref } from 'vue'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }
    notifications.value.push(newNotification)
    
    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 3000)
    }
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  const success = (message: string, duration = 3000) => {
    addNotification({ message, type: 'success', duration })
  }

  const error = (message: string, duration = 5000) => {
    addNotification({ message, type: 'error', duration })
  }

  const info = (message: string, duration = 3000) => {
    addNotification({ message, type: 'info', duration })
  }

  const warning = (message: string, duration = 4000) => {
    addNotification({ message, type: 'warning', duration })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    info,
    warning
  }
} 