import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// GET - Ambil data absensi existing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const sesiId = params.id

    const { data: absensi, error } = await supabase
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
    const supabase = createServerClient()
    const sesiId = params.id
    const { absensiData } = await request.json()

    if (!absensiData || !Array.isArray(absensiData)) {
      return NextResponse.json({ error: 'Data absensi tidak valid' }, { status: 400 })
    }

    // Delete existing absensi for this session
    await supabase
      .from('absensi')
      .delete()
      .eq('sesi_id', sesiId)

    // Insert new absensi data
    const absensiRecords = absensiData.map((item: any) => ({
      sesi_id: sesiId,
      peserta_id: item.peserta_id,
      status_kehadiran: item.status_kehadiran,
      waktu_absen: new Date().toISOString(),
      ip_address: request.ip || '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'Admin Manual Input'
    }))

    const { error: insertError } = await supabase
      .from('absensi')
      .insert(absensiRecords as any)

    if (insertError) {
      console.error('Error inserting absensi:', insertError)
      return NextResponse.json({ error: 'Gagal menyimpan absensi' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Absensi berhasil disimpan',
      count: absensiRecords.length 
    })
  } catch (error) {
    console.error('Error in POST absensi-manual:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}