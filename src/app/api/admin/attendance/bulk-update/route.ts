import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { sesi_id, peserta_ids, status_kehadiran, admin_notes, modification_reason, admin_id, updates } = body

    // Handle both old format (updates array) and new format (peserta_ids array)
    let targetUpdates = []
    
    if (peserta_ids && Array.isArray(peserta_ids)) {
      // New format from bulk modal
      targetUpdates = peserta_ids.map((peserta_id: string) => ({
        peserta_id,
        status_kehadiran,
        catatan: `${modification_reason}${admin_notes ? ` - ${admin_notes}` : ''}`
      }))
    } else if (updates && Array.isArray(updates)) {
      // Old format
      targetUpdates = updates
    } else {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    if (!sesi_id || targetUpdates.length === 0) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const results = []
    const errors = []

    // Process each update individually with upsert
    for (const update of targetUpdates) {
      try {
        // Check if record exists
        const { data: existing } = await (supabase as any)
          .from('absensi')
          .select('*')
          .eq('peserta_id', update.peserta_id)
          .eq('sesi_id', sesi_id)
          .single()

        if (existing) {
          // Update existing record
          const { data: updatedData, error: updateError } = await (supabase as any)
            .from('absensi')
            .update({
              status_kehadiran: update.status_kehadiran,
              catatan: update.catatan || null,
              waktu_absen: new Date().toISOString()
            })
            .eq('peserta_id', update.peserta_id)
            .eq('sesi_id', sesi_id)
            .select()
            .single()

          if (updateError) {
            errors.push(`Update error for peserta ${update.peserta_id}: ${updateError.message}`)
          } else {
            results.push(updatedData)
          }
        } else {
          // Insert new record
          const { data: insertedData, error: insertError } = await (supabase as any)
            .from('absensi')
            .insert({
              sesi_id,
              peserta_id: update.peserta_id,
              status_kehadiran: update.status_kehadiran,
              catatan: update.catatan || null,
              waktu_absen: new Date().toISOString(),
              ip_address: request.ip || '127.0.0.1',
              user_agent: 'Admin Bulk Update'
            })
            .select()
            .single()

          if (insertError) {
            errors.push(`Insert error for peserta ${update.peserta_id}: ${insertError.message}`)
          } else {
            results.push(insertedData)
          }
        }
      } catch (itemError) {
        errors.push(`Processing error for peserta ${update.peserta_id}: ${(itemError as Error).message}`)
      }
    }

    return NextResponse.json({ 
      data: results,
      message: `Bulk update berhasil: ${results.length} berhasil, ${errors.length} error`,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}