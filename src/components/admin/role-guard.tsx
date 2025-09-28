'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromStorage, isSessionValid } from '@/lib/auth'
import { useNavigationGuard } from '@/hooks/use-navigation-guard'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
  fallback?: React.ReactNode
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/admin',
  fallback 
}: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const { isNavigating } = useNavigationGuard()

  useEffect(() => {
    // Add delay to prevent immediate redirect on browser navigation
    const checkAuth = () => {
      try {
        const user = getUserFromStorage()
        const sessionValid = isSessionValid()
        
        if (!user || !sessionValid) {
          // If we're navigating, give more time for localStorage to be available
          const delay = isNavigating ? 300 : 150
          
          setTimeout(() => {
            const userRecheck = getUserFromStorage()
            const sessionRecheckValid = isSessionValid()
            
            if (!userRecheck || !sessionRecheckValid) {
              // Only redirect if we're not in the middle of navigation
              if (!isNavigating) {
                router.push('/admin/login')
              }
            } else {
              const hasAccess = allowedRoles.includes(userRecheck.role)
              if (!hasAccess) {
                if (fallback) {
                  setIsAuthorized(false)
                } else {
                  router.push(redirectTo)
                }
              } else {
                setIsAuthorized(true)
              }
            }
            setIsChecking(false)
          }, delay)
          return
        }

        const hasAccess = allowedRoles.includes(user.role)
        
        if (!hasAccess) {
          if (fallback) {
            setIsAuthorized(false)
          } else {
            router.push(redirectTo)
          }
        } else {
          setIsAuthorized(true)
        }
        setIsChecking(false)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsChecking(false)
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [allowedRoles, redirectTo, router, fallback])

  if (isChecking || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (isAuthorized === false) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}