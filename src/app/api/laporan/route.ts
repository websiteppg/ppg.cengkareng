import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getOverviewStats(supabase)

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
    const [pesertaResult, sesiResult] = await Promise.all([
      supabase.from('peserta').select('id', { count: 'exact' }),
      supabase.from('sesi_musyawarah').select('id', { count: 'exact' })
    ])

    const totalParticipants = pesertaResult.count || 0
    const totalSessions = sesiResult.count || 0

    
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
    


    return NextResponse.json({
      totalParticipants,
      totalSessions,

      totalNotes,

      approvalRate
    })
  } catch (error) {
    console.error('Overview stats error:', error)
    return NextResponse.json({
      totalParticipants: 0,
      totalSessions: 0,

      totalNotes: 0,

      approvalRate: 0
    })
  }
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

    const activities = [
      ...(recentSessions || []).map((s: any) => ({
        id: s.id,
        aktivitas: 'Sesi Dibuat',
        detail: s.nama_sesi,
        waktu: s.created_at,
        status: s.status
      }))
    ].sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime())

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Activity report error:', error)
    return NextResponse.json([])
  }
}
