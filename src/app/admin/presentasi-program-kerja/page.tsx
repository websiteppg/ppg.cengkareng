'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Presentation, Calendar, Users, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ProgramKerja {
  id: string
  tahun: number
  nama_bidang: string
  created_at: string
}

export default function PresentasiProgramKerjaPage() {
  const router = useRouter()
  const [programKerjaList, setProgramKerjaList] = useState<ProgramKerja[]>([])
  const [kegiatanStats, setKegiatanStats] = useState({ totalKegiatan: 0, kegiatanByTahun: {} as any })
  const [selectedTahun, setSelectedTahun] = useState<string>('')
  const [selectedBidang, setSelectedBidang] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgramKerja()
  }, [])

  const fetchProgramKerja = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        console.error('Supabase client is null')
        return
      }
      
      console.log('Fetching program kerja...')
      
      // Fetch directly from Supabase
      const { data, error } = await supabase
        .from('program_kerja_tahunan')
        .select(`
          tahun,
          kegiatan_bidang!inner(
            nama_bidang
          )
        `)
        .is('kegiatan_bidang.deleted_at', null)
      
      console.log('Direct Supabase query result:', { data, error })
      
      // Transform to get unique tahun-bidang combinations
      const combinations: any[] = []
      const kegiatanByTahun: any = {}
      let totalKegiatan = 0
      
      if (data) {
        data.forEach((program: any) => {
          program.kegiatan_bidang.forEach((kegiatan: any) => {
            // Count total kegiatan
            totalKegiatan++
            
            // Count kegiatan by tahun
            if (!kegiatanByTahun[program.tahun]) {
              kegiatanByTahun[program.tahun] = 0
            }
            kegiatanByTahun[program.tahun]++
            
            // Get unique tahun-bidang combinations
            const existing = combinations.find(c => 
              c.tahun === program.tahun && c.nama_bidang === kegiatan.nama_bidang
            )
            if (!existing) {
              combinations.push({
                tahun: program.tahun,
                nama_bidang: kegiatan.nama_bidang
              })
            }
          })
        })
      }
      
      // Set kegiatan statistics
      setKegiatanStats({ totalKegiatan, kegiatanByTahun })
      
      console.log('Transformed combinations:', combinations)
      
      const transformedData = combinations

      console.log('API response:', { data, error })
      console.log('Transformed data:', transformedData)
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Program Kerja Data:', transformedData)
      console.log('Data length:', transformedData?.length)
      setProgramKerjaList(transformedData || [])
    } catch (error) {
      console.error('Error fetching program kerja:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debug uniqueTahun
  console.log('programKerjaList:', programKerjaList)
  console.log('programKerjaList.length:', programKerjaList.length)
  
  const uniqueTahun = programKerjaList.length > 0 
    ? Array.from(new Set(programKerjaList.map(p => p.tahun))).sort((a, b) => b - a)
    : [2024, 2025, 2026] // Default tahun jika tidak ada data
    
  console.log('uniqueTahun:', uniqueTahun)
  const bidangByTahun = selectedTahun ? 
    Array.from(new Set(programKerjaList
      .filter(p => p.tahun === parseInt(selectedTahun))
      .map(p => p.nama_bidang))) : []

  const handleStartPresentation = () => {
    if (selectedTahun && selectedBidang) {
      router.push(`/admin/presentasi-program-kerja/${selectedTahun}/${encodeURIComponent(selectedBidang)}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Viewer Role Check */}
        {(() => {
          const userData = typeof window !== 'undefined' ? localStorage.getItem('admin_user') : null
          const currentUser = userData ? JSON.parse(userData) : null
          
          if (currentUser?.role === 'viewer') {
            // Redirect viewer directly to presentation
            if (typeof window !== 'undefined') {
              window.location.href = '/admin/presentasi-program-kerja/2026/PENGURUS_HARIAN'
            }
            return null
          }
          return null
        })()}
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full mr-4">
              <Presentation className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">Presentasi Program Kerja</h1>
          </div>
          <p className="text-xl text-gray-600">PPG Jakarta Barat Cengkareng</p>
          <p className="text-lg text-gray-500 mt-2">Presentasi Musyawarah PPG Daerah - Sabtu Malam Minggu ke-4</p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Tahun Selection */}
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Calendar className="h-5 w-5 mr-2" />
                Pilih Tahun
              </CardTitle>
              <CardDescription>Tahun program kerja yang akan dipresentasikan</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTahun} onValueChange={setSelectedTahun}>
                <SelectTrigger className="w-full h-12 text-lg">
                  <SelectValue placeholder="Pilih Tahun..." />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTahun.map((tahun) => (
                    <SelectItem key={tahun} value={tahun.toString()} className="text-lg">
                      {tahun}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Bidang Selection */}
          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Users className="h-5 w-5 mr-2" />
                Pilih Bidang
              </CardTitle>
              <CardDescription>Bidang PPG yang akan dipresentasikan</CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={selectedBidang} 
                onValueChange={setSelectedBidang}
                disabled={!selectedTahun || bidangByTahun.length === 0}
              >
                <SelectTrigger className="w-full h-12 text-lg">
                  <SelectValue placeholder={
                    !selectedTahun ? "Pilih tahun terlebih dahulu" :
                    bidangByTahun.length === 0 ? "Tidak ada bidang untuk tahun ini" :
                    "Pilih Bidang..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {bidangByTahun.map((bidang) => (
                    <SelectItem key={bidang} value={bidang} className="text-lg">
                      {bidang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        {programKerjaList.length === 0 && !loading && (
          <Card className="mb-8 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-700">⚠️ Tidak Ada Data Program Kerja</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-600 mb-4">
                Belum ada program kerja yang dibuat. Silakan buat program kerja terlebih dahulu di menu "Program Kerja PPG".
              </p>
              <Button 
                onClick={() => router.push('/admin/presentasi-program-kerja/debug')}
                variant="outline"
                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                🔧 Debug Database
              </Button>
            </CardContent>
          </Card>
        )}
        


        {/* Statistics */}
        {selectedTahun && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <TrendingUp className="h-5 w-5 mr-2" />
                Statistik Tahun {selectedTahun}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{uniqueTahun.length}</div>
                  <div className="text-sm text-gray-600">Total Tahun</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{bidangByTahun.length}</div>
                  <div className="text-sm text-gray-600">Total Bidang</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{kegiatanStats.kegiatanByTahun[selectedTahun] || 0}</div>
                  <div className="text-sm text-gray-600">Kegiatan {selectedTahun}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{kegiatanStats.totalKegiatan}</div>
                  <div className="text-sm text-gray-600">Total Kegiatan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start Button */}
        <div className="text-center">
          <Button
            onClick={handleStartPresentation}
            disabled={!selectedTahun || !selectedBidang}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-xl font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Presentation className="h-6 w-6 mr-2" />
            Mulai Presentasi
          </Button>
          {(!selectedTahun || !selectedBidang) && (
            <p className="text-gray-500 mt-2">Pilih tahun dan bidang untuk memulai presentasi</p>
          )}
        </div>
      </div>
    </div>
  )
}