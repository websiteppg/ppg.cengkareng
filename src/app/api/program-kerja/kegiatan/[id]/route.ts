import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createKegiatanSchema } from '@/lib/validations/program-kerja'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { id } = params

    // Validate input
    const validatedData = createKegiatanSchema.parse(body)

    // Check if no_urut already exists in same bidang (excluding current kegiatan)
    const { data: existingKegiatan, error: checkError } = await (supabase as any)
      .from('kegiatan_bidang')
      .select('id')
      .eq('program_kerja_tahunan_id', validatedData.programKerjaTahunanId)
      .eq('nama_bidang', validatedData.namaBidang)
      .eq('no_urut', validatedData.noUrut)
      .neq('id', id)
      .single()

    if (existingKegiatan) {
      return NextResponse.json({ 
        error: `Nomor urut ${validatedData.noUrut} sudah digunakan di bidang ini` 
      }, { status: 400 })
    }

    // Update kegiatan
    const { data: kegiatan, error } = await (supabase as any)
      .from('kegiatan_bidang')
      .update({
        nama_bidang: validatedData.namaBidang,
        no_urut: validatedData.noUrut,
        bulan: validatedData.bulan,
        nama_kegiatan: validatedData.namaKegiatan,
        tujuan_kegiatan: validatedData.tujuanKegiatan,
        keterangan: validatedData.keterangan || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(kegiatan)

  } catch (error) {
    console.error('Update kegiatan error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Get kegiatan with rincian biaya
    const { data: kegiatan, error } = await (supabase as any)
      .from('kegiatan_bidang')
      .select(`
        *,
        rincian_biaya (
          id,
          nama_item,
          jumlah,
          harga_satuan,
          hari_kegiatan,
          frekuensi,
          sub_total,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !kegiatan) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 })
    }

    // Filter out deleted rincian biaya
    if (kegiatan.rincian_biaya) {
      kegiatan.rincian_biaya = kegiatan.rincian_biaya.filter((r: any) => !r.deleted_at)
    }

    return NextResponse.json(kegiatan)

  } catch (error) {
    console.error('Get kegiatan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // First delete all rincian biaya for this kegiatan
    await (supabase as any)
      .from('rincian_biaya')
      .delete()
      .eq('kegiatan_bidang_id', id)

    // Then delete the kegiatan
    const { error } = await (supabase as any)
      .from('kegiatan_bidang')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete kegiatan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}