'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const ToastComponent = ({ toast, onRemove }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 1000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'error': return <XCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'info': return <Info className="w-5 h-5" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-500 text-white'
      case 'error': return 'bg-red-500 text-white'
      case 'warning': return 'bg-yellow-500 text-white'
      case 'info': return 'bg-blue-500 text-white'
    }
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-80 max-w-96
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getStyles()}
      `}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="hover:bg-black/10 rounded p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}