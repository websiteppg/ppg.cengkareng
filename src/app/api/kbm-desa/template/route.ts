import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// createClient already imported

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const desaId = searchParams.get('desa_id')
    const kelompok = searchParams.get('kelompok')
    const periode = searchParams.get('periode')

    if (!desaId || !kelompok || !periode) {
      return NextResponse.json(
        { success: false, error: 'Parameter tidak lengkap' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Ambil data dari periode sebelumnya
    const { data, error } = await supabase
      .from('laporan_kbm_desa')
      .select('*')
      .eq('desa_id', desaId)
      .eq('kelompok', kelompok)
      .eq('periode', periode)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Error fetching template data:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data template' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      source_periode,
      target_periode,
      desa_id,
      kelompok,
      created_by
    } = body

    if (!source_periode || !target_periode || !desa_id || !kelompok) {
      return NextResponse.json(
        { success: false, error: 'Parameter tidak lengkap' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Ambil data dari periode sumber
    const { data: sourceData, error: fetchError } = await supabase
      .from('laporan_kbm_desa')
      .select('*')
      .eq('desa_id', desa_id)
      .eq('kelompok', kelompok)
      .eq('periode', source_periode)

    if (fetchError) throw fetchError

    if (!sourceData || sourceData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data template tidak ditemukan' },
        { status: 404 }
      )
    }

    // Copy data ke periode target
    const insertData = sourceData.map((item: any) => ({
      desa_id: item.desa_id,
      kelompok: item.kelompok,
      periode: target_periode,
      kategori_program: item.kategori_program,
      jumlah_murid: item.jumlah_murid,
      jumlah_kelas: item.jumlah_kelas,
      persentase_kehadiran: item.persentase_kehadiran,
      pencapaian_target_materi: item.pencapaian_target_materi,
      pertemuan_kbm_kali: item.pertemuan_kbm_kali,
      sarpras: item.sarpras,
      tahfidz: item.tahfidz,
      pengajar_mt_ms: item.pengajar_mt_ms,
      laporan_musyawarah: null, // Reset laporan
      kendala_saran: null, // Reset kendala
      created_by
    }))

    const { data, error } = await (supabase as any)
      .from('laporan_kbm_desa')
      .insert(insertData)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data,
      message: `Berhasil copy ${data.length} data dari periode ${source_periode}`
    })
  } catch (error) {
    console.error('Error copying template data:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal copy data template' },
      { status: 500 }
    )
  }
}
