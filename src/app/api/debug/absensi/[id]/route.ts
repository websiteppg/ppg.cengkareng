import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('DEBUG: Checking session:', sesiId)

    // Get ALL absensi data for this session
    const { data: allAbsensi, error } = await (supabase as any)
      .from('absensi')
      .select('*')
      .eq('sesi_id', sesiId)

    console.log('DEBUG: All absensi data:', allAbsensi)
    console.log('DEBUG: Query error:', error)

    // Get peserta data for H. Fauzan
    const { data: fauzan } = await (supabase as any)
      .from('peserta')
      .select('*')
      .eq('email', 'H. Fauzan')
      .single()

    console.log('DEBUG: H. Fauzan data:', fauzan)

    // Check if H. Fauzan has attendance record
    const fauzanAbsensi = allAbsensi?.find((a: any) => a.peserta_id === fauzan?.id)
    console.log('DEBUG: H. Fauzan absensi:', fauzanAbsensi)

    return NextResponse.json({
      sesi_id: sesiId,
      total_absensi: allAbsensi?.length || 0,
      all_absensi: allAbsensi,
      fauzan_data: fauzan,
      fauzan_absensi: fauzanAbsensi,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('DEBUG API Error:', error)
    return NextResponse.json({ error: 'Debug error' }, { status: 500 })
  }
}