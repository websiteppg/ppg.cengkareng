'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { getUserFromStorage, canEditOwnContent } from '@/lib/auth'
// import { formatDate, formatTime, getStatusColor, getStatusText } from '@/lib/utils'

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID')
const formatTime = (time: string) => time
const getStatusColor = (status: string) => {
  const colors = {
    'scheduled': 'bg-blue-100 text-blue-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-gray-100 text-gray-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}
const getStatusText = (status: string) => {
  const texts = {
    'scheduled': 'Terjadwal',
    'active': 'Aktif',
    'completed': 'Selesai'
  }
  return texts[status as keyof typeof texts] || status
}

interface Session {
  id: string
  nama_sesi: string
  deskripsi: string
  tanggal: string
  waktu_mulai: string
  waktu_selesai: string
  lokasi: string
  tipe: string
  status: string
  maksimal_peserta: number
  created_at: string
  created_by: string
}

export default function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = getUserFromStorage()
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sesi')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (sessionId: string, sessionName: string) => {
    if (!confirm(`Yakin ingin menghapus sesi "${sessionName}"?`)) return

    try {
      const response = await fetch(`/api/sesi/${sessionId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSessions(sessions.filter(s => s.id !== sessionId))
        alert('Sesi berhasil dihapus')
      } else {
        alert('Gagal menghapus sesi')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Terjadi kesalahan saat menghapus sesi')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data sesi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Sesi</h1>
          <p className="text-gray-600 mt-2">
            Kelola Sesi Musyawarah ({sessions.length} sesi)
          </p>
        </div>
        <Link href="/admin/sesi/buat">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Sesi Baru
          </Button>
        </Link>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{session.nama_sesi}</CardTitle>
                  <CardDescription className="mt-2">
                    {session.deskripsi}
                  </CardDescription>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                  {getStatusText(session.status)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(session.tanggal)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(session.waktu_mulai)} - {formatTime(session.waktu_selesai)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {session.lokasi || 'Tidak ditentukan'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Maksimal {session.maksimal_peserta} peserta
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                {currentUser && canEditOwnContent(currentUser.role, session.created_by, currentUser.id) ? (
                  <Link href={`/admin/sesi/${session.id}/edit`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Link href={`/admin/sesi/${session.id}/kehadiran`}>
                  <Button size="sm" className="w-full">
                    <Users className="w-4 h-4 mr-1" />
                    Kehadiran
                  </Button>
                </Link>
                {currentUser && canEditOwnContent(currentUser.role, session.created_by, currentUser.id) ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleDelete(session.id, session.nama_sesi)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    disabled
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada sesi</h3>
            <p className="text-gray-600 mb-4">
              Mulai dengan membuat sesi musyawarah pertama Anda
            </p>
            <Link href="/admin/sesi/buat">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Buat Sesi Baru
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}