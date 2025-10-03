import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    
    const { 
      jenis_laporan, 
      tanggal_mulai, 
      tanggal_selesai, 
      status_filter, 
      role_filter 
    } = body

    if (!jenis_laporan || !tanggal_mulai || !tanggal_selesai) {
      return NextResponse.json(
        { error: 'Jenis laporan dan rentang tanggal wajib diisi' },
        { status: 400 }
      )
    }

    switch (jenis_laporan) {
      case 'kehadiran':
        return await getCustomAttendanceReport(supabase, tanggal_mulai, tanggal_selesai, status_filter)
      case 'peserta':
        return await getCustomParticipantReport(supabase, tanggal_mulai, tanggal_selesai, role_filter)
      case 'sesi':
        return await getCustomSessionReport(supabase, tanggal_mulai, tanggal_selesai)
      case 'notulensi':
        return await getCustomNotesReport(supabase, tanggal_mulai, tanggal_selesai)
      default:
        return NextResponse.json({ error: 'Jenis laporan tidak valid' }, { status: 400 })
    }
  } catch (error) {
    console.error('Custom report API error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}

async function getCustomAttendanceReport(supabase: any, startDate: string, endDate: string, statusFilter: string) {
  const { data: sesiData } = await (supabase as any)
    .from('sesi_musyawarah')
    .select('id')
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)

  if (!sesiData || sesiData.length === 0) {
    return NextResponse.json([])
  }

  const sesiIds = sesiData.map((s: any) => s.id)
  let query = (supabase as any)
    .from('absensi')
    .select('id, peserta_id, sesi_id, status_kehadiran, waktu_absen, catatan')
    .in('sesi_id', sesiIds)

  if (statusFilter && statusFilter !== 'semua') {
    query = query.eq('status_kehadiran', statusFilter)
  }

  const { data: absensiData, error } = await query.order('waktu_absen', { ascending: false })
  if (error) throw error

  const reportData = []
  if (absensiData && absensiData.length > 0) {
    const pesertaIds = Array.from(new Set(absensiData.map((a: any) => a.peserta_id)))
    const allSesiIds = Array.from(new Set(absensiData.map((a: any) => a.sesi_id)))
    
    const [pesertaResult, sesiResult] = await Promise.all([
      (supabase as any).from('peserta').select('id, nama, email').in('id', pesertaIds),
      (supabase as any).from('sesi_musyawarah').select('id, nama_sesi, tanggal').in('id', allSesiIds)
    ])
    
    for (const absen of absensiData) {
      const peserta = pesertaResult.data?.find((p: any) => p.id === absen.peserta_id)
      const sesi = sesiResult.data?.find((s: any) => s.id === absen.sesi_id)
      
      reportData.push({
        'Nama Peserta': peserta?.nama || '-',
        'Email': peserta?.email || '-',
        'Nama Sesi': sesi?.nama_sesi || '-',
        'Tanggal': sesi?.tanggal ? new Date(sesi.tanggal).toLocaleDateString('id-ID') : '-',
        'Status Kehadiran': absen.status_kehadiran || '-',
        'Waktu Absen': absen.waktu_absen ? new Date(absen.waktu_absen).toLocaleString('id-ID') : '-',
        'Catatan': absen.catatan || '-'
      })
    }
  }

  return NextResponse.json(reportData)
}

async function getCustomParticipantReport(supabase: any, startDate: string, endDate: string, roleFilter: string) {
  let query = (supabase as any)
    .from('peserta')
    .select('id, nama, email, nomor_hp, jabatan, instansi, role, aktif, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate + 'T23:59:59')

  if (roleFilter && roleFilter !== 'semua') {
    query = query.eq('role', roleFilter)
  }

  const { data, error } = await query.order('nama')
  if (error) throw error
  
  const reportData = data?.map((p: any) => ({
    'Nama': p.nama || '-',
    'Email': p.email || '-',
    'Nomor HP': p.nomor_hp || '-',
    'Jabatan': p.jabatan || '-',
    'Instansi': p.instansi || '-',
    'Role': p.role || '-',
    'Status': p.aktif ? 'Aktif' : 'Tidak Aktif',
    'Tanggal Daftar': p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : '-'
  })) || []
  
  return NextResponse.json(reportData)
}

async function getCustomSessionReport(supabase: any, startDate: string, endDate: string) {
  const { data, error } = await (supabase as any)
    .from('sesi_musyawarah')
    .select('id, nama_sesi, tanggal, waktu_mulai, waktu_selesai, lokasi, tipe, status, maksimal_peserta, created_at')
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)
    .order('tanggal', { ascending: false })

  if (error) throw error
  
  const reportData = data?.map((s: any) => ({
    'Nama Sesi': s.nama_sesi || '-',
    'Tanggal': s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID') : '-',
    'Waktu Mulai': s.waktu_mulai || '-',
    'Waktu Selesai': s.waktu_selesai || '-',
    'Lokasi': s.lokasi || '-',
    'Tipe': s.tipe || '-',
    'Status': s.status || '-',
    'Maksimal Peserta': s.maksimal_peserta || '-'
  })) || []
  
  return NextResponse.json(reportData)
}

async function getCustomNotesReport(supabase: any, startDate: string, endDate: string) {
  const { data: sesiData } = await (supabase as any)
    .from('sesi_musyawarah')
    .select('id')
    .gte('tanggal', startDate)
    .lte('tanggal', endDate)

  if (!sesiData || sesiData.length === 0) {
    return NextResponse.json([])
  }

  const sesiIds = sesiData.map((s: any) => s.id)
  const { data: notulensiData, error } = await (supabase as any)
    .from('notulensi_sesi')
    .select('id, sesi_id, dibuat_oleh, judul, status, version, created_at, updated_at')
    .in('sesi_id', sesiIds)
    .order('created_at', { ascending: false })

  if (error) throw error

  const reportData = []
  if (notulensiData && notulensiData.length > 0) {
    const allSesiIds = Array.from(new Set(notulensiData.map((n: any) => n.sesi_id)))
    const pembuatIds = Array.from(new Set(notulensiData.map((n: any) => n.dibuat_oleh)))
    
    const [sesiResult, pembuatResult] = await Promise.all([
      (supabase as any).from('sesi_musyawarah').select('id, nama_sesi, tanggal').in('id', allSesiIds),
      (supabase as any).from('peserta').select('id, nama').in('id', pembuatIds)
    ])
    
    for (const notulensi of notulensiData) {
      const sesi = sesiResult.data?.find((s: any) => s.id === notulensi.sesi_id)
      const pembuat = pembuatResult.data?.find((p: any) => p.id === notulensi.dibuat_oleh)
      
      reportData.push({
        'Judul': notulensi.judul || '-',
        'Nama Sesi': sesi?.nama_sesi || '-',
        'Tanggal Sesi': sesi?.tanggal ? new Date(sesi.tanggal).toLocaleDateString('id-ID') : '-',
        'Dibuat Oleh': pembuat?.nama || '-',
        'Status': notulensi.status || '-',
        'Versi': notulensi.version || '-',
        'Tanggal Dibuat': notulensi.created_at ? new Date(notulensi.created_at).toLocaleDateString('id-ID') : '-'
      })
    }
  }

  return NextResponse.json(reportData)
}