'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle, Heart } from 'lucide-react'
import Link from 'next/link'

interface Session {
  id: string
  nama_sesi: string
  tanggal: string
  waktu_mulai: string
  waktu_selesai: string
  lokasi: string
}

interface Peserta {
  id: string
  nama: string
  email: string
  jabatan: string
}

interface AbsensiData {
  peserta: Peserta
  status_kehadiran: 'hadir' | 'ghoib' | 'izin' | 'sakit' | null
  waktu_absen: string | null
  catatan: string | null
}

export default function SessionAttendancePage() {
  const params = useParams()
  const [session, setSession] = useState<Session | null>(null)
  const [attendanceData, setAttendanceData] = useState<AbsensiData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessionAndAttendance()
  }, [params.id])

  const fetchSessionAndAttendance = async () => {
    try {
      // Get session data
      const sessionResponse = await fetch(`/api/sesi/${params.id}`)
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setSession(sessionData)
      }

      // Get attendance data
      const attendanceResponse = await fetch(`/api/absensi/sesi/${params.id}`)
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setAttendanceData(attendanceData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'hadir':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'ghoib':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'izin':
        return <AlertCircle className="w-5 h-5 text-blue-600" />
      case 'sakit':
        return <Heart className="w-5 h-5 text-orange-600" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string | null) => {
    const badges = {
      hadir: <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Hadir</span>,
      ghoib: <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Ghoib</span>,
      izin: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Izin</span>,
      sakit: <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">Sakit</span>
    }
    return badges[status as keyof typeof badges] || <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Belum Absen</span>
  }

  const getStats = () => {
    const hadir = attendanceData.filter(a => a.status_kehadiran === 'hadir').length
    const ghoib = attendanceData.filter(a => a.status_kehadiran === 'ghoib' || !a.status_kehadiran).length
    const izin = attendanceData.filter(a => a.status_kehadiran === 'izin').length
    const sakit = attendanceData.filter(a => a.status_kehadiran === 'sakit').length
    const total = attendanceData.length

    return { hadir, ghoib, izin, sakit, total }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kehadiran...</p>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/sesi" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Daftar Sesi
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Data Kehadiran</h1>
        {session && (
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{session.nama_sesi}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(session.tanggal).toLocaleDateString('id-ID')}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {session.waktu_mulai} - {session.waktu_selesai} WIB
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {session.lokasi}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Peserta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
            <div className="text-sm text-gray-600">Hadir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.ghoib}</div>
            <div className="text-sm text-gray-600">Ghoib</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.izin}</div>
            <div className="text-sm text-gray-600">Izin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.sakit}</div>
            <div className="text-sm text-gray-600">Sakit</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kehadiran Peserta</CardTitle>
          <CardDescription>
            Status kehadiran semua peserta yang diundang ke sesi ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attendanceData.map((data, index) => (
              <div key={data.peserta.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                    {index + 1}
                  </div>
                  {getStatusIcon(data.status_kehadiran)}
                  <div>
                    <p className="font-medium text-gray-900">{data.peserta.nama}</p>
                    <p className="text-sm text-gray-600">{data.peserta.email}</p>
                    {data.peserta.jabatan && (
                      <p className="text-xs text-gray-500">{data.peserta.jabatan}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(data.status_kehadiran)}
                  {data.waktu_absen && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(data.waktu_absen).toLocaleString('id-ID')}
                    </p>
                  )}
                  {data.catatan && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{data.catatan}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {attendanceData.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada data kehadiran</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}