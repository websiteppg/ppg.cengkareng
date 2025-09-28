import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('id, nama')
      .eq('email', username)
      .eq('aktif', true)
      .single()

    if (pesertaError || !peserta) {
      return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 })
    }

    // Check if already submitted
    const { data: existing } = await supabase
      .from('absensi')
      .select('id')
      .eq('peserta_id', (peserta as any).id)
      .eq('sesi_id', sesi_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Sudah melakukan absensi untuk sesi ini' }, { status: 400 })
    }

    // Submit absensi
    const { data, error } = await (supabase as any)
      .from('absensi')
      .insert({
        peserta_id: (peserta as any).id,
        sesi_id,
        status_kehadiran,
        catatan: catatan || null,
        waktu_absen: new Date().toISOString(),
        ip_address: request.ip || '127.0.0.1',
        user_agent: request.headers.get('user-agent') || 'Unknown'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      message: `Absensi berhasil dicatat untuk ${(peserta as any).nama}` 
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}