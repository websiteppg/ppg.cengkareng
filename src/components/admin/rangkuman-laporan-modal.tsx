'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, X } from 'lucide-react'
import { toast } from 'sonner'

interface RangkumanData {
  mt: string
  ms: string
  total_tahfidz: number
  paud_cbr: {
    total_murid: number
    total_kelas: number
    total_tahfidz: number
    rata_kehadiran: number
    rata_pencapaian: number
  }
  pra_remaja: {
    total_murid: number
    total_kelas: number
    total_tahfidz: number
    rata_kehadiran: number
    rata_pencapaian: number
  }
  remaja: {
    total_murid: number
    total_kelas: number
    total_tahfidz: number
    rata_kehadiran: number
    rata_pencapaian: number
  }
  pra_nikah: {
    total_murid: number
    total_kelas: number
    total_tahfidz: number
    rata_kehadiran: number
    rata_pencapaian: number
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  desaId: string
  desaNama: string
  periode: string
}

export default function RangkumanLaporanModal({ isOpen, onClose, desaId, desaNama, periode }: Props) {
  const [data, setData] = useState<RangkumanData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && desaId && periode) {
      fetchRangkumanData()
    }
  }, [isOpen, desaId, periode])

  const fetchRangkumanData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/kbm-desa/rangkuman?desa_id=${desaId}&periode=${periode}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Gagal mengambil data rangkuman')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const formatPeriode = (periode: string) => {
    const [year, month] = periode.split('-')
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Rangkuman Laporan Desa {desaNama}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            📅 Periode: {formatPeriode(periode)}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Memuat data rangkuman...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Sumber Daya Manusia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5" />
                  👥 SUMBER DAYA MANUSIA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-600">MT (Mubaligh Tugasan)</div>
                    <div className="text-xl font-bold text-blue-600">{data.mt || '0'} orang</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-gray-600">MS (Mubaligh Setempat)</div>
                    <div className="text-xl font-bold text-green-600">{data.ms || '0'} orang</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PAUD/CBR */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 PAUD/CBR (PAUD, TK, SD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.paud_cbr.total_murid}</div>
                    <div className="text-sm text-gray-600">Murid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.paud_cbr.total_kelas}</div>
                    <div className="text-sm text-gray-600">Kelas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{data.paud_cbr.total_tahfidz}</div>
                    <div className="text-sm text-gray-600">Tahfidz</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{data.paud_cbr.rata_kehadiran}%</div>
                    <div className="text-sm text-gray-600">Kehadiran</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{data.paud_cbr.rata_pencapaian}%</div>
                    <div className="text-sm text-gray-600">Pencapaian</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PRA REMAJA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 PRA REMAJA (SMP)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.pra_remaja.total_murid}</div>
                    <div className="text-sm text-gray-600">Murid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.pra_remaja.total_kelas}</div>
                    <div className="text-sm text-gray-600">Kelas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{data.pra_remaja.total_tahfidz}</div>
                    <div className="text-sm text-gray-600">Tahfidz</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{data.pra_remaja.rata_kehadiran}%</div>
                    <div className="text-sm text-gray-600">Kehadiran</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{data.pra_remaja.rata_pencapaian}%</div>
                    <div className="text-sm text-gray-600">Pencapaian</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* REMAJA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 REMAJA (SMA)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.remaja.total_murid}</div>
                    <div className="text-sm text-gray-600">Murid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.remaja.total_kelas}</div>
                    <div className="text-sm text-gray-600">Kelas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{data.remaja.total_tahfidz}</div>
                    <div className="text-sm text-gray-600">Tahfidz</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{data.remaja.rata_kehadiran}%</div>
                    <div className="text-sm text-gray-600">Kehadiran</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{data.remaja.rata_pencapaian}%</div>
                    <div className="text-sm text-gray-600">Pencapaian</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PRA NIKAH */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 PRA NIKAH (USMAN)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.pra_nikah.total_murid}</div>
                    <div className="text-sm text-gray-600">Murid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.pra_nikah.total_kelas}</div>
                    <div className="text-sm text-gray-600">Kelas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{data.pra_nikah.total_tahfidz}</div>
                    <div className="text-sm text-gray-600">Tahfidz</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{data.pra_nikah.rata_kehadiran}%</div>
                    <div className="text-sm text-gray-600">Kehadiran</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{data.pra_nikah.rata_pencapaian}%</div>
                    <div className="text-sm text-gray-600">Pencapaian</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Tahfidz */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5" />
                  📖 PROGRAM TAHFIDZ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">{data.total_tahfidz}</div>
                  <div className="text-lg text-gray-700 mb-4">Total Program Tahfidz</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="font-semibold text-blue-700">PAUD/CBR</div>
                      <div className="text-xl font-bold text-blue-600">{data.paud_cbr.total_tahfidz}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="font-semibold text-green-700">PRA REMAJA</div>
                      <div className="text-xl font-bold text-green-600">{data.pra_remaja.total_tahfidz}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="font-semibold text-yellow-700">REMAJA</div>
                      <div className="text-xl font-bold text-yellow-600">{data.remaja.total_tahfidz}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="font-semibold text-purple-700">PRA NIKAH</div>
                      <div className="text-xl font-bold text-purple-600">{data.pra_nikah.total_tahfidz}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Tidak ada data rangkuman untuk periode ini
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}