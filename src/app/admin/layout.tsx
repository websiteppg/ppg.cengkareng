'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Head from 'next/head'
import AdminNavigation from '@/components/admin/admin-navigation'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import { sessionManager } from '@/lib/session-manager'
import { getUserFromStorage, isSessionValid } from '@/lib/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const { toasts, removeToast } = useToast()
  
  useEffect(() => {
    // Initialize session manager
    sessionManager.init()
    
    // Check user authentication with session validation
    const checkAuth = () => {
      const userData = getUserFromStorage()
      const sessionValid = isSessionValid()
      
      if (userData && sessionValid) {
        setUser(userData)
        // Refresh session timestamp on page load
        sessionManager.refreshSession()
      } else if (pathname !== '/admin/login') {
        // Clear invalid session and redirect
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_session_timestamp')
        window.location.href = '/admin/login'
        return
      }
      setLoading(false)
    }
    
    // Add small delay to handle browser navigation
    const timer = setTimeout(checkAuth, 100)
    
    return () => {
      clearTimeout(timer)
    }
  }, [pathname])
  
  // Show login page without navigation
  if (pathname === '/admin/login' || loading) {
    return children
  }
  
  // Show navigation if user is authenticated
  if (user) {
    return (
      <>
        <Head>
          <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
          <meta httpEquiv="Pragma" content="no-cache" />
          <meta httpEquiv="Expires" content="0" />
        </Head>
        <div className="min-h-screen bg-gray-50">
          <AdminNavigation user={user} />
          <main className="lg:pl-64 pt-16 lg:pt-0">
            <div className="p-0">
              {children}
            </div>
          </main>
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
      </>
    )
  }
  
  // Show children without navigation if not authenticated
  return children
}