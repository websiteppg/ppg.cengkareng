'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface KegiatanProgram {
  id: string
  bulan: string
  nama_kegiatan: string
  alokasi_dana: number
}

interface BiayaChartProps {
  kegiatan: KegiatanProgram[]
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export function BiayaChart({ kegiatan }: BiayaChartProps) {
  const chartData = MONTHS.map(month => {
    const kegiatanBulan = kegiatan.filter(k => k.bulan?.toUpperCase() === month.toUpperCase())
    const totalBiaya = kegiatanBulan.reduce((total, k) => total + (k.alokasi_dana || 0), 0)
    
    return {
      bulan: month.substring(0, 3), // Singkat untuk chart
      total: totalBiaya,
      jumlahKegiatan: kegiatanBulan.length
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-green-600">
            Total: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-600">
            Kegiatan: {payload[0].payload.jumlahKegiatan}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="bulan" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="total" 
            fill="#22C55E" 
            radius={[4, 4, 0, 0]}
            name="Total Biaya"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}