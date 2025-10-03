import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tahun = searchParams.get('tahun')
    const bidang = searchParams.get('bidang')

    if (!tahun || !bidang) {
      return NextResponse.json(
        { error: 'Tahun dan bidang harus diisi' },
        { status: 400 }
      )
    }

    // Fetch program kerja dengan kegiatan dan rincian biaya
    const supabase = createClient()
    
    // Use correct table names
    const { data: programKerja, error } = await supabase
      .from('program_kerja_tahunan')
      .select(`
        *,
        kegiatan_bidang (
          *,
          rincian_biaya (*)
        )
      `)
      .eq('tahun', parseInt(tahun))
      .eq('nama_bidang', bidang)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Program kerja tidak ditemukan' },
        { status: 404 }
      )
    }

    // Sort kegiatan by no_urut
    if (programKerja && (programKerja as any).kegiatan_bidang) {
      (programKerja as any).kegiatan_bidang.sort((a: any, b: any) => a.no_urut - b.no_urut)
    }

    return NextResponse.json({
      success: true,
      data: programKerja
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, tahun, bidang, kegiatanId } = body

    if (action === 'get_statistics') {
      // Get statistics for presentation
      const supabase = createClient()
      
      // Use correct table names
      const { data: programKerja, error } = await supabase
        .from('program_kerja_tahunan')
        .select(`
          *,
          kegiatan_bidang (
            id,
            bulan,
            total_alokasi,
            rincian_biaya (*)
          )
        `)
        .eq('tahun', parseInt(tahun))
        .eq('nama_bidang', bidang)
        .single()

      if (error) throw error

      const kegiatan = (programKerja as any)?.kegiatan_bidang || []
      const totalBiaya = kegiatan.reduce((sum: number, k: any) => sum + (k.total_alokasi || 0), 0)
      const totalKegiatan = kegiatan.length

      // Biaya per bulan
      const biayaPerBulan = kegiatan.reduce((acc: any, k: any) => {
        acc[k.bulan] = (acc[k.bulan] || 0) + (k.total_alokasi || 0)
        return acc
      }, {})

      // Kategori biaya
      const kategoriBiaya = kegiatan.reduce((acc: any, k: any) => {
        if (k.rincian_biaya) {
          acc['Konsumsi'] = (acc['Konsumsi'] || 0) + (k.rincian_biaya.konsumsi || 0)
          acc['Akomodasi'] = (acc['Akomodasi'] || 0) + (k.rincian_biaya.akomodasi || 0)
          acc['Dokumentasi'] = (acc['Dokumentasi'] || 0) + (k.rincian_biaya.dokumentasi || 0)
          acc['Lainnya'] = (acc['Lainnya'] || 0) + (k.rincian_biaya.extra_biaya || 0)
        } else {
          acc['Lainnya'] = (acc['Lainnya'] || 0) + (k.total_alokasi || 0)
        }
        return acc
      }, {})

      return NextResponse.json({
        success: true,
        data: {
          totalBiaya,
          totalKegiatan,
          biayaPerBulan,
          kategoriBiaya,
          kegiatan
        }
      })
    }

    return NextResponse.json(
      { error: 'Action tidak valid' },
      { status: 400 }
    )

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}