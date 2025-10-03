import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { notulensiId } = body

    if (!notulensiId) {
      return NextResponse.json(
        { error: 'Notulensi ID wajib diisi' },
        { status: 400 }
      )
    }

    // Fetch detailed notulensi data for PDF export
    const { data: notulensi, error } = await supabase
      .from('notulensi_sesi')
      .select(`
        *,
        sesi:sesi_id(
          nama_sesi, 
          tanggal, 
          waktu_mulai, 
          waktu_selesai, 
          lokasi,
          tipe
        ),
        dibuat_oleh:dibuat_oleh(nama),
        disetujui_oleh:disetujui_oleh(nama)
      `)
      .eq('id', notulensiId)
      .single()

    if (error || !notulensi) {
      return NextResponse.json(
        { error: 'Notulensi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Format data for PDF export
    const exportData = {
      id: (notulensi as any).id,
      judul: (notulensi as any).judul,
      status: (notulensi as any).status,
      created_at: (notulensi as any).created_at,
      updated_at: (notulensi as any).updated_at,
      agenda: (notulensi as any).agenda || '',
      pembahasan: (notulensi as any).pembahasan || '',
      keputusan: (notulensi as any).keputusan || '',
      tindak_lanjut: (notulensi as any).tindak_lanjut || '',
      sesi: (notulensi as any).sesi ? {
        nama_sesi: (notulensi as any).sesi.nama_sesi,
        tanggal: (notulensi as any).sesi.tanggal,
        waktu_mulai: (notulensi as any).sesi.waktu_mulai,
        waktu_selesai: (notulensi as any).sesi.waktu_selesai,
        lokasi: (notulensi as any).sesi.lokasi,
        tipe: (notulensi as any).sesi.tipe
      } : null,
      dibuat_oleh: (notulensi as any).dibuat_oleh?.nama || 'Unknown',
      disetujui_oleh: (notulensi as any).disetujui_oleh?.nama || null
    }

    return NextResponse.json(exportData)

  } catch (error) {
    console.error('Export notulensi error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    )
  }
}