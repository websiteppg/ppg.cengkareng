import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    const { data: programKerja, error } = await (supabase as any)
      .from('program_kerja_tahunan')
      .select(`
        id,
        tahun,
        created_by,
        created_at,
        updated_at,
        kegiatan_bidang(
          id,
          nama_bidang,
          no_urut,
          bulan,
          nama_kegiatan,
          tujuan_kegiatan,
          keterangan,
          alokasi_dana,
          created_at,
          updated_at,
          rincian_biaya(
            id,
            nama_item,
            jumlah,
            harga_satuan,
            hari_kegiatan,
            frekuensi,
            sub_total
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !programKerja) {
      return NextResponse.json({ error: 'Program kerja tidak ditemukan' }, { status: 404 })
    }

    // Transform data (no need to filter since using hard delete)
    const kegiatanBidang = (programKerja as any).kegiatan_bidang || []
    const kegiatan = kegiatanBidang.map((k: any) => ({
      ...k,
      rincian_biaya: k.rincian_biaya || []
    }))

    const result = {
      id: (programKerja as any).id,
      tahun: (programKerja as any).tahun,
      created_by: (programKerja as any).created_by,
      created_at: (programKerja as any).created_at,
      updated_at: (programKerja as any).updated_at,
      kegiatan
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Get program kerja detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    const { data: programKerja, error } = await (supabase as any)
      .from('program_kerja_tahunan')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(programKerja)

  } catch (error) {
    console.error('Update program kerja error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    // Get all kegiatan for this program kerja
    const { data: kegiatanList } = await (supabase as any)
      .from('kegiatan_bidang')
      .select('id')
      .eq('program_kerja_tahunan_id', params.id)

    if (kegiatanList && kegiatanList.length > 0) {
      // Hard delete all rincian biaya
      for (const kegiatan of kegiatanList) {
        await (supabase as any)
          .from('rincian_biaya')
          .delete()
          .eq('kegiatan_bidang_id', kegiatan.id)
      }

      // Hard delete all kegiatan
      await (supabase as any)
        .from('kegiatan_bidang')
        .delete()
        .eq('program_kerja_tahunan_id', params.id)
    }

    // Delete program kerja (hard delete since it's the parent)
    const { error } = await (supabase as any)
      .from('program_kerja_tahunan')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete program kerja error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}