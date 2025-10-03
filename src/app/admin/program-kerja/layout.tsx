'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface User {
  role: string
  nama: string
  email: string
}

export default function ProgramKerjaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Check role access
  const allowedRoles = ['super_admin', 'admin', 'bidang_ppg']
  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">Akses Ditolak</h2>
            <p className="text-gray-500 text-center mb-4">
              Anda tidak memiliki akses ke halaman Program Kerja PPG.
              <br />
              Fitur ini hanya tersedia untuk Super Admin, Admin, dan Bidang PPG.
            </p>
            <Link href="/admin">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}