import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const sessionId = params.id

    // Get session details with participants and attendance
    const { data: session, error: sessionError } = await supabase
      .from('sesi_musyawarah')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesi tidak ditemukan' }, { status: 404 })
    }

    // Get participants for this session
    const { data: participants, error: participantsError } = await supabase
      .from('sesi_peserta')
      .select(`
        peserta:peserta_id(
          id, nama, email, jabatan, instansi
        )
      `)
      .eq('sesi_id', sessionId)

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 })
    }

    // Get attendance data
    const { data: attendance, error: attendanceError } = await supabase
      .from('absensi')
      .select('peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sessionId)

    if (attendanceError) {
      return NextResponse.json({ error: attendanceError.message }, { status: 500 })
    }

    // Map attendance by peserta_id
    const attendanceMap = new Map()
    attendance?.forEach((item: any) => {
      attendanceMap.set(item.peserta_id, item)
    })

    // Combine participants with attendance status
    const participantsWithAttendance = participants?.map((p: any) => ({
      ...p.peserta,
      attendance: attendanceMap.get(p.peserta.id) || null
    })) || []

    return NextResponse.json({
      session,
      participants: participantsWithAttendance
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}