'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, calculateSubTotal } from '@/lib/utils/calculations'

interface RincianBiaya {
  id?: string
  nama_item: string
  jumlah: number
  harga_satuan: number
  hari_kegiatan: number
  frekuensi: number
  sub_total: number
}

interface ModalRincianBiayaProps {
  isOpen: boolean
  onClose: () => void
  kegiatanId: string
  onSuccess: () => void
}

export default function ModalRincianBiaya({ 
  isOpen, 
  onClose, 
  kegiatanId, 
  onSuccess 
}: ModalRincianBiayaProps) {
  const [rincianList, setRincianList] = useState<RincianBiaya[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && kegiatanId) {
      fetchRincianBiaya()
    }
  }, [isOpen, kegiatanId])

  const fetchRincianBiaya = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/program-kerja/kegiatan/${kegiatanId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched kegiatan data:', data)
        
        if (data.rincian_biaya && data.rincian_biaya.length > 0) {
          const activeRincian = data.rincian_biaya.filter((r: any) => !r.deleted_at)
          if (activeRincian.length > 0) {
            setRincianList(activeRincian)
          } else {
            // Initialize with one empty row if no active rincian
            setRincianList([{
              nama_item: '',
              jumlah: 1,
              harga_satuan: 0,
              hari_kegiatan: 1,
              frekuensi: 1,
              sub_total: 0
            }])
          }
        } else {
          // Initialize with one empty row if no rincian at all
          setRincianList([{
            nama_item: '',
            jumlah: 1,
            harga_satuan: 0,
            hari_kegiatan: 1,
            frekuensi: 1,
            sub_total: 0
          }])
        }
      } else {
        toast.error('Gagal memuat data kegiatan')
      }
    } catch (error) {
      console.error('Fetch rincian biaya error:', error)
      toast.error('Gagal memuat data rincian biaya')
    } finally {
      setLoading(false)
    }
  }

  const addNewRow = () => {
    setRincianList([...rincianList, {
      nama_item: '',
      jumlah: 1,
      harga_satuan: 0,
      hari_kegiatan: 1,
      frekuensi: 1,
      sub_total: 0
    }])
  }

  const removeRow = async (index: number) => {
    const item = rincianList[index]
    
    if (item.id) {
      // Delete from database
      try {
        const response = await fetch(`/api/program-kerja/rincian-biaya/${item.id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          toast.success('Item berhasil dihapus')
        } else {
          toast.error('Gagal menghapus item')
          return
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem')
        return
      }
    }
    
    // Remove from local state
    const newList = rincianList.filter((_, i) => i !== index)
    setRincianList(newList)
  }

  const updateRow = (index: number, field: keyof RincianBiaya, value: any) => {
    const newList = [...rincianList]
    newList[index] = { ...newList[index], [field]: value }
    
    // Recalculate sub_total if calculation fields change
    if (['jumlah', 'harga_satuan', 'hari_kegiatan', 'frekuensi'].includes(field)) {
      const item = newList[index]
      newList[index].sub_total = calculateSubTotal(
        item.jumlah,
        item.harga_satuan,
        item.hari_kegiatan,
        item.frekuensi
      )
    }
    
    setRincianList(newList)
  }

  const saveAllRincian = async () => {
    try {
      setSaving(true)
      
      for (const item of rincianList) {
        if (!item.nama_item.trim()) continue
        
        if (item.id) {
          // Update existing
          const response = await fetch(`/api/program-kerja/rincian-biaya/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nama_item: item.nama_item,
              jumlah: item.jumlah,
              harga_satuan: item.harga_satuan,
              hari_kegiatan: item.hari_kegiatan,
              frekuensi: item.frekuensi,
              sub_total: item.sub_total
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Update error:', error)
            throw new Error(error.error || 'Gagal update rincian biaya')
          }
        } else {
          // Create new
          const response = await fetch('/api/program-kerja/rincian-biaya', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kegiatanBidangId: kegiatanId,
              namaItem: item.nama_item,
              jumlah: item.jumlah,
              hargaSatuan: item.harga_satuan,
              hariKegiatan: item.hari_kegiatan,
              frekuensi: item.frekuensi
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Create error:', error)
            throw new Error(error.error || 'Gagal create rincian biaya')
          }
        }
      }
      
      toast.success('Rincian biaya berhasil disimpan')
      onSuccess()
      onClose()
      
    } catch (error) {
      toast.error('Gagal menyimpan rincian biaya')
    } finally {
      setSaving(false)
    }
  }

  const getTotalKeseluruhan = () => {
    return rincianList.reduce((sum, item) => sum + item.sub_total, 0)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rincian Biaya Kegiatan</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header Table */}
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 border-b pb-2">
              <div className="col-span-3">Nama Item</div>
              <div className="col-span-1">Jumlah</div>
              <div className="col-span-2">Harga Satuan</div>
              <div className="col-span-1">Hari</div>
              <div className="col-span-1">Frekuensi</div>
              <div className="col-span-2">Sub Total</div>
              <div className="col-span-2">Aksi</div>
            </div>
            
            {/* Rincian Rows */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rincianList.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Input
                      value={item.nama_item}
                      onChange={(e) => updateRow(index, 'nama_item', e.target.value)}
                      placeholder="Nama item"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.jumlah}
                      onChange={(e) => updateRow(index, 'jumlah', parseInt(e.target.value) || 0)}
                      min="0"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.harga_satuan}
                      onChange={(e) => updateRow(index, 'harga_satuan', parseInt(e.target.value) || 0)}
                      min="0"
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.hari_kegiatan}
                      onChange={(e) => updateRow(index, 'hari_kegiatan', parseInt(e.target.value) || 1)}
                      min="1"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.frekuensi}
                      onChange={(e) => updateRow(index, 'frekuensi', parseInt(e.target.value) || 1)}
                      min="1"
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-medium text-green-600 px-3 py-2 bg-green-50 rounded">
                      {formatCurrency(item.sub_total)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeRow(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Row Button */}
            <Button
              variant="outline"
              onClick={addNewRow}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Item
            </Button>
            
            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Keseluruhan:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(getTotalKeseluruhan())}
                </span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button onClick={saveAllRincian} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}