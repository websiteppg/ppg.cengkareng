import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { sesi_id, peserta_id, status_kehadiran, catatan } = body

    // Validate required fields
    if (!sesi_id || !peserta_id || !status_kehadiran) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    // Validate status_kehadiran
    const validStatuses = ['hadir', 'ghoib', 'izin', 'sakit']
    if (!validStatuses.includes(status_kehadiran)) {
      return NextResponse.json(
        { error: 'Status kehadiran tidak valid' },
        { status: 400 }
      )
    }

    // Check if peserta is invited to this session
    const { data: invitation, error: invitationError } = await (supabase as any)
      .from('sesi_peserta')
      .select('id')
      .eq('sesi_id', sesi_id)
      .eq('peserta_id', peserta_id)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Anda tidak diundang ke sesi ini' },
        { status: 403 }
      )
    }

    // Check if already attended
    const { data: existingAttendance } = await (supabase as any)
      .from('absensi')
      .select('id')
      .eq('sesi_id', sesi_id)
      .eq('peserta_id', peserta_id)
      .single()

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Anda sudah melakukan absensi untuk sesi ini' },
        { status: 409 }
      )
    }

    // Get client IP and user agent for logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Insert attendance record
    const { data, error } = await (supabase as any)
      .from('absensi')
      .insert({
        sesi_id,
        peserta_id,
        status_kehadiran,
        catatan: catatan || null,
        waktu_absen: new Date().toISOString(),
        ip_address: clientIP,
        user_agent: userAgent
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Gagal mencatat absensi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Absensi berhasil dicatat',
      data
    })

  } catch (error) {
    console.error('Submit attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}