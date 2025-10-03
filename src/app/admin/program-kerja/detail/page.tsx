'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Calculator, ArrowLeft, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, getBidangLabel, getBulanLabel } from '@/lib/utils/calculations'
import ModalRincianBiaya from '@/components/admin/modal-rincian-biaya'
import Link from 'next/link'

interface Kegiatan {
  id: string
  nama_bidang: string
  no_urut: number
  bulan: string
  nama_kegiatan: string
  tujuan_kegiatan: string
  keterangan: string | null
  alokasi_dana: number
  created_at: string
  updated_at: string
}

interface ProgramKerja {
  id: string
  tahun: number
  kegiatan: Kegiatan[]
}

const BIDANG_OPTIONS = [
  'PENGURUS_HARIAN', 'KURIKULUM', 'TENAGA_PENDIDIK', 'SARANA_DAN_PRA_SARANA',
  'MUDA_MUDI', 'KEPUTRIAN', 'HTQ', 'KEMANDIRIAN', 'SENI_OR', 
  'BIMBINGAN_KONSELING', 'PENGGALANG_DANA'
]

const BULAN_OPTIONS = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
]

export default function DetailProgramKerjaPage() {
  const searchParams = useSearchParams()
  const tahun = parseInt(searchParams.get('tahun') || '0')
  
  const [programKerja, setProgramKerja] = useState<ProgramKerja | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBidang, setSelectedBidang] = useState<string>('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRincianModalOpen, setIsRincianModalOpen] = useState(false)
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<string>('')
  
  // Form state
  const [formData, setFormData] = useState({
    namaBidang: '',
    noUrut: 1,
    bulan: '',
    namaKegiatan: '',
    tujuanKegiatan: '',
    keterangan: ''
  })

  useEffect(() => {
    if (tahun > 0) {
      fetchProgramKerja()
    }
  }, [tahun])

  const fetchProgramKerja = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/program-kerja?tahun=${tahun}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          // Get detailed data with kegiatan
          const detailResponse = await fetch(`/api/program-kerja/${data[0].id}`)
          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            setProgramKerja(detailData)
          } else {
            // Fallback to basic data
            const programData = {
              id: data[0].id,
              tahun: data[0].tahun,
              kegiatan: []
            }
            setProgramKerja(programData)
          }
        } else {
          toast.error('Program kerja tidak ditemukan')
        }
      } else {
        toast.error('Program kerja tidak ditemukan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateKegiatan = async () => {
    try {
      if (!programKerja) return

      // Validate form data
      if (!formData.namaBidang) {
        toast.error('Pilih bidang terlebih dahulu')
        return
      }
      if (!formData.bulan) {
        toast.error('Pilih bulan terlebih dahulu')
        return
      }
      if (!formData.namaKegiatan.trim()) {
        toast.error('Masukkan nama kegiatan')
        return
      }
      if (!formData.tujuanKegiatan.trim() || formData.tujuanKegiatan.trim().length < 3) {
        toast.error('Tujuan kegiatan minimal 3 karakter')
        return
      }

      const response = await fetch('/api/program-kerja/kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programKerjaTahunanId: programKerja.id,
          namaBidang: formData.namaBidang,
          noUrut: formData.noUrut,
          bulan: formData.bulan,
          namaKegiatan: formData.namaKegiatan.trim(),
          tujuanKegiatan: formData.tujuanKegiatan.trim(),
          keterangan: formData.keterangan?.trim() || null
        })
      })

      if (response.ok) {
        toast.success('Kegiatan berhasil ditambahkan')
        setIsCreateModalOpen(false)
        resetForm()
        fetchProgramKerja()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menambahkan kegiatan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const handleDeleteKegiatan = async (id: string, namaKegiatan: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${namaKegiatan}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/program-kerja/kegiatan/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Kegiatan berhasil dihapus')
        fetchProgramKerja()
      } else {
        toast.error('Gagal menghapus kegiatan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const resetForm = () => {
    setFormData({
      namaBidang: '',
      noUrut: 1,
      bulan: '',
      namaKegiatan: '',
      tujuanKegiatan: '',
      keterangan: ''
    })
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!programKerja) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Program Kerja Tidak Ditemukan</h3>
            <p className="text-gray-500 text-center mb-4">
              Program kerja untuk tahun {tahun} belum dibuat
            </p>
            <Link href="/admin/program-kerja">
              <Button>Kembali ke Daftar Program Kerja</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/program-kerja">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Program Kerja {tahun}</h1>
            <p className="text-gray-600">
              Total {programKerja.kegiatan.length} kegiatan • 
              {formatCurrency(programKerja.kegiatan.reduce((sum, k) => sum + Number(k.alokasi_dana), 0))}
            </p>
          </div>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kegiatan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Kegiatan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="namaBidang">Nama Bidang</Label>
                  <select
                    id="namaBidang"
                    value={formData.namaBidang}
                    onChange={(e) => setFormData({...formData, namaBidang: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Bidang</option>
                    {BIDANG_OPTIONS.map(bidang => (
                      <option key={bidang} value={bidang}>{getBidangLabel(bidang)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="noUrut">No Urut</Label>
                  <Input
                    type="number"
                    value={formData.noUrut}
                    onChange={(e) => setFormData({...formData, noUrut: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulan">Bulan</Label>
                  <select
                    id="bulan"
                    value={formData.bulan}
                    onChange={(e) => setFormData({...formData, bulan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Bulan</option>
                    {BULAN_OPTIONS.map(bulan => (
                      <option key={bulan} value={bulan}>{getBulanLabel(bulan)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="namaKegiatan">Nama Kegiatan</Label>
                  <Input
                    value={formData.namaKegiatan}
                    onChange={(e) => setFormData({...formData, namaKegiatan: e.target.value})}
                    placeholder="Masukkan nama kegiatan"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="tujuanKegiatan">Tujuan Kegiatan</Label>
                <Textarea
                  value={formData.tujuanKegiatan}
                  onChange={(e) => setFormData({...formData, tujuanKegiatan: e.target.value})}
                  placeholder="Jelaskan tujuan kegiatan"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                <Textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  placeholder="Keterangan tambahan"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateKegiatan}>
                  Tambah Kegiatan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kegiatan List */}
      {programKerja.kegiatan.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Kegiatan</h3>
            <p className="text-gray-500 text-center mb-4">
              Mulai dengan menambahkan kegiatan pertama untuk program kerja {tahun}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kegiatan Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {programKerja.kegiatan.map((kegiatan) => (
            <Card key={kegiatan.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className="bg-gray-100 text-gray-800">{kegiatan.no_urut}</Badge>
                      <Badge className="bg-blue-100 text-blue-800">{getBulanLabel(kegiatan.bulan)}</Badge>
                      <Badge className="bg-green-100 text-green-800">{getBidangLabel(kegiatan.nama_bidang)}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {kegiatan.nama_kegiatan}
                    </h3>
                    <p className="text-gray-600 mb-2">{kegiatan.tujuan_kegiatan}</p>
                    {kegiatan.keterangan && (
                      <p className="text-sm text-gray-500 mb-3">{kegiatan.keterangan}</p>
                    )}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Alokasi Dana:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(Number(kegiatan.alokasi_dana))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedKegiatanId(kegiatan.id)
                        setIsRincianModalOpen(true)
                      }}
                    >
                      <Calculator className="w-4 h-4 mr-1" />
                      Rincian Biaya
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteKegiatan(kegiatan.id, kegiatan.nama_kegiatan)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rincian Biaya Modal */}
      <ModalRincianBiaya
        isOpen={isRincianModalOpen}
        onClose={() => setIsRincianModalOpen(false)}
        kegiatanId={selectedKegiatanId}
        onSuccess={fetchProgramKerja}
      />
    </div>
  )
}