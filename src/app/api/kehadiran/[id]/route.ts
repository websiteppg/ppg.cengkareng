import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const sesiId = params.id

    const { data: kehadiran, error } = await supabase
      .from('absensi')
      .select(`
        *,
        peserta:peserta_id(nama, email, jabatan, instansi)
      `)
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: kehadiran })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}