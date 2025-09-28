'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import { ArrowLeft, Save } from 'lucide-react'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface Notulensi {
  id: string
  judul: string
  agenda: string
  pembahasan: string
  keputusan: string
  tindak_lanjut: string
  status: string
  sesi: {
    nama_sesi: string
    tanggal: string
  }
}

export default function EditNotulensiPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    judul: '',
    agenda: '',
    pembahasan: '',
    keputusan: '',
    tindak_lanjut: ''
  })

  useEffect(() => {
    fetchNotulensi()
  }, [params.id])

  const fetchNotulensi = async () => {
    try {
      const response = await fetch(`/api/notulensi/${params.id}`)
      if (response.ok) {
        const data: Notulensi = await response.json()
        setFormData({
          judul: data.judul,
          agenda: data.agenda,
          pembahasan: data.pembahasan,
          keputusan: data.keputusan,
          tindak_lanjut: data.tindak_lanjut
        })
      }
    } catch (error) {
      console.error('Error fetching notulensi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/notulensi/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push(`/admin/notulensi/${params.id}`)
      } else {
        alert('Gagal mengupdate notulensi')
      }
    } catch (error) {
      console.error('Error updating notulensi:', error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setSaving(false)
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ]
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/admin/notulensi')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Edit Notulensi</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Judul Notulensi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="judul" className="block text-sm font-medium mb-2">Judul Notulensi *</label>
              <Input
                id="judul"
                value={formData.judul}
                onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Isi Notulensi</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactQuill
              theme="snow"
              value={formData.pembahasan}
              onChange={(value) => setFormData(prev => ({ ...prev, pembahasan: value }))}
              modules={quillModules}
              style={{ height: '200px', marginBottom: '50px' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kesimpulan</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactQuill
              theme="snow"
              value={formData.keputusan}
              onChange={(value) => setFormData(prev => ({ ...prev, keputusan: value }))}
              modules={quillModules}
              style={{ height: '200px', marginBottom: '50px' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tindak Lanjut</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactQuill
              theme="snow"
              value={formData.tindak_lanjut}
              onChange={(value) => setFormData(prev => ({ ...prev, tindak_lanjut: value }))}
              modules={quillModules}
              style={{ height: '200px', marginBottom: '50px' }}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/notulensi/${params.id}`)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  )
}