'use client'

import { useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastItem = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const toast = {
    success: (message: string, duration?: number) => 
      addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => 
      addToast({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) => 
      addToast({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) => 
      addToast({ type: 'info', message, duration })
  }

  return { toasts, removeToast, toast }
}