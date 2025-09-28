import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const pesertaId = params.id

    const { data: absensi, error } = await supabase
      .from('absensi')
      .select(`
        *,
        sesi:sesi_id(nama_sesi, tanggal, waktu_mulai, waktu_selesai, lokasi)
      `)
      .eq('peserta_id', pesertaId)
      .order('waktu_absen', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: absensi })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}