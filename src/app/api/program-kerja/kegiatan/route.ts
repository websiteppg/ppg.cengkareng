import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createKegiatanSchema } from '@/lib/validations/program-kerja'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const programId = searchParams.get('programId')

    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 })
    }

    const { data: kegiatan, error } = await (supabase as any)
      .from('kegiatan_bidang')
      .select('*')
      .eq('program_kerja_tahunan_id', programId)
      .is('deleted_at', null)
      .order('no_urut', { ascending: true })

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(kegiatan || [])

  } catch (error) {
    console.error('Get kegiatan list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    console.log('Received kegiatan data:', body)

    // Validate input
    const validatedData = createKegiatanSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Verify program kerja exists
    const { data: programKerja, error: programError } = await (supabase as any)
      .from('program_kerja_tahunan')
      .select('id')
      .eq('id', validatedData.programKerjaTahunanId)
      .single()

    if (programError || !programKerja) {
      return NextResponse.json({ error: 'Program kerja tidak ditemukan' }, { status: 404 })
    }

    // Create kegiatan
    const { data: kegiatan, error } = await (supabase as any)
      .from('kegiatan_bidang')
      .insert({
        program_kerja_tahunan_id: validatedData.programKerjaTahunanId,
        nama_bidang: validatedData.namaBidang,
        no_urut: validatedData.noUrut,
        bulan: validatedData.bulan,
        nama_kegiatan: validatedData.namaKegiatan,
        tujuan_kegiatan: validatedData.tujuanKegiatan,
        keterangan: validatedData.keterangan || null,
        alokasi_dana: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('Created kegiatan:', kegiatan)
    return NextResponse.json(kegiatan)

  } catch (error) {
    console.error('Create kegiatan error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}