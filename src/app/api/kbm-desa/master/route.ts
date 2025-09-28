import { NextRequest, NextResponse } from 'next/server'

const DESA_DATA = [
  {
    id: 'kalideres',
    nama_desa: 'Kalideres',
    kelompok: ['Tegal Alur A', 'Tegal Alur B', 'Prepedan A', 'Prepedan B', 'Kebon Kelapa']
  },
  {
    id: 'bandara',
    nama_desa: 'Bandara',
    kelompok: ['Prima', 'Rawa Lele', 'Kampung Duri']
  },
  {
    id: 'kebon_jahe',
    nama_desa: 'Kebon Jahe',
    kelompok: ['Kebon Jahe A', 'Kebon Jahe B', 'Garikas', 'Taniwan']
  },
  {
    id: 'cengkareng',
    nama_desa: 'Cengkareng',
    kelompok: ['Fajar A', 'Fajar B', 'Fajar C']
  },
  {
    id: 'kapuk_melati',
    nama_desa: 'Kapuk Melati',
    kelompok: ['BGN', 'Melati A', 'Melati B']
  },
  {
    id: 'taman_kota',
    nama_desa: 'Taman Kota',
    kelompok: ['Tamkot A', 'Tamkot B', 'Rawa Buaya A', 'Rawa Buaya B']
  },
  {
    id: 'jelambar',
    nama_desa: 'Jelambar',
    kelompok: ['Indah', 'Jaya', 'Damai', 'Pejagalan']
  },
  {
    id: 'cipondoh',
    nama_desa: 'Cipondoh',
    kelompok: ['Griya Permata', 'Pondok Bahar', 'Semanan A', 'Semanan B']
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('role')

    let filteredData = DESA_DATA

    // Filter berdasarkan role KBM Desa
    if (userRole && userRole.startsWith('kbm_desa_')) {
      const allowedDesaId = userRole.replace('kbm_desa_', '')
      filteredData = DESA_DATA.filter(desa => desa.id === allowedDesaId)
    }

    return NextResponse.json({
      success: true,
      data: filteredData
    })
  } catch (error) {
    console.error('Error fetching desa master:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data desa' },
      { status: 500 }
    )
  }
}
