import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // Get raw attendance data
    const { data: rawAbsensi, error: rawError } = await (supabase as any)
      .from('absensi')
      .select('id, peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sesiId)

    // Get participant details
    const pesertaIds = rawAbsensi?.map((a: any) => a.peserta_id) || []
    const { data: pesertaData, error: pesertaError } = await (supabase as any)
      .from('peserta')
      .select('id, nama, email, jabatan, instansi')
      .in('id', pesertaIds)

    return NextResponse.json({
      sesi_id: sesiId,
      total_absensi: rawAbsensi?.length || 0,
      raw_absensi: rawAbsensi,
      raw_peserta: pesertaData,
      peserta_ids: pesertaIds,
      errors: { rawError, pesertaError }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Debug error' }, { status: 500 })
  }
}