import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { filters, dateRange, exportType } = body

    let query = supabase.from('absensi').select(`
      *,
      peserta:peserta_id(nama, email, jabatan, instansi),
      sesi:sesi_id(nama_sesi, tanggal, lokasi)
    `)

    if (filters?.status) {
      query = query.eq('status_kehadiran', filters.status)
    }

    if (dateRange?.start && dateRange?.end) {
      query = query.gte('waktu_absen', dateRange.start)
      query = query.lte('waktu_absen', dateRange.end)
    }

    const { data, error } = await query.order('waktu_absen', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, exportType })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}