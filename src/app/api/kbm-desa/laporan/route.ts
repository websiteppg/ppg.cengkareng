import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// createClient already imported

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periode = searchParams.get('periode')
    const desaId = searchParams.get('desa_id')
    const kelompok = searchParams.get('kelompok')
    const userRole = searchParams.get('role')

    const supabase = createClient()

    let query = supabase
      .from('laporan_kbm_desa')
      .select('*')

    if (periode) query = query.eq('periode', periode)
    if (desaId) query = query.eq('desa_id', desaId)
    if (kelompok) query = query.eq('kelompok', kelompok)

    // Filter berdasarkan role KBM Desa
    if (userRole && userRole.startsWith('kbm_desa_')) {
      const allowedDesaId = userRole.replace('kbm_desa_', '')
      query = query.eq('desa_id', allowedDesaId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data || []
    })
  } catch (error) {
    console.error('Error fetching laporan KBM:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data laporan' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      desa_id, 
      kelompok, 
      periode, 
      kategori_program,
      jumlah_murid,
      jumlah_kelas,
      persentase_kehadiran,
      pencapaian_target_materi,
      pertemuan_kbm_kali,
      sarpras,
      tahfidz,
      pengajar_mt_ms,
      created_by
    } = body

    // Validasi field wajib
    if (!desa_id || !kelompok || !periode || !kategori_program || 
        jumlah_murid === undefined || jumlah_kelas === undefined ||
        persentase_kehadiran === undefined || pencapaian_target_materi === undefined ||
        pertemuan_kbm_kali === undefined || !sarpras || !tahfidz || !pengajar_mt_ms) {
      return NextResponse.json(
        { success: false, error: 'Field wajib tidak lengkap' },
        { status: 400 }
      )
    }

    // Validasi persentase
    if (persentase_kehadiran < 0 || persentase_kehadiran > 100 ||
        pencapaian_target_materi < 0 || pencapaian_target_materi > 100) {
      return NextResponse.json(
        { success: false, error: 'Persentase harus antara 0-100' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await (supabase as any)
      .from('laporan_kbm_desa')
      .insert({
        desa_id,
        kelompok,
        periode,
        kategori_program,
        jumlah_murid,
        jumlah_kelas,
        persentase_kehadiran,
        pencapaian_target_materi,
        pertemuan_kbm_kali,
        sarpras,
        tahfidz,
        pengajar_mt_ms,
        created_by
      })
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data[0]
    })
  } catch (error) {
    console.error('Error creating laporan KBM:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan laporan' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      jumlah_murid,
      jumlah_kelas,
      persentase_kehadiran,
      pencapaian_target_materi,
      pertemuan_kbm_kali,
      sarpras,
      tahfidz,
      pengajar_mt_ms
    } = body

    // Validasi persentase
    if (persentase_kehadiran < 0 || persentase_kehadiran > 100 ||
        pencapaian_target_materi < 0 || pencapaian_target_materi > 100) {
      return NextResponse.json(
        { success: false, error: 'Persentase harus antara 0-100' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await (supabase as any)
      .from('laporan_kbm_desa')
      .update({
        jumlah_murid,
        jumlah_kelas,
        persentase_kehadiran,
        pencapaian_target_materi,
        pertemuan_kbm_kali,
        sarpras,
        tahfidz,
        pengajar_mt_ms,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data[0]
    })
  } catch (error) {
    console.error('Error updating laporan KBM:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate laporan' },
      { status: 500 }
    )
  }
}
