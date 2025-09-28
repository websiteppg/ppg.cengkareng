'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, Calendar, BarChart3, CheckCircle, MapPin, FolderOpen, Shield, Zap } from 'lucide-react'

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
            Platform terintegrasi untuk mengelola musyawarah, notulensi digital, laporan KBM desa, dan manajemen file MediaFire untuk PPG Daerah Jakarta Barat Cengkareng.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Manajemen Sesi Musyawarah</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                CRUD sesi lengkap, assign peserta, absensi manual, print PDF, dan real-time sync.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Sistem Absensi Real-time</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                URL publik /absen, multi status kehadiran, bulk update, dan upsert system tanpa error.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Notulensi Digital</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Rich text editor, workflow approval, komentar kolaboratif, dan export PDF.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-lg">Sistem KBM Desa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                8 desa terdaftar, 4 kategori program, laporan bulanan, dan dashboard per desa.
              </CardDescription>
            </CardContent>
          </Card>



          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">MediaFire Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                File management, kategori, bulk operations, activity log, dan export data.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Role-Based Access Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Role-Based Access Control</h3>
            <p className="text-gray-600">Sistem akses berlevel dengan 10+ role untuk keamanan dan efisiensi</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-900">Super Admin</div>
              <div className="text-blue-700">Akses penuh sistem</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="font-semibold text-green-900">Admin KMM</div>
              <div className="text-green-700">Manajemen sesi</div>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="font-semibold text-yellow-900">KBM Desa</div>
              <div className="text-yellow-700">8 desa admin</div>
            </div>
          </div>
        </div>

        {/* Technical Excellence Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Technical Excellence</h3>
            <p className="text-blue-100">Dibangun dengan teknologi modern dan best practices</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">Next.js 14+</div>
              <div className="text-blue-100">App Router & TypeScript</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Supabase</div>
              <div className="text-blue-100">Real-time Database</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Vercel</div>
              <div className="text-blue-100">Auto-deploy Production</div>
            </div>
          </div>
        </div>



        {/* System Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600">Peserta Aktif</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-green-600 mb-2">10+</div>
            <div className="text-gray-600">Role Access</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-gray-600">Desa Terdaftar</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Real-time Sync</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 PPG Jakarta Barat Cengkareng. Platform Terintegrasi Penggerak Pembina Generus.</p>
            <p className="text-sm text-gray-500 mt-2">Sistem Musyawarah • Notulensi Digital • KBM Desa • MediaFire Manager</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
