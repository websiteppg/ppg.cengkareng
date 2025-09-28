import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const sesiId = searchParams.get('sesi_id')
    const pesertaId = searchParams.get('peserta_id')

    let query = supabase
      .from('absensi')
      .select(`
        *,
        peserta:peserta_id(nama, email),
        sesi:sesi_id(nama_sesi, tanggal)
      `)

    if (sesiId) {
      query = query.eq('sesi_id', sesiId)
    }

    if (pesertaId) {
      query = query.eq('peserta_id', pesertaId)
    }

    const { data: absensi, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: absensi })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { peserta_id, sesi_id, status_kehadiran, catatan } = body

    const { data, error } = await (supabase as any)
      .from('absensi')
      .insert({
        peserta_id,
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

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { peserta_id, sesi_id, status_kehadiran, catatan } = body

    if (!peserta_id || !sesi_id || !status_kehadiran) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Check if record exists
    const { data: existing } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('peserta_id', peserta_id)
      .eq('sesi_id', sesi_id)
      .single()

    if (existing) {
      // Update existing record using peserta_id and sesi_id
      const { data, error } = await (supabase as any)
        .from('absensi')
        .update({
          status_kehadiran,
          catatan,
          waktu_absen: new Date().toISOString()
        })
        .eq('peserta_id', peserta_id)
        .eq('sesi_id', sesi_id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data, message: 'Status absensi berhasil diupdate' })
    } else {
      // Insert new record if not exists
      const { data, error } = await (supabase as any)
        .from('absensi')
        .insert({
          peserta_id,
          sesi_id,
          status_kehadiran,
          catatan,
          waktu_absen: new Date().toISOString(),
          ip_address: request.ip || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'Admin Update'
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data, message: 'Absensi berhasil dibuat' })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}