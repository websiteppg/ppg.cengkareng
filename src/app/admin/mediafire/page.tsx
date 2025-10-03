'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import MediaFireExport from '@/components/admin/mediafire-export'
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Edit, 
  Trash2, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File,
  Cloud,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface MediaFireFile {
  id: string
  filename: string
  mediafire_url: string
  category: string
  description: string | null
  file_size: string | null
  file_type: string | null
  tags: string[] | null
  created_at: string
  peserta: { nama: string; email: string }
}

interface Stats {
  totalFiles: number
  categoryStats: Record<string, number>
  recentFiles: MediaFireFile[]
}

export default function MediaFireManagerPage() {
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<MediaFireFile[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingFile, setEditingFile] = useState<MediaFireFile | null>(null)

  const categories = [
    { value: 'documents', label: 'Documents', icon: FileText },
    { value: 'images', label: 'Images', icon: Image },
    { value: 'videos', label: 'Videos', icon: Video },
    { value: 'audio', label: 'Audio', icon: Music },
    { value: 'archives', label: 'Archives', icon: Archive },
    { value: 'others', label: 'Others', icon: File }
  ]

  useEffect(() => {
    const userData = localStorage.getItem('admin_user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'super_admin') {
        window.location.href = '/admin'
        return
      }
      setUser(parsedUser)
    } else {
      window.location.href = '/admin/login'
      return
    }

    fetchStats()
    fetchFiles()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/mediafire/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      
      const response = await fetch(`/api/mediafire/files?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFile = async (formData: any) => {
    try {
      const response = await fetch('/api/mediafire/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, created_by: user.id })
      })

      if (response.ok) {
        toast.success('File added successfully')
        setShowAddForm(false)
        fetchFiles()
        fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add file')
      }
    } catch (error) {
      toast.error('Error adding file')
    }
  }

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/mediafire/files/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('File deleted successfully')
        fetchFiles()
        fetchStats()
      } else {
        toast.error('Failed to delete file')
      }
    } catch (error) {
      toast.error('Error deleting file')
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.icon : File
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">Only Super Admin can access this feature</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Cloud className="w-6 h-6" />
            MediaFire Link Manager
          </h1>
          <p className="text-gray-600">Manage MediaFire file links and metadata</p>
        </div>
        <div className="flex gap-2">
          <MediaFireExport files={files} />
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add File
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Files</p>
                  <p className="text-2xl font-bold">{stats.totalFiles}</p>
                </div>
                <Cloud className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          {categories.slice(0, 3).map(cat => {
            const Icon = cat.icon
            return (
              <Card key={cat.value}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{cat.label}</p>
                      <p className="text-2xl font-bold">{stats.categoryStats[cat.value] || 0}</p>
                    </div>
                    <Icon className="w-8 h-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Button onClick={fetchFiles} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No files found</div>
          ) : (
            <div className="space-y-4">
              {files.map(file => {
                const Icon = getCategoryIcon(file.category)
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Icon className="w-8 h-8 text-gray-500" />
                      <div>
                        <h3 className="font-medium">{file.filename}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">{file.category}</span>
                          {file.file_size && <span>{file.file_size}</span>}
                          <span>by {file.peserta?.nama}</span>
                        </div>
                        {file.description && (
                          <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.mediafire_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingFile(file)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingFile) && (
        <AddEditFileModal
          file={editingFile}
          onClose={() => {
            setShowAddForm(false)
            setEditingFile(null)
          }}
          onSave={handleAddFile}
          categories={categories}
        />
      )}
    </div>
  )
}

// Add/Edit File Modal Component
function AddEditFileModal({ 
  file, 
  onClose, 
  onSave, 
  categories 
}: { 
  file: MediaFireFile | null
  onClose: () => void
  onSave: (data: any) => void
  categories: any[]
}) {
  const [formData, setFormData] = useState({
    filename: file?.filename || '',
    mediafire_url: file?.mediafire_url || '',
    category: file?.category || 'others',
    description: file?.description || '',
    file_size: file?.file_size || '',
    file_type: file?.file_type || '',
    tags: file?.tags?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    }
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {file ? 'Edit File' : 'Add New File'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">File Name *</label>
            <Input
              value={formData.filename}
              onChange={(e) => setFormData({...formData, filename: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MediaFire URL *</label>
            <Input
              value={formData.mediafire_url}
              onChange={(e) => setFormData({...formData, mediafire_url: e.target.value})}
              placeholder="https://www.mediafire.com/..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">File Size</label>
              <Input
                value={formData.file_size}
                onChange={(e) => setFormData({...formData, file_size: e.target.value})}
                placeholder="e.g., 10MB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">File Type</label>
              <Input
                value={formData.file_type}
                onChange={(e) => setFormData({...formData, file_type: e.target.value})}
                placeholder="e.g., PDF, MP4"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="tag1, tag2, tag3"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {file ? 'Update' : 'Add'} File
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}