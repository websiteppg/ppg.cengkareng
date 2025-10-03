'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  MessageSquare,
  MapPin,
  PieChart,
  Cloud,
  Briefcase,
  FolderOpen,
  Presentation
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AdminNavigationProps {
  user: {
    role: string
    nama: string
    email: string
  }
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Peserta', href: '/admin/peserta', icon: Users },
  { name: 'Sesi Musyawarah', href: '/admin/sesi', icon: Calendar },
  { name: 'Notulensi', href: '/admin/notulensi', icon: FileText },
  { name: 'Program Kerja PPG', href: '/admin/program-kerja', icon: Briefcase, allowedRoles: ['super_admin', 'admin', 'bidang_ppg'] },
  { name: 'Program Kerja Per Bidang', href: '/admin/program-kerja/bidang', icon: FolderOpen, allowedRoles: ['super_admin', 'admin', 'bidang_ppg'] },
  { name: 'Presentasi Program Kerja', href: '/admin/presentasi-program-kerja', icon: Presentation, allowedRoles: ['super_admin', 'admin', 'bidang_ppg', 'viewer'] },
  { name: 'Laporan', href: '/admin/laporan', icon: BarChart3 },
  { name: 'MediaFire Manager', href: '/admin/mediafire', icon: Cloud, superAdminOnly: true },
  { name: 'Dashboard KBM', href: '/admin/dashboard-kbm', icon: PieChart },
  { name: 'Laporan KBM Desa', href: '/admin/kbm-desa', icon: MapPin },
]

export default function AdminNavigation({ user }: AdminNavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem('admin_user')
        toast.success('Logout berhasil')
        // Force page reload to clear all state
        window.location.href = '/'
      } else {
        toast.error('Gagal logout')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const getRoleText = (role: string) => {
    const roles = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'bidang_ppg': 'Bidang PPG',
      'sekretaris_ppg': 'Sekretaris PPG',
      'admin_kmm': 'Admin KMM',
      'viewer': 'Viewer',
      'kbm_desa_kalideres': 'KBM Desa Kalideres',
      'kbm_desa_bandara': 'KBM Desa Bandara',
      'kbm_desa_kebon_jahe': 'KBM Desa Kebon Jahe',
      'kbm_desa_cengkareng': 'KBM Desa Cengkareng',
      'kbm_desa_kapuk_melati': 'KBM Desa Kapuk Melati',
      'kbm_desa_taman_kota': 'KBM Desa Taman Kota',
      'kbm_desa_jelambar': 'KBM Desa Jelambar',
      'kbm_desa_cipondoh': 'KBM Desa Cipondoh'
    }
    return roles[role as keyof typeof roles] || role
  }

  const getFilteredNavigation = (userRole: string) => {
    if (userRole === 'viewer') {
      return navigation.filter(item => 
        ['Presentasi Program Kerja'].includes(item.name)
      )
    }
    if (userRole === 'admin_kmm') {
      return navigation.filter(item => 
        ['Sesi Musyawarah', 'Notulensi'].includes(item.name)
      )
    }
    if (userRole === 'bidang_ppg') {
      return navigation.filter(item => 
        ['Program Kerja PPG', 'Program Kerja Per Bidang', 'Presentasi Program Kerja'].includes(item.name)
      )
    }
    if (userRole.startsWith('kbm_desa_')) {
      return navigation.filter(item => 
        ['Dashboard KBM', 'Laporan KBM Desa'].includes(item.name)
      )
    }
    // Filter items based on role restrictions
    return navigation.filter(item => {
      if (item.superAdminOnly) {
        return userRole === 'super_admin'
      }
      if (item.allowedRoles) {
        return item.allowedRoles.includes(userRole)
      }
      return true
    })
  }

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/logo-small.png" alt="PPG Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">PPG Admin</h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.nama}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {getRoleText(user.role)}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {getFilteredNavigation(user.role).map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Top header for all screens */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            PPG Jakarta Barat Cengkareng
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>
    </>
  )
}