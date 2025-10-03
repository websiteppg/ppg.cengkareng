import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get all sessions with basic info
    const { data: sessions, error: sessionsError } = await supabase
      .from('sesi_musyawarah')
      .select(`
        id,
        nama_sesi,
        tanggal,
        waktu_mulai,
        waktu_selesai,
        lokasi,
        tipe,
        status,
        maksimal_peserta
      `)
      .order('tanggal', { ascending: false })

    if (sessionsError) {
      throw sessionsError
    }

    // Get attendance stats for each session
    const sessionsWithStats = await Promise.all(
      (sessions || []).map(async (session: any) => {
        // Get total assigned participants
        const { count: totalPeserta } = await supabase
          .from('sesi_peserta')
          .select('*', { count: 'exact' })
          .eq('sesi_id', session.id)

        // Get attendance breakdown
        const { data: attendanceData } = await supabase
          .from('absensi')
          .select('status_kehadiran')
          .eq('sesi_id', session.id)

        // Count by status
        const stats = {
          total_peserta: totalPeserta || 0,
          hadir: 0,
          terlambat: 0,
          izin: 0,
          sakit: 0,
          tidak_hadir: 0
        }

        if (attendanceData) {
          attendanceData.forEach((record: any) => {
            switch (record.status_kehadiran) {
              case 'hadir':
                stats.hadir++
                break
              case 'terlambat':
                stats.terlambat++
                break
              case 'izin':
                stats.izin++
                break
              case 'sakit':
                stats.sakit++
                break
              default:
                stats.tidak_hadir++
            }
          })
        }

        // Calculate tidak_hadir (assigned but no attendance record)
        const totalAttended = stats.hadir + stats.terlambat + stats.izin + stats.sakit
        stats.tidak_hadir = Math.max(0, stats.total_peserta - totalAttended)

        return {
          ...session,
          stats
        }
      })
    )

    return NextResponse.json(sessionsWithStats)
  } catch (error) {
    console.error('Sessions with stats API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}