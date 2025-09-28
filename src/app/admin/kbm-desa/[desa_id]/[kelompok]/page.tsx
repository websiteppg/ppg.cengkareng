'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Copy } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface FormData {
  jumlah_murid: number
  jumlah_kelas: number
  persentase_kehadiran: number
  pencapaian_target_materi: number
  pertemuan_kbm_kali: number
  sarpras: string
  tahfidz: number
  pengajar_mt_ms: string
}

const KATEGORI_PROGRAM = [
  { id: 'paud_cbr', label: 'PAUD/CBR (PAUD, TK, SD)' },
  { id: 'pra_remaja', label: 'Pra Remaja (SMP)' },
  { id: 'remaja', label: 'Remaja (SMA)' },
  { id: 'pra_nikah', label: 'Pra Nikah (USMAN)' }
]

const EMPTY_FORM: FormData = {
  jumlah_murid: 0,
  jumlah_kelas: 0,
  persentase_kehadiran: 0,
  pencapaian_target_materi: 0,
  pertemuan_kbm_kali: 0,
  sarpras: '',
  tahfidz: 0,
  pengajar_mt_ms: ''
}

export default function KelompokFormPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const desaId = params.desa_id as string
  const kelompok = decodeURIComponent(params.kelompok as string)
  const periode = searchParams.get('periode') || ''
  
  const [activeTab, setActiveTab] = useState('paud_cbr')
  const [formData, setFormData] = useState<Record<string, FormData>>({})
  const [existingData, setExistingData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Initialize form data dengan empty form untuk semua kategori
    const initialFormData: Record<string, FormData> = {}
    KATEGORI_PROGRAM.forEach(kategori => {
      initialFormData[kategori.id] = { ...EMPTY_FORM }
    })
    setFormData(initialFormData)
    
    if (desaId && kelompok && periode) {
      fetchExistingData()
    }
  }, [desaId, kelompok, periode])

  const fetchExistingData = async () => {
    try {
      const response = await fetch(`/api/kbm-desa/laporan?periode=${periode}&desa_id=${desaId}&kelompok=${encodeURIComponent(kelompok)}`)
      const result = await response.json()
      
      if (result.success) {
        const dataByCategory: Record<string, any> = {}
        const formByCategory: Record<string, FormData> = {}
        
        result.data.forEach((item: any) => {
          dataByCategory[item.kategori_program] = item
          formByCategory[item.kategori_program] = {
            jumlah_murid: item.jumlah_murid,
            jumlah_kelas: item.jumlah_kelas,
            persentase_kehadiran: item.persentase_kehadiran,
            pencapaian_target_materi: item.pencapaian_target_materi,
            pertemuan_kbm_kali: item.pertemuan_kbm_kali,
            sarpras: item.sarpras,
            tahfidz: item.tahfidz,
            pengajar_mt_ms: item.pengajar_mt_ms
          }
        })
        
        setExistingData(dataByCategory)
        
        // Initialize form data untuk semua kategori
        const initialFormData: Record<string, FormData> = {}
        KATEGORI_PROGRAM.forEach(kategori => {
          initialFormData[kategori.id] = formByCategory[kategori.id] || { ...EMPTY_FORM }
        })
        
        setFormData(initialFormData)
      }
    } catch (error) {
      toast.error('Gagal mengambil data existing')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (kategori: string, field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [kategori]: {
        ...(prev[kategori] || EMPTY_FORM),
        [field]: value
      }
    }))
  }

  const validateForm = (data: FormData): string | null => {
    if (data.jumlah_murid < 0) return 'Jumlah murid tidak boleh negatif'
    if (data.jumlah_kelas < 0) return 'Jumlah kelas tidak boleh negatif'
    if (data.persentase_kehadiran < 0 || data.persentase_kehadiran > 100) return 'Persentase kehadiran harus 0-100'
    if (data.pencapaian_target_materi < 0 || data.pencapaian_target_materi > 100) return 'Pencapaian target materi harus 0-100'
    if (data.pertemuan_kbm_kali < 0) return 'Pertemuan KBM tidak boleh negatif'
    if (!data.sarpras.trim()) return 'Sarpras wajib diisi'
    if (data.tahfidz < 0) return 'Jumlah tahfidz tidak boleh negatif'
    if (!data.pengajar_mt_ms.trim()) return 'Pengajar (MT, MS) wajib diisi'
    return null
  }

  const handleSave = async (kategori: string) => {
    const data = formData[kategori]
    if (!data) return

    const validationError = validateForm(data)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setSaving(true)
    try {
      const existingItem = existingData[kategori]
      const url = '/api/kbm-desa/laporan'
      const method = existingItem ? 'PUT' : 'POST'
      
      const payload = existingItem 
        ? { id: existingItem.id, ...data }
        : {
            desa_id: desaId,
            kelompok,
            periode,
            kategori_program: kategori,
            created_by: JSON.parse(localStorage.getItem('admin_user') || '{}').id,
            ...data
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Data ${KATEGORI_PROGRAM.find(k => k.id === kategori)?.label} berhasil disimpan`)
        fetchExistingData() // Refresh data
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Gagal menyimpan data')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyTemplate = async () => {
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
        fetchExistingData() // Refresh data
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
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href={`/admin/kbm-desa/${desaId}?periode=${periode}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Kelompok {kelompok}
            </h1>
            <p className="text-gray-600">
              Periode: {periode ? new Date(periode + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : ''}
            </p>
          </div>
          
          <Button onClick={handleCopyTemplate} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {KATEGORI_PROGRAM.map(kategori => (
            <TabsTrigger key={kategori.id} value={kategori.id} className="text-xs">
              {kategori.label.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {KATEGORI_PROGRAM.map(kategori => (
          <TabsContent key={kategori.id} value={kategori.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {kategori.label}
                  <Button 
                    onClick={() => handleSave(kategori.id)}
                    disabled={saving}
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`jumlah_murid_${kategori.id}`}>Jumlah Murid *</Label>
                    <Input
                      id={`jumlah_murid_${kategori.id}`}
                      type="number"
                      min="0"
                      value={formData[kategori.id]?.jumlah_murid ?? 0}
                      onChange={(e) => handleInputChange(kategori.id, 'jumlah_murid', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`jumlah_kelas_${kategori.id}`}>Jumlah Kelas *</Label>
                    <Input
                      id={`jumlah_kelas_${kategori.id}`}
                      type="number"
                      min="0"
                      value={formData[kategori.id]?.jumlah_kelas ?? 0}
                      onChange={(e) => handleInputChange(kategori.id, 'jumlah_kelas', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`persentase_kehadiran_${kategori.id}`}>Persentase Kehadiran (%) *</Label>
                    <Input
                      id={`persentase_kehadiran_${kategori.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={formData[kategori.id]?.persentase_kehadiran ?? 0}
                      onChange={(e) => handleInputChange(kategori.id, 'persentase_kehadiran', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`pencapaian_target_${kategori.id}`}>Pencapaian Target Materi (%) *</Label>
                    <Input
                      id={`pencapaian_target_${kategori.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={formData[kategori.id]?.pencapaian_target_materi ?? 0}
                      onChange={(e) => handleInputChange(kategori.id, 'pencapaian_target_materi', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`pertemuan_kbm_${kategori.id}`}>Pertemuan KBM (kali) *</Label>
                    <Input
                      id={`pertemuan_kbm_${kategori.id}`}
                      type="number"
                      min="0"
                      value={formData[kategori.id]?.pertemuan_kbm_kali ?? 0}
                      onChange={(e) => handleInputChange(kategori.id, 'pertemuan_kbm_kali', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`pengajar_${kategori.id}`}>Pengajar (MT, MS) *</Label>
                    <Input
                      id={`pengajar_${kategori.id}`}
                      value={formData[kategori.id]?.pengajar_mt_ms ?? ''}
                      onChange={(e) => handleInputChange(kategori.id, 'pengajar_mt_ms', e.target.value)}
                      placeholder="Contoh: MT: 2, MS: 3"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`sarpras_${kategori.id}`}>Sarpras *</Label>
                  <Textarea
                    id={`sarpras_${kategori.id}`}
                    value={formData[kategori.id]?.sarpras ?? ''}
                    onChange={(e) => handleInputChange(kategori.id, 'sarpras', e.target.value)}
                    placeholder="Deskripsikan kondisi sarana dan prasarana..."
                  />
                </div>
                
                <div>
                  <Label htmlFor={`tahfidz_${kategori.id}`}>Tahfidz (Jumlah) *</Label>
                  <Input
                    id={`tahfidz_${kategori.id}`}
                    type="number"
                    min="0"
                    value={formData[kategori.id]?.tahfidz ?? 0}
                    onChange={(e) => handleInputChange(kategori.id, 'tahfidz', parseInt(e.target.value) || 0)}
                    placeholder="Masukkan jumlah program tahfidz"
                  />
                </div>
                

              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}