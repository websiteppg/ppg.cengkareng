'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUserFromStorage, isSessionValid } from '@/lib/auth'
import { sessionManager } from '@/lib/session-manager'

interface SessionProviderProps {
  children: React.ReactNode
}

export default function SessionProvider({ children }: SessionProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Initialize session manager
    sessionManager.init()

    const checkAuthentication = () => {
      // Skip auth check for login page
      if (pathname === '/admin/login') {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      const user = getUserFromStorage()
      const sessionValid = isSessionValid()

      if (user && sessionValid) {
        setIsAuthenticated(true)
        sessionManager.refreshSession()
      } else {
        setIsAuthenticated(false)
        // Clear any invalid session data
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_session_timestamp')
        router.push('/admin/login')
      }
      setIsLoading(false)
    }

    // Add delay to handle browser navigation and page refresh
    const timer = setTimeout(checkAuthentication, 200)

    // Listen for storage changes (logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_user' && !e.newValue) {
        setIsAuthenticated(false)
        router.push('/admin/login')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}