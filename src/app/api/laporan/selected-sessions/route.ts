import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { sessionIds } = body

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json({ error: 'Session IDs required' }, { status: 400 })
    }

    // Get selected sessions with participants and attendance
    const { data: sessions, error: sessionsError } = await supabase
      .from('sesi_musyawarah')
      .select('*')
      .in('id', sessionIds)
      .order('tanggal', { ascending: true })

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 })
    }

    // Get participants for selected sessions
    const { data: participants, error: participantsError } = await supabase
      .from('sesi_peserta')
      .select(`
        sesi_id,
        peserta:peserta_id(
          id, nama, email, jabatan, instansi
        )
      `)
      .in('sesi_id', sessionIds)

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 })
    }

    // Get attendance for selected sessions
    const { data: attendance, error: attendanceError } = await supabase
      .from('absensi')
      .select('sesi_id, peserta_id, status_kehadiran, waktu_absen')
      .in('sesi_id', sessionIds)

    if (attendanceError) {
      return NextResponse.json({ error: attendanceError.message }, { status: 500 })
    }

    // Group data by session
    const sessionsWithData = sessions?.map((session: any) => {
      const sessionParticipants = participants?.filter((p: any) => p.sesi_id === session.id) || []
      const sessionAttendance = attendance?.filter((a: any) => a.sesi_id === session.id) || []
      
      const attendanceMap = new Map()
      sessionAttendance.forEach((item: any) => {
        attendanceMap.set(item.peserta_id, item)
      })

      const participantsWithAttendance = sessionParticipants.map((p: any) => ({
        ...p.peserta,
        attendance: attendanceMap.get(p.peserta.id) || { status_kehadiran: 'ghoib' }
      }))

      return {
        ...session,
        participants: participantsWithAttendance
      }
    }) || []

    return NextResponse.json({ data: sessionsWithData })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}