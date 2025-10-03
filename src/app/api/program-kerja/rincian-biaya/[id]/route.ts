import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { calculateSubTotal, calculateAlokasiDanaKegiatan } from '@/lib/utils/calculations'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    console.log('PATCH rincian biaya body:', body)

    // Get current rincian biaya to get kegiatan_bidang_id
    const { data: currentRincian } = await (supabase as any)
      .from('rincian_biaya')
      .select('kegiatan_bidang_id')
      .eq('id', params.id)
      .single()

    if (!currentRincian) {
      return NextResponse.json({ error: 'Rincian biaya tidak ditemukan' }, { status: 404 })
    }

    // Use provided sub_total or recalculate if calculation fields are provided
    let updateData = { ...body, updated_at: new Date().toISOString() }
    
    // If sub_total is provided, use it; otherwise calculate it
    if (body.sub_total !== undefined) {
      updateData.sub_total = body.sub_total
    } else if (body.jumlah !== undefined && body.harga_satuan !== undefined && body.hari_kegiatan !== undefined && body.frekuensi !== undefined) {
      updateData.sub_total = calculateSubTotal(
        body.jumlah,
        body.harga_satuan,
        body.hari_kegiatan,
        body.frekuensi
      )
    }

    console.log('Update data to be sent:', updateData)
    
    // Update rincian biaya
    const { data: rincianBiaya, error } = await (supabase as any)
      .from('rincian_biaya')
      .update(updateData)
      .eq('id', params.id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Recalculate kegiatan alokasi dana
    await recalculateKegiatanAlokasi(supabase, (currentRincian as any).kegiatan_bidang_id)

    return NextResponse.json(rincianBiaya)

  } catch (error) {
    console.error('Update rincian biaya error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    // Get kegiatan_bidang_id before delete
    const { data: rincianBiaya } = await (supabase as any)
      .from('rincian_biaya')
      .select('kegiatan_bidang_id')
      .eq('id', params.id)
      .single()

    if (!rincianBiaya) {
      return NextResponse.json({ error: 'Rincian biaya tidak ditemukan' }, { status: 404 })
    }

    // Hard delete
    const { error } = await (supabase as any)
      .from('rincian_biaya')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Recalculate kegiatan alokasi dana
    await recalculateKegiatanAlokasi(supabase, (rincianBiaya as any).kegiatan_bidang_id)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete rincian biaya error:', error)
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