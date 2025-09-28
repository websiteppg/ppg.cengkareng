'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, X, Shield, Users, Calendar, FileText, Briefcase, Cloud, BarChart3, PieChart, MapPin } from 'lucide-react'

interface RoleInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RoleInfoModal({ isOpen, onClose }: RoleInfoModalProps) {
  if (!isOpen) return null

  const roleDetails = [
    {
      role: 'super_admin',
      name: 'Super Admin',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: Shield,
      description: 'Akses penuh ke semua fitur sistem',
      access: [
        '✅ Dashboard Utama',
        '✅ CRUD Peserta (Semua Role)',
        '✅ CRUD Sesi Musyawarah',
        '✅ CRUD Notulensi + Approval',
        '✅ Program Kerja PPG',
        '✅ MediaFire Manager (EKSKLUSIF)',
        '✅ Laporan & Export (Semua)',
        '✅ Dashboard KBM (Semua Desa)',
        '✅ Laporan KBM (Semua Desa)'
      ]
    },
    {
      role: 'admin',
      name: 'Admin',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Users,
      description: 'Manajemen lengkap minus MediaFire',
      access: [
        '✅ Dashboard Utama',
        '✅ CRUD Peserta (Semua Role)',
        '✅ CRUD Sesi Musyawarah',
        '✅ CRUD Notulensi + Approval',
        '✅ Program Kerja PPG',
        '❌ MediaFire Manager',
        '✅ Laporan & Export (Semua)',
        '✅ Dashboard KBM (Semua Desa)',
        '✅ Laporan KBM (Semua Desa)'
      ]
    },
    {
      role: 'sekretaris_ppg',
      name: 'Sekretaris PPG',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: FileText,
      description: 'Fokus notulensi & dokumentasi',
      access: [
        '✅ Dashboard Utama',
        '✅ CRUD Peserta',
        '✅ CRUD Sesi Musyawarah',
        '✅ CRUD Notulensi + APPROVAL AUTHORITY',
        '✅ Program Kerja PPG',
        '❌ MediaFire Manager',
        '✅ Laporan & Export',
        '✅ Dashboard KBM',
        '✅ Laporan KBM Desa'
      ]
    },
    {
      role: 'bidang_ppg',
      name: 'Bidang PPG',
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: Briefcase,
      description: 'Khusus Program Kerja saja',
      access: [
        '❌ Dashboard Utama',
        '❌ CRUD Peserta',
        '❌ CRUD Sesi Musyawarah',
        '❌ CRUD Notulensi',
        '✅ Program Kerja PPG (ONLY)',
        '❌ MediaFire Manager',
        '❌ Laporan & Export',
        '❌ Dashboard KBM',
        '❌ Laporan KBM Desa'
      ]
    },
    {
      role: 'admin_kmm',
      name: 'Admin KMM',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Calendar,
      description: 'Khusus Sesi & Notulensi',
      access: [
        '❌ Dashboard Utama',
        '❌ CRUD Peserta',
        '✅ CRUD Sesi Musyawarah (ONLY)',
        '✅ CRUD Notulensi (ONLY)',
        '❌ Program Kerja PPG',
        '❌ MediaFire Manager',
        '❌ Laporan & Export',
        '❌ Dashboard KBM',
        '❌ Laporan KBM Desa'
      ]
    },
    {
      role: 'kbm_desa',
      name: 'KBM Desa (8 Desa)',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: MapPin,
      description: 'Admin per desa dengan akses terbatas',
      access: [
        '❌ Dashboard Utama',
        '❌ CRUD Peserta',
        '❌ CRUD Sesi Musyawarah',
        '❌ CRUD Notulensi',
        '❌ Program Kerja PPG',
        '❌ MediaFire Manager',
        '❌ Laporan & Export',
        '✅ Dashboard KBM (Overview)',
        '✅ Laporan KBM (Desa Sendiri ONLY)'
      ]
    },
    {
      role: 'peserta',
      name: 'Peserta',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Users,
      description: 'Akses publik terbatas',
      access: [
        '❌ Tidak ada akses admin panel',
        '✅ Absensi Publik (/absen)',
        '✅ Submit absensi di sesi assigned',
        '✅ Lihat status kehadiran sendiri',
        '❌ Semua fitur admin lainnya'
      ]
    }
  ]

  const desaList = [
    'Kalideres', 'Bandara', 'Kebon Jahe', 'Cengkareng', 
    'Kapuk Melati', 'Taman Kota', 'Jelambar', 'Cipondoh'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📊 Matrix Akses Role PPG
                </h2>
                <p className="text-gray-600">
                  Panduan lengkap akses setiap role sebelum melakukan perubahan
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Warning */}
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    ⚠️ Peringatan Penting
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    Perubahan role akan langsung mempengaruhi akses user. Pastikan Anda memilih role yang tepat sesuai tanggung jawab user tersebut.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {roleDetails.map((roleInfo) => {
              const IconComponent = roleInfo.icon
              return (
                <Card key={roleInfo.role} className={`border-2 ${roleInfo.color.split(' ')[2]}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${roleInfo.color.split(' ')[0]} ${roleInfo.color.split(' ')[1]}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{roleInfo.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {roleInfo.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {roleInfo.access.map((access, index) => (
                        <div key={index} className="text-sm flex items-start gap-2">
                          <span className={access.startsWith('✅') ? 'text-green-600' : 'text-red-500'}>
                            {access}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* KBM Desa Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Detail 8 Desa KBM
              </CardTitle>
              <CardDescription>
                Setiap role KBM desa hanya bisa akses data desa masing-masing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {desaList.map((desa) => (
                  <div key={desa} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">
                      kbm_desa_{desa.toLowerCase().replace(' ', '_')}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      KBM Desa {desa}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Auto Redirect Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Auto-Redirect Setelah Login
              </CardTitle>
              <CardDescription>
                Setiap role akan diarahkan ke halaman yang sesuai setelah login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">admin_kmm</span>
                    <span className="text-sm text-gray-600">/admin/sesi</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">bidang_ppg</span>
                    <span className="text-sm text-gray-600">/admin/program-kerja-admin</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">kbm_desa_*</span>
                    <span className="text-sm text-gray-600">/admin/kbm-desa</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">super_admin</span>
                    <span className="text-sm text-gray-600">/admin</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">admin</span>
                    <span className="text-sm text-gray-600">/admin</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">sekretaris_ppg</span>
                    <span className="text-sm text-gray-600">/admin</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <Button onClick={onClose} className="px-8">
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}