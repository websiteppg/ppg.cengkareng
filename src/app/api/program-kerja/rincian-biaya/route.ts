import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createRincianBiayaSchema } from '@/lib/validations/program-kerja'
import { calculateSubTotal, calculateAlokasiDanaKegiatan } from '@/lib/utils/calculations'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    // Validate input
    const validatedData = createRincianBiayaSchema.parse(body)

    // Calculate sub total
    const subTotal = calculateSubTotal(
      validatedData.jumlah,
      validatedData.hargaSatuan,
      validatedData.hariKegiatan,
      validatedData.frekuensi
    )

    // Create rincian biaya
    const { data: rincianBiaya, error } = await (supabase as any)
      .from('rincian_biaya')
      .insert({
        kegiatan_bidang_id: validatedData.kegiatanBidangId,
        nama_item: validatedData.namaItem,
        jumlah: validatedData.jumlah,
        harga_satuan: validatedData.hargaSatuan,
        hari_kegiatan: validatedData.hariKegiatan,
        frekuensi: validatedData.frekuensi,
        sub_total: subTotal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Recalculate kegiatan alokasi dana
    await recalculateKegiatanAlokasi(supabase, validatedData.kegiatanBidangId)

    return NextResponse.json(rincianBiaya)

  } catch (error) {
    console.error('Create rincian biaya error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function recalculateKegiatanAlokasi(supabase: any, kegiatanBidangId: string) {
  // Get all rincian biaya for this kegiatan
  const { data: rincianList } = await (supabase as any)
    .from('rincian_biaya')
    .select('sub_total, deleted_at')
    .eq('kegiatan_bidang_id', kegiatanBidangId)

  if (rincianList) {
    const totalAlokasi = calculateAlokasiDanaKegiatan(rincianList)
    
    // Update kegiatan alokasi dana
    await (supabase as any)
      .from('kegiatan_bidang')
      .update({ alokasi_dana: totalAlokasi })
      .eq('id', kegiatanBidangId)
  }
}