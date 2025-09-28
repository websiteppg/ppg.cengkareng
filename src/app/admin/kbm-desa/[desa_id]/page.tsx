'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Users, ArrowLeft, Plus, CheckCircle, XCircle, Copy, Save, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Kelompok {
  nama: string
  status: 'complete' | 'incomplete' | 'empty'
  totalData: number
  completedCategories: number
}

interface LaporanDesa {
  mt: string
  ms: string
  laporan_musyawarah: string
  kendala_saran: string
}

export default function DesaDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const desaId = params.desa_id as string
  const periode = searchParams.get('periode') || ''
  
  const [desaData, setDesaData] = useState<any>(null)
  const [kelompokList, setKelompokList] = useState<Kelompok[]>([])
  const [laporanDesa, setLaporanDesa] = useState<LaporanDesa>({
    mt: '',
    ms: '',
    laporan_musyawarah: '',
    kendala_saran: ''
  })
  const [existingLaporanDesa, setExistingLaporanDesa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingLaporan, setSavingLaporan] = useState(false)

  useEffect(() => {
    if (desaId && periode) {
      fetchDesaDetail()
      fetchLaporanDesa()
    }
  }, [desaId, periode])
  
  useEffect(() => {
    if (desaData && desaData.kelompok && periode) {
      fetchKelompokStatus()
    }
  }, [desaData, periode])

  const fetchDesaDetail = async () => {
    try {
      const response = await fetch(`/api/kbm-desa/master`)
      const result = await response.json()
      
      if (result.success) {
        const desa = result.data.find((d: any) => d.id === desaId)
        if (desa) {
          setDesaData(desa)
        } else {
          toast.error('Data desa tidak ditemukan')
        }
      } else {
        toast.error('Gagal mengambil data desa')
      }
    } catch (error) {
      toast.error('Gagal mengambil data desa')
    }
  }

  const fetchKelompokStatus = async () => {
    try {
      if (!desaData || !desaData.kelompok) {
        console.log('No desa data or kelompok:', desaData)
        setLoading(false)
        return
      }

      console.log('Fetching status for kelompok:', desaData.kelompok)
      const kelompokStatus: Kelompok[] = []
      
      for (const kelompok of desaData.kelompok) {
        try {
          const response = await fetch(`/api/kbm-desa/laporan?periode=${periode}&desa_id=${desaId}&kelompok=${encodeURIComponent(kelompok)}`)
          const result = await response.json()
          
          let status: 'complete' | 'incomplete' | 'empty' = 'empty'
          let totalData = 0
          let completedCategories = 0
          
          if (result.success && result.data) {
            const data = result.data
            totalData = data.length
            completedCategories = data.length
            const totalCategories = 4 // PAUD, Pra Remaja, Remaja, Pra Nikah
            
            if (completedCategories === totalCategories) {
              status = 'complete'
            } else if (completedCategories > 0) {
              status = 'incomplete'
            }
          }

          kelompokStatus.push({
            nama: kelompok,
            status,
            totalData,
            completedCategories
          })
        } catch (apiError) {
          // Jika API error, tetap tambahkan kelompok dengan status empty
          kelompokStatus.push({
            nama: kelompok,
            status: 'empty',
            totalData: 0,
            completedCategories: 0
          })
        }
      }
      
      setKelompokList(kelompokStatus)
      console.log('Final kelompok status:', kelompokStatus)
    } catch (error) {
      console.error('Error fetching kelompok status:', error)
      toast.error('Gagal mengambil status kelompok')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Lengkap</Badge>
      case 'incomplete':
        return <Badge className="bg-yellow-100 text-yellow-800">Sebagian</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Kosong</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'incomplete':
        return <XCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const fetchLaporanDesa = async () => {
    try {
      const response = await fetch(`/api/kbm-desa/laporan-desa?periode=${periode}&desa_id=${desaId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setExistingLaporanDesa(result.data)
        setLaporanDesa({
          mt: result.data.mt || '',
          ms: result.data.ms || '',
          laporan_musyawarah: result.data.laporan_musyawarah || '',
          kendala_saran: result.data.kendala_saran || ''
        })
      }
    } catch (error) {
      console.error('Error fetching laporan desa:', error)
    }
  }

  const handleLaporanDesaChange = (field: keyof LaporanDesa, value: string) => {
    setLaporanDesa(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveLaporanDesa = async () => {
    setSavingLaporan(true)
    try {
      const url = '/api/kbm-desa/laporan-desa'
      const method = existingLaporanDesa ? 'PUT' : 'POST'
      
      const payload = existingLaporanDesa 
        ? { id: existingLaporanDesa.id, ...laporanDesa }
        : {
            desa_id: desaId,
            periode,
            created_by: JSON.parse(localStorage.getItem('admin_user') || '{}').id,
            ...laporanDesa
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success('Laporan desa berhasil disimpan')
        fetchLaporanDesa() // Refresh data
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal menyimpan laporan desa')
    } finally {
      setSavingLaporan(false)
    }
  }

  const handleCopyTemplate = async (kelompok: string) => {
    try {
      // Hitung periode sebelumnya
      const [year, month] = periode.split('-').map(Number)
      let prevYear = year
      let prevMonth = month - 1
      
      if (prevMonth === 0) {
        prevMonth = 12
        prevYear = year - 1
      }
      
      const sourcePeriode = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
      
      const response = await fetch('/api/kbm-desa/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_periode: sourcePeriode,
          target_periode: periode,
          desa_id: desaId,
          kelompok,
          created_by: JSON.parse(localStorage.getItem('admin_user') || '{}').id
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
        fetchKelompokStatus() // Refresh status
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal copy template')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/kbm-desa">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Desa {desaData?.nama_desa}
        </h1>
        <p className="text-gray-600">
          Periode: {periode ? new Date(periode + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : ''}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kelompok</p>
                <p className="text-2xl font-bold">{kelompokList.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lengkap</p>
                <p className="text-2xl font-bold text-green-600">
                  {kelompokList.filter(k => k.status === 'complete').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Belum Lengkap</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {kelompokList.filter(k => k.status !== 'complete').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Laporan Desa */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Laporan Desa
            </span>
            <Button 
              onClick={handleSaveLaporanDesa}
              disabled={savingLaporan}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {savingLaporan ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mt">MT (Mubaligh Tugasan)</Label>
              <Input
                id="mt"
                value={laporanDesa.mt}
                onChange={(e) => handleLaporanDesaChange('mt', e.target.value)}
                placeholder="Masukkan jumlah MT..."
              />
            </div>
            
            <div>
              <Label htmlFor="ms">MS (Mubaligh Setempat)</Label>
              <Input
                id="ms"
                value={laporanDesa.ms}
                onChange={(e) => handleLaporanDesaChange('ms', e.target.value)}
                placeholder="Masukkan jumlah MS..."
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="laporan_musyawarah">Laporan Hasil Musyawarah KBM Desa</Label>
            <Textarea
              id="laporan_musyawarah"
              value={laporanDesa.laporan_musyawarah}
              onChange={(e) => handleLaporanDesaChange('laporan_musyawarah', e.target.value)}
              placeholder="Laporan hasil musyawarah..."
              rows={4}
            />
          </div>
          
          <div>
            <Label htmlFor="kendala_saran">Kendala dan Saran ke PPG Daerah</Label>
            <Textarea
              id="kendala_saran"
              value={laporanDesa.kendala_saran}
              onChange={(e) => handleLaporanDesaChange('kendala_saran', e.target.value)}
              placeholder="Kendala yang dihadapi dan saran..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Kelompok List */}
      {kelompokList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kelompokList.map((kelompok) => (
            <Card key={kelompok.nama} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(kelompok.status)}
                    {kelompok.nama}
                  </span>
                  {getStatusBadge(kelompok.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>Kategori Lengkap: {kelompok.completedCategories}/4</div>
                    <div>Total Data: {kelompok.totalData}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/admin/kbm-desa/${desaId}/${encodeURIComponent(kelompok.nama)}?periode=${periode}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Input Data
                      </Button>
                    </Link>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCopyTemplate(kelompok.nama)}
                      title="Copy dari periode sebelumnya"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Data Kelompok</h3>
            <p className="text-gray-600 mb-4">Data kelompok untuk desa ini belum tersedia atau sedang dimuat.</p>
            {desaData && (
              <div className="text-sm text-gray-500">
                <p>Debug Info:</p>
                <p>Desa ID: {desaId}</p>
                <p>Periode: {periode}</p>
                <p>Desa Data: {JSON.stringify(desaData)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}