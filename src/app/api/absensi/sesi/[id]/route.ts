import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // Get attendance data with peserta info in one query
    const { data: absensiData, error: absensiError } = await (supabase as any)
      .from('absensi')
      .select(`
        id, 
        peserta_id, 
        status_kehadiran, 
        waktu_absen, 
        catatan,
        peserta:peserta_id (
          id,
          nama,
          email,
          jabatan,
          instansi
        )
      `)
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: true })

    console.log('Query sesi_id:', sesiId)
    console.log('Absensi data with peserta:', absensiData)
    console.log('Total count:', absensiData?.length)
    console.log('Absensi error:', absensiError)

    // If JOIN fails, try separate queries
    if (!absensiData || absensiData.length === 0) {
      console.log('JOIN query failed, trying separate queries...')
      
      const { data: rawAbsensi, error: rawError } = await (supabase as any)
        .from('absensi')
        .select('id, peserta_id, status_kehadiran, waktu_absen, catatan')
        .eq('sesi_id', sesiId)
        .order('waktu_absen', { ascending: true })

      if (rawAbsensi && rawAbsensi.length > 0) {
        const pesertaIds = rawAbsensi.map((a: any) => a.peserta_id)
        const { data: pesertaData } = await (supabase as any)
          .from('peserta')
          .select('id, nama, email, jabatan, instansi')
          .in('id', pesertaIds)

        const combinedData = rawAbsensi.map((absen: any) => ({
          ...absen,
          peserta: pesertaData?.find((p: any) => p.id === absen.peserta_id) || null
        }))

        console.log('Separate query result:', combinedData.length)
        return NextResponse.json(combinedData)
      }
    }

    if (absensiError) {
      console.error('Error fetching attendance:', absensiError)
      return NextResponse.json(
        { error: 'Gagal mengambil data kehadiran' },
        { status: 500 }
      )
    }

    return NextResponse.json(absensiData || [])

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}