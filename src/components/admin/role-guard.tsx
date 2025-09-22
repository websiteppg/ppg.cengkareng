'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromStorage } from '@/lib/auth'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export default function RoleGuard({ children, allowedRoles, redirectTo = '/admin' }: RoleGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getUserFromStorage()
    
    if (!user) {
      router.push('/admin/login')
      return
    }

    if (!allowedRoles.includes(user.role)) {
      router.push(redirectTo)
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [router, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}