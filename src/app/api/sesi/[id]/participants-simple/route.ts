import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    console.log('Simple participants query for session:', sesiId)

    // Get participant IDs first
    const { data: sesiPesertaData, error: sesiError } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    console.log('Session participants found:', sesiPesertaData?.length || 0)

    if (sesiError) {
      console.error('Session participants error:', sesiError)
      return NextResponse.json({ error: 'Failed to fetch session participants' }, { status: 500 })
    }

    if (!sesiPesertaData || sesiPesertaData.length === 0) {
      return NextResponse.json([])
    }

    // Get participant details
    const pesertaIds = sesiPesertaData.map((sp: any) => sp.peserta_id)
    const { data: pesertaData, error: pesertaError } = await (supabase as any)
      .from('peserta')
      .select('id, nama, email, jabatan, instansi')
      .in('id', pesertaIds)

    console.log('Participant details found:', pesertaData?.length || 0)

    if (pesertaError) {
      console.error('Participant details error:', pesertaError)
      return NextResponse.json({ error: 'Failed to fetch participant details' }, { status: 500 })
    }

    return NextResponse.json(pesertaData || [])

  } catch (error) {
    console.error('Simple participants API Error:', error)
    return NextResponse.json({ error: 'System error' }, { status: 500 })
  }
}