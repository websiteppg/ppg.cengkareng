'use client'

import { useState, useCallback } from 'react'
import { Toast } from '@/components/ui/toast'

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])
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