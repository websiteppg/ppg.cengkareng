import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()



    // Get all assigned peserta IDs first
    const { data: sesiPesertaData, error: sesiPesertaError } = await supabase
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)



    if (sesiPesertaError) {
      console.error('Error fetching sesi_peserta:', sesiPesertaError)
      return NextResponse.json({ error: 'Gagal mengambil data peserta' }, { status: 500 })
    }

    const assignedPesertaIds = sesiPesertaData?.map((sp: any) => sp.peserta_id) || []

    // Get absensi data
    const { data: absensiData, error: absensiError } = await supabase
      .from('absensi')
      .select('peserta_id, status_kehadiran, waktu_absen, catatan')
      .eq('sesi_id', sesiId)



    if (absensiError) {
      console.error('Error fetching absensi:', absensiError)
    }

    // Get peserta who have attended but might not be in sesi_peserta
    const attendedPesertaIds = absensiData?.map((a: any) => a.peserta_id) || []
    const allPesertaIds = Array.from(new Set(assignedPesertaIds.concat(attendedPesertaIds)))

    // Get all peserta details
    const { data: allPesertaDetails, error: pesertaDetailsError } = await supabase
      .from('peserta')
      .select('id, nama, email, jabatan, instansi')
      .in('id', allPesertaIds)

    if (pesertaDetailsError) {
      console.error('Error fetching peserta details:', pesertaDetailsError)
    }

    // Combine data: all peserta with their attendance status
    const result = allPesertaDetails?.map((peserta: any) => {
      const absensi = absensiData?.find((a: any) => a.peserta_id === peserta.id) as any
      return {
        peserta,
        absensi: absensi || null,
        status_kehadiran: absensi?.status_kehadiran || 'ghoib',
        waktu_absen: absensi?.waktu_absen || null,
        catatan: absensi?.catatan || null
      }
    }) || []



    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    return response

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}