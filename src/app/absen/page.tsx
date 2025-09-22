'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Clock, MapPin, Users, CheckCircle, XCircle } from 'lucide-react'

interface Session {
  id: string
  nama_sesi: string
  tanggal: string
  waktu_mulai: string
  waktu_selesai: string
  lokasi: string
  status_absensi?: 'hadir' | 'ghoib' | 'izin' | 'sakit' | null
}

interface Peserta {
  id: string
  nama: string
  username: string
  bidang: string
}

export default function PublicAttendancePage() {
  const [username, setUsername] = useState('')
  const [peserta, setPeserta] = useState<Peserta | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [attendanceForm, setAttendanceForm] = useState({
    status: '',
    catatan: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const searchPeserta = async () => {
    if (!username.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/absensi/peserta?username=${username}`)
      if (response.ok) {
        const data = await response.json()
        setPeserta(data.peserta)
        setSessions(data.sessions)
      } else {
        setPeserta(null)
        setSessions([])
        alert('Username tidak ditemukan')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleAttendance = async () => {
    if (!attendanceForm.status || !selectedSession || !peserta) return
    
    setSubmitting(true)
    try {
      const response = await fetch('/api/absensi/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sesi_id: selectedSession.id,
          peserta_id: peserta.id,
          status_kehadiran: attendanceForm.status,
          catatan: attendanceForm.catatan
        })
      })

      if (response.ok) {
        alert('Absensi berhasil dicatat!')
        setSelectedSession(null)
        setAttendanceForm({ status: '', catatan: '' })
        // Refresh sessions
        searchPeserta()
      } else {
        const error = await response.json()
        alert(error.message || 'Gagal mencatat absensi')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) return <span className="text-gray-500 text-sm">Belum Absen</span>
    
    const badges = {
      hadir: <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Hadir</span>,
      ghoib: <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Ghoib</span>,
      izin: <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Izin</span>,
      sakit: <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Sakit</span>
    }
    
    return badges[status as keyof typeof badges] || <span className="text-gray-500 text-sm">Belum Absen</span>
  }

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2" />
                Catat Kehadiran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{selectedSession.nama_sesi}</h3>
                  <p className="text-gray-600">{peserta?.nama}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(selectedSession.tanggal).toLocaleDateString('id-ID')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {selectedSession.waktu_mulai} - {selectedSession.waktu_selesai} WIB
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedSession.lokasi}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Status Kehadiran *</label>
                  <div className="space-y-2">
                    {[
                      { value: 'hadir', label: 'Hadir', color: 'border-green-200 bg-green-50' },
                      { value: 'ghoib', label: 'Ghoib', color: 'border-red-200 bg-red-50' },
                      { value: 'izin', label: 'Izin', color: 'border-blue-200 bg-blue-50' },
                      { value: 'sakit', label: 'Sakit', color: 'border-yellow-200 bg-yellow-50' }
                    ].map((option) => (
                      <label key={option.value} className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        attendanceForm.status === option.value 
                          ? `${option.color} border-opacity-100` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={attendanceForm.status === option.value}
                          onChange={(e) => setAttendanceForm(prev => ({ ...prev, status: e.target.value }))}
                          className="mr-3"
                        />
                        <span className="font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Catatan (Opsional)</label>
                  <textarea
                    value={attendanceForm.catatan}
                    onChange={(e) => setAttendanceForm(prev => ({ ...prev, catatan: e.target.value }))}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSession(null)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleAttendance}
                    disabled={!attendanceForm.status || submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'Menyimpan...' : 'Catat Kehadiran'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2" />
              ABSENSI MUSYAWARAH
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <div className="flex space-x-2">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    onKeyPress={(e) => e.key === 'Enter' && searchPeserta()}
                  />
                  <Button 
                    onClick={searchPeserta}
                    disabled={loading || !username.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Mencari data...</p>
                </div>
              )}

              {peserta && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="font-medium text-green-800">{peserta.nama}</p>
                      <p className="text-sm text-green-600">{peserta.bidang}</p>
                    </div>
                  </div>
                </div>
              )}

              {sessions.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Sesi Wajib Dihadiri:</h3>
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <Card key={session.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm">{session.nama_sesi}</h4>
                            {getStatusBadge(session.status_absensi)}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(session.tanggal).toLocaleDateString('id-ID')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {session.waktu_mulai} - {session.waktu_selesai} WIB
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {session.lokasi}
                            </div>
                          </div>
                          {!session.status_absensi && (
                            <Button
                              size="sm"
                              onClick={() => setSelectedSession(session)}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Klik untuk Absen
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {peserta && sessions.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-yellow-800 font-medium">Tidak ada sesi yang wajib dihadiri</p>
                  <p className="text-yellow-600 text-sm">Anda tidak memiliki kewajiban absensi saat ini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}