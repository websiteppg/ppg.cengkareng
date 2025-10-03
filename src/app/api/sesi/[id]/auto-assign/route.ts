import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesiId = params.id
    const supabase = createServerClient()

    // Get peserta yang sudah absen tapi belum terdaftar di sesi_peserta
    const { data: absensiData } = await (supabase as any)
      .from('absensi')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    console.log('Absensi data:', absensiData)

    if (!absensiData || absensiData.length === 0) {
      return NextResponse.json({ message: 'Tidak ada peserta yang perlu di-assign' })
    }

    const pesertaAbsenIds = absensiData.map((a: any) => a.peserta_id)
    console.log('Peserta absen IDs:', pesertaAbsenIds)

    // Get peserta yang sudah terdaftar di sesi_peserta
    const { data: sesiPesertaData } = await (supabase as any)
      .from('sesi_peserta')
      .select('peserta_id')
      .eq('sesi_id', sesiId)

    console.log('Sesi peserta data:', sesiPesertaData)
    const pesertaTerdaftarIds = sesiPesertaData?.map((sp: any) => sp.peserta_id) || []
    console.log('Peserta terdaftar IDs:', pesertaTerdaftarIds)

    // Find peserta yang sudah absen tapi belum terdaftar
    const pesertaBelumTerdaftar = pesertaAbsenIds.filter(
      (id: string) => !pesertaTerdaftarIds.includes(id)
    )
    console.log('Peserta belum terdaftar:', pesertaBelumTerdaftar)

    if (pesertaBelumTerdaftar.length === 0) {
      return NextResponse.json({ message: 'Semua peserta sudah terdaftar' })
    }

    // Insert peserta baru ke sesi_peserta
    const newSesiPesertaData = pesertaBelumTerdaftar.map((peserta_id: string) => ({
      sesi_id: sesiId,
      peserta_id,
      wajib_hadir: true,
      created_at: new Date().toISOString()
    }))

    const { error } = await (supabase as any)
      .from('sesi_peserta')
      .insert(newSesiPesertaData)

    if (error) {
      console.error('Auto-assign error:', error)
      return NextResponse.json(
        { error: 'Gagal auto-assign peserta' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Berhasil auto-assign ${pesertaBelumTerdaftar.length} peserta`,
      assigned_count: pesertaBelumTerdaftar.length
    })

  } catch (error) {
    console.error('Auto-assign API error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}