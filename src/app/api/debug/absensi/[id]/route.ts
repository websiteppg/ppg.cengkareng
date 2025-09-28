import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.id

    const { data: absensi, error } = await supabase
      .from('absensi')
      .select(`
        *,
        peserta:peserta_id(nama, email),
        sesi:sesi_id(nama_sesi)
      `)
      .eq('sesi_id', sesiId)

    return NextResponse.json({ data: absensi, error })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}