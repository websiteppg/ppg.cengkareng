'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, DollarSign } from 'lucide-react'
import { formatCurrency, getBidangLabel, getBulanLabel } from '@/lib/utils/calculations'
import Link from 'next/link'

interface BidangSummary {
  namaBidang: string
  labelBidang: string
  jumlahKegiatan: number
  totalAlokasi: number
  kegiatan: Array<{
    id: string
    namaKegiatan: string
    bulan: string
    tujuanKegiatan: string
    alokasiDana: number
    jumlahRincian: number
  }>
}

interface Summary {
  tahun: number
  bidangList: BidangSummary[]
  grandTotal: number
  totalBidang: number
  totalKegiatan: number
}

export default function SummaryPage() {
  const params = useParams()
  const tahun = parseInt(params.tahun as string)
  
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [tahun])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/program-kerja/summary/${tahun}`)
      
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      } else {
        console.error('Failed to fetch summary')
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data Tidak Ditemukan</h3>
            <p className="text-gray-500 text-center mb-4">
              Belum ada data summary untuk tahun {tahun}
            </p>
            <Link href={`/admin/program-kerja/${tahun}`}>
              <Button>Kembali ke Program Kerja</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/admin/program-kerja/${tahun}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Summary Program Kerja {tahun}</h1>
            <p className="text-gray-600">
              {summary.totalBidang} bidang • {summary.totalKegiatan} kegiatan • {formatCurrency(summary.grandTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bidang</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalBidang}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kegiatan</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalKegiatan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alokasi</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.grandTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bidang Details */}
      <div className="space-y-6">
        {summary.bidangList.map((bidang) => (
          <Card key={bidang.namaBidang}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{bidang.labelBidang}</span>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">{bidang.jumlahKegiatan} kegiatan</Badge>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(bidang.totalAlokasi)}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bidang.kegiatan.map((kegiatan) => (
                  <div key={kegiatan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className="text-xs bg-gray-100 text-gray-800">
                          {getBulanLabel(kegiatan.bulan)}
                        </Badge>
                        <h4 className="font-medium text-gray-900">{kegiatan.namaKegiatan}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{kegiatan.tujuanKegiatan}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {kegiatan.jumlahRincian} item rincian biaya
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(kegiatan.alokasiDana)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}