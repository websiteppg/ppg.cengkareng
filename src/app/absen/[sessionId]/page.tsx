'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users, Search, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'

interface Session {
  id: string
  nama_sesi: string
  deskripsi: string
  tanggal: string
  waktu_mulai: string
  waktu_selesai: string
  lokasi: string
  status: string
  maksimal_peserta: number
}

interface Participant {
  id: string
  nama: string
  email: string
  jabatan: string
  instansi: string
}

export default function AttendancePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([])
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState<'hadir' | 'terlambat' | 'izin' | 'sakit'>('hadir')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showParticipantList, setShowParticipantList] = useState(false)

  useEffect(() => {
    fetchSessionData()
    fetchParticipants()
  }, [sessionId])

  useEffect(() => {
    const filtered = participants.filter(p => 
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.instansi.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredParticipants(filtered)
  }, [searchTerm, participants])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/sesi/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
      } else {
        toast.error('Sesi tidak ditemukan')
        router.push('/')
      }
    } catch (error) {
      toast.error('Gagal memuat data sesi')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/peserta')
      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
        setFilteredParticipants(data)
      }
    } catch (error) {
      toast.error('Gagal memuat data peserta')
    }
  }

  const handleSubmitAttendance = async () => {
    if (!selectedParticipant) {
      toast.error('Pilih peserta terlebih dahulu')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/absensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peserta_id: selectedParticipant.id,
          sesi_id: sessionId,
          status_kehadiran: status,
          catatan: notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Absensi berhasil dicatat!')
        router.push(`/absen/${sessionId}/success?participant=${encodeURIComponent(selectedParticipant.nama)}`)
      } else {
        toast.error(data.error || 'Gagal mencatat absensi')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectParticipant = (participant: Participant) => {
    setSelectedParticipant(participant)
    setShowParticipantList(false)
    setSearchTerm('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data sesi...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Sesi tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Session Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{session.nama_sesi}</CardTitle>
                <CardDescription className="mt-2">
                  {session.deskripsi}
                </CardDescription>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                {session.status === 'active' ? 'Berlangsung' :
                 session.status === 'scheduled' ? 'Terjadwal' : 'Selesai'}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Tanggal</p>
                  <p className="text-sm text-gray-600">{formatDate(session.tanggal)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Waktu</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(session.waktu_mulai)} - {formatTime(session.waktu_selesai)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Lokasi</p>
                  <p className="text-sm text-gray-600">{session.lokasi || 'Tidak ditentukan'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Form Absensi
            </CardTitle>
            <CardDescription>
              Pilih nama Anda dan catat kehadiran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Participant Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Pilih Peserta
              </label>
              <div className="relative">
                <div
                  className="w-full p-3 border border-gray-300 rounded-md cursor-pointer bg-white flex items-center justify-between"
                  onClick={() => setShowParticipantList(!showParticipantList)}
                >
                  <span className={selectedParticipant ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedParticipant ? selectedParticipant.nama : 'Pilih nama Anda...'}
                  </span>
                  <Search className="w-4 h-4 text-gray-400" />
                </div>

                {showParticipantList && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Cari nama, email, atau instansi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredParticipants.map((participant) => (
                        <div
                          key={participant.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectParticipant(participant)}
                        >
                          <p className="font-medium text-gray-900">{participant.nama}</p>
                          <p className="text-sm text-gray-600">{participant.jabatan}</p>
                          <p className="text-xs text-gray-500">{participant.instansi}</p>
                        </div>
                      ))}
                      {filteredParticipants.length === 0 && (
                        <div className="p-3 text-center text-gray-500">
                          Tidak ada peserta ditemukan
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status Kehadiran
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'hadir', label: 'Hadir', color: 'bg-green-100 text-green-800 border-green-200' },
                  { value: 'terlambat', label: 'Terlambat', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { value: 'izin', label: 'Izin', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { value: 'sakit', label: 'Sakit', color: 'bg-red-100 text-red-800 border-red-200' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatus(option.value as any)}
                    className={`p-3 rounded-md border-2 text-sm font-medium transition-colors ${
                      status === option.value
                        ? option.color
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Catatan (Opsional)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={3}
                placeholder="Tambahkan catatan jika diperlukan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitAttendance}
              disabled={!selectedParticipant || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Menyimpan...' : 'Catat Kehadiran'}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Pastikan data yang Anda masukkan sudah benar.</p>
          <p>Hubungi panitia jika mengalami kesulitan.</p>
        </div>
      </div>
    </div>
  )
}