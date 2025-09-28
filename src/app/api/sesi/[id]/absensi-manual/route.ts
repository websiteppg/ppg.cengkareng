import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Ambil data absensi existing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.id

    const { data: absensi, error } = await (supabase as any)
      .from('absensi')
      .select('peserta_id, status_kehadiran')
      .eq('sesi_id', sesiId)

    if (error) {
      console.error('Error fetching absensi:', error)
      return NextResponse.json({ error: 'Gagal mengambil data absensi' }, { status: 500 })
    }

    return NextResponse.json(absensi || [])
  } catch (error) {
    console.error('Error in GET absensi-manual:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Simpan/Update absensi manual
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.id
    const { absensiData } = await request.json()

    if (!absensiData || !Array.isArray(absensiData)) {
      return NextResponse.json({ error: 'Data absensi tidak valid' }, { status: 400 })
    }

    console.log(`Saving absensi for session ${sesiId}:`, absensiData.length, 'records')

    // Filter out empty or invalid records
    const validAbsensiData = absensiData.filter((item: any) => 
      item.peserta_id && item.status_kehadiran
    )

    if (validAbsensiData.length === 0) {
      return NextResponse.json({ error: 'Tidak ada data absensi yang valid' }, { status: 400 })
    }

    const results = []
    const errors = []

    // Process each record individually with upsert
    for (const item of validAbsensiData) {
      try {
        // Check if record exists
        const { data: existing } = await (supabase as any)
          .from('absensi')
          .select('*')
          .eq('sesi_id', sesiId)
          .eq('peserta_id', item.peserta_id)
          .single()

        if (existing) {
          // Update existing record using peserta_id and sesi_id
          const { data: updatedData, error: updateError } = await (supabase as any)
            .from('absensi')
            .update({
              status_kehadiran: item.status_kehadiran,
              waktu_absen: new Date().toISOString(),
              catatan: 'Update manual oleh admin'
            })
            .eq('peserta_id', item.peserta_id)
            .eq('sesi_id', sesiId)
            .select()
            .single()

          if (updateError) {
            errors.push(`Update error for peserta ${item.peserta_id}: ${updateError.message}`)
          } else {
            results.push(updatedData)
          }
        } else {
          // Insert new record
          const { data: insertedData, error: insertError } = await (supabase as any)
            .from('absensi')
            .insert({
              sesi_id: sesiId,
              peserta_id: item.peserta_id,
              status_kehadiran: item.status_kehadiran,
              waktu_absen: new Date().toISOString(),
              ip_address: request.ip || '127.0.0.1',
              user_agent: request.headers.get('user-agent') || 'Admin Manual Input',
              catatan: 'Input manual oleh admin'
            })
            .select()
            .single()

          if (insertError) {
            errors.push(`Insert error for peserta ${item.peserta_id}: ${insertError.message}`)
          } else {
            results.push(insertedData)
          }
        }
      } catch (itemError) {
        errors.push(`Processing error for peserta ${item.peserta_id}: ${(itemError as Error).message}`)
      }
    }

    console.log(`Successfully processed ${results.length} records, ${errors.length} errors`)

    if (errors.length > 0) {
      console.error('Errors during processing:', errors)
    }

    return NextResponse.json({ 
      message: `Absensi berhasil diproses: ${results.length} berhasil, ${errors.length} error`,
      count: results.length,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in POST absensi-manual:', error)
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 })
  }
}