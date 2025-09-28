import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sesiId: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.sesiId

    // Debug info for session
    const { data: session, error: sessionError } = await supabase
      .from('sesi_musyawarah')
      .select('*')
      .eq('id', sesiId)
      .single()

    const { data: participants, error: participantsError } = await supabase
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    const { data: attendance, error: attendanceError } = await supabase
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)

    return NextResponse.json({
      session: { data: session, error: sessionError },
      participants: { data: participants, error: participantsError },
      attendance: { data: attendance, error: attendanceError }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}