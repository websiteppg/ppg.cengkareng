import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sesiId: string } }
) {
  try {
    const sesiId = params.sesiId
    const supabase = createServerClient()

    // Check attendance records
    const { data: attendance, error: attendanceError } = await supabase
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)

    // Check assigned participants  
    const { data: assigned, error: assignedError } = await supabase
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    return NextResponse.json({
      sesiId,
      attendance: { data: attendance, error: attendanceError },
      assigned: { data: assigned, error: assignedError },
      counts: {
        attendance: attendance?.length || 0,
        assigned: assigned?.length || 0
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}