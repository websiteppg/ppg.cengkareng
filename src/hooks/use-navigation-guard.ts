'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromStorage, isSessionValid } from '@/lib/auth'

export function useNavigationGuard() {
  const router = useRouter()
  const isNavigatingRef = useRef(false)

  useEffect(() => {
    const handleBeforeUnload = () => {
      isNavigatingRef.current = true
    }

    const handlePopState = () => {
      // Delay check to allow localStorage to be available
      setTimeout(() => {
        const user = getUserFromStorage()
        const sessionValid = isSessionValid()
        
        if (!user || !sessionValid) {
          router.push('/admin/login')
        }
        isNavigatingRef.current = false
      }, 200)
    }

    // Listen for browser navigation events
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [router])

  return { isNavigating: isNavigatingRef.current }
}