import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { peserta_id, sesi_id, status_kehadiran, catatan } = await request.json()

    if (!peserta_id || !sesi_id) {
      return NextResponse.json(
        { error: 'Data peserta dan sesi harus diisi' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if attendance already exists
    const { data: existingAttendance } = await supabase
      .from('absensi')
      .select('id')
      .eq('peserta_id', peserta_id)
      .eq('sesi_id', sesi_id)
      .single()

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan absensi untuk sesi ini' },
        { status: 400 }
      )
    }

    // Check if session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('sesi_musyawarah')
      .select('status, tanggal, waktu_mulai, waktu_selesai, batas_absen_mulai, batas_absen_selesai')
      .eq('id', sesi_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Skip time validation for testing - allow attendance anytime
    // TODO: Re-enable time validation for production
    const now = new Date()
    
    /*
    // Check if attendance is within allowed time window
    const sessionData = session as any
    const sessionDate = new Date(sessionData.tanggal)
    const [startHour, startMinute] = sessionData.waktu_mulai.split(':').map(Number)
    const [endHour, endMinute] = sessionData.waktu_selesai.split(':').map(Number)
    
    const sessionStart = new Date(sessionDate)
    sessionStart.setHours(startHour, startMinute, 0, 0)
    
    const sessionEnd = new Date(sessionDate)
    sessionEnd.setHours(endHour, endMinute, 0, 0)

    const attendanceStart = new Date(sessionStart.getTime() - ((sessionData.batas_absen_mulai || 30) * 60000))
    const attendanceEnd = new Date(sessionEnd.getTime() + ((sessionData.batas_absen_selesai || 15) * 60000))

    if (now < attendanceStart || now > attendanceEnd) {
      return NextResponse.json(
        { error: 'Waktu absensi sudah berakhir atau belum dimulai' },
        { status: 400 }
      )
    }
    */

    // Validate status_kehadiran
    const validStatuses = ['hadir', 'ghoib', 'izin', 'sakit']
    if (!validStatuses.includes(status_kehadiran)) {
      return NextResponse.json(
        { error: 'Status kehadiran tidak valid' },
        { status: 400 }
      )
    }

    // Use selected status directly for testing
    let finalStatus = status_kehadiran

    // Insert attendance record
    const { data: attendance, error } = await (supabase as any)
      .from('absensi')
      .insert({
        peserta_id,
        sesi_id,
        status_kehadiran: finalStatus,
        catatan,
        ip_address: request.ip,
        user_agent: request.headers.get('user-agent'),
        waktu_absen: now.toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menyimpan absensi' },
        { status: 500 }
      )
    }

    // Log activity (optional - remove if table doesn't exist)
    try {
      await (supabase as any)
        .from('log_aktivitas')
        .insert({
          peserta_id,
          aktivitas: 'attendance_recorded',
          detail: { 
            sesi_id, 
            status: finalStatus,
            ip: request.ip 
          },
          ip_address: request.ip,
          user_agent: request.headers.get('user-agent')
        })
    } catch (logError) {
      console.log('Log activity failed:', logError)
    }

    return NextResponse.json({
      success: true,
      attendance,
      message: 'Absensi berhasil dicatat'
    })

  } catch (error) {
    console.error('Attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}