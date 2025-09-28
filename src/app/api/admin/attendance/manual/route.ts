import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { sesi_id, peserta_id, status_kehadiran, catatan } = body

    if (!sesi_id || !peserta_id || !status_kehadiran) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Check if attendance already exists
    const { data: existing } = await supabase
      .from('absensi')
      .select('id')
      .eq('sesi_id', sesi_id)
      .eq('peserta_id', peserta_id)
      .single()

    if (existing) {
      // Update existing attendance
      const { data, error } = await (supabase as any)
        .from('absensi')
        .update({
          status_kehadiran,
          catatan: catatan || null,
          waktu_absen: new Date().toISOString(),
          ip_address: request.ip || '127.0.0.1',
          user_agent: 'Admin Manual Update'
        })
        .eq('id', (existing as any).id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data, message: 'Absensi berhasil diupdate' })
    } else {
      // Create new attendance
      const { data, error } = await (supabase as any)
        .from('absensi')
        .insert({
          sesi_id,
          peserta_id,
          status_kehadiran,
          catatan: catatan || null,
          waktu_absen: new Date().toISOString(),
          ip_address: request.ip || '127.0.0.1',
          user_agent: 'Admin Manual Input'
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ data, message: 'Absensi berhasil dicatat' })
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}