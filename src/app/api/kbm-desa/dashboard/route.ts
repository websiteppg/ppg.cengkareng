import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const createClient = createServerClient

const DESA_LIST = [
  { id: 'kalideres', nama: 'Kalideres', kelompok_count: 5 },
  { id: 'bandara', nama: 'Bandara', kelompok_count: 3 },
  { id: 'kebon_jahe', nama: 'Kebon Jahe', kelompok_count: 4 },
  { id: 'cengkareng', nama: 'Cengkareng', kelompok_count: 3 },
  { id: 'kapuk_melati', nama: 'Kapuk Melati', kelompok_count: 3 },
  { id: 'taman_kota', nama: 'Taman Kota', kelompok_count: 4 },
  { id: 'jelambar', nama: 'Jelambar', kelompok_count: 4 },
  { id: 'cipondoh', nama: 'Cipondoh', kelompok_count: 4 }
]

export async function GET(request: NextRequest) {
  try {
    const periode = request.nextUrl.searchParams.get('periode')
    const desaId = request.nextUrl.searchParams.get('desa_id')
    const userRole = request.nextUrl.searchParams.get('role')

    if (!periode) {
      return NextResponse.json(
        { success: false, error: 'Periode wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Filter desa berdasarkan role
    let allowedDesa = DESA_LIST
    if (userRole && userRole.startsWith('kbm_desa_')) {
      const allowedDesaId = userRole.replace('kbm_desa_', '')
      allowedDesa = DESA_LIST.filter(d => d.id === allowedDesaId)
    }
    if (desaId && desaId !== 'all') {
      allowedDesa = allowedDesa.filter(d => d.id === desaId)
    }

    // Query data laporan
    let query = supabase
      .from('laporan_kbm_desa')
      .select('*')
      .eq('periode', periode)

    if (allowedDesa.length === 1) {
      query = query.eq('desa_id', allowedDesa[0].id)
    } else if (allowedDesa.length > 1) {
      query = query.in('desa_id', allowedDesa.map(d => d.id))
    }

    const { data: laporanData, error } = await query

    if (error) throw error

    // Hitung statistik
    const totalKelompok = allowedDesa.reduce((sum, desa) => sum + desa.kelompok_count, 0)
    const totalDataInput = laporanData?.length || 0
    
    // Hitung rata-rata kehadiran dan pencapaian
    let rataKehadiran = 0
    let rataPencapaian = 0
    
    if (laporanData && laporanData.length > 0) {
      const totalKehadiran = laporanData.reduce((sum: number, item: any) => sum + (item.persentase_kehadiran || 0), 0)
      const totalPencapaian = laporanData.reduce((sum: number, item: any) => sum + (item.pencapaian_target_materi || 0), 0)
      
      rataKehadiran = Math.round((totalKehadiran / laporanData.length) * 100) / 100
      rataPencapaian = Math.round((totalPencapaian / laporanData.length) * 100) / 100
    }

    // Progress by desa
    const progressByDesa = allowedDesa.map(desa => {
      const desaData = laporanData?.filter((item: any) => item.desa_id === desa.id) || []
      const kelompokWithData = new Set(desaData.map((item: any) => item.kelompok))
      const lengkap = kelompokWithData.size
      const total = desa.kelompok_count
      const persentase = total > 0 ? Math.round((lengkap / total) * 100) : 0

      return {
        nama: desa.nama,
        lengkap,
        total,
        persentase
      }
    })

    // Kategori stats
    const kategoriStats = [
      { 
        name: 'PAUD/CBR', 
        value: laporanData?.filter((item: any) => item.kategori_program === 'paud_cbr').length || 0,
        color: '#8884d8' 
      },
      { 
        name: 'Pra Remaja', 
        value: laporanData?.filter((item: any) => item.kategori_program === 'pra_remaja').length || 0,
        color: '#82ca9d' 
      },
      { 
        name: 'Remaja', 
        value: laporanData?.filter((item: any) => item.kategori_program === 'remaja').length || 0,
        color: '#ffc658' 
      },
      { 
        name: 'Pra Nikah', 
        value: laporanData?.filter((item: any) => item.kategori_program === 'pra_nikah').length || 0,
        color: '#ff7300' 
      }
    ]

    // Trend bulanan (ambil 3 bulan terakhir)
    const trendBulanan = await getTrendBulanan(supabase, periode, allowedDesa.map(d => d.id))

    return NextResponse.json({
      success: true,
      data: {
        totalKelompok,
        totalDataInput,
        rataKehadiran,
        rataPencapaian,
        progressByDesa,
        kategoriStats,
        trendBulanan
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data dashboard' },
      { status: 500 }
    )
  }
}

async function getTrendBulanan(supabase: any, currentPeriode: string, desaIds: string[]) {
  const [year, month] = currentPeriode.split('-').map(Number)
  const trends = []

  // Ambil 3 bulan terakhir
  for (let i = 2; i >= 0; i--) {
    let targetYear = year
    let targetMonth = month - i
    
    if (targetMonth <= 0) {
      targetMonth += 12
      targetYear -= 1
    }
    
    const targetPeriode = `${targetYear}-${String(targetMonth).padStart(2, '0')}`
    
    let query = supabase
      .from('laporan_kbm_desa')
      .select('persentase_kehadiran, pencapaian_target_materi')
      .eq('periode', targetPeriode)
    
    if (desaIds.length > 0) {
      query = query.in('desa_id', desaIds)
    }
    
    const { data } = await query
    
    let avgKehadiran = 0
    let avgPencapaian = 0
    
    if (data && data.length > 0) {
      avgKehadiran = Math.round((data.reduce((sum: number, item: any) => sum + (item.persentase_kehadiran || 0), 0) / data.length) * 100) / 100
      avgPencapaian = Math.round((data.reduce((sum: number, item: any) => sum + (item.pencapaian_target_materi || 0), 0) / data.length) * 100) / 100
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    
    trends.push({
      bulan: `${monthNames[targetMonth - 1]} ${targetYear}`,
      kehadiran: avgKehadiran,
      pencapaian: avgPencapaian
    })
  }

  return trends
}