import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { sesi_id, peserta_id, status_kehadiran, waktu_absen, catatan, admin_notes, modification_reason, admin_id } = body

    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Check if attendance already exists
    const { data: existing } = await supabase
      .from('absensi')
      .select('id, status_kehadiran')
      .eq('sesi_id', sesi_id)
      .eq('peserta_id', peserta_id)
      .single()

    let result
    let action_type: 'MANUAL_CREATE' | 'STATUS_UPDATE' = 'MANUAL_CREATE'
    let old_status = null

    if (existing) {
      // Update existing attendance
      old_status = (existing as any).status_kehadiran
      action_type = 'STATUS_UPDATE'
      
      const { data, error } = await (supabase as any)
        .from('absensi')
        .update({
          status_kehadiran,
          waktu_absen: waktu_absen || new Date().toISOString(),
          catatan
        })
        .eq('id', (existing as any).id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new attendance
      const { data, error } = await (supabase as any)
        .from('absensi')
        .insert({
          sesi_id,
          peserta_id,
          status_kehadiran,
          waktu_absen: waktu_absen || new Date().toISOString(),
          catatan,
          ip_address: ip
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // Audit log disabled until database migration
    console.log('Manual attendance:', { action_type, peserta_id, status_kehadiran })

    return NextResponse.json({ 
      success: true, 
      message: existing ? 'Status kehadiran berhasil diperbarui' : 'Absensi manual berhasil dibuat',
      data: result 
    })

  } catch (error) {
    console.error('Manual attendance error:', error)
    return NextResponse.json({ error: 'Gagal memproses absensi manual' }, { status: 500 })
  }
}