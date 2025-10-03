'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface DashboardStats {
  totalKelompok: number
  totalDataInput: number
  rataKehadiran: number
  rataPencapaian: number
  progressByDesa: any[]
  trendBulanan: any[]
  kategoriStats: any[]
}

export default function DashboardKBMPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [selectedPeriode, setSelectedPeriode] = useState('')
  const [selectedDesa, setSelectedDesa] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    // Set default periode ke bulan ini
    const now = new Date()
    const currentPeriode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setSelectedPeriode(currentPeriode)
  }, [])

  useEffect(() => {
    if (selectedPeriode && user) {
      fetchDashboardStats()
    }
  }, [selectedPeriode, selectedDesa, user])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        periode: selectedPeriode,
        role: user?.role || ''
      })
      
      if (selectedDesa !== 'all') {
        params.append('desa_id', selectedDesa)
      }
      
      const response = await fetch(`/api/kbm-desa/dashboard?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        toast.error(result.error || 'Gagal mengambil data dashboard')
      }
    } catch (error) {
      toast.error('Gagal mengambil data dashboard')
    } finally {
      setLoading(false)
    }
  }

  const generatePeriodeOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    
    for (let year = 2025; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const value = `${year}-${String(month).padStart(2, '0')}`
        const label = `${getMonthName(month)} ${year}`
        options.push({ value, label })
      }
    }
    
    return options.reverse() // Terbaru di atas
  }

  const getMonthName = (month: number) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[month - 1]
  }

  const handleExport = () => {
    toast.success('Export dashboard akan segera tersedia')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard KBM</h1>
        <p className="text-gray-600">Analisis dan monitoring Kegiatan Belajar Mengajar per desa</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Periode</label>
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                <SelectTrigger className="w-48">
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
            </div>
            
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <div>
                <label className="text-sm font-medium mb-2 block">Desa</label>
                <Select value={selectedDesa} onValueChange={setSelectedDesa}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Pilih desa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Desa</SelectItem>
                    <SelectItem value="kalideres">Kalideres</SelectItem>
                    <SelectItem value="bandara">Bandara</SelectItem>
                    <SelectItem value="kebon_jahe">Kebon Jahe</SelectItem>
                    <SelectItem value="cengkareng">Cengkareng</SelectItem>
                    <SelectItem value="kapuk_melati">Kapuk Melati</SelectItem>
                    <SelectItem value="taman_kota">Taman Kota</SelectItem>
                    <SelectItem value="jelambar">Jelambar</SelectItem>
                    <SelectItem value="cipondoh">Cipondoh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="ml-auto">
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Kelompok</p>
                <p className="text-2xl font-bold">{stats?.totalKelompok}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Data Terinput</p>
                <p className="text-2xl font-bold">{stats?.totalDataInput}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Kehadiran</p>
                <p className="text-2xl font-bold">{stats?.rataKehadiran}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Pencapaian</p>
                <p className="text-2xl font-bold">{stats?.rataPencapaian}%</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Progress by Desa */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Input Data per Desa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.progressByDesa}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nama" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="persentase" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Kategori Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori Program</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.kategoriStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.kategoriStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trend Kehadiran vs Pencapaian Target</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.trendBulanan}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="kehadiran" stroke="#8884d8" name="Kehadiran %" />
              <Line type="monotone" dataKey="pencapaian" stroke="#82ca9d" name="Pencapaian %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Progress per Desa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Desa</th>
                  <th className="text-center p-2">Kelompok Lengkap</th>
                  <th className="text-center p-2">Total Kelompok</th>
                  <th className="text-center p-2">Progress</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.progressByDesa.map((desa, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{desa.nama}</td>
                    <td className="text-center p-2">{desa.lengkap}</td>
                    <td className="text-center p-2">{desa.total}</td>
                    <td className="text-center p-2">{desa.persentase}%</td>
                    <td className="text-center p-2">
                      <Badge 
                        className={
                          desa.persentase === 100 
                            ? "bg-green-100 text-green-800" 
                            : desa.persentase >= 75 
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {desa.persentase === 100 ? 'Lengkap' : desa.persentase >= 75 ? 'Hampir' : 'Kurang'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}