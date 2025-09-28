import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get all sessions with participant count and attendance stats
    const { data: sessions, error } = await supabase
      .from('sesi_musyawarah')
      .select(`
        *,
        sesi_peserta(count),
        absensi(status_kehadiran)
      `)
      .order('tanggal', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate stats for each session
    const sessionsWithStats = sessions?.map((session: any) => {
      const totalPeserta = session.sesi_peserta?.[0]?.count || 0
      const absensiData = session.absensi || []
      
      const hadir = absensiData.filter((a: any) => a.status_kehadiran === 'hadir').length
      const terlambat = absensiData.filter((a: any) => a.status_kehadiran === 'terlambat').length
      const izin = absensiData.filter((a: any) => a.status_kehadiran === 'izin').length
      const sakit = absensiData.filter((a: any) => a.status_kehadiran === 'sakit').length
      const ghoib = totalPeserta - (hadir + terlambat + izin + sakit)

      return {
        ...session,
        stats: {
          total_peserta: totalPeserta,
          hadir,
          terlambat,
          izin,
          sakit,
          ghoib
        }
      }
    }) || []

    return NextResponse.json({ data: sessionsWithStats })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}