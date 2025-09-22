'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle,
  TrendingUp,
  PieChart,
  Activity
} from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/lib/export'
import RoleGuard from '@/components/admin/role-guard'

export default function LaporanManagement() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalSessions: 0,
    totalAttendance: 0,
    totalNotes: 0,
    attendanceRate: 0,
    approvalRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const response = await fetch('/api/laporan?type=overview')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportExcel = async (type: string) => {
    try {
      const response = await fetch(`/api/laporan?type=${type}`)
      if (response.ok) {
        const data = await response.json()
        exportToExcel(data, `laporan-${type}-${new Date().toISOString().split('T')[0]}`, `Laporan ${type}`)
      }
    } catch (error) {
      console.error('Export Excel error:', error)
      alert('Gagal export ke Excel')
    }
  }

  const handleExportPDF = async (type: string) => {
    try {
      const response = await fetch(`/api/laporan?type=${type}`)
      if (response.ok) {
        const data = await response.json()
        await exportToPDF(data, `laporan-${type}-${new Date().toISOString().split('T')[0]}`, `Laporan ${type.toUpperCase()}`)
      }
    } catch (error) {
      console.error('Export PDF error:', error)
      alert('Gagal export ke PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin', 'sekretaris_ppg']}>
      <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Laporan & Analitik</h1>
        <p className="text-gray-600 mt-2">
          Dashboard laporan dan analisis data musyawarah PPG
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                <p className="text-sm text-gray-600">Total Peserta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                <p className="text-sm text-gray-600">Total Sesi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAttendance}</p>
                <p className="text-sm text-gray-600">Total Kehadiran</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-600 mr-4" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNotes}</p>
                <p className="text-sm text-gray-600">Total Notulensi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Tingkat Kehadiran
            </CardTitle>
            <CardDescription>
              Persentase kehadiran peserta dalam musyawarah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.attendanceRate}%</p>
                <p className="text-sm text-gray-600">Rata-rata kehadiran</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Tingkat Approval
            </CardTitle>
            <CardDescription>
              Persentase notulensi yang disetujui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.approvalRate}%</p>
                <p className="text-sm text-gray-600">Notulensi disetujui</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Laporan Kehadiran
            </CardTitle>
            <CardDescription>
              Analisis data kehadiran peserta per sesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Absensi:</span>
                <span className="font-medium">{stats.totalAttendance}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tingkat Kehadiran:</span>
                <span className="font-medium text-green-600">{stats.attendanceRate}%</span>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleExportExcel('kehadiran')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExportPDF('kehadiran')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participant Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Laporan Peserta
            </CardTitle>
            <CardDescription>
              Data lengkap peserta dan partisipasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Peserta:</span>
                <span className="font-medium">{stats.totalParticipants}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Peserta Aktif:</span>
                <span className="font-medium text-green-600">{stats.totalParticipants}</span>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleExportExcel('peserta')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExportPDF('peserta')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Laporan Sesi
            </CardTitle>
            <CardDescription>
              Ringkasan sesi musyawarah dan efektivitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Sesi:</span>
                <span className="font-medium">{stats.totalSessions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Sesi Selesai:</span>
                <span className="font-medium text-green-600">{stats.totalSessions}</span>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleExportExcel('sesi')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExportPDF('sesi')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Notes Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Laporan Notulensi
            </CardTitle>
            <CardDescription>
              Status dan kualitas notulensi musyawarah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total Notulensi:</span>
                <span className="font-medium">{stats.totalNotes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tingkat Approval:</span>
                <span className="font-medium text-green-600">{stats.approvalRate}%</span>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleExportExcel('notulensi')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExportPDF('notulensi')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Laporan Aktivitas
            </CardTitle>
            <CardDescription>
              Log aktivitas sistem dan user engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Login Hari Ini:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Aktivitas Terakhir:</span>
                <span className="font-medium text-blue-600">2 menit lalu</span>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleExportExcel('aktivitas')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExportPDF('aktivitas')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Laporan Kustom
            </CardTitle>
            <CardDescription>
              Buat laporan sesuai kebutuhan spesifik
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Pilih parameter dan rentang waktu untuk membuat laporan kustom
              </p>
              <Button className="w-full" variant="outline">
                <PieChart className="w-4 h-4 mr-2" />
                Buat Laporan Kustom
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </RoleGuard>
  )
}