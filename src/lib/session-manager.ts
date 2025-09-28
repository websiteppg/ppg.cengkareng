'use client'

import { getUserFromStorage, setUserToStorage, clearUserFromStorage, isSessionValid } from './auth'

class SessionManager {
  private static instance: SessionManager
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    this.isInitialized = true
    this.startSessionCheck()
    this.setupStorageListener()
  }

  private startSessionCheck() {
    // Check session every 5 minutes
    this.sessionCheckInterval = setInterval(() => {
      if (!isSessionValid()) {
        this.handleSessionExpired()
      }
    }, 5 * 60 * 1000)
  }

  private setupStorageListener() {
    // Listen for storage changes across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'admin_user' && !e.newValue) {
        // User logged out in another tab
        this.handleSessionExpired()
      }
    })

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Page became visible, check session
        if (!isSessionValid()) {
          this.handleSessionExpired()
        }
      }
    })
  }

  private handleSessionExpired() {
    clearUserFromStorage()
    window.location.href = '/admin/login'
  }

  refreshSession() {
    const user = getUserFromStorage()
    if (user) {
      setUserToStorage(user) // This will update the timestamp
    }
  }

  destroy() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
    this.isInitialized = false
  }
}

export const sessionManager = SessionManager.getInstance()

// Auto-initialize when imported in browser
if (typeof window !== 'undefined') {
  sessionManager.init()
}