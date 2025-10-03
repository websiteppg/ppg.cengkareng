'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Plus, Eye, Trash2, Calendar, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/calculations'

interface ProgramKerja {
  id: string
  tahun: number
  bidangSummary: Record<string, { jumlahKegiatan: number; totalAlokasi: number }>
  totalAlokasi: number
  created_at: string
  updated_at: string
}

export default function ProgramKerjaPage() {
  const router = useRouter()
  const [programKerjaList, setProgramKerjaList] = useState<ProgramKerja[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTahun, setNewTahun] = useState<number>(new Date().getFullYear() + 1)
  const [filterTahun, setFilterTahun] = useState<string>('')

  useEffect(() => {
    fetchProgramKerja()
  }, [filterTahun])

  const fetchProgramKerja = async () => {
    try {
      setLoading(true)
      const url = filterTahun ? `/api/program-kerja?tahun=${filterTahun}` : '/api/program-kerja'
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setProgramKerjaList(data)
      } else {
        toast.error('Gagal memuat data program kerja')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgramKerja = async () => {
    try {
      const response = await fetch('/api/program-kerja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tahun: newTahun })
      })

      if (response.ok) {
        toast.success('Program kerja berhasil dibuat')
        setIsCreateModalOpen(false)
        fetchProgramKerja()
        setNewTahun(new Date().getFullYear() + 1)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gagal membuat program kerja')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const handleDeleteProgramKerja = async (id: string, tahun: number) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus program kerja tahun ${tahun}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/program-kerja/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Program kerja berhasil dihapus')
        fetchProgramKerja()
      } else {
        toast.error('Gagal menghapus program kerja')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = 2026; year <= 2100; year++) {
      years.push(year)
    }
    return years
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Kerja PPG</h1>
          <p className="text-gray-600">Kelola program kerja tahunan PPG Jakarta Barat Cengkareng</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Buat Program Kerja Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Program Kerja Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tahun">Tahun Program Kerja</Label>
                <select
                  id="tahun"
                  value={newTahun.toString()}
                  onChange={(e) => setNewTahun(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getAvailableYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreateProgramKerja}>
                  Buat Program Kerja
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex space-x-4">
        <div className="w-48">
          <Label htmlFor="filter-tahun">Filter Tahun</Label>
          <select
            id="filter-tahun"
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Tahun</option>
            {getAvailableYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Program Kerja List */}
      {programKerjaList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Program Kerja</h3>
            <p className="text-gray-500 text-center mb-4">
              Mulai dengan membuat program kerja untuk tahun yang diinginkan
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Buat Program Kerja Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programKerjaList.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Program Kerja {program.tahun}</span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/program-kerja/detail?tahun=${program.tahun}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProgramKerja(program.id, program.tahun)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Bidang</span>
                    <span className="font-medium">{Object.keys(program.bidangSummary).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Kegiatan</span>
                    <span className="font-medium">
                      {Object.values(program.bidangSummary).reduce((sum, bidang) => sum + bidang.jumlahKegiatan, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Alokasi</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(program.totalAlokasi)}
                    </span>
                  </div>
                  <div className="pt-3 border-t">
                    <Button 
                      className="w-full" 
                      onClick={() => router.push(`/admin/program-kerja/detail?tahun=${program.tahun}`)}
                    >
                      Kelola Program Kerja
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}