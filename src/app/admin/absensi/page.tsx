'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Calendar, Users, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import RoleGuard from '@/components/admin/role-guard'
// import { formatDate, formatTime, getStatusColor, getStatusText } from '@/lib/utils'

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID')
const formatTime = (time: string) => time
const getStatusColor = (status: string) => {
  const colors = {
    'hadir': 'bg-green-100 text-green-800',
    'ghoib': 'bg-red-100 text-red-800',
    'izin': 'bg-blue-100 text-blue-800',
    'sakit': 'bg-yellow-100 text-yellow-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}
const getStatusText = (status: string) => {
  const texts = {
    'hadir': 'Hadir',
    'ghoib': 'Ghoib',
    'izin': 'Izin',
    'sakit': 'Sakit'
  }
  return texts[status as keyof typeof texts] || status
}

interface AttendanceRecord {
  id: string
  peserta: {
    nama: string
    email: string
    instansi: string
  }
  sesi_musyawarah: {
    nama_sesi: string
    tanggal: string
    waktu_mulai: string
  }
  waktu_absen: string
  status_kehadiran: string
  catatan: string
  ip_address: string
}

export default function AbsensiManagement() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch('/api/absensi/all')
      if (response.ok) {
        const data = await response.json()
        console.log('Attendance data:', data)
        setAttendanceRecords(data)
      } else {
        console.error('Response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRecords = attendanceRecords.filter(record =>
    record.peserta.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.sesi_musyawarah.nama_sesi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.peserta.instansi.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'ghoib': return <XCircle className="w-4 h-4 text-red-600" />
      case 'izin': return <AlertCircle className="w-4 h-4 text-blue-600" />
      case 'sakit': return <Clock className="w-4 h-4 text-yellow-600" />
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStats = () => {
    const total = filteredRecords.length
    const hadir = filteredRecords.filter(r => r.status_kehadiran === 'hadir').length
    const ghoib = filteredRecords.filter(r => r.status_kehadiran === 'ghoib').length
    const izin = filteredRecords.filter(r => r.status_kehadiran === 'izin').length
    const sakit = filteredRecords.filter(r => r.status_kehadiran === 'sakit').length

    return { total, hadir, ghoib, izin, sakit }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data absensi...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin', 'sekretaris_ppg']}>
      <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Absensi</h1>
        <p className="text-gray-600 mt-2">
          Monitor Dan Kelola Data Kehadiran Peserta Musyawarah
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Absensi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.hadir}</p>
                <p className="text-sm text-gray-600">Hadir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.ghoib}</p>
                <p className="text-sm text-gray-600">Ghoib</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.izin}</p>
                <p className="text-sm text-gray-600">Izin</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.sakit}</p>
                <p className="text-sm text-gray-600">Sakit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari nama peserta, sesi, atau instansi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
          <CardDescription>
            {filteredRecords.length} dari {attendanceRecords.length} record absensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Peserta</th>
                  <th className="text-left py-3 px-4 font-medium">Sesi</th>
                  <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium">Waktu Absen</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Catatan</th>
                  <th className="text-left py-3 px-4 font-medium">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{record.peserta.nama}</div>
                        <div className="text-sm text-gray-600">{record.peserta.instansi}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{record.sesi_musyawarah.nama_sesi}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(record.sesi_musyawarah.tanggal)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(record.waktu_absen).toLocaleTimeString('id-ID')} WIB
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(record.status_kehadiran)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status_kehadiran)}`}>
                          {getStatusText(record.status_kehadiran)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                      {record.catatan || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {record.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Tidak ada record yang sesuai dengan pencarian' : 'Belum ada data absensi'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </RoleGuard>
  )
}