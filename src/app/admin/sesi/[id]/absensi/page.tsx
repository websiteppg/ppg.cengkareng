'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, FileText, Calendar, MapPin, Users, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Peserta {
  id: string
  nama: string
  email: string
  jabatan: string
  instansi: string
}

interface Session {
  id: string
  nama_sesi: string
  deskripsi: string
  tanggal: string
  waktu_mulai: string
  waktu_selesai: string
  lokasi: string
}

interface AbsensiData {
  peserta_id: string
  status_kehadiran: string
}

export default function ManualAbsensi() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [peserta, setPeserta] = useState<Peserta[]>([])
  const [absensiData, setAbsensiData] = useState<AbsensiData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (sessionId) {
      loadAllData()
    }
  }, [sessionId])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      // Load session and peserta data first
      await Promise.all([
        fetchSessionData(),
        fetchPesertaAndAbsensi()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/sesi/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const fetchPesertaAndAbsensi = async () => {
    try {
      // Fetch peserta data
      const pesertaResponse = await fetch(`/api/sesi/${sessionId}/peserta`)
      if (!pesertaResponse.ok) throw new Error('Failed to fetch peserta')
      const pesertaData = await pesertaResponse.json()
      setPeserta(pesertaData)

      // Fetch existing absensi data
      const absensiResponse = await fetch(`/api/sesi/${sessionId}/absensi-manual`)
      const existingAbsensi = absensiResponse.ok ? await absensiResponse.json() : []
      
      // Create absensi map for quick lookup
      const absensiMap = new Map()
      existingAbsensi.forEach((item: any) => {
        absensiMap.set(item.peserta_id, item.status_kehadiran)
      })

      // Initialize absensi data with existing data or default 'ghoib'
      const initialAbsensi = pesertaData.map((p: Peserta) => ({
        peserta_id: p.id,
        status_kehadiran: absensiMap.get(p.id) || 'ghoib'
      }))
      
      setAbsensiData(initialAbsensi)
    } catch (error) {
      console.error('Error fetching peserta and absensi:', error)
    }
  }

  const handleStatusChange = (pesertaId: string, status: string) => {
    setAbsensiData(prev => 
      prev.map(item => 
        item.peserta_id === pesertaId 
          ? { ...item, status_kehadiran: status }
          : item
      )
    )
    setHasUnsavedChanges(true)
  }

  const handleSaveAbsensi = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/sesi/${sessionId}/absensi-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          absensiData: absensiData
        })
      })

      if (response.ok) {
        alert('Absensi berhasil disimpan!')
        setHasUnsavedChanges(false)
        // Refresh data to ensure consistency
        await fetchPesertaAndAbsensi()
      } else {
        const errorData = await response.json()
        alert(`Gagal menyimpan absensi: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving absensi:', error)
      alert('Terjadi kesalahan saat menyimpan absensi')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrintAbsensi = () => {
    window.open(`/api/sesi/${sessionId}/print-absensi`, '_blank')
  }

  const getStatusKehadiran = (pesertaId: string) => {
    const item = absensiData.find(a => a.peserta_id === pesertaId)
    return item?.status_kehadiran || 'ghoib'
  }

  const getStatusStats = () => {
    const stats = {
      hadir: absensiData.filter(a => a.status_kehadiran === 'hadir').length,
      izin: absensiData.filter(a => a.status_kehadiran === 'izin').length,
      sakit: absensiData.filter(a => a.status_kehadiran === 'sakit').length,
      ghoib: absensiData.filter(a => a.status_kehadiran === 'ghoib').length
    }
    return stats
  }

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

  const stats = getStatusStats()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/sesi">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Absensi Manual</h1>
            <p className="text-gray-600 mt-1">
              Input kehadiran peserta untuk sesi ini
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => fetchPesertaAndAbsensi()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={handlePrintAbsensi}
            variant="outline"
            disabled={hasUnsavedChanges}
            title={hasUnsavedChanges ? 'Simpan perubahan terlebih dahulu' : 'Print PDF'}
          >
            <FileText className="w-4 h-4 mr-2" />
            Print PDF
            {hasUnsavedChanges && <span className="ml-1 text-red-500">*</span>}
          </Button>
          <Button 
            onClick={handleSaveAbsensi}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Menyimpan...' : 'Simpan Absensi'}
          </Button>
        </div>
      </div>

      {/* Session Info */}
      {session && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{session.nama_sesi}</CardTitle>
            <CardDescription>{session.deskripsi}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(session.tanggal).toLocaleDateString('id-ID')} | {session.waktu_mulai} - {session.waktu_selesai}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {session.lokasi || 'Tidak ditentukan'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                {peserta.length} peserta terdaftar
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
            <p className="text-yellow-800 font-medium">
              Ada perubahan yang belum disimpan. Klik "Simpan Absensi" sebelum print PDF.
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
            <div className="text-sm text-gray-600">Hadir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.izin}</div>
            <div className="text-sm text-gray-600">Izin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.sakit}</div>
            <div className="text-sm text-gray-600">Sakit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.ghoib}</div>
            <div className="text-sm text-gray-600">Ghoib</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kehadiran Peserta</CardTitle>
          <CardDescription>
            Pilih status kehadiran untuk setiap peserta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {peserta.map((p, index) => (
              <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{p.nama}</div>
                      <div className="text-sm text-gray-600">{p.email}</div>
                      <div className="text-sm text-gray-500">{p.jabatan} - {p.instansi}</div>
                    </div>
                  </div>
                </div>
                <div className="w-48">
                  <Select
                    value={getStatusKehadiran(p.id)}
                    onValueChange={(value) => handleStatusChange(p.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hadir">✅ Hadir</SelectItem>
                      <SelectItem value="izin">📝 Izin</SelectItem>
                      <SelectItem value="sakit">🏥 Sakit</SelectItem>
                      <SelectItem value="ghoib">❌ Ghoib</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}