import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    // Find peserta by email (username)
    const { data: peserta, error: pesertaError } = await supabase
      .from('peserta')
      .select('id, nama, email, jabatan, instansi')
      .eq('email', username)
      .eq('aktif', true)
      .single()

    if (pesertaError || !peserta) {
      return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 })
    }

    // Get sesi that this peserta is assigned to
    const { data: sesiPeserta, error: sesiError } = await supabase
      .from('sesi_peserta')
      .select(`
        sesi_id,
        sesi:sesi_id(
          id, nama_sesi, tanggal, waktu_mulai, waktu_selesai, lokasi, tipe
        )
      `)
      .eq('peserta_id', (peserta as any).id)

    if (sesiError) {
      return NextResponse.json({ error: 'Gagal mengambil data sesi' }, { status: 500 })
    }

    // Get existing absensi for this peserta
    const { data: absensi, error: absensiError } = await supabase
      .from('absensi')
      .select('sesi_id, status_kehadiran, waktu_absen')
      .eq('peserta_id', (peserta as any).id)

    if (absensiError) {
      return NextResponse.json({ error: 'Gagal mengambil data absensi' }, { status: 500 })
    }

    // Map absensi by sesi_id for easy lookup
    const absensiMap = new Map()
    absensi?.forEach((item: any) => {
      absensiMap.set(item.sesi_id, item)
    })

    // Combine sesi with absensi status
    const sesiWithAbsensi = sesiPeserta?.map((sp: any) => ({
      ...sp.sesi,
      absensi: absensiMap.get(sp.sesi_id) || null
    })) || []

    return NextResponse.json({
      peserta,
      sesi: sesiWithAbsensi
    })

  } catch (error) {
    console.error('Error in absensi peserta:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { username, sesi_id, status_kehadiran, catatan } = body

    if (!username || !sesi_id || !status_kehadiran) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Find peserta by email (username)
    const { data: peserta, error: pesertaError } = await supabase
      .from('peserta')
      .select('id')
      .eq('email', username)
      .eq('aktif', true)
      .single()

    if (pesertaError || !peserta) {
      return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 })
    }

    // Check if already absent
    const { data: existing } = await supabase
      .from('absensi')
      .select('id')
      .eq('peserta_id', (peserta as any).id)
      .eq('sesi_id', sesi_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Sudah melakukan absensi' }, { status: 400 })
    }

    // Insert absensi
    const { data, error } = await (supabase as any)
      .from('absensi')
      .insert({
        peserta_id: (peserta as any).id,
        sesi_id,
        status_kehadiran,
        catatan,
        waktu_absen: new Date().toISOString(),
        ip_address: request.ip || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || 'Unknown'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, message: 'Absensi berhasil dicatat' })

  } catch (error) {
    console.error('Error in POST absensi peserta:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}