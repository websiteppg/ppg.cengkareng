'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, FileText, Heart } from 'lucide-react'
import Link from 'next/link'

interface Peserta {
  id: string
  nama: string
  email: string
  jabatan: string
  instansi: string
}

interface Absensi {
  id: string
  peserta_id: string
  status_kehadiran: string
  waktu_absen: string
  catatan: string
  peserta: Peserta
}

interface Sesi {
  id: string
  nama_sesi: string
  tanggal: string
  waktu_mulai: string
  waktu_selesai: string
  lokasi: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'hadir': return <CheckCircle className="w-4 h-4" />
    case 'ghoib': return <XCircle className="w-4 h-4" />
    case 'izin': return <FileText className="w-4 h-4" />
    case 'sakit': return <Heart className="w-4 h-4" />
    default: return <Clock className="w-4 h-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'hadir': return 'bg-green-100 text-green-800'
    case 'ghoib': return 'bg-red-100 text-red-800'
    case 'izin': return 'bg-yellow-100 text-yellow-800'
    case 'sakit': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'hadir': return 'Hadir'
    case 'ghoib': return 'Ghoib'
    case 'izin': return 'Izin'
    case 'sakit': return 'Sakit'
    default: return 'Belum Absen'
  }
}

export default function KehadiranPage() {
  const params = useParams()
  const sesiId = params.id as string
  
  const [sesi, setSesi] = useState<Sesi | null>(null)
  const [absensi, setAbsensi] = useState<Absensi[]>([])
  const [allPeserta, setAllPeserta] = useState<Peserta[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sesiId) {
      fetchData()
    }
  }, [sesiId])

  const fetchData = async () => {
    try {
      // Fetch sesi info
      const sesiResponse = await fetch(`/api/sesi/${sesiId}`)
      if (sesiResponse.ok) {
        const sesiData = await sesiResponse.json()
        setSesi(sesiData)
      }

      // Fetch kehadiran data
      const kehadiranResponse = await fetch(`/api/absensi/sesi/${sesiId}`)
      let kehadiranData = []
      if (kehadiranResponse.ok) {
        kehadiranData = await kehadiranResponse.json()
        setAbsensi(kehadiranData)
      }

      // Fetch peserta terdaftar
      const pesertaResponse = await fetch(`/api/sesi/${sesiId}/peserta`)
      let pesertaTerdaftar = []
      if (pesertaResponse.ok) {
        pesertaTerdaftar = await pesertaResponse.json()
      }

      // Gabungkan dengan peserta yang sudah absen tapi tidak terdaftar
      const pesertaAbsen = kehadiranData?.map((a: any) => a.peserta).filter(Boolean) || []
      const allPesertaMap = new Map()
      
      // Tambahkan peserta terdaftar
      pesertaTerdaftar.forEach((p: any) => allPesertaMap.set(p.id, p))
      
      // Tambahkan peserta yang sudah absen
      pesertaAbsen.forEach((p: any) => allPesertaMap.set(p.id, p))
      
      setAllPeserta(Array.from(allPesertaMap.values()))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getKehadiranStatus = (pesertaId: string) => {
    const kehadiran = absensi.find(a => a.peserta_id === pesertaId)
    return kehadiran ? kehadiran.status_kehadiran : 'ghoib'
  }

  const getKehadiranWaktu = (pesertaId: string) => {
    const kehadiran = absensi.find(a => a.peserta_id === pesertaId)
    return kehadiran ? new Date(kehadiran.waktu_absen).toLocaleString('id-ID') : '-'
  }

  const getKehadiranCatatan = (pesertaId: string) => {
    const kehadiran = absensi.find(a => a.peserta_id === pesertaId)
    return kehadiran?.catatan || '-'
  }

  const stats = {
    total: allPeserta.length,
    hadir: absensi.filter(a => a.status_kehadiran === 'hadir').length,
    ghoib: allPeserta.length - absensi.length,
    izin: absensi.filter(a => a.status_kehadiran === 'izin').length,
    sakit: absensi.filter(a => a.status_kehadiran === 'sakit').length
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kehadiran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/sesi">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kehadiran Peserta</h1>
          <p className="text-gray-600 mt-1">
            {sesi?.nama_sesi} - {sesi && new Date(sesi.tanggal).toLocaleDateString('id-ID')}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Peserta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.hadir}</div>
            <div className="text-sm text-gray-600">Hadir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.ghoib}</div>
            <div className="text-sm text-gray-600">Ghoib</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{stats.izin}</div>
            <div className="text-sm text-gray-600">Izin</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.sakit}</div>
            <div className="text-sm text-gray-600">Sakit</div>
          </CardContent>
        </Card>
      </div>

      {/* Peserta List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kehadiran Peserta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">No</th>
                  <th className="text-left p-3">Nama Peserta</th>
                  <th className="text-left p-3">Jabatan</th>
                  <th className="text-left p-3">Instansi</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Waktu Absen</th>
                  <th className="text-left p-3">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {allPeserta.map((peserta, index) => {
                  const status = getKehadiranStatus(peserta.id)
                  return (
                    <tr key={peserta.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{peserta.nama}</div>
                          <div className="text-sm text-gray-600">{peserta.email}</div>
                        </div>
                      </td>
                      <td className="p-3">{peserta.jabatan || '-'}</td>
                      <td className="p-3">{peserta.instansi || '-'}</td>
                      <td className="p-3">
                        <Badge className={`${getStatusColor(status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(status)}
                          {getStatusText(status)}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{getKehadiranWaktu(peserta.id)}</td>
                      <td className="p-3 text-sm">{getKehadiranCatatan(peserta.id)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}