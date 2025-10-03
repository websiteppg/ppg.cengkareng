'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Head from 'next/head'
import AdminNavigation from '@/components/admin/admin-navigation'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'

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
    // Prevent browser caching of admin pages
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.href)
      window.addEventListener('popstate', () => {
        window.location.href = '/'
      })
    }
    
    // Check localStorage for user data
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      const user = JSON.parse(userData)
      setUser(user)
      
      // Role-based redirect middleware
      if (user.role === 'bidang_ppg' && pathname === '/admin') {
        window.location.href = '/admin/program-kerja/bidang'
        return
      }
      if (user.role === 'admin_kmm' && pathname === '/admin') {
        window.location.href = '/admin/sesi'
        return
      }
      if (user.role.startsWith('kbm_desa_') && pathname === '/admin') {
        window.location.href = '/admin/kbm-desa'
        return
      }
    } else if (pathname !== '/admin/login') {
      // Redirect to home if no user data and not on login page
      window.location.href = '/'
      return
    }
    setLoading(false)
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', () => {})
      }
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