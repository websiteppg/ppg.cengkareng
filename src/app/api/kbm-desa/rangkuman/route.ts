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

    // Ambil data laporan desa (MT, MS)
    const { data: laporanDesa, error: laporanDesaError } = await supabase
      .from('laporan_desa')
      .select('mt, ms')
      .eq('periode', periode)
      .eq('desa_id', desaId)
      .single()

    // Ignore error jika data tidak ditemukan
    if (laporanDesaError && laporanDesaError.code !== 'PGRST116') {
      console.error('Error fetching laporan desa:', laporanDesaError)
    }

    // Ambil data laporan KBM per kategori
    const { data: laporanKBM, error } = await supabase
      .from('laporan_kbm_desa')
      .select('kategori_program, jumlah_murid, jumlah_kelas, persentase_kehadiran, pencapaian_target_materi, tahfidz')
      .eq('periode', periode)
      .eq('desa_id', desaId)

    if (error) throw error

    // Agregasi data per kategori program
    const kategoris = ['paud_cbr', 'pra_remaja', 'remaja', 'pra_nikah']
    const rangkuman: any = {
      mt: (laporanDesa as any)?.mt || '0',
      ms: (laporanDesa as any)?.ms || '0',
      total_tahfidz: 0
    }

    kategoris.forEach(kategori => {
      const dataKategori = laporanKBM?.filter((item: any) => item.kategori_program === kategori) || []
      
      if (dataKategori.length > 0) {
        const totalMurid = dataKategori.reduce((sum: number, item: any) => sum + (item.jumlah_murid || 0), 0)
        const totalKelas = dataKategori.reduce((sum: number, item: any) => sum + (item.jumlah_kelas || 0), 0)
        const totalTahfidz = dataKategori.reduce((sum: number, item: any) => {
          const tahfidzValue = typeof item.tahfidz === 'number' ? item.tahfidz : parseInt(item.tahfidz) || 0
          return sum + tahfidzValue
        }, 0)
        const rataKehadiran = Math.round(
          dataKategori.reduce((sum: number, item: any) => sum + (item.persentase_kehadiran || 0), 0) / dataKategori.length
        )
        const rataPencapaian = Math.round(
          dataKategori.reduce((sum: number, item: any) => sum + (item.pencapaian_target_materi || 0), 0) / dataKategori.length
        )

        rangkuman[kategori] = {
          total_murid: totalMurid,
          total_kelas: totalKelas,
          total_tahfidz: totalTahfidz,
          rata_kehadiran: rataKehadiran || 0,
          rata_pencapaian: rataPencapaian || 0
        }

        // Tambahkan ke total tahfidz keseluruhan
        rangkuman.total_tahfidz += totalTahfidz
      } else {
        rangkuman[kategori] = {
          total_murid: 0,
          total_kelas: 0,
          total_tahfidz: 0,
          rata_kehadiran: 0,
          rata_pencapaian: 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: rangkuman
    })
  } catch (error) {
    console.error('Error fetching rangkuman:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data rangkuman' },
      { status: 500 }
    )
  }
}
