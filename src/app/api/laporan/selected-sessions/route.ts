import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { sessionIds } = await request.json()

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json(
        { error: 'Session IDs diperlukan' },
        { status: 400 }
      )
    }

    // Get detailed attendance data for selected sessions
    const { data: attendanceData, error } = await supabase
      .from('absensi')
      .select(`
        id,
        status_kehadiran,
        waktu_absen,
        catatan,
        peserta:peserta_id(nama, email, jabatan, instansi),
        sesi:sesi_id(
          id,
          nama_sesi, 
          tanggal, 
          waktu_mulai, 
          waktu_selesai,
          lokasi,
          tipe
        )
      `)
      .in('sesi_id', sessionIds)
      .order('sesi_id')
      .order('waktu_absen', { ascending: false })

    if (error) {
      throw error
    }

    // Also get participants who were assigned but didn't attend
    const { data: assignedParticipants } = await supabase
      .from('sesi_peserta')
      .select(`
        sesi_id,
        peserta:peserta_id(id, nama, email, jabatan, instansi),
        sesi:sesi_id(
          id,
          nama_sesi, 
          tanggal, 
          waktu_mulai, 
          waktu_selesai,
          lokasi,
          tipe
        )
      `)
      .in('sesi_id', sessionIds)

    // Create a comprehensive report including no-shows
    const reportData: any[] = []

    // Group by session
    const sessionGroups = new Map()

    // Add attendance records
    attendanceData?.forEach((record: any) => {
      if (!record.sesi) {
        return
      }
      
      const sessionId = record.sesi.id
      if (!sessionGroups.has(sessionId)) {
        sessionGroups.set(sessionId, {
          session: record.sesi,
          participants: []
        })
      }
      
      sessionGroups.get(sessionId).participants.push({
        nama_peserta: record.peserta?.nama || '-',
        email_peserta: record.peserta?.email || '-',
        jabatan: record.peserta?.jabatan || '-',
        instansi: record.peserta?.instansi || '-',
        status_kehadiran: record.status_kehadiran || 'tidak_hadir',
        waktu_absen: record.waktu_absen,
        catatan: record.catatan || '-',
        attended: true
      })
    })

    // Add no-show participants
    assignedParticipants?.forEach((assignment: any) => {
      if (!assignment.sesi || !assignment.peserta) {
        return
      }
      
      const sessionId = assignment.sesi.id
      
      if (!sessionGroups.has(sessionId)) {
        sessionGroups.set(sessionId, {
          session: assignment.sesi,
          participants: []
        })
      }

      // Check if participant already has attendance record
      const hasAttendance = sessionGroups.get(sessionId).participants.some(
        (p: any) => p.email_peserta === assignment.peserta?.email
      )

      if (!hasAttendance) {
        sessionGroups.get(sessionId).participants.push({
          nama_peserta: assignment.peserta?.nama || '-',
          email_peserta: assignment.peserta?.email || '-',
          jabatan: assignment.peserta?.jabatan || '-',
          instansi: assignment.peserta?.instansi || '-',
          status_kehadiran: 'tidak_hadir',
          waktu_absen: null,
          catatan: 'Tidak hadir',
          attended: false
        })
      }
    })

    // Flatten data for export
    let nomorUrut = 1
    sessionGroups.forEach((group, sessionId) => {
      group.participants.forEach((participant: any) => {
        reportData.push({
          no: nomorUrut++,
          nama_sesi: group.session.nama_sesi,
          tanggal_sesi: group.session.tanggal,
          waktu_mulai: group.session.waktu_mulai,
          waktu_selesai: group.session.waktu_selesai,
          lokasi: group.session.lokasi || '-',
          tipe_sesi: group.session.tipe,
          nama_peserta: participant.nama_peserta,
          username: participant.email_peserta,
          dapuan: participant.jabatan,
          bidang: participant.instansi,
          status_kehadiran: participant.status_kehadiran,
          waktu_absen: participant.waktu_absen,
          catatan: participant.catatan
        })
      })
    })

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Selected sessions API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}