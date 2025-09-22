'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, MapPin, Users, UserCheck } from 'lucide-react'
import Link from 'next/link'

interface Peserta {
  id: string
  nama: string
  username: string
  bidang: string
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
  maksimal_peserta: number
  sesi_peserta: Array<{
    peserta_id: string
    peserta: Peserta
  }>
}

export default function EditSession() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [participants, setParticipants] = useState<Peserta[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Peserta[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBidang, setFilterBidang] = useState('semua')
  const [availableBidang, setAvailableBidang] = useState<string[]>([])
  const [formData, setFormData] = useState({
    nama_sesi: '',
    deskripsi: '',
    tanggal: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi: '',
    tipe: 'offline',
    maksimal_peserta: 100
  })

  useEffect(() => {
    fetchSession()
    fetchParticipants()
  }, [params.id])

  useEffect(() => {
    filterParticipants()
  }, [participants, searchTerm, filterBidang])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sesi/${params.id}`)
      if (response.ok) {
        const session: Session = await response.json()
        setFormData({
          nama_sesi: session.nama_sesi,
          deskripsi: session.deskripsi || '',
          tanggal: session.tanggal,
          waktu_mulai: session.waktu_mulai,
          waktu_selesai: session.waktu_selesai,
          lokasi: session.lokasi || '',
          tipe: session.tipe,
          maksimal_peserta: session.maksimal_peserta
        })
        
        // Set selected participants
        const selectedIds = session.sesi_peserta?.map(sp => sp.peserta_id) || []
        setSelectedParticipants(selectedIds)
      }
    } catch (error) {
      console.error('Failed to fetch session:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/peserta')
      if (response.ok) {
        const data = await response.json()
        const pesertaOnly = data.filter((p: any) => p.role === 'peserta')
        setParticipants(pesertaOnly)
        setFilteredParticipants(pesertaOnly)
        
        // Extract unique bidang values
        const bidangList = pesertaOnly.map((p: any) => p.bidang)
        const uniqueBidang = Array.from(new Set(bidangList))
          .filter((bidang: any) => bidang && typeof bidang === 'string' && bidang.trim() !== '')
          .sort() as string[]
        setAvailableBidang(uniqueBidang)
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
    }
  }

  const filterParticipants = () => {
    let filtered = participants

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        (p.nama && p.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.username && p.username.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by bidang
    if (filterBidang !== 'semua') {
      filtered = filtered.filter(p => 
        p.bidang && p.bidang === filterBidang
      )
    }

    setFilteredParticipants(filtered)
  }

  const handleParticipantToggle = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    )
  }

  const selectAllParticipants = () => {
    setSelectedParticipants(participants.map(p => p.id))
  }

  const selectFilteredParticipants = () => {
    const newSelected = [...selectedParticipants]
    filteredParticipants.forEach(p => {
      if (!newSelected.includes(p.id)) {
        newSelected.push(p.id)
      }
    })
    setSelectedParticipants(newSelected)
  }

  const clearAllParticipants = () => {
    setSelectedParticipants([])
  }

  const selectByBidang = (bidang: string) => {
    const bidangParticipants = participants.filter(p => 
      p.bidang && p.bidang === bidang
    )
    const newSelected = [...selectedParticipants]
    bidangParticipants.forEach(p => {
      if (!newSelected.includes(p.id)) {
        newSelected.push(p.id)
      }
    })
    setSelectedParticipants(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (selectedParticipants.length === 0) {
      alert('Pilih minimal 1 peserta yang wajib hadir')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/sesi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          peserta_ids: selectedParticipants
        })
      })

      if (response.ok) {
        alert('Sesi berhasil diupdate!')
        router.push('/admin/sesi')
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal mengupdate sesi')
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data sesi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/sesi" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Daftar Sesi
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Sesi</h1>
        <p className="text-gray-600 mt-2">
          Edit detail sesi musyawarah PPG
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Sesi</CardTitle>
              <CardDescription>
                Edit detail sesi musyawarah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Sesi *
                  </label>
                  <Input
                    name="nama_sesi"
                    value={formData.nama_sesi}
                    onChange={handleChange}
                    placeholder="Contoh: Musyawarah PPG Daerah, Musy KBM Desa, dll"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    placeholder="Deskripsi singkat tentang sesi ini..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal *
                  </label>
                  <Input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Waktu Mulai *
                  </label>
                  <Input
                    type="time"
                    name="waktu_mulai"
                    value={formData.waktu_mulai}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Waktu Selesai *
                  </label>
                  <Input
                    type="time"
                    name="waktu_selesai"
                    value={formData.waktu_selesai}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Location & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Lokasi
                  </label>
                  <Input
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleChange}
                    placeholder="Contoh: Ruang GSG Daerah, GSG Desa, dll"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Sesi
                  </label>
                  <select
                    name="tipe"
                    value={formData.tipe}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Maksimal Peserta
                </label>
                <Input
                  type="number"
                  name="maksimal_peserta"
                  value={formData.maksimal_peserta}
                  onChange={handleChange}
                  min="1"
                  max="100"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Participant Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Peserta</CardTitle>
              <CardDescription>
                Edit peserta yang wajib hadir di sesi ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Participant Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Pilih Peserta Wajib Hadir * ({selectedParticipants.length} dipilih)
                  </label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllParticipants}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearAllParticipants}
                    >
                      Hapus Semua
                    </Button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Cari nama atau username peserta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <select
                      value={filterBidang}
                      onChange={(e) => setFilterBidang(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="semua">Semua Bidang</option>
                      {availableBidang.map((bidang) => (
                        <option key={bidang} value={bidang}>
                          {bidang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Select Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectFilteredParticipants}
                    disabled={filteredParticipants.length === 0}
                  >
                    Pilih Hasil Filter ({filteredParticipants.length})
                  </Button>
                  {availableBidang.slice(0, 4).map((bidang) => (
                    <Button
                      key={bidang}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectByBidang(bidang)}
                    >
                      Pilih {bidang}
                    </Button>
                  ))}
                  {availableBidang.length > 4 && (
                    <span className="text-xs text-gray-500 self-center">
                      +{availableBidang.length - 4} bidang lainnya
                    </span>
                  )}
                </div>
                
                <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {participants.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Memuat data peserta...</p>
                  ) : filteredParticipants.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Tidak ada peserta yang sesuai filter</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {filteredParticipants.map((participant) => (
                        <label
                          key={participant.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(participant.id)}
                            onChange={() => handleParticipantToggle(participant.id)}
                            className="mr-3 h-4 w-4 text-blue-600"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{participant.nama || 'Nama tidak tersedia'}</p>
                            <p className="text-xs text-gray-600">{participant.username || 'Username tidak tersedia'} • {participant.bidang || 'Bidang tidak tersedia'}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedParticipants.length === 0 && (
                  <p className="text-red-600 text-sm mt-2">* Pilih minimal 1 peserta yang wajib hadir</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 pt-8 max-w-md mx-auto">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <Link href="/admin/sesi" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Batal
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}