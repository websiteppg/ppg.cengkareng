import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { sesi_id, peserta_ids, status_kehadiran, admin_notes, modification_reason, admin_id } = body

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const waktu_absen = new Date().toISOString()
    
    const results = []
    const auditLogs = []

    for (const peserta_id of peserta_ids) {
      // Check existing attendance
      const { data: existing } = await supabase
        .from('absensi')
        .select('id, status_kehadiran')
        .eq('sesi_id', sesi_id)
        .eq('peserta_id', peserta_id)
        .single()

      let result
      let old_status = null

      if (existing) {
        // Update existing
        old_status = (existing as any).status_kehadiran
        const { data, error } = await (supabase as any)
          .from('absensi')
          .update({
            status_kehadiran,
            waktu_absen,
            admin_override: true,
            admin_notes,
            modified_by: admin_id,
            modification_reason
          })
          .eq('id', (existing as any).id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new
        const { data, error } = await (supabase as any)
          .from('absensi')
          .insert({
            sesi_id,
            peserta_id,
            status_kehadiran,
            waktu_absen,
            admin_override: true,
            admin_notes,
            modified_by: admin_id,
            modification_reason,
            ip_address: ip
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      results.push(result)
      
      // Prepare audit log
      auditLogs.push({
        absensi_id: result.id,
        sesi_id,
        peserta_id,
        action_type: 'BULK_UPDATE' as const,
        old_status,
        new_status: status_kehadiran,
        admin_id,
        reason: modification_reason,
        notes: admin_notes,
        ip_address: ip
      })
    }

    // Insert audit logs
    await (supabase as any)
      .from('attendance_audit')
      .insert(auditLogs)

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil memperbarui ${results.length} peserta`,
      updated_count: results.length
    })

  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui absensi massal' }, { status: 500 })
  }
}