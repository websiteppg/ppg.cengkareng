'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Clock, FileText, Heart, Users } from 'lucide-react'

interface BulkAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPeserta: Array<{
    id: string
    nama: string
    email: string
  }>
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
  'Update Massal',
  'Koreksi Data Batch',
  'Situasi Darurat',
  'Permintaan Admin',
  'Lainnya'
]

export default function BulkAttendanceModal({
  isOpen,
  onClose,
  selectedPeserta,
  sesiId,
  adminId,
  onSuccess
}: BulkAttendanceModalProps) {
  const [status, setStatus] = useState('hadir')
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
      const response = await fetch('/api/admin/attendance/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sesi_id: sesiId,
          peserta_ids: selectedPeserta.map(p => p.id),
          status_kehadiran: status,
          admin_notes: adminNotes,
          modification_reason: reason,
          admin_id: adminId
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(result.message)
        onSuccess()
        onClose()
      } else {
        alert(result.error || 'Gagal memperbarui absensi massal')
      }
    } catch (error) {
      alert('Terjadi kesalahan sistem')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Update Status Massal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Count */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-900">
              {selectedPeserta.length} peserta dipilih
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Status akan diperbarui untuk semua peserta yang dipilih
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <Label>Status Kehadiran Baru *</Label>
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
              placeholder="Catatan tambahan untuk update massal ini"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview List */}
          <div>
            <Label>Peserta yang akan diperbarui:</Label>
            <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-sm">
              {selectedPeserta.map((peserta, index) => (
                <div key={peserta.id} className="py-1">
                  {index + 1}. {peserta.nama}
                </div>
              ))}
            </div>
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
              {isSubmitting ? 'Memproses...' : `Update ${selectedPeserta.length} Peserta`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}