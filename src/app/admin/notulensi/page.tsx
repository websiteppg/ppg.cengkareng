'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, FileText, Clock, CheckCircle, XCircle, Eye, Edit, Users } from 'lucide-react'
import Link from 'next/link'

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID')
const getStatusColor = (status: string) => {
  const colors = {
    'draft': 'bg-gray-100 text-gray-800',
    'pending_approval': 'bg-orange-100 text-orange-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  }
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}
const getStatusText = (status: string) => {
  const texts = {
    'draft': 'Draft',
    'pending_approval': 'Pending',
    'approved': 'Disetujui',
    'rejected': 'Ditolak'
  }
  return texts[status as keyof typeof texts] || status
}

interface MeetingNote {
  id: string
  judul: string
  sesi: {
    nama_sesi: string
    tanggal: string
    waktu_mulai: string
  }
  status: string
  dibuat_oleh: {
    nama: string
  }
  disetujui_oleh?: {
    nama: string
  }
  created_at: string
  updated_at: string
  version: number
}

export default function NotulensiManagement() {
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMeetingNotes()
  }, [])

  const fetchMeetingNotes = async () => {
    try {
      const response = await fetch('/api/notulensi')
      if (response.ok) {
        const data = await response.json()
        setMeetingNotes(data)
      }
    } catch (error) {
      console.error('Error fetching meeting notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNotes = meetingNotes.filter(note => {
    const matchesSearch = note.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.sesi.nama_sesi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.dibuat_oleh.nama.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStats = () => {
    const total = meetingNotes.length
    const draft = meetingNotes.filter(n => n.status === 'draft').length
    const pending = meetingNotes.filter(n => n.status === 'pending_approval').length
    const approved = meetingNotes.filter(n => n.status === 'approved').length
    const rejected = meetingNotes.filter(n => n.status === 'rejected').length

    return { total, draft, pending, approved, rejected }
  }

  const stats = getStats()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending_approval': return <Clock className="w-4 h-4 text-orange-600" />
      case 'draft': return <FileText className="w-4 h-4 text-gray-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data notulensi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Notulensi</h1>
          <p className="text-gray-600 mt-2">
            Kelola Notulenasi Musyawarah dan Proses Approval
          </p>
        </div>
        <Link href="/admin/notulensi/buat">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Notulensi
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Notulensi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-gray-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                <p className="text-sm text-gray-600">Draft</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-sm text-gray-600">Disetujui</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-sm text-gray-600">Ditolak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari judul, sesi, atau pembuat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Notes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{note.judul}</CardTitle>
                  <CardDescription className="mt-2">
                    {note.sesi.nama_sesi}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(note.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(note.status)}`}>
                    {getStatusText(note.status)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Dibuat oleh: {note.dibuat_oleh.nama}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDate(note.sesi.tanggal)} • {note.sesi.waktu_mulai} WIB
                </div>
                {note.disetujui_oleh && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Disetujui oleh: {note.disetujui_oleh.nama}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Versi {note.version} • Terakhir diupdate: {formatDate(note.updated_at)}
                </div>
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t">
                <Link href={`/admin/notulensi/${note.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat
                  </Button>
                </Link>
                <Link href={`/admin/notulensi/${note.id}/edit`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Tidak ada notulensi yang sesuai' : 'Belum ada notulensi'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai dengan membuat notulensi untuk sesi musyawarah'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/admin/notulensi/buat">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Notulensi Pertama
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}