'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import RoleGuard from '@/components/admin/role-guard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
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
  Activity,
  Users,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react'
import { toast } from 'sonner'
import { getUserFromStorage } from '@/lib/auth'

interface MediafireFile {
  id: string
  filename: string
  mediafire_url: string
  category: string
  description?: string
  file_size?: string
  file_type?: string
  upload_date: string
  tags?: string[]
  peserta?: {
    nama: string
    email: string
  }
}

interface DashboardStats {
  totalFiles: number
  totalSizeEstimate: string
  categoryBreakdown: Record<string, number>
  recentFiles: MediafireFile[]
  activityStats: Record<string, number>
}

const categories = [
  { value: 'Documents', label: 'Documents', icon: FileText },
  { value: 'Images', label: 'Images', icon: Image },
  { value: 'Videos', label: 'Videos', icon: Video },
  { value: 'Audio', label: 'Audio', icon: Music },
  { value: 'Archives', label: 'Archives', icon: Archive },
  { value: 'Others', label: 'Others', icon: File }
]

function MediafireManagerContent() {
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<MediafireFile[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('upload_date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingFile, setEditingFile] = useState<MediafireFile | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)


  // Form state
  const [formData, setFormData] = useState({
    filename: '',
    mediafire_url: '',
    category: 'Others',
    description: '',
    file_size: '',
    file_type: '',
    tags: ''
  })

  useEffect(() => {
    const userData = getUserFromStorage()
    setUser(userData)
    fetchStats()
    fetchFiles()
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/mediafire-manager/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/mediafire-manager/files?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch files:', error)
      toast.error('Failed to load files')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.filename || !formData.mediafire_url) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      const url = editingFile 
        ? `/api/mediafire-manager/files/${editingFile.id}`
        : '/api/mediafire-manager/files'
      
      const method = editingFile ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          created_by: user.id,
          user_id: user.id
        })
      })

      if (response.ok) {
        toast.success(editingFile ? 'File updated successfully' : 'File added successfully')
        setShowAddDialog(false)
        setEditingFile(null)
        resetForm()
        fetchFiles()
        fetchStats()
      } else {
        const error = await response.json()
        if (error.code === 'TABLE_NOT_EXISTS') {
          toast.error('Database tables not created yet. Please run database migration first.')
        } else {
          toast.error(error.error || 'Operation failed')
        }
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/mediafire-manager/files/${fileId}?user_id=${user.id}`, {
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
      toast.error('An error occurred')
    }
  }

  const handleEdit = (file: MediafireFile) => {
    setEditingFile(file)
    setFormData({
      filename: file.filename,
      mediafire_url: file.mediafire_url,
      category: file.category,
      description: file.description || '',
      file_size: file.file_size || '',
      file_type: file.file_type || '',
      tags: file.tags?.join(', ') || ''
    })
    setShowAddDialog(true)
  }

  const resetForm = () => {
    setFormData({
      filename: '',
      mediafire_url: '',
      category: 'Others',
      description: '',
      file_size: '',
      file_type: '',
      tags: ''
    })
  }

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map(f => f.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) return

    setBulkLoading(true)
    try {
      const response = await fetch('/api/mediafire-manager/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds: selectedFiles,
          user_id: user.id
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        setSelectedFiles([])
        fetchFiles()
        fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Bulk delete failed')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        format: 'csv',
        search: searchTerm,
        category: selectedCategory
      })

      const response = await fetch(`/api/mediafire-manager/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mediafire-files-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Export completed')
      } else {
        toast.error('Export failed')
      }
    } catch (error) {
      toast.error('Export error')
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.icon : File
  }



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MediaFire Link Manager</h1>
          <p className="text-gray-600">Manage your MediaFire file links and metadata</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/mediafire-manager/activity">
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </Button>
          </Link>
          <Button onClick={() => { resetForm(); setEditingFile(null); setShowAddDialog(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Add File
          </Button>
        </div>
      </div>

      {/* Add File Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFile ? 'Edit File' : 'Add New File'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="filename">File Name *</Label>
                <Input
                  id="filename"
                  value={formData.filename}
                  onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                  placeholder="Enter file name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mediafire_url">MediaFire URL *</Label>
                <Input
                  id="mediafire_url"
                  value={formData.mediafire_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, mediafire_url: e.target.value }))}
                  placeholder="https://www.mediafire.com/..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="file_size">File Size</Label>
                  <Input
                    id="file_size"
                    value={formData.file_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, file_size: e.target.value }))}
                    placeholder="e.g., 10MB"
                  />
                </div>
                <div>
                  <Label htmlFor="file_type">File Type</Label>
                  <Input
                    id="file_type"
                    value={formData.file_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, file_type: e.target.value }))}
                    placeholder="e.g., PDF"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingFile ? 'Update' : 'Add'} File
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFiles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.categoryBreakdown).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.values(stats.activityStats).reduce((a, b) => a + b, 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{stats.totalSizeEstimate}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>File Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex gap-2">
              {selectedFiles.length > 0 && (
                <>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete ({selectedFiles.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                  >
                    Clear Selection
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upload_date-desc">Newest First</SelectItem>
                <SelectItem value="upload_date-asc">Oldest First</SelectItem>
                <SelectItem value="filename-asc">Name A-Z</SelectItem>
                <SelectItem value="filename-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File List */}
          <div className="space-y-2">
            {files.length > 0 && (
              <div className="flex items-center space-x-2 p-2 border-b">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  {selectedFiles.length === files.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  <span>Select All ({files.length})</span>
                </button>
              </div>
            )}
            {files.map((file) => {
              const IconComponent = getCategoryIcon(file.category)
              const isSelected = selectedFiles.includes(file.id)
              return (
                <div key={file.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleSelectFile(file.id)}
                      className="flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <IconComponent className="w-8 h-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium">{file.filename}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Badge className="bg-gray-100 text-gray-800">{file.category}</Badge>
                        {file.file_size && <span>{file.file_size}</span>}
                        <span>{new Date(file.upload_date).toLocaleDateString()}</span>
                        {file.peserta && <span>by {file.peserta.nama}</span>}
                      </div>
                      {file.description && (
                        <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.mediafire_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(file)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function MediafireManagerPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <MediafireManagerContent />
    </RoleGuard>
  )
}