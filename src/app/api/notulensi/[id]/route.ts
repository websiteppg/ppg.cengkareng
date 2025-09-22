import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data: notulensi, error } = await supabase
      .from('notulensi_sesi')
      .select(`
        *,
        sesi:sesi_id(nama_sesi, tanggal, waktu_mulai, waktu_selesai, lokasi),
        dibuat_oleh:dibuat_oleh(nama),
        disetujui_oleh:disetujui_oleh(nama)
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Notulensi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(notulensi)

  } catch (error) {
    console.error('Get notulensi error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params
    const body = await request.json()

    // Validate required fields
    if (!body.judul) {
      return NextResponse.json(
        { error: 'Judul wajib diisi' },
        { status: 400 }
      )
    }

    const { data, error } = await (supabase as any)
      .from('notulensi_sesi')
      .update({
        judul: body.judul,
        agenda: body.agenda || '',
        pembahasan: body.pembahasan || '',
        keputusan: body.keputusan || '',
        tindak_lanjut: body.tindak_lanjut || '',
        status: body.status || 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Gagal mengupdate notulensi' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Update notulensi error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { error } = await (supabase as any)
      .from('notulensi_sesi')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Gagal menghapus notulensi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Notulensi berhasil dihapus' })

  } catch (error) {
    console.error('Delete notulensi error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}