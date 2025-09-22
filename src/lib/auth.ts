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

export function canAccessAbsensi(userRole: string): boolean {
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

export function getUserFromStorage(): any {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('admin_user')
    return userData ? JSON.parse(userData) : null
  }
  return null
}