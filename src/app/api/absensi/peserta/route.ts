import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const username = request.nextUrl.searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username wajib diisi' },
        { status: 400 }
      )
    }
    
    console.log('Searching for username:', username)

    // Find peserta by email (used as username) - try different approaches
    let peserta = null
    let pesertaError = null
    
    // Try exact match first
    const { data: exactMatch, error: exactError } = await (supabase as any)
      .from('peserta')
      .select('id, nama, email, jabatan, instansi')
      .eq('email', username)
      .eq('role', 'peserta')
      .single()
    
    if (exactMatch) {
      peserta = exactMatch
    } else {
      // Try case-insensitive search
      const { data: caseInsensitive, error: caseError } = await (supabase as any)
        .from('peserta')
        .select('id, nama, email, jabatan, instansi')
        .ilike('email', username)
        .eq('role', 'peserta')
        .single()
      
      if (caseInsensitive) {
        peserta = caseInsensitive
      } else {
        pesertaError = exactError || caseError
      }
    }

    if (pesertaError || !peserta) {
      return NextResponse.json(
        { error: 'Username tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get sessions that this peserta is invited to
    const { data: sessions, error: sessionsError } = await (supabase as any)
      .from('sesi_peserta')
      .select(`
        sesi_id,
        sesi_musyawarah:sesi_id (
          id,
          nama_sesi,
          tanggal,
          waktu_mulai,
          waktu_selesai,
          lokasi,
          status
        )
      `)
      .eq('peserta_id', peserta.id)

    if (sessionsError) {
      console.error('Sessions error:', sessionsError)
      return NextResponse.json(
        { error: 'Gagal memuat sesi' },
        { status: 500 }
      )
    }

    // Get attendance status for each session
    const sessionIds = sessions?.map((s: any) => s.sesi_musyawarah.id) || []
    const { data: attendanceRecords } = await (supabase as any)
      .from('absensi')
      .select('sesi_id, status_kehadiran')
      .eq('peserta_id', peserta.id)
      .in('sesi_id', sessionIds)

    // Combine session data with attendance status
    const sessionsWithStatus = sessions?.map((s: any) => ({
      id: s.sesi_musyawarah.id,
      nama_sesi: s.sesi_musyawarah.nama_sesi,
      tanggal: s.sesi_musyawarah.tanggal,
      waktu_mulai: s.sesi_musyawarah.waktu_mulai,
      waktu_selesai: s.sesi_musyawarah.waktu_selesai,
      lokasi: s.sesi_musyawarah.lokasi,
      status_absensi: attendanceRecords?.find((a: any) => a.sesi_id === s.sesi_musyawarah.id)?.status_kehadiran || null
    })).filter((s: any) => s.id) // Filter out null sessions

    return NextResponse.json({
      peserta: {
        ...peserta,
        bidang: peserta.instansi // Map instansi to bidang for consistency
      },
      sessions: sessionsWithStatus || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}