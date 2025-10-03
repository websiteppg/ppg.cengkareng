'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface KegiatanProgram {
  id: string
  rincian_biaya_fleksibel?: any[]
  rincian_biaya?: any
  alokasi_dana: number
}

interface KategoriBiayaChartProps {
  kegiatan: KegiatanProgram[]
}

const COLORS = {
  'Konsumsi': '#22C55E',
  'Transport': '#3B82F6', 
  'Akomodasi': '#F59E0B',
  'Dokumentasi': '#EF4444',
  'Lainnya': '#8B5CF6'
}

export function KategoriBiayaChart({ kegiatan }: KategoriBiayaChartProps) {
  const kategoriData = kegiatan.reduce((acc: any, k) => {
    let hasRincianBiaya = false
    
    // Dari rincian biaya fleksibel
    if (k.rincian_biaya_fleksibel && Array.isArray(k.rincian_biaya_fleksibel) && k.rincian_biaya_fleksibel.length > 0) {
      k.rincian_biaya_fleksibel.forEach((item: any) => {
        const kategori = item.kategori || 'Lainnya'
        acc[kategori] = (acc[kategori] || 0) + (item.subtotal || 0)
        hasRincianBiaya = true
      })
    }
    // Dari rincian biaya array (database structure)
    else if (k.rincian_biaya && Array.isArray(k.rincian_biaya) && k.rincian_biaya.length > 0) {
      k.rincian_biaya.forEach((item: any) => {
        // Map database items to categories based on nama_item
        const namaItem = (item.nama_item || '').toLowerCase()
        let kategori = 'Lainnya'
        
        if (namaItem.includes('makan') || namaItem.includes('konsumsi') || namaItem.includes('snack')) {
          kategori = 'Konsumsi'
        } else if (namaItem.includes('transport') || namaItem.includes('bensin') || namaItem.includes('ojek')) {
          kategori = 'Transport'
        } else if (namaItem.includes('hotel') || namaItem.includes('penginapan') || namaItem.includes('akomodasi')) {
          kategori = 'Akomodasi'
        } else if (namaItem.includes('foto') || namaItem.includes('video') || namaItem.includes('dokumentasi')) {
          kategori = 'Dokumentasi'
        }
        
        acc[kategori] = (acc[kategori] || 0) + (item.sub_total || 0)
        hasRincianBiaya = true
      })
    }
    // Dari rincian biaya legacy object
    else if (k.rincian_biaya && typeof k.rincian_biaya === 'object' && !Array.isArray(k.rincian_biaya)) {
      acc['Konsumsi'] = (acc['Konsumsi'] || 0) + (k.rincian_biaya.konsumsi || 0)
      acc['Akomodasi'] = (acc['Akomodasi'] || 0) + (k.rincian_biaya.akomodasi || 0)
      acc['Dokumentasi'] = (acc['Dokumentasi'] || 0) + (k.rincian_biaya.dokumentasi || 0)
      acc['Lainnya'] = (acc['Lainnya'] || 0) + (k.rincian_biaya.extra_biaya || 0)
      hasRincianBiaya = true
    }
    
    // Fallback ke total alokasi (always execute if no detailed breakdown)
    if (!hasRincianBiaya && k.alokasi_dana && k.alokasi_dana > 0) {
      acc['Lainnya'] = (acc['Lainnya'] || 0) + k.alokasi_dana
    }
    
    return acc
  }, {})

  const chartData = Object.entries(kategoriData)
    .filter(([_, value]) => (value as number) > 0)
    .map(([kategori, value]) => ({
      kategori,
      value: value as number,
      color: COLORS[kategori as keyof typeof COLORS] || '#6B7280'
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.kategori}</p>
          <p style={{ color: data.color }}>
            {formatCurrency(data.value)}
          </p>
        </div>
      )
    }
    return null
  }

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
    return `${percent}%`
  }

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <p>Tidak ada data rincian biaya</p>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>
                {value}: {formatCurrency(entry.payload.value)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}