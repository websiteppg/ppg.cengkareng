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
import { exportToExcel, exportToPDF, exportNotulensiToPDF } from '@/lib/export'
import RoleGuard from '@/components/admin/role-guard'

import NotulensiSelectionModal from '@/components/admin/notulensi-selection-modal'

export default function LaporanManagement() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalSessions: 0,

    totalNotes: 0,

    approvalRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const [showNotulensiModal, setShowNotulensiModal] = useState(false)

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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        alert('Tidak ada data untuk diekspor')
        return
      }
      
      exportToExcel(data, `laporan-${type}-${new Date().toISOString().split('T')[0]}`, `Laporan ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      
    } catch (error) {
      console.error('Export Excel error:', error)
      alert(`Gagal export ke Excel: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`)
    }
  }

  const handleExportPDF = async (type: string) => {
    if (type === 'notulensi') {
      setShowNotulensiModal(true)
      return
    }

    try {
      const response = await fetch(`/api/laporan?type=${type}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        alert('Tidak ada data untuk diekspor')
        return
      }
      
      await exportToPDF(data, `laporan-${type}-${new Date().toISOString().split('T')[0]}`, `Laporan ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      
    } catch (error) {
      console.error('Export PDF error:', error)
      alert(`Gagal export ke PDF: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`)
    }
  }



  const handleExportSelectedNotulensi = async (selectedNotulensi: string) => {
    try {
      const response = await fetch('/api/laporan/notulensi-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notulensiId: selectedNotulensi })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data) {
        alert('Tidak ada data notulensi untuk diekspor')
        return
      }
      
      await exportNotulensiToPDF(data, `notulensi-${data.judul.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}`)
      
    } catch (error) {
      console.error('Export notulensi PDF error:', error)
      alert(`Gagal export PDF notulensi: ${error instanceof Error ? error.message : 'Terjadi kesalahan'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
          Dashboard Laporan Dan Analisis Data Musyawarah
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



      {/* Notulensi Selection Modal */}
      <NotulensiSelectionModal
        isOpen={showNotulensiModal}
        onClose={() => setShowNotulensiModal(false)}
        onExportPDF={handleExportSelectedNotulensi}
      />
      </div>
    </RoleGuard>
  )
}