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
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Notulensi</CardTitle>
            <CardDescription>
              Isi detail notulensi musyawarah yang akan dibuat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Pilih Sesi Musyawarah *
                  </label>
                  <select
                    name="sesi_id"
                    value={formData.sesi_id}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Judul Notulensi *
                  </label>
                  <Input
                    name="judul"
                    value={formData.judul}
                    onChange={handleInputChange}
                    placeholder="Contoh: Notulensi Musyawarah PPG Daerah"
                    className="p-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    📝 Isi Notulensi *
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <ReactQuill
                      theme="snow"
                      value={formData.isi_notulensi}
                      onChange={(value) => setFormData(prev => ({ ...prev, isi_notulensi: value }))}
                      modules={quillModules}
                      placeholder="Tulis isi notulensi musyawarah dengan detail..."
                      style={{ height: '300px', marginBottom: '50px' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                      💡 Kesimpulan
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <ReactQuill
                        theme="snow"
                        value={formData.kesimpulan}
                        onChange={(value) => setFormData(prev => ({ ...prev, kesimpulan: value }))}
                        modules={quillModules}
                        placeholder="Kesimpulan dari musyawarah..."
                        style={{ height: '200px', marginBottom: '50px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-4">
                      🎯 Tindak Lanjut
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <ReactQuill
                        theme="snow"
                        value={formData.tindak_lanjut}
                        onChange={(value) => setFormData(prev => ({ ...prev, tindak_lanjut: value }))}
                        modules={quillModules}
                        placeholder="Tindak lanjut yang perlu dilakukan..."
                        style={{ height: '200px', marginBottom: '50px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-6 pt-8 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
                  size="lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {isLoading ? 'Membuat Notulensi...' : 'Buat Notulensi'}
                </Button>
                <Link href="/admin/notulensi">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="px-8 py-3 text-lg font-semibold border-gray-300 hover:bg-gray-50 transition-colors"
                    size="lg"
                  >
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