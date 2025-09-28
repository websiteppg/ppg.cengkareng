export function checkRoleAccess(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

export function canAccessSesi(userRole: string): boolean {
  return ['admin', 'super_admin', 'sekretaris_ppg', 'admin_kmm'].includes(userRole)
}

export function canAccessNotulensi(userRole: string): boolean {
  return ['admin', 'super_admin', 'sekretaris_ppg', 'admin_kmm'].includes(userRole)
}

export function canAccessPeserta(userRole: string): boolean {
  return ['admin', 'super_admin', 'sekretaris_ppg'].includes(userRole)
}



export function canAccessLaporan(userRole: string): boolean {
  return ['admin', 'super_admin', 'sekretaris_ppg'].includes(userRole)
}

export function canEditOwnContent(userRole: string, createdBy: string, currentUserId: string): boolean {
  // Super admin can edit anything
  if (userRole === 'super_admin') return true
  
  // Admin can edit anything
  if (userRole === 'admin') return true
  
  // Admin KMM and Sekretaris PPG can only edit their own content
  if (['admin_kmm', 'sekretaris_ppg'].includes(userRole)) {
    return createdBy === currentUserId
  }
  
  return false
}

export function canAccessMediafireManager(userRole: string): boolean {
  return userRole === 'super_admin'
}

export function getUserFromStorage(): any {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('admin_user')
      if (!userData) return null
      
      const user = JSON.parse(userData)
      // Validate user object has required fields
      if (user && user.id && user.role) {
        return user
      }
      return null
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error)
      // Clear corrupted data
      localStorage.removeItem('admin_user')
      return null
    }
  }
  return null
}

export function setUserToStorage(user: any): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('admin_user', JSON.stringify(user))
      // Also set a timestamp for session validation
      localStorage.setItem('admin_session_timestamp', Date.now().toString())
    } catch (error) {
      console.error('Error saving user data to localStorage:', error)
    }
  }
}

export function clearUserFromStorage(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_session_timestamp')
  }
}

export function isSessionValid(): boolean {
  if (typeof window !== 'undefined') {
    const user = getUserFromStorage()
    const timestamp = localStorage.getItem('admin_session_timestamp')
    
    if (!user || !timestamp) return false
    
    // Session valid for 24 hours
    const sessionAge = Date.now() - parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    
    return sessionAge < maxAge
  }
  return false
}