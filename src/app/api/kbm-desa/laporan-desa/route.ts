import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// createClient already imported

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const periode = searchParams.get('periode')
    const desaId = searchParams.get('desa_id')

    if (!periode || !desaId) {
      return NextResponse.json(
        { success: false, error: 'Periode dan desa_id wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('laporan_desa')
      .select('*')
      .eq('periode', periode)
      .eq('desa_id', desaId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || null
    })
  } catch (error) {
    console.error('Error fetching laporan desa:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data laporan desa' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      desa_id, 
      periode, 
      mt,
      ms,
      laporan_musyawarah,
      kendala_saran,
      created_by
    } = body

    if (!desa_id || !periode) {
      return NextResponse.json(
        { success: false, error: 'Desa ID dan periode wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await (supabase as any)
      .from('laporan_desa')
      .insert({
        desa_id,
        periode,
        mt: mt || '',
        ms: ms || '',
        laporan_musyawarah: laporan_musyawarah || '',
        kendala_saran: kendala_saran || '',
        created_by
      })
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data[0]
    })
  } catch (error) {
    console.error('Error creating laporan desa:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan laporan desa' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      id,
      mt,
      ms,
      laporan_musyawarah,
      kendala_saran
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID wajib diisi' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await (supabase as any)
      .from('laporan_desa')
      .update({
        mt: mt || '',
        ms: ms || '',
        laporan_musyawarah: laporan_musyawarah || '',
        kendala_saran: kendala_saran || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data[0]
    })
  } catch (error) {
    console.error('Error updating laporan desa:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate laporan desa' },
      { status: 500 }
    )
  }
}
