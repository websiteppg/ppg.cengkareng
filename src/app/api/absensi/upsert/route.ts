import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { peserta_id, sesi_id, status_kehadiran, catatan } = body

    if (!peserta_id || !sesi_id || !status_kehadiran) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Check if record exists first
    const { data: existing } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('peserta_id', peserta_id)
      .eq('sesi_id', sesi_id)
      .single()

    let data, error

    if (existing) {
      // Update existing record
      const updateResult = await (supabase as any)
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
      
      data = updateResult.data
      error = updateResult.error
    } else {
      // Insert new record
      const insertResult = await (supabase as any)
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
      
      data = insertResult.data
      error = insertResult.error
    }

    if (error) {
      console.error('Upsert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      data, 
      message: existing ? 'Status absensi berhasil diupdate' : 'Status absensi berhasil disimpan',
      action: existing ? 'updated' : 'created'
    })

  } catch (error) {
    console.error('Error in upsert absensi:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}