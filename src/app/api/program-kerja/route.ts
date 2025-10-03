import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createProgramKerjaSchema } from '@/lib/validations/program-kerja'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const url = new URL(request.url)
    const tahun = url.searchParams.get('tahun')

    let query = (supabase as any)
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
          alokasi_dana,
          deleted_at
        )
      `)
      .order('tahun', { ascending: false })

    if (tahun) {
      query = query.eq('tahun', parseInt(tahun))
    }

    const { data: programKerja, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggregate data
    const aggregatedData = programKerja?.map((program: any) => {
      const kegiatanList = program.kegiatan_bidang || []
      const kegiatanByBidang = kegiatanList
        .filter((k: any) => !k.deleted_at)
        .reduce((acc: any, kegiatan: any) => {
          if (!acc[kegiatan.nama_bidang]) {
            acc[kegiatan.nama_bidang] = {
              jumlahKegiatan: 0,
              totalAlokasi: 0
            }
          }
          acc[kegiatan.nama_bidang].jumlahKegiatan += 1
          acc[kegiatan.nama_bidang].totalAlokasi += Number(kegiatan.alokasi_dana)
          return acc
        }, {})

      const totalAlokasi = Object.values(kegiatanByBidang)
        .reduce((sum: number, bidang: any) => sum + bidang.totalAlokasi, 0)

      return {
        id: program.id,
        tahun: program.tahun,
        bidangSummary: kegiatanByBidang,
        totalAlokasi,
        created_at: program.created_at,
        updated_at: program.updated_at
      }
    }) || []

    return NextResponse.json(aggregatedData)

  } catch (error) {
    console.error('Get program kerja error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()

    // Validate input
    const validatedData = createProgramKerjaSchema.parse(body)

    // Check if tahun already exists
    const { data: existing } = await (supabase as any)
      .from('program_kerja_tahunan')
      .select('id')
      .eq('tahun', validatedData.tahun)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Program kerja untuk tahun ini sudah ada' }, { status: 400 })
    }

    // Create program kerja
    const { data: programKerja, error } = await (supabase as any)
      .from('program_kerja_tahunan')
      .insert({
        tahun: validatedData.tahun,
        created_by: '00000000-0000-0000-0000-000000000000', // Default system UUID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(programKerja)

  } catch (error) {
    console.error('Create program kerja error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}