'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, FileText, Heart, RefreshCw, Edit, UserPlus, History, Settings } from 'lucide-react'
import Link from 'next/link'
import ManualAttendanceModal from '@/components/admin/manual-attendance-modal'
import BulkAttendanceModal from '@/components/admin/bulk-attendance-modal'

interface Peserta {
  id: string
  nama: string
  email: string
  jabatan: string
  instansi: string
  status_kehadiran?: string
  admin_override?: boolean
  admin_notes?: string
}

interface Absensi {
  id: string
  peserta_id: string
  status_kehadiran: string
  waktu_absen: string
  catatan: string
  peserta: Peserta
}

interface Sesi {
  id: string
  nama_sesi: string
  tanggal: string
  waktu_mulai: string
  waktu_selesai: string
  lokasi: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'hadir': return <CheckCircle className="w-4 h-4" />
    case 'terlambat': return <Clock className="w-4 h-4" />
    case 'ghoib': return <XCircle className="w-4 h-4" />
    case 'izin': return <FileText className="w-4 h-4" />
    case 'sakit': return <Heart className="w-4 h-4" />
    default: return <Clock className="w-4 h-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'hadir': return 'bg-green-100 text-green-800'
    case 'terlambat': return 'bg-orange-100 text-orange-800'
    case 'ghoib': return 'bg-red-100 text-red-800'
    case 'izin': return 'bg-yellow-100 text-yellow-800'
    case 'sakit': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'hadir': return 'Hadir'
    case 'terlambat': return 'Terlambat'
    case 'ghoib': return 'Ghoib'
    case 'izin': return 'Izin'
    case 'sakit': return 'Sakit'
    default: return 'Belum Absen'
  }
}

export default function KehadiranPage() {
  const params = useParams()
  const sesiId = params.id as string
  
  const [sesi, setSesi] = useState<Sesi | null>(null)
  const [absensi, setAbsensi] = useState<Absensi[]>([])
  const [allPeserta, setAllPeserta] = useState<Peserta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedPeserta, setSelectedPeserta] = useState<string[]>([])
  const [showManualModal, setShowManualModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedPesertaForModal, setSelectedPesertaForModal] = useState<Peserta | null>(null)
  const [adminId] = useState('550e8400-e29b-41d4-a716-446655440000') // Temporary admin ID

  useEffect(() => {
    if (sesiId) {
      fetchData()
      
      // Auto refresh setiap 5 detik
      const interval = setInterval(() => {
        fetchData()
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [sesiId])

  const handleAutoAssign = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch(`/api/sesi/${sesiId}/auto-assign`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal auto-assign peserta')
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem')
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true)
        // Clear existing data for force refresh
        setAbsensi([])
        setAllPeserta([])
      }
      
      // Fetch sesi info with cache busting
      const sesiTimestamp = Date.now()
      const sesiResponse = await fetch(`/api/sesi/${sesiId}?t=${sesiTimestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (sesiResponse.ok) {
        const sesiData = await sesiResponse.json()
        setSesi(sesiData)
      }

      // FORCE REFRESH with timestamp and clear cache
      const timestamp = Date.now()
      console.log('Fetching kehadiran data for sesi:', sesiId)
      try {
        const response = await fetch(`/api/kehadiran/${sesiId}?t=${timestamp}&refresh=${isManualRefresh ? '1' : '0'}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('API Response:', data)
          console.log('Participants received:', data.participants?.length || 0)
          
          if (data.participants && data.participants.length > 0) {
            console.log('First participant:', data.participants[0])
            
            // Force state update with new data
            setAllPeserta([...data.participants])
            
            // Create absensi data for compatibility
            const absensiData = data.participants
              .filter((p: any) => p.status_kehadiran !== 'ghoib')
              .map((p: any) => ({
                id: `absen-${p.id}-${timestamp}`,
                peserta_id: p.id,
                status_kehadiran: p.status_kehadiran,
                waktu_absen: p.waktu_absen,
                catatan: p.catatan,
                peserta: p
              }))
            
            setAbsensi([...absensiData])
            console.log('State updated - participants:', data.participants.length, 'absensi:', absensiData.length)
          } else {
            console.log('No participants received')
            setAllPeserta([])
            setAbsensi([])
          }
        } else {
          console.error('API failed with status:', response.status)
          setAllPeserta([])
          setAbsensi([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setAllPeserta([])
        setAbsensi([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const getKehadiranStatus = (pesertaId: string) => {
    const peserta = allPeserta.find(p => p.id === pesertaId)
    return peserta?.status_kehadiran || 'ghoib'
  }

  const handleSelectPeserta = (pesertaId: string, checked: boolean) => {
    if (checked) {
      setSelectedPeserta(prev => [...prev, pesertaId])
    } else {
      setSelectedPeserta(prev => prev.filter(id => id !== pesertaId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPeserta(allPeserta.map(p => p.id))
    } else {
      setSelectedPeserta([])
    }
  }

  const handleManualAttendance = (peserta: Peserta) => {
    setSelectedPesertaForModal(peserta)
    setShowManualModal(true)
  }

  const handleBulkUpdate = () => {
    if (selectedPeserta.length === 0) {
      alert('Pilih minimal 1 peserta')
      return
    }
    setShowBulkModal(true)
  }

  const refreshData = () => {
    console.log('Force refreshing data...')
    // Clear all state first
    setAbsensi([])
    setAllPeserta([])
    setSelectedPeserta([])
    // Force refresh with delay to ensure state is cleared
    setTimeout(() => {
      fetchData(true)
    }, 100)
  }



  const stats = {
    total: allPeserta.length,
    hadir: absensi.filter(a => a.status_kehadiran === 'hadir').length,
    terlambat: absensi.filter(a => a.status_kehadiran === 'terlambat').length,
    izin: absensi.filter(a => a.status_kehadiran === 'izin').length,
    sakit: absensi.filter(a => a.status_kehadiran === 'sakit').length,
    ghoib: allPeserta.length - absensi.length
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kehadiran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/sesi">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kehadiran Peserta</h1>
            <p className="text-gray-600 mt-1">
              {sesi?.nama_sesi} - {sesi && new Date(sesi.tanggal).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAutoAssign} 
            disabled={isRefreshing}
            variant="default"
            size="sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Auto-Assign Peserta
          </Button>
          <Button 
            onClick={() => fetchData(true)} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Memuat...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Peserta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
            <div className="text-sm text-gray-600">Hadir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{stats.terlambat}</div>
            <div className="text-sm text-gray-600">Terlambat</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.izin}</div>
            <div className="text-sm text-gray-600">Izin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{stats.sakit}</div>
            <div className="text-sm text-gray-600">Sakit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.ghoib}</div>
            <div className="text-sm text-gray-600">Ghoib</div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedPeserta.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedPeserta.length} peserta dipilih
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkUpdate}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Update Status Massal
                </Button>
                <Button 
                  onClick={() => setSelectedPeserta([])}
                  variant="outline"
                  size="sm"
                >
                  Batal Pilih
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peserta List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daftar Kehadiran Peserta</span>
            <div className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={selectedPeserta.length === allPeserta.length && allPeserta.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span>Pilih Semua</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 w-12"></th>
                  <th className="text-left p-3">No</th>
                  <th className="text-left p-3">Nama Peserta</th>
                  <th className="text-left p-3">Jabatan</th>
                  <th className="text-left p-3">Instansi</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allPeserta.map((peserta, index) => {
                  const status = getKehadiranStatus(peserta.id)
                  const isSelected = selectedPeserta.includes(peserta.id)
                  return (
                    <tr key={peserta.id} className={`border-b hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="p-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectPeserta(peserta.id, checked as boolean)}
                        />
                      </td>
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{peserta.nama}</div>
                          <div className="text-sm text-gray-600">{peserta.email}</div>
                          {peserta.admin_override && (
                            <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                              <Settings className="w-3 h-3" />
                              Admin Override
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{peserta.jabatan || '-'}</td>
                      <td className="p-3">{peserta.instansi || '-'}</td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(status)}
                          {getStatusText(status)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManualAttendance(peserta)}
                            className="h-8 px-2"
                          >
                            {status === 'ghoib' ? (
                              <><UserPlus className="w-3 h-3 mr-1" />Absen</>
                            ) : (
                              <><Edit className="w-3 h-3 mr-1" />Edit</>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showManualModal && selectedPesertaForModal && (
        <ManualAttendanceModal
          isOpen={showManualModal}
          onClose={() => {
            setShowManualModal(false)
            setSelectedPesertaForModal(null)
          }}
          peserta={selectedPesertaForModal}
          sesiId={sesiId}
          adminId={adminId}
          onSuccess={refreshData}
        />
      )}

      {showBulkModal && (
        <BulkAttendanceModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          selectedPeserta={allPeserta.filter(p => selectedPeserta.includes(p.id))}
          sesiId={sesiId}
          adminId={adminId}
          onSuccess={refreshData}
        />
      )}
    </div>
  )
}