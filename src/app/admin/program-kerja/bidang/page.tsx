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
import { Plus, Calculator, Trash2, ArrowLeft, FileText, FolderOpen, Edit } from 'lucide-react'
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

interface BidangGroup {
  nama: string
  label: string
  kegiatan: Kegiatan[]
  totalAlokasi: number
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

export default function ProgramKerjaPerBidangPage() {
  const searchParams = useSearchParams()
  const [selectedTahun, setSelectedTahun] = useState<number>(2026)
  const tahun = parseInt(searchParams.get('tahun') || selectedTahun.toString())
  
  const [programKerja, setProgramKerja] = useState<ProgramKerja | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBidang, setSelectedBidang] = useState<string>('')
  const [isRincianModalOpen, setIsRincianModalOpen] = useState(false)
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<string>('')
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [managingBidang, setManagingBidang] = useState<BidangGroup | null>(null)
  
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
    // Get current user from localStorage
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    
    console.log('Fetching program kerja for tahun:', tahun)
    if (tahun >= 2026) {
      fetchProgramKerja()
    }
  }, [tahun])

  const fetchProgramKerja = async () => {
    try {
      setLoading(true)
      console.log('Fetching program kerja for tahun:', tahun)
      const response = await fetch(`/api/program-kerja?tahun=${tahun}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Program kerja data:', data)
        if (data.length > 0) {
          // Get detailed data with kegiatan
          const detailResponse = await fetch(`/api/program-kerja/${data[0].id}`)
          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            console.log('Detail data:', detailData)
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
          console.log('No program kerja found for tahun:', tahun)
          setProgramKerja(null)
        }
      } else {
        console.log('API response not ok:', response.status)
        setProgramKerja(null)
      }
    } catch (error) {
      console.error('Error fetching program kerja:', error)
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

  const handleEditKegiatan = async (kegiatan: Kegiatan) => {
    setEditingKegiatan(kegiatan)
    setFormData({
      namaBidang: kegiatan.nama_bidang,
      noUrut: kegiatan.no_urut,
      bulan: kegiatan.bulan,
      namaKegiatan: kegiatan.nama_kegiatan,
      tujuanKegiatan: kegiatan.tujuan_kegiatan,
      keterangan: kegiatan.keterangan || ''
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateKegiatan = async () => {
    try {
      if (!editingKegiatan || !programKerja) return

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

      const response = await fetch(`/api/program-kerja/kegiatan/${editingKegiatan.id}`, {
        method: 'PUT',
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
        toast.success('Kegiatan berhasil diperbarui')
        setIsEditModalOpen(false)
        setEditingKegiatan(null)
        resetForm()
        fetchProgramKerja()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal memperbarui kegiatan')
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
      namaBidang: selectedBidang || '',
      noUrut: 1,
      bulan: '',
      namaKegiatan: '',
      tujuanKegiatan: '',
      keterangan: ''
    })
  }

  const getBidangGroups = (): BidangGroup[] => {
    if (!programKerja) return []
    
    const groups: Record<string, BidangGroup> = {}
    
    // Initialize all bidang groups
    BIDANG_OPTIONS.forEach(bidang => {
      groups[bidang] = {
        nama: bidang,
        label: getBidangLabel(bidang),
        kegiatan: [],
        totalAlokasi: 0
      }
    })
    
    // Group kegiatan by bidang
    programKerja.kegiatan.forEach(kegiatan => {
      if (groups[kegiatan.nama_bidang]) {
        groups[kegiatan.nama_bidang].kegiatan.push(kegiatan)
        groups[kegiatan.nama_bidang].totalAlokasi += Number(kegiatan.alokasi_dana)
      }
    })
    
    return Object.values(groups)
  }

  const openCreateModal = (bidang?: string) => {
    setSelectedBidang(bidang || '')
    setFormData({
      namaBidang: bidang || '',
      noUrut: 1,
      bulan: '',
      namaKegiatan: '',
      tujuanKegiatan: '',
      keterangan: ''
    })
    setIsCreateModalOpen(true)
  }

  const toggleCardExpansion = (bidangNama: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(bidangNama)) {
      newExpanded.delete(bidangNama)
    } else {
      newExpanded.add(bidangNama)
    }
    setExpandedCards(newExpanded)
  }

  const openManageModal = (bidang: BidangGroup) => {
    setManagingBidang(bidang)
    setIsManageModalOpen(true)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
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
              <Button>Buat Program Kerja</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const bidangGroups = getBidangGroups()
  const totalKegiatan = programKerja.kegiatan.length
  const totalAlokasi = programKerja.kegiatan.reduce((sum, k) => sum + Number(k.alokasi_dana), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {currentUser?.role !== 'bidang_ppg' && (
            <Link href="/admin/program-kerja">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Program Kerja Per Bidang {tahun}</h1>
            <p className="text-gray-600">
              {bidangGroups.filter(g => g.kegiatan.length > 0).length} bidang aktif • 
              {totalKegiatan} kegiatan • {formatCurrency(totalAlokasi)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={tahun}
            onChange={(e) => {
              const newTahun = parseInt(e.target.value)
              setSelectedTahun(newTahun)
              window.location.href = `/admin/program-kerja/bidang?tahun=${newTahun}`
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({length: 75}, (_, i) => 2026 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Button onClick={() => openCreateModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kegiatan
          </Button>
        </div>
      </div>

      {/* Bidang Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bidangGroups.map((bidang) => (
          <Card key={bidang.nama} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">{bidang.label}</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {bidang.kegiatan.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Summary */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Alokasi:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(bidang.totalAlokasi)}
                  </span>
                </div>
                
                {/* Kegiatan List */}
                {bidang.kegiatan.length === 0 ? (
                  <div className="text-center py-8">
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">Belum ada kegiatan</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openCreateModal(bidang.nama)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah Kegiatan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Show kegiatan based on expansion state */}
                    {(expandedCards.has(bidang.nama) ? bidang.kegiatan : bidang.kegiatan.slice(0, 3)).map((kegiatan) => (
                      <div key={kegiatan.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {kegiatan.nama_kegiatan}
                          </h4>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditKegiatan(kegiatan)}
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                              title="Edit Kegiatan"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedKegiatanId(kegiatan.id)
                                setIsRincianModalOpen(true)
                              }}
                              className="h-6 w-6 p-0"
                              title="Rincian Biaya"
                            >
                              <Calculator className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteKegiatan(kegiatan.id, kegiatan.nama_kegiatan)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              title="Hapus Kegiatan"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className="text-xs bg-gray-100 text-gray-800">
                            {getBulanLabel(kegiatan.bulan)}
                          </Badge>
                          <span className="text-xs font-medium text-green-600">
                            {formatCurrency(Number(kegiatan.alokasi_dana))}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Expand/Collapse and Manage buttons */}
                    {bidang.kegiatan.length > 3 && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="flex-1 text-blue-600 hover:text-blue-700"
                          onClick={() => toggleCardExpansion(bidang.nama)}
                        >
                          {expandedCards.has(bidang.nama) 
                            ? `Tutup (${bidang.kegiatan.length - 3} kegiatan)` 
                            : `Lihat ${bidang.kegiatan.length - 3} Lainnya`
                          }
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-purple-600 hover:text-purple-700"
                          onClick={() => openManageModal(bidang)}
                          title="Kelola Semua Kegiatan"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={() => openCreateModal(bidang.nama)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah Kegiatan
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Tambah Kegiatan {selectedBidang ? `- ${getBidangLabel(selectedBidang)}` : ''}
            </DialogTitle>
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Edit Kegiatan {editingKegiatan ? `- ${editingKegiatan.nama_kegiatan}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editNamaBidang">Nama Bidang</Label>
                <select
                  id="editNamaBidang"
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
                <Label htmlFor="editNoUrut">No Urut</Label>
                <Input
                  id="editNoUrut"
                  type="number"
                  value={formData.noUrut}
                  onChange={(e) => setFormData({...formData, noUrut: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editBulan">Bulan</Label>
                <select
                  id="editBulan"
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
                <Label htmlFor="editNamaKegiatan">Nama Kegiatan</Label>
                <Input
                  id="editNamaKegiatan"
                  value={formData.namaKegiatan}
                  onChange={(e) => setFormData({...formData, namaKegiatan: e.target.value})}
                  placeholder="Masukkan nama kegiatan"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editTujuanKegiatan">Tujuan Kegiatan</Label>
              <Textarea
                id="editTujuanKegiatan"
                value={formData.tujuanKegiatan}
                onChange={(e) => setFormData({...formData, tujuanKegiatan: e.target.value})}
                placeholder="Jelaskan tujuan kegiatan"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="editKeterangan">Keterangan (Opsional)</Label>
              <Textarea
                id="editKeterangan"
                value={formData.keterangan}
                onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                placeholder="Keterangan tambahan"
                rows={2}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false)
                setEditingKegiatan(null)
                resetForm()
              }}>
                Batal
              </Button>
              <Button onClick={handleUpdateKegiatan}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rincian Biaya Modal */}
      <ModalRincianBiaya
        isOpen={isRincianModalOpen}
        onClose={() => setIsRincianModalOpen(false)}
        kegiatanId={selectedKegiatanId}
        onSuccess={fetchProgramKerja}
      />

      {/* Manage All Activities Modal */}
      <Dialog open={isManageModalOpen} onOpenChange={setIsManageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Kelola Semua Kegiatan - {managingBidang?.label}</span>
              <Badge className="bg-blue-100 text-blue-800">
                {managingBidang?.kegiatan.length || 0} kegiatan
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] space-y-3">
            {managingBidang?.kegiatan.map((kegiatan, index) => (
              <div key={kegiatan.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-xs bg-gray-100 text-gray-800">
                        #{kegiatan.no_urut}
                      </Badge>
                      <Badge className="text-xs bg-blue-100 text-blue-800">
                        {getBulanLabel(kegiatan.bulan)}
                      </Badge>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(Number(kegiatan.alokasi_dana))}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      {kegiatan.nama_kegiatan}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {kegiatan.tujuan_kegiatan}
                    </p>
                    {kegiatan.keterangan && (
                      <p className="text-xs text-gray-500">
                        {kegiatan.keterangan}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        handleEditKegiatan(kegiatan)
                        setIsManageModalOpen(false)
                      }}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit Kegiatan"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedKegiatanId(kegiatan.id)
                        setIsRincianModalOpen(true)
                        setIsManageModalOpen(false)
                      }}
                      className="text-green-600 hover:text-green-700"
                      title="Rincian Biaya"
                    >
                      <Calculator className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteKegiatan(kegiatan.id, kegiatan.nama_kegiatan)}
                      className="text-red-600 hover:text-red-700"
                      title="Hapus Kegiatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                Tidak ada kegiatan untuk bidang ini
              </div>
            )}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Total Alokasi: <span className="font-semibold text-green-600">
                {formatCurrency(managingBidang?.totalAlokasi || 0)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  openCreateModal(managingBidang?.nama)
                  setIsManageModalOpen(false)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kegiatan
              </Button>
              <Button onClick={() => setIsManageModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}