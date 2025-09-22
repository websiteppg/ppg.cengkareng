import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getOverviewStats(supabase)
      case 'kehadiran':
        return await getAttendanceReport(supabase)
      case 'peserta':
        return await getParticipantReport(supabase)
      case 'sesi':
        return await getSessionReport(supabase)
      case 'notulensi':
        return await getNotesReport(supabase)
      case 'aktivitas':
        return await getActivityReport(supabase)
      default:
        return await getOverviewStats(supabase)
    }
  } catch (error) {
    console.error('Laporan API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

async function getOverviewStats(supabase: any) {
  try {
    const [pesertaResult, sesiResult, absensiResult] = await Promise.all([
      supabase.from('peserta').select('id', { count: 'exact' }),
      supabase.from('sesi_musyawarah').select('id', { count: 'exact' }),
      supabase.from('absensi').select('id', { count: 'exact' })
    ])

    const totalParticipants = pesertaResult.count || 0
    const totalSessions = sesiResult.count || 0
    const totalAttendance = absensiResult.count || 0
    
    // Try to get notulensi data, but don't fail if table doesn't exist
    let totalNotes = 0
    let approvalRate = 0
    
    try {
      const notulensiResult = await supabase.from('notulensi_sesi').select('id, status', { count: 'exact' })
      totalNotes = notulensiResult.count || 0
      const approvedNotes = notulensiResult.data?.filter((n: any) => n.status === 'approved').length || 0
      approvalRate = totalNotes > 0 ? Math.round((approvedNotes / totalNotes) * 100) : 0
    } catch (error) {
      console.log('Notulensi table not found, using default values')
    }
    
    const attendanceRate = totalSessions > 0 && totalParticipants > 0 
      ? Math.round((totalAttendance / (totalSessions * totalParticipants)) * 100) 
      : 0

    return NextResponse.json({
      totalParticipants,
      totalSessions,
      totalAttendance,
      totalNotes,
      attendanceRate: Math.min(attendanceRate, 100), // Cap at 100%
      approvalRate
    })
  } catch (error) {
    console.error('Overview stats error:', error)
    return NextResponse.json({
      totalParticipants: 0,
      totalSessions: 0,
      totalAttendance: 0,
      totalNotes: 0,
      attendanceRate: 0,
      approvalRate: 0
    })
  }
}

async function getAttendanceReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('absensi')
    .select(`
      id,
      status_kehadiran,
      waktu_absen,
      catatan,
      peserta:peserta_id(nama, email),
      sesi:sesi_id(nama_sesi, tanggal)
    `)
    .order('waktu_absen', { ascending: false })

  if (error) {
    console.error('Attendance report error:', error)
    return NextResponse.json([])
  }
  
  // Flatten data untuk export
  const flattenedData = (data || []).map((item: any) => ({
    id: item.id,
    status_kehadiran: item.status_kehadiran,
    waktu_absen: item.waktu_absen,
    catatan: item.catatan || '-',
    nama_peserta: item.peserta?.nama || '-',
    email_peserta: item.peserta?.email || '-',
    nama_sesi: item.sesi?.nama_sesi || '-',
    tanggal_sesi: item.sesi?.tanggal || '-'
  }))
  
  return NextResponse.json(flattenedData)
}

async function getParticipantReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('peserta')
    .select(`
      id,
      nama,
      email,
      nomor_hp,
      jabatan,
      instansi,
      role,
      aktif,
      created_at
    `)
    .order('nama')

  if (error) {
    console.error('Participant report error:', error)
    return NextResponse.json([])
  }
  return NextResponse.json(data || [])
}

async function getSessionReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('sesi_musyawarah')
    .select(`
      id,
      nama_sesi,
      deskripsi,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      lokasi,
      tipe,
      status,
      maksimal_peserta,
      created_at
    `)
    .order('tanggal', { ascending: false })

  if (error) {
    console.error('Session report error:', error)
    return NextResponse.json([])
  }
  return NextResponse.json(data || [])
}

async function getNotesReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('notulensi_sesi')
    .select(`
      id,
      judul,
      status,
      version,
      created_at,
      updated_at,
      sesi:sesi_id(nama_sesi, tanggal),
      dibuat_oleh:dibuat_oleh(nama)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Notes report error:', error)
    return NextResponse.json([])
  }
  return NextResponse.json(data || [])
}

async function getActivityReport(supabase: any) {
  try {
    const { data: recentSessions } = await supabase
      .from('sesi_musyawarah')
      .select('id, nama_sesi, created_at, status')
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: recentAttendance } = await supabase
      .from('absensi')
      .select('id, waktu_absen, peserta:peserta_id(nama)')
      .order('waktu_absen', { ascending: false })
      .limit(50)

    const activities = [
      ...(recentSessions || []).map((s: any) => ({
        id: s.id,
        aktivitas: 'Sesi Dibuat',
        detail: s.nama_sesi,
        waktu: s.created_at,
        status: s.status
      })),
      ...(recentAttendance || []).map((a: any) => ({
        id: a.id,
        aktivitas: 'Absensi',
        detail: a.peserta?.nama || 'Unknown',
        waktu: a.waktu_absen,
        status: 'completed'
      }))
    ].sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime())

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Activity report error:', error)
    return NextResponse.json([])
  }
}