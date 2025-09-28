import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sesiId: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.sesiId

    const { data: attendance, error } = await supabase
      .from('absensi')
      .select(`
        *,
        peserta:peserta_id(nama, email),
        sesi:sesi_id(nama_sesi, tanggal)
      `)
      .eq('sesi_id', sesiId)

    return NextResponse.json({ data: attendance, error })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}