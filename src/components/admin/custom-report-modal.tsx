'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Calendar, Filter, Download } from 'lucide-react'

interface CustomReportModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (params: any) => void
}

export default function CustomReportModal({ isOpen, onClose, onGenerate }: CustomReportModalProps) {
  const [formData, setFormData] = useState({
    jenis_laporan: 'kehadiran',
    tanggal_mulai: '',
    tanggal_selesai: '',
    status_filter: 'semua',
    role_filter: 'semua',
    format_output: 'pdf'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(formData)
    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Buat Laporan Kustom</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Jenis Laporan
              </label>
              <select
                name="jenis_laporan"
                value={formData.jenis_laporan}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="kehadiran">Laporan Kehadiran</option>
                <option value="peserta">Laporan Peserta</option>
                <option value="sesi">Laporan Sesi</option>
                <option value="notulensi">Laporan Notulensi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Tanggal Mulai
                </label>
                <Input
                  type="date"
                  name="tanggal_mulai"
                  value={formData.tanggal_mulai}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tanggal Selesai
                </label>
                <Input
                  type="date"
                  name="tanggal_selesai"
                  value={formData.tanggal_selesai}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.jenis_laporan === 'kehadiran' && (
              <div>
                <label className="block text-sm font-medium mb-2">Status Kehadiran</label>
                <select
                  name="status_filter"
                  value={formData.status_filter}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="semua">Semua Status</option>
                  <option value="hadir">Hadir</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                </select>
              </div>
            )}

            {formData.jenis_laporan === 'peserta' && (
              <div>
                <label className="block text-sm font-medium mb-2">Role Peserta</label>
                <select
                  name="role_filter"
                  value={formData.role_filter}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="semua">Semua Role</option>
                  <option value="peserta">Peserta</option>
                  <option value="admin">Admin</option>
                  <option value="sekretaris_ppg">Sekretaris PPG</option>
                  <option value="admin_kmm">Admin KMM</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                <Download className="w-4 h-4 inline mr-1" />
                Format Output
              </label>
              <select
                name="format_output"
                value={formData.format_output}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1">
                Generate Laporan
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}