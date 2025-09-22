import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sesiId: string } }
) {
  try {
    const sesiId = params.sesiId
    const supabase = createServerClient()

    // Check absensi data
    const { data: absensiData } = await (supabase as any)
      .from('absensi')
      .select('peserta_id, peserta(nama, email)')
      .eq('sesi_id', sesiId)

    // Check sesi_peserta data
    const { data: sesiPesertaData } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id, peserta(nama, email)')
      .eq('sesi_id', sesiId)

    return NextResponse.json({
      sesi_id: sesiId,
      absensi_count: absensiData?.length || 0,
      absensi_data: absensiData,
      sesi_peserta_count: sesiPesertaData?.length || 0,
      sesi_peserta_data: sesiPesertaData
    })

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}