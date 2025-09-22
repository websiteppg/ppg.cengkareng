import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Calendar, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Notulen Musyawarah PPG</h1>
                <p className="text-sm text-gray-600">Penggerak Pembina Generus</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/admin/login">
                <Button variant="outline">Login Admin</Button>
              </Link>
              <Link href="/absen">
                <Button>Absensi Peserta</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Selamat Datang di Notulen Musyawarah PPG
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Platform terintegrasi untuk mengelola musyawarah, absensi, dan notulensi 
            Program Penggerak Pembina Generasi dengan dukungan hingga 100 peserta.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Manajemen Sesi</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kelola jadwal musyawarah dengan sistem absensi real-time dan notifikasi otomatis.
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
                Dashboard analitik dengan laporan kehadiran, statistik partisipasi, dan export data.
              </CardDescription>
            </CardContent>
          </Card>
        </div>



        {/* System Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">100</div>
            <div className="text-gray-600">Maksimal Peserta</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">4</div>
            <div className="text-gray-600">Level Akses</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
            <div className="text-gray-600">Akses Real-time</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Sistem Musyawarah PPG. Dikembangkan untuk Program Penggerak Pembina Generasi.</p>
            <p className="mt-2 text-sm">
              Mendukung hingga 100 peserta dengan sistem real-time dan mobile-responsive.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}