import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // Get peserta IDs assigned to this sesi
    const { data: sesiPesertaData, error: sesiError } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    if (sesiError) {
      console.error('Error fetching sesi_peserta:', sesiError)
      return NextResponse.json(
        { error: 'Gagal mengambil data peserta' },
        { status: 500 }
      )
    }

    // Get peserta details
    let pesertaList = []
    if (sesiPesertaData && sesiPesertaData.length > 0) {
      const pesertaIds = sesiPesertaData.map((sp: any) => sp.peserta_id)
      
      const { data: pesertaData, error: pesertaError } = await (supabase as any)
        .from('peserta')
        .select('id, nama, email, jabatan, instansi')
        .in('id', pesertaIds)
      
      if (!pesertaError) {
        pesertaList = pesertaData || []
      }
    }

    return NextResponse.json(pesertaList)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}