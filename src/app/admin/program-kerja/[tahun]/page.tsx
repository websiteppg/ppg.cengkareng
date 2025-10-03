'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  const params = useParams()
  const tahun = parseInt(params.tahun as string)
  
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
    fetchProgramKerja()
  }, [tahun])

  const fetchProgramKerja = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/program-kerja?tahun=${tahun}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          // Fetch kegiatan for this program
          const kegiatanResponse = await fetch(`/api/program-kerja/kegiatan?programId=${data[0].id}`)
          let kegiatanData = []
          
          if (kegiatanResponse.ok) {
            kegiatanData = await kegiatanResponse.json()
          }
          
          const programData = {
            id: data[0].id,
            tahun: data[0].tahun,
            kegiatan: kegiatanData
          }
          setProgramKerja(programData)
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

      const response = await fetch('/api/program-kerja/kegiatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programKerjaTahunanId: programKerja.id,
          namaBidang: formData.namaBidang,
          noUrut: formData.noUrut,
          bulan: formData.bulan,
          namaKegiatan: formData.namaKegiatan,
          tujuanKegiatan: formData.tujuanKegiatan,
          keterangan: formData.keterangan || null
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

  const handleDeleteKegiatan = async (kegiatanId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/program-kerja/kegiatan/${kegiatanId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Kegiatan berhasil dihapus')
        fetchProgramKerja()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal menghapus kegiatan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
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

      {/* Daftar Kegiatan */}
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
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge>{kegiatan.no_urut}</Badge>
                    <div>
                      <CardTitle className="text-lg">{kegiatan.nama_kegiatan}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {getBidangLabel(kegiatan.nama_bidang)} • {getBulanLabel(kegiatan.bulan)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedKegiatanId(kegiatan.id)
                        setIsRincianModalOpen(true)
                      }}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Rincian Biaya
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteKegiatan(kegiatan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>Tujuan:</strong> {kegiatan.tujuan_kegiatan}
                  </p>
                  {kegiatan.keterangan && (
                    <p className="text-sm text-gray-700">
                      <strong>Keterangan:</strong> {kegiatan.keterangan}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">Alokasi Dana:</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(kegiatan.alokasi_dana)}
                    </span>
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