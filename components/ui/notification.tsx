"use client"

import { useState, useEffect } from "react"
import { CheckCircle, X, Info } from "lucide-react"
import { createContext, useContext } from "react"

export type NotificationType = 'success' | 'error' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description?: string
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (type: NotificationType, title: string, description?: string, duration?: number) => void
  hideNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = (type: NotificationType, title: string, description?: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      type,
      title,
      description,
      duration
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hideNotification(id)
      }, duration)
    }
  }

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

function NotificationContainer() {
  const { notifications, hideNotification } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
              {notification.type === 'error' && <X className="h-5 w-5 text-red-400" />}
              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-400" />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.title}</p>
              {notification.description && (
                <p className="text-sm mt-1 opacity-90">{notification.description}</p>
              )}
            </div>
            <button
              onClick={() => hideNotification(notification.id)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 