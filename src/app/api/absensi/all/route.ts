import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: attendanceRecords, error } = await (supabase as any)
      .from('absensi')
      .select(`
        id,
        waktu_absen,
        status_kehadiran,
        catatan,
        ip_address,
        peserta!inner(nama, email, instansi),
        sesi_musyawarah!inner(nama_sesi, tanggal, waktu_mulai)
      `)
      .order('waktu_absen', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memuat data absensi' },
        { status: 500 }
      )
    }

    return NextResponse.json(attendanceRecords || [])

  } catch (error) {
    console.error('Get all attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}