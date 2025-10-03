'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { CheckCircle, Clock, FileText, Heart, XCircle } from 'lucide-react'

interface ManualAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  peserta: {
    id: string
    nama: string
    email: string
    status_kehadiran?: string
  }
  sesiId: string
  adminId: string
  onSuccess: () => void
}

const statusOptions = [
  { value: 'hadir', label: 'Hadir', icon: CheckCircle, color: 'text-green-600' },
  { value: 'terlambat', label: 'Terlambat', icon: Clock, color: 'text-orange-600' },
  { value: 'izin', label: 'Izin', icon: FileText, color: 'text-yellow-600' },
  { value: 'sakit', label: 'Sakit', icon: Heart, color: 'text-purple-600' }
]

const reasonOptions = [
  'Koreksi Data',
  'Permintaan Peserta', 
  'Situasi Darurat',
  'Kesalahan Sistem',
  'Lainnya'
]

export default function ManualAttendanceModal({
  isOpen,
  onClose,
  peserta,
  sesiId,
  adminId,
  onSuccess
}: ManualAttendanceModalProps) {
  const [status, setStatus] = useState(peserta.status_kehadiran || 'hadir')
  const [waktuAbsen, setWaktuAbsen] = useState(new Date().toISOString().slice(0, 16))
  const [catatan, setCatatan] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Alasan perubahan wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Submitting manual attendance:', {
        sesi_id: sesiId,
        peserta_id: peserta.id,
        status_kehadiran: status,
        peserta_nama: peserta.nama
      })
      
      const response = await fetch('/api/admin/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sesi_id: sesiId,
          peserta_id: peserta.id,
          status_kehadiran: status,
          waktu_absen: waktuAbsen,
          catatan,
          admin_notes: adminNotes,
          modification_reason: reason,
          admin_id: adminId
        })
      })

      const result = await response.json()
      console.log('Manual attendance response:', result)
      
      if (response.ok) {
        alert(result.message || 'Absensi berhasil diperbarui')
        onClose()
        // Force immediate refresh
        window.location.reload()
      } else {
        console.error('Manual attendance failed:', result)
        alert(result.error || 'Gagal memproses absensi')
      }
    } catch (error) {
      console.error('Manual attendance error:', error)
      alert('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isUpdate = peserta.status_kehadiran && peserta.status_kehadiran !== 'ghoib'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? 'Edit Status Kehadiran' : 'Absensi Manual'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Peserta Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium">{peserta.nama}</div>
            <div className="text-sm text-gray-600">{peserta.email}</div>
            {isUpdate && (
              <div className="text-sm text-orange-600 mt-1">
                Status saat ini: {peserta.status_kehadiran}
              </div>
            )}
          </div>

          {/* Status Selection */}
          <div>
            <Label>Status Kehadiran *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Waktu Absen */}
          <div>
            <Label>Waktu Absen</Label>
            <Input
              type="datetime-local"
              value={waktuAbsen}
              onChange={(e) => setWaktuAbsen(e.target.value)}
            />
          </div>

          {/* Catatan Peserta */}
          <div>
            <Label>Catatan Peserta</Label>
            <Textarea
              placeholder="Catatan dari peserta (opsional)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
            />
          </div>

          {/* Alasan */}
          <div>
            <Label>Alasan Perubahan *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih alasan" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div>
            <Label>Catatan Admin</Label>
            <Textarea
              placeholder="Catatan tambahan dari admin"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Memproses...' : (isUpdate ? 'Update Status' : 'Buat Absensi')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}