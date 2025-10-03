'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar, 
  Target, 
  FileText, 
  DollarSign, 
  Download, 
  Maximize, 
  BarChart3,
  PieChart,
  Presentation,
  QrCode,
  StickyNote,
  ChevronDown,
  Navigation,
  Eye,
  EyeOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { BiayaChart } from '@/components/admin/BiayaChart'
import { KategoriBiayaChart } from '@/components/admin/KategoriBiayaChart'
import { AutoAdvancePresentation } from '@/components/admin/AutoAdvancePresentation'
import { exportPresentationPDF } from '@/lib/export-presentation'
import { exportPowerPointPresentation } from '@/lib/export-powerpoint'

interface KegiatanBidang {
  id: string
  no_urut: number
  nama_kegiatan: string
  bulan: string
  tujuan_kegiatan: string
  keterangan: string
  alokasi_dana: number
  rincian_biaya?: any
}

interface ProgramKerja {
  id: string
  tahun: number
  nama_bidang: string
  kegiatan_bidang: KegiatanBidang[]
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const formatBidangName = (bidang: string) => {
  return bidang.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default function PresentasiTimelinePage() {
  const params = useParams()
  const tahun = params.tahun as string
  const bidang = decodeURIComponent(params.bidang as string)
  
  const [programKerja, setProgramKerja] = useState<ProgramKerja | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanBidang | null>(null)
  const [presentationMode, setPresentationMode] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [autoAdvanceMode, setAutoAdvanceMode] = useState(false)
  const [showFloatingNav, setShowFloatingNav] = useState(true)
  const [availableBidang, setAvailableBidang] = useState<string[]>([])

  useEffect(() => {
    fetchProgramKerja()
    fetchAvailableBidang()
  }, [tahun, bidang])

  const fetchAvailableBidang = async () => {
    try {
      const supabase = createClient()
      if (!supabase) return
      
      const { data, error } = await supabase
        .from('program_kerja_tahunan')
        .select(`
          kegiatan_bidang!inner (
            nama_bidang
          )
        `)
        .eq('tahun', parseInt(tahun))
        .is('kegiatan_bidang.deleted_at', null)
        .single()

      if (data && (data as any).kegiatan_bidang) {
        const uniqueBidang = Array.from(new Set(
          (data as any).kegiatan_bidang.map((k: any) => k.nama_bidang as string)
        )).sort() as string[]
        setAvailableBidang(uniqueBidang)
      }
    } catch (error) {
      console.error('Error fetching available bidang:', error)
    }
  }

  const handleBidangChange = (newBidang: string) => {
    if (newBidang !== bidang) {
      window.location.href = `/admin/presentasi-program-kerja/${tahun}/${encodeURIComponent(newBidang)}`
    }
  }

  const fetchProgramKerja = async () => {
    try {
      const supabase = createClient()
      if (!supabase) return
      
      // Query program_kerja_tahunan with filtered kegiatan_bidang
      const { data, error } = await supabase
        .from('program_kerja_tahunan')
        .select(`
          *,
          kegiatan_bidang!inner (
            *,
            rincian_biaya (*)
          )
        `)
        .eq('tahun', parseInt(tahun))
        .eq('kegiatan_bidang.nama_bidang', bidang)
        .is('kegiatan_bidang.deleted_at', null)
        .single()

      if (error) throw error
      console.log('Fetched program kerja data:', JSON.stringify(data, null, 2))
      setProgramKerja(data)
    } catch (error) {
      console.error('Error fetching program kerja:', error)
    } finally {
      setLoading(false)
    }
  }

  const getKegiatanByMonth = (month: string) => {
    return programKerja?.kegiatan_bidang?.filter(k => k.bulan?.toUpperCase() === month.toUpperCase()) || []
  }

  const getTotalBiayaByMonth = (month: string) => {
    const kegiatan = getKegiatanByMonth(month)
    return kegiatan.reduce((total, k) => total + (k.alokasi_dana || 0), 0)
  }

  const getTotalBiayaKeseluruhan = () => {
    return programKerja?.kegiatan_bidang?.reduce((total, k) => total + (k.alokasi_dana || 0), 0) || 0
  }

  const handleExportPDF = async () => {
    if (programKerja) {
      await exportPresentationPDF(programKerja, tahun, bidang)
    }
  }

  const handleExportPowerPoint = async () => {
    if (programKerja) {
      await exportPowerPointPresentation(programKerja, tahun, bidang)
    }
  }

  const generateQRCode = () => {
    const url = window.location.href
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!programKerja) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Program Kerja Tidak Ditemukan</h2>
          <p className="text-gray-600">Program kerja untuk {bidang} tahun {tahun} belum tersedia.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${presentationMode ? 'bg-black text-white' : 'bg-gradient-to-br from-green-50 to-emerald-100'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full mr-4">
              <Presentation className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Program Kerja PPG Jakarta Barat Cengkareng</h1>
          </div>
          <div className="flex items-center justify-center space-x-8 text-xl">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-green-600" />
              <span className="font-semibold">Tahun {tahun}</span>
            </div>
            <div className="flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              <span className="font-semibold">{bidang}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-yellow-600" />
              <span className="font-semibold">{formatCurrency(getTotalBiayaKeseluruhan())}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <Button onClick={() => setShowCharts(!showCharts)} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            {showCharts ? 'Sembunyikan' : 'Tampilkan'} Grafik
          </Button>
          <Button onClick={() => setPresentationMode(!presentationMode)} variant="outline">
            <Maximize className="h-4 w-4 mr-2" />
            Mode {presentationMode ? 'Normal' : 'Presentasi'}
          </Button>
          <Button onClick={() => setAutoAdvanceMode(!autoAdvanceMode)} variant="outline">
            <Presentation className="h-4 w-4 mr-2" />
            {autoAdvanceMode ? 'Timeline' : 'Auto-Advance'}
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportPowerPoint} variant="outline">
            <Presentation className="h-4 w-4 mr-2" />
            Export PowerPoint
          </Button>
          <Button onClick={generateQRCode} variant="outline">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button 
            onClick={() => {
              setShowNotes(!showNotes)
              // Auto scroll to notes panel when opened
              if (!showNotes) {
                setTimeout(() => {
                  const notesPanel = document.getElementById('notes-panel')
                  if (notesPanel) {
                    notesPanel.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }, 100)
              }
            }} 
            variant={showNotes ? "default" : "outline"}
            className={showNotes ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            <StickyNote className="h-4 w-4 mr-2" />
            {showNotes ? 'Sembunyikan Catatan' : 'Tampilkan Catatan'}
          </Button>
        </div>

        {/* Auto-Advance Presentation */}
        {autoAdvanceMode ? (
          <AutoAdvancePresentation 
            programKerja={programKerja}
            tahun={tahun}
            bidang={bidang}
          />
        ) : (
          <>
            {/* Charts Section */}
            {showCharts && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Biaya per Bulan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BiayaChart kegiatan={programKerja.kegiatan_bidang} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Kategori Biaya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KategoriBiayaChart kegiatan={programKerja.kegiatan_bidang} />
              </CardContent>
            </Card>
          </div>
        )}

            {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MONTHS.map((month, index) => {
            const kegiatanBulan = getKegiatanByMonth(month)
            const totalBiaya = getTotalBiayaByMonth(month)
            
            return (
              <Card key={month} className={`${presentationMode ? 'bg-gray-800 border-gray-600' : 'bg-white'} hover:shadow-lg transition-shadow`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-center">
                    {month} {tahun}
                  </CardTitle>
                  {totalBiaya > 0 && (
                    <div className="text-center">
                      <Badge className="bg-gray-100 text-gray-800 text-sm">
                        {formatCurrency(totalBiaya)}
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {kegiatanBulan.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Tidak ada kegiatan</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {kegiatanBulan.map((kegiatan) => (
                        <Dialog key={kegiatan.id}>
                          <DialogTrigger asChild>
                            <div className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="font-semibold text-sm mb-1">
                                {kegiatan.no_urut}. {kegiatan.nama_kegiatan}
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {formatCurrency(kegiatan.alokasi_dana)}
                              </div>
                              <Badge className="border border-gray-300 text-xs">
                                Klik untuk Detail
                              </Badge>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl">
                                {kegiatan.no_urut}. {kegiatan.nama_kegiatan}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Bulan Pelaksanaan
                                  </h4>
                                  <p className="text-gray-700">{kegiatan.bulan}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Total Biaya
                                  </h4>
                                  <p className="text-green-600 font-bold text-lg">
                                    {formatCurrency(kegiatan.alokasi_dana)}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  Tujuan Kegiatan
                                </h4>
                                <p className="text-gray-700">{kegiatan.tujuan_kegiatan}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Keterangan
                                </h4>
                                <p className="text-gray-700">{kegiatan.keterangan}</p>
                              </div>

                              {/* Rincian Biaya */}
                              <div>
                                <h4 className="font-semibold mb-3">Rincian Biaya</h4>
                                {kegiatan.rincian_biaya && kegiatan.rincian_biaya.length > 0 ? (
                                  <div className="space-y-2">
                                    {kegiatan.rincian_biaya.map((item: any, index: number) => (
                                      <div key={index} className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-2 rounded">
                                        <div><strong>{item.nama_item}:</strong></div>
                                        <div>{formatCurrency(item.sub_total || 0)}</div>
                                        <div className="text-xs text-gray-600 col-span-2">
                                          {item.jumlah} × {formatCurrency(item.harga_satuan)} × {item.hari_kegiatan} hari × {item.frekuensi} kali
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 text-sm">
                                    Tidak ada rincian biaya detail. Total alokasi: {formatCurrency(kegiatan.alokasi_dana)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

            {/* Notes Panel */}
            {showNotes && (
              <Card id="notes-panel" className="mt-8 border-2 border-blue-200 bg-blue-50 shadow-lg">
                <CardHeader className="bg-blue-100">
                  <CardTitle className="flex items-center text-blue-800">
                    <StickyNote className="h-5 w-5 mr-2" />
                    Catatan Presenter
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      <span><strong>Total kegiatan:</strong> {programKerja.kegiatan_bidang.length} kegiatan</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                      <span><strong>Total anggaran:</strong> {formatCurrency(getTotalBiayaKeseluruhan())}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                      <span><strong>Periode:</strong> Januari - Desember {tahun}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                      <span><strong>Bidang:</strong> {bidang}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                      <span><strong>Event:</strong> Musyawarah PPG Daerah - Sabtu Malam Minggu ke-4</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Floating Navigation Panel */}
      {showFloatingNav && !autoAdvanceMode && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Navigation className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Navigasi Bidang</span>
              </div>
              <button
                onClick={() => setShowFloatingNav(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Sembunyikan Panel"
              >
                <EyeOff className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-gray-500 mb-2">
                Tahun {tahun} • {availableBidang.length} bidang tersedia
              </div>
              
              <select
                value={bidang}
                onChange={(e) => handleBidangChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableBidang.map((b) => (
                  <option key={b} value={b}>
                    {formatBidangName(b)}
                  </option>
                ))}
              </select>
              
              <div className="text-xs text-gray-400 mt-2">
                Bidang aktif: <span className="font-medium text-blue-600">
                  {formatBidangName(bidang)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Floating Panel Button (when hidden) */}
      {!showFloatingNav && !autoAdvanceMode && (
        <button
          onClick={() => setShowFloatingNav(true)}
          className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Tampilkan Navigasi Bidang"
        >
          <Eye className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}