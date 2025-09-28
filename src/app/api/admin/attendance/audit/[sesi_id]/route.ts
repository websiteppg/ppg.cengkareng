import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { sesi_id: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.sesi_id

    // Get attendance audit data
    const { data: auditData, error } = await supabase
      .from('absensi')
      .select(`
        *,
        peserta:peserta_id(nama, email),
        sesi:sesi_id(nama_sesi, tanggal)
      `)
      .eq('sesi_id', sesiId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: auditData })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}