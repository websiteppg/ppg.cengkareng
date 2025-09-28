'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, FileText, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getUserFromStorage } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RecentSession {
  id: string
  nama_sesi: string
  tanggal: string
  waktu_mulai: string
  status: string
}



export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<{
    totalParticipants: number
    totalSessions: number
    activeSessions: number
    pendingNotes: number
    recentSessions: RecentSession[]

  }>({
    totalParticipants: 0,
    totalSessions: 0,
    activeSessions: 0,
    pendingNotes: 0,
    recentSessions: [],

  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getUserFromStorage()
    
    if (user) {
      // Redirect admin_kmm to sesi page
      if (user.role === 'admin_kmm') {
        window.location.href = '/admin/sesi'
        return
      }
      
      // Redirect bidang_ppg to program kerja page
      if (user.role === 'bidang_ppg') {
        window.location.href = '/admin/program-kerja-admin'
        return
      }
      
      // Redirect KBM Desa users to their KBM dashboard
      if (user.role && user.role.startsWith('kbm_desa_')) {
        window.location.href = '/admin/kbm-desa'
        return
      }
    }
    
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get total participants
      const { count: totalParticipants } = await supabase
        .from('peserta')
        .select('*', { count: 'exact', head: true })
        .eq('aktif', true)

      // Get total sessions
      const { count: totalSessions } = await supabase
        .from('sesi_musyawarah')
        .select('*', { count: 'exact', head: true })

      // Get active sessions
      const { count: activeSessions } = await supabase
        .from('sesi_musyawarah')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get pending notes
      const { count: pendingNotes } = await supabase
        .from('notulensi_sesi')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_approval')

      // Get recent sessions
      const { data: recentSessions } = await supabase
        .from('sesi_musyawarah')
        .select('id, nama_sesi, tanggal, waktu_mulai, status')
        .order('created_at', { ascending: false })
        .limit(5)



      setStats({
        totalParticipants: totalParticipants || 0,
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        pendingNotes: pendingNotes || 0,
        recentSessions: recentSessions || [],

      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'aktif': 'bg-green-100 text-green-800',
      'terjadwal': 'bg-blue-100 text-blue-800',
      'selesai': 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }



  // Check for redirect first
  const user = getUserFromStorage()
  if (user && user.role && user.role.startsWith('kbm_desa_')) {
    return null // Don't render anything
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">
          Selamat Datang di PPG Jakarta Barat Cengkareng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Peserta aktif terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesi musyawarah dibuat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesi Aktif</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesi sedang berlangsung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notulensi Pending</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingNotes}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu persetujuan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Tindakan yang sering dilakukan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/sesi/buat">
              <Button className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Buat Sesi Baru
              </Button>
            </Link>
            <Link href="/admin/peserta/tambah">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Tambah Peserta
              </Button>
            </Link>
            <Link href="/admin/notulensi">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Kelola Notulensi
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesi Terbaru</CardTitle>
            <CardDescription>
              {stats.recentSessions.length} sesi musyawarah terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSessions.length > 0 ? (
                stats.recentSessions.map((sesi) => (
                  <div key={sesi.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sesi.nama_sesi}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sesi.tanggal)} • {sesi.waktu_mulai}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sesi.status)}`}>
                      {sesi.status === 'aktif' ? 'Aktif' : sesi.status === 'terjadwal' ? 'Terjadwal' : 'Selesai'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada sesi musyawarah</p>
              )}
            </div>
          </CardContent>
        </Card>


      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status Sistem</CardTitle>
          <CardDescription>
            Informasi status sistem musyawarah PPG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-gray-500">Terhubung</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Real-time</p>
                <p className="text-xs text-gray-500">Aktif</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Notifikasi</p>
                <p className="text-xs text-gray-500">Berjalan</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}