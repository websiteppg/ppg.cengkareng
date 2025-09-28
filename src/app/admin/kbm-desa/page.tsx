'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Users, Calendar, ArrowRight, AlertCircle, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import RangkumanLaporanModal from '@/components/admin/rangkuman-laporan-modal'

interface Desa {
  id: string
  nama_desa: string
  kelompok: string[]
}

export default function LaporanKBMDesaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [desaList, setDesaList] = useState<Desa[]>([])
  const [selectedPeriode, setSelectedPeriode] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [showRangkumanModal, setShowRangkumanModal] = useState(false)
  const [selectedDesa, setSelectedDesa] = useState<Desa | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      const allowedRoles = ['super_admin', 'admin', 'kbm_desa_kalideres', 'kbm_desa_bandara', 'kbm_desa_kebon_jahe', 'kbm_desa_cengkareng', 'kbm_desa_kapuk_melati', 'kbm_desa_taman_kota', 'kbm_desa_jelambar', 'kbm_desa_cipondoh']
      
      if (allowedRoles.includes(parsedUser.role)) {
        setUser(parsedUser)
        setHasAccess(true)
        fetchDesaData(parsedUser.role)
      } else {
        setHasAccess(false)
        setLoading(false)
      }
    } else {
      // Redirect to login if not authenticated
      router.push('/admin/login')
      return
    }
    
    // Set default periode ke bulan ini
    const now = new Date()
    const currentPeriode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedPeriode(currentPeriode)
  }, [router])

  const fetchDesaData = async (userRole: string) => {
    try {
      const response = await fetch(`/api/kbm-desa/master?role=${userRole}`)
      const result = await response.json()
      
      if (result.success) {
        setDesaList(result.data)
      } else {
        toast.error('Gagal mengambil data desa')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const generatePeriodeOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    
    for (let year = 2025; year <= 2100; year++) {
      for (let month = 1; month <= 12; month++) {
        const value = `${year}-${String(month).padStart(2, '0')}`
        const label = `${getMonthName(month)} ${year}`
        options.push({ value, label })
      }
    }
    
    return options
  }

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[month - 1]
  }

  const handleShowRangkuman = (desa: Desa) => {
    setSelectedDesa(desa)
    setShowRangkumanModal(true)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h3>
            <p className="text-gray-600 mb-6">
              Anda tidak memiliki akses ke menu KBM Desa. Hubungi administrator untuk mendapatkan akses.
            </p>
            <div className="space-y-2">
              <Button onClick={() => router.push('/admin')} className="w-full">
                Kembali ke Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/login')} className="w-full">
                Login dengan Akun Lain
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan KBM Desa</h1>
            <p className="text-gray-600">Kelola laporan Kegiatan Belajar Mengajar per desa dan kelompok</p>
          </div>
          {user && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Login sebagai:</div>
              <div className="font-semibold text-gray-900">{user.nama}</div>
              <div className="text-xs text-blue-600">
                {user.role === 'super_admin' ? 'Super Admin (Akses Semua Desa)' :
                 user.role === 'admin' ? 'Admin (Akses Semua Desa)' :
                 user.role.startsWith('kbm_desa_') ? `Admin Desa ${user.role.replace('kbm_desa_', '').replace('_', ' ').toUpperCase()}` :
                 user.role}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Periode Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Pilih Periode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {generatePeriodeOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500">
              Periode yang dipilih: <span className="font-medium">{selectedPeriode ? getMonthName(parseInt(selectedPeriode.split('-')[1])) + ' ' + selectedPeriode.split('-')[0] : 'Belum dipilih'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desa Cards */}
      {selectedPeriode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {desaList.map((desa) => (
            <Card key={desa.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Desa {desa.nama_desa}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {desa.kelompok.length} Kelompok
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <div className="font-medium mb-1">Kelompok:</div>
                    <div className="space-y-1">
                      {desa.kelompok.slice(0, 3).map((kelompok, idx) => (
                        <div key={idx} className="truncate">• {kelompok}</div>
                      ))}
                      {desa.kelompok.length > 3 && (
                        <div className="text-blue-600">+{desa.kelompok.length - 3} lainnya</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link href={`/admin/kbm-desa/${desa.id}?periode=${selectedPeriode}`} className="flex-1">
                      <Button className="w-full" size="sm">
                        Kelola Laporan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShowRangkuman(desa)}
                      title="Rangkuman Laporan Desa"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {desaList.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Akses Desa</h3>
            <p className="text-gray-600">Anda tidak memiliki akses ke desa manapun. Hubungi administrator.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal Rangkuman Laporan */}
      {selectedDesa && (
        <RangkumanLaporanModal
          isOpen={showRangkumanModal}
          onClose={() => setShowRangkumanModal(false)}
          desaId={selectedDesa.id}
          desaNama={selectedDesa.nama_desa}
          periode={selectedPeriode}
        />
      )}
    </div>
  )
}