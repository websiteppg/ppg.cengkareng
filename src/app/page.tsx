'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Calendar, BarChart3, Presentation, FolderOpen, Home, Target } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/logo-small.png" alt="PPG Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Website PPG Jakarta Barat Cengkareng</h1>
                <p className="text-sm text-gray-600">Penggerak Pembina Generus</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/viewer/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Login Viewer</Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline">Login Admin/Laporan KBM Desa</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Selamat Datang di Website PPG Jakarta Barat Cengkareng
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Platform terintegrasi untuk mengelola musyawarah, notulensi digital, laporan KBM desa, program kerja, presentasi, dan manajemen file MediaFire untuk PPG Daerah Jakarta Barat Cengkareng. Mendukung multi-role access dengan sistem yang komprehensif dan real-time.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Manajemen Sesi</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kelola jadwal musyawarah dengan sistem notifikasi otomatis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Notulensi Digital</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Buat dan kelola notulensi dengan editor rich text, sistem approval, dan komentar kolaboratif.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Manajemen Peserta</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kelola hingga 100 peserta dengan sistem role-based access dan dashboard personal.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Laporan & Analitik</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Dashboard analitik dengan laporan peserta, statistik partisipasi, dan export data.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">Program Kerja PPG</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manajemen program kerja per bidang dengan rincian biaya fleksibel dan export PDF.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Presentation className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Presentasi Program</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Presentasi timeline kegiatan dengan charts, export PowerPoint, dan navigasi antar bidang.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-lg">KBM Desa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Laporan KBM 8 desa dengan 4 kategori program dan dashboard statistik per desa.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">MediaFire Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manajemen file MediaFire dengan kategori, bulk operations, dan activity logging.
              </CardDescription>
            </CardContent>
          </Card>
        </div>



        {/* System Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600">Peserta Aktif</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">12+</div>
            <div className="text-gray-600">Role Access</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-gray-600">Desa Terdaftar</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Real-time System</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 PPG Jakarta Barat Cengkareng. Dikembangkan untuk Penggerak Pembina Generus.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}