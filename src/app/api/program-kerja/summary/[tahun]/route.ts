import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getBidangLabel } from '@/lib/utils/calculations'

export async function GET(request: NextRequest, { params }: { params: { tahun: string } }) {
  try {
    const supabase = createServerClient()
    const tahun = parseInt(params.tahun)

    // Get program kerja for the year
    const { data: programKerja, error: programError } = await (supabase as any)
      .from('program_kerja_tahunan')
      .select(`
        id,
        tahun,
        kegiatan_bidang!inner(
          id,
          nama_bidang,
          nama_kegiatan,
          bulan,
          tujuan_kegiatan,
          alokasi_dana,
          deleted_at,
          rincian_biaya!inner(
            id,
            nama_item,
            sub_total,
            deleted_at
          )
        )
      `)
      .eq('tahun', tahun)
      .single()

    if (programError || !programKerja) {
      return NextResponse.json({ error: 'Program kerja tidak ditemukan' }, { status: 404 })
    }

    // Group by bidang
    const bidangMap: Record<string, any> = Object.create(null)
    
    (programKerja as any).kegiatan_bidang
      .filter((kegiatan: any) => !kegiatan.deleted_at)
      .forEach((kegiatan: any) => {
        const bidang = kegiatan.nama_bidang
        
        if (!bidangMap[bidang]) {
          bidangMap[bidang] = {
            namaBidang: bidang,
            labelBidang: getBidangLabel(bidang),
            jumlahKegiatan: 0,
            totalAlokasi: 0,
            kegiatan: []
          }
        }
        
        const bidangData = bidangMap[bidang]
        bidangData.jumlahKegiatan += 1
        bidangData.totalAlokasi += Number(kegiatan.alokasi_dana)
        bidangData.kegiatan.push({
          id: kegiatan.id,
          namaKegiatan: kegiatan.nama_kegiatan,
          bulan: kegiatan.bulan,
          tujuanKegiatan: kegiatan.tujuan_kegiatan,
          alokasiDana: Number(kegiatan.alokasi_dana),
          jumlahRincian: kegiatan.rincian_biaya.filter((r: any) => !r.deleted_at).length
        })
      })

    // Convert to array and calculate grand total
    const bidangList = Object.values(bidangMap)
    const grandTotal = bidangList.reduce((sum, bidang) => sum + bidang.totalAlokasi, 0)

    const summary = {
      tahun: (programKerja as any).tahun,
      bidangList,
      grandTotal,
      totalBidang: bidangList.length,
      totalKegiatan: bidangList.reduce((sum, bidang) => sum + bidang.jumlahKegiatan, 0)
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Get summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}