'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
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

interface ExportProps {
  files: MediaFireFile[]
}

export default function MediaFireExport({ files }: ExportProps) {
  const [exporting, setExporting] = useState(false)

  const exportToCSV = async () => {
    try {
      setExporting(true)
      
      // Prepare CSV data
      const headers = [
        'No',
        'Filename', 
        'MediaFire URL',
        'Category',
        'Description',
        'File Size',
        'File Type',
        'Tags',
        'Created By',
        'Created At'
      ]

      const csvData = files.map((file, index) => [
        index + 1,
        file.filename,
        file.mediafire_url,
        file.category,
        file.description || '',
        file.file_size || '',
        file.file_type || '',
        file.tags?.join(', ') || '',
        file.peserta?.nama || '',
        new Date(file.created_at).toLocaleDateString('id-ID')
      ])

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `mediafire-files-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('File exported successfully')
    } catch (error) {
      toast.error('Failed to export file')
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportToCSV}
        disabled={exporting || files.length === 0}
        variant="outline"
        className="flex items-center gap-2"
      >
        {exporting ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV ({files.length} files)
          </>
        )}
      </Button>
    </div>
  )
}