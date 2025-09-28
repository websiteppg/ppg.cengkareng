import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const sesiId = searchParams.get('sesi_id')

    if (!sesiId) {
      return NextResponse.json({ error: 'sesi_id required' }, { status: 400 })
    }

    // Get all absensi data for this session
    const { data: absensi, error } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      sesi_id: sesiId,
      total_records: absensi?.length || 0,
      data: absensi,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}