import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createClient()

    console.log('Fetching participants for session:', sesiId)

    // Direct query with JOIN to get peserta details
    const { data: pesertaList, error } = await (supabase as any)
      .from('sesi_peserta')
      .select(`
        peserta_id,
        peserta:peserta_id (
          id,
          nama,
          email,
          jabatan,
          instansi
        )
      `)
      .eq('sesi_id', sesiId)

    if (error) {
      console.error('Error fetching participants:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil data peserta' },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedData = pesertaList?.map((item: any) => ({
      id: item.peserta?.id || item.peserta_id,
      nama: item.peserta?.nama || 'Unknown',
      email: item.peserta?.email || '',
      jabatan: item.peserta?.jabatan || '',
      instansi: item.peserta?.instansi || ''
    })) || []

    console.log('Transformed participants:', transformedData.length)
    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}