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
  const [pesertaResult, sesiResult, absensiResult, notulensiResult] = await Promise.all([
    supabase.from('peserta').select('id', { count: 'exact' }),
    supabase.from('sesi_musyawarah').select('id', { count: 'exact' }),
    supabase.from('absensi').select('id', { count: 'exact' }),
    supabase.from('notulensi_sesi').select('id, status', { count: 'exact' })
  ])

  const totalParticipants = pesertaResult.count || 0
  const totalSessions = sesiResult.count || 0
  const totalAttendance = absensiResult.count || 0
  const totalNotes = notulensiResult.count || 0
  
  const approvedNotes = notulensiResult.data?.filter((n: any) => n.status === 'approved').length || 0
  const attendanceRate = totalSessions > 0 ? Math.round((totalAttendance / (totalSessions * totalParticipants)) * 100) : 0
  const approvalRate = totalNotes > 0 ? Math.round((approvedNotes / totalNotes) * 100) : 0

  return NextResponse.json({
    totalParticipants,
    totalSessions,
    totalAttendance,
    totalNotes,
    attendanceRate,
    approvalRate
  })
}

async function getAttendanceReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('absensi')
    .select(`
      id,
      status_kehadiran,
      waktu_absen,
      peserta:peserta_id(nama, username),
      sesi:sesi_id(nama_sesi, tanggal)
    `)
    .order('waktu_absen', { ascending: false })

  if (error) throw error
  return NextResponse.json(data || [])
}

async function getParticipantReport(supabase: any) {
  const { data, error } = await (supabase as any)
    .from('peserta')
    .select(`
      id,
      nama,
      username,
      role,
      dapuan,
      bidang,
      created_at
    `)
    .order('nama')

  if (error) throw error
  return NextResponse.json(data || [])
}

async function getSessionReport(supabase: any) {
  const { data, error } = await (supabase as any)
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
      created_at
    `)
    .order('tanggal', { ascending: false })

  if (error) throw error
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

  if (error) throw error
  return NextResponse.json(data || [])
}