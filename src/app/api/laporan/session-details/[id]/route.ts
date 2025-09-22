import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const sessionId = params.id

    // Get all participants assigned to this session with their attendance status
    const { data: participants, error } = await supabase
      .from('sesi_peserta')
      .select(`
        peserta:peserta_id (
          id,
          nama,
          email
        )
      `)
      .eq('sesi_id', sessionId)

    if (error) {
      throw error
    }

    // Get attendance records for this session
    const { data: attendanceRecords } = await supabase
      .from('absensi')
      .select(`
        peserta_id,
        status_kehadiran,
        waktu_absen,
        catatan
      `)
      .eq('sesi_id', sessionId)

    // Combine participant data with attendance status
    const participantsWithStatus = (participants || []).map((item: any) => {
      const peserta = item.peserta
      if (!peserta) {
        return null
      }
      
      const attendance = attendanceRecords?.find(
        (record: any) => record.peserta_id === peserta.id
      ) as any

      return {
        id: peserta.id,
        nama: peserta.nama || 'Nama tidak tersedia',
        email: peserta.email || 'Email tidak tersedia',
        status_kehadiran: attendance?.status_kehadiran || null,
        waktu_absen: attendance?.waktu_absen || null,
        catatan: attendance?.catatan || null
      }
    }).filter(Boolean)

    return NextResponse.json({
      peserta: participantsWithStatus || []
    })
  } catch (error) {
    console.error('Session details API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}