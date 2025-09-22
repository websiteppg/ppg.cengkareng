'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Calendar } from 'lucide-react'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CreateNotulensiForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [sessions, setSessions] = useState<any[]>([])
  const { toasts, removeToast, toast } = useToast()
  const [formData, setFormData] = useState({
    sesi_id: '',
    judul: '',
    isi_notulensi: '',
    kesimpulan: '',
    tindak_lanjut: ''
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      console.log('Fetching sessions from API...')
      const response = await fetch('/api/sesi')
      
      if (!response.ok) {
        console.error('API response not ok:', response.status)
        toast.error('Gagal memuat data sesi')
        return
      }
      
      const data = await response.json()
      console.log('Sessions API result:', data)
      
      setSessions(data || [])
      console.log('Sessions set:', data?.length || 0, 'items')
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Terjadi kesalahan saat memuat sesi')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sesi_id || !formData.judul) {
      toast.error('Sesi dan judul wajib diisi')
      return
    }
    
    setIsLoading(true)

    // Get current user from localStorage
    let currentUserId = null
    try {
      const userData = localStorage.getItem('admin_user') || localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        currentUserId = user.id
      }
    } catch (error) {
      console.error('Error getting user from localStorage:', error)
    }

    try {
      const response = await fetch('/api/notulensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dibuat_oleh_id: currentUserId
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Notulensi berhasil dibuat!')
        setTimeout(() => router.push('/admin/notulensi'), 1200)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Gagal membuat notulensi')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Terjadi kesalahan sistem')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/notulensi" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke Daftar Notulensi
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Buat Notulensi Baru</h1>
        <p className="text-gray-600 mt-2">
          Buat Notulensi Untuk Sesi Musyawarah
        </p>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Notulensi</CardTitle>
            <CardDescription>
              Isi detail notulensi musyawarah yang akan dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Pilih Sesi Musyawarah *
                </label>
                <select
                  name="sesi_id"
                  value={formData.sesi_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Pilih sesi musyawarah...</option>
                  {sessions.map((sesi: any) => (
                    <option key={sesi.id} value={sesi.id}>
                      {sesi.nama_sesi} - {new Date(sesi.tanggal).toLocaleDateString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Notulensi *
                </label>
                <Input
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  placeholder="Contoh: Notulensi Musyawarah PPG Daerah"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Isi Notulensi *
                </label>
                <textarea
                  name="isi_notulensi"
                  value={formData.isi_notulensi}
                  onChange={handleChange}
                  placeholder="Tulis isi notulensi musyawarah..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kesimpulan
                </label>
                <textarea
                  name="kesimpulan"
                  value={formData.kesimpulan}
                  onChange={handleChange}
                  placeholder="Kesimpulan dari musyawarah..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tindak Lanjut
                </label>
                <textarea
                  name="tindak_lanjut"
                  value={formData.tindak_lanjut}
                  onChange={handleChange}
                  placeholder="Tindak lanjut yang perlu dilakukan..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={4}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  {isLoading ? 'Membuat...' : 'Buat Notulensi'}
                </Button>
                <Link href="/admin/notulensi" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}