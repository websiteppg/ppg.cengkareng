'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, Check, X } from 'lucide-react'

interface Notulensi {
  id: string
  judul: string
  agenda: string
  pembahasan: string
  keputusan: string
  tindak_lanjut: string
  status: string
  version: number
  created_at: string
  updated_at: string
  sesi: {
    nama_sesi: string
    tanggal: string
    waktu_mulai: string
    waktu_selesai: string
    lokasi: string
  }
  dibuat_oleh: {
    nama: string
  }
  disetujui_oleh?: {
    nama: string
  }
}

export default function ViewNotulensiPage() {
  const params = useParams()
  const router = useRouter()
  const [notulensi, setNotulensi] = useState<Notulensi | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotulensi()
  }, [params.id])

  const fetchNotulensi = async () => {
    try {
      const response = await fetch(`/api/notulensi/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotulensi(data)
      }
    } catch (error) {
      console.error('Error fetching notulensi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus notulensi ini?')) return

    try {
      const response = await fetch(`/api/notulensi/${params.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.push('/admin/notulensi')
      }
    } catch (error) {
      console.error('Error deleting notulensi:', error)
    }
  }

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/notulensi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...notulensi,
          status: 'approved' 
        })
      })
      
      if (response.ok) {
        fetchNotulensi()
      }
    } catch (error) {
      console.error('Error approving notulensi:', error)
    }
  }

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/notulensi/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...notulensi,
          status: 'rejected' 
        })
      })
      
      if (response.ok) {
        fetchNotulensi()
      }
    } catch (error) {
      console.error('Error rejecting notulensi:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      pending: 'default',
      approved: 'default',
      rejected: 'destructive'
    } as const

    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    } as const

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (!notulensi) {
    return <div className="text-center p-8">Notulensi tidak ditemukan</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/notulensi')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Detail Notulensi</h1>
        </div>
        
        <div className="flex gap-2">
          {notulensi.status === 'draft' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleApprove}
              >
                <Check className="h-4 w-4 mr-2" />
                Setujui
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
              >
                <X className="h-4 w-4 mr-2" />
                Tolak
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/admin/notulensi/${params.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{notulensi.judul}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Sesi: {notulensi.sesi.nama_sesi}
                </p>
              </div>
              {getStatusBadge(notulensi.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tanggal:</strong> {new Date(notulensi.sesi.tanggal).toLocaleDateString('id-ID')}
              </div>
              <div>
                <strong>Waktu:</strong> {notulensi.sesi.waktu_mulai} - {notulensi.sesi.waktu_selesai}
              </div>
              <div>
                <strong>Lokasi:</strong> {notulensi.sesi.lokasi}
              </div>
              <div>
                <strong>Dibuat oleh:</strong> {notulensi.dibuat_oleh.nama}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: notulensi.agenda || 'Tidak ada agenda' }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembahasan</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: notulensi.pembahasan || 'Tidak ada pembahasan' }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keputusan</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: notulensi.keputusan || 'Tidak ada keputusan' }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tindak Lanjut</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: notulensi.tindak_lanjut || 'Tidak ada tindak lanjut' }} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}