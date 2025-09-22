'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Edit, Trash2, X } from 'lucide-react'
import { ToastContainer } from '@/components/ui/toast'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import RoleGuard from '@/components/admin/role-guard'

interface Participant {
  id: string
  nama: string
  email: string
  jabatan: string
  instansi: string
  role: string
  aktif: boolean
}

export default function ParticipantManagement() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  const [editForm, setEditForm] = useState({ nama: '', jabatan: '', instansi: '', role: '', password: '' })
  const { toasts, removeToast, toast } = useToast()

  useEffect(() => {
    fetchParticipants()
  }, [])

  const fetchParticipants = async () => {
    try {
      setError(null)
      const response = await fetch('/api/peserta')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          const safeData = data.map((p: any) => ({
            id: p.id || '',
            nama: String(p.nama || ''),
            email: String(p.email || ''),
            jabatan: String(p.jabatan || ''),
            instansi: String(p.instansi || ''),
            role: String(p.role || 'peserta'),
            aktif: Boolean(p.aktif)
          }))
          setParticipants(safeData)
        } else {
          setParticipants([])
        }
      } else {
        setError('Gagal memuat data peserta')
        setParticipants([])
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      setError('Terjadi kesalahan saat memuat data')
      setParticipants([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredParticipants = participants.filter(p => {
    try {
      if (!p || !searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        String(p.nama || '').toLowerCase().includes(search) ||
        String(p.email || '').toLowerCase().includes(search) ||
        String(p.instansi || '').toLowerCase().includes(search)
      )
    } catch (error) {
      console.error('Filter error:', error)
      return true
    }
  })

  const getRoleText = (role: string) => {
    const roles = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'admin_kmm': 'Admin KMM',
      'sekretaris_ppg': 'Sekretaris PPG',
      'peserta': 'Peserta'
    }
    return roles[role as keyof typeof roles] || role
  }

  const getRoleColor = (role: string) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-blue-100 text-blue-800',
      'admin_kmm': 'bg-indigo-100 text-indigo-800',
      'sekretaris_ppg': 'bg-purple-100 text-purple-800',
      'peserta': 'bg-green-100 text-green-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus peserta ${nama}?`)) {
      try {
        const response = await fetch(`/api/peserta?id=${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          toast.success('Peserta berhasil dihapus')
          fetchParticipants() // Refresh data
        } else {
          toast.error('Gagal menghapus peserta')
        }
      } catch (error) {
        toast.error('Terjadi kesalahan sistem')
      }
    }
  }

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant)
    setEditForm({
      nama: participant.nama,
      jabatan: participant.jabatan,
      instansi: participant.instansi,
      role: participant.role,
      password: ''
    })
  }

  const handleSaveEdit = async () => {
    if (editingParticipant && editForm.nama && editForm.jabatan && editForm.instansi && editForm.role) {
      await updateParticipant(editingParticipant.id, editForm)
      setEditingParticipant(null)
      setEditForm({ nama: '', jabatan: '', instansi: '', role: '', password: '' })
    }
  }

  const handleCancelEdit = () => {
    setEditingParticipant(null)
    setEditForm({ nama: '', jabatan: '', instansi: '', role: '', password: '' })
  }

  const updateParticipant = async (id: string, data: any) => {
    try {
      const response = await fetch(`/api/peserta?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (response.ok) {
        toast.success('Peserta berhasil diupdate')
        fetchParticipants() // Refresh data
      } else {
        toast.error('Gagal mengupdate peserta')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan sistem')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data peserta...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchParticipants}>Coba Lagi</Button>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'super_admin', 'sekretaris_ppg']}>
      <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Peserta</h1>
          <p className="text-gray-600 mt-2">
            Kelola Data Peserta Musywarah ({participants.length} peserta)
          </p>
        </div>
        <Link href="/admin/peserta/tambah">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Peserta
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari nama, username, dapuan, atau bidang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Peserta</CardTitle>
          <CardDescription>
            {filteredParticipants.length} dari {participants.length} peserta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nama</th>
                  <th className="text-left py-3 px-4 font-medium">Username</th>
                  <th className="text-left py-3 px-4 font-medium">Dapuan</th>
                  <th className="text-left py-3 px-4 font-medium">Bidang</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{participant.nama}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{participant.email}</td>
                    <td className="py-3 px-4 text-gray-600">{participant.jabatan}</td>
                    <td className="py-3 px-4 text-gray-600">{participant.instansi}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(participant.role)}`}>
                        {getRoleText(participant.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        participant.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {participant.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(participant)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(participant.id, participant.nama)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredParticipants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm ? 'Tidak ada peserta yang sesuai dengan pencarian' : 'Belum ada peserta'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Peserta</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama</label>
                <Input
                  value={editForm.nama}
                  onChange={(e) => setEditForm({...editForm, nama: e.target.value})}
                  placeholder="Masukkan nama"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Dapuan</label>
                <Input
                  value={editForm.jabatan}
                  onChange={(e) => setEditForm({...editForm, jabatan: e.target.value})}
                  placeholder="Masukkan dapuan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bidang</label>
                <Input
                  value={editForm.instansi}
                  onChange={(e) => setEditForm({...editForm, instansi: e.target.value})}
                  placeholder="Masukkan bidang"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="peserta">Peserta</option>
                  <option value="sekretaris_ppg">Sekretaris PPG</option>
                  <option value="admin_kmm">Admin KMM</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password Baru</label>
                <Input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button onClick={handleSaveEdit} className="flex-1">
                Simpan
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </RoleGuard>
  )
}