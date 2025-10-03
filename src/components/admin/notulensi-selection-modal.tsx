'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Calendar, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Search,
  Download,
  User
} from 'lucide-react'

interface NotulensiData {
  id: string
  judul: string
  status: string
  created_at: string
  updated_at: string
  sesi: {
    nama_sesi: string
    tanggal: string
    waktu_mulai: string
    lokasi: string
  } | null
  dibuat_oleh: {
    nama: string
  } | null
  agenda?: string
  pembahasan?: string
  keputusan?: string
  tindak_lanjut?: string
}

interface NotulensiSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onExportPDF: (selectedNotulensi: string) => void
}

export default function NotulensiSelectionModal({ 
  isOpen, 
  onClose, 
  onExportPDF 
}: NotulensiSelectionModalProps) {
  const [notulensiList, setNotulensiList] = useState<NotulensiData[]>([])
  const [selectedNotulensi, setSelectedNotulensi] = useState<string>('')
  const [expandedNotulensi, setExpandedNotulensi] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchNotulensiList()
      // Reset states when modal opens
      setSelectedNotulensi('')
      setExpandedNotulensi([])
      setSearchTerm('')
    }
  }, [isOpen])

  const fetchNotulensiList = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notulensi')
      if (response.ok) {
        const data = await response.json()
        setNotulensiList(data || [])
      } else {
        console.error('Failed to fetch notulensi:', response.status)
        setNotulensiList([])
      }
    } catch (error) {
      console.error('Error fetching notulensi:', error)
      setNotulensiList([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotulensiDetails = async (notulensiId: string) => {
    setLoadingDetails(prev => [...prev, notulensiId])
    try {
      const response = await fetch(`/api/notulensi/${notulensiId}`)
      if (response.ok) {
        const details = await response.json()
        setNotulensiList(prev => prev.map(notulensi => 
          notulensi.id === notulensiId 
            ? { 
                ...notulensi, 
                agenda: details.agenda || '',
                pembahasan: details.pembahasan || '',
                keputusan: details.keputusan || '',
                tindak_lanjut: details.tindak_lanjut || ''
              }
            : notulensi
        ))
      } else {
        console.error('Failed to fetch notulensi details:', response.status)
      }
    } catch (error) {
      console.error('Error fetching notulensi details:', error)
    } finally {
      setLoadingDetails(prev => prev.filter(id => id !== notulensiId))
    }
  }

  const toggleNotulensiExpansion = async (notulensiId: string) => {
    const isExpanded = expandedNotulensi.includes(notulensiId)
    
    if (isExpanded) {
      setExpandedNotulensi(prev => prev.filter(id => id !== notulensiId))
    } else {
      setExpandedNotulensi(prev => [...prev, notulensiId])
      
      // Fetch details if not already loaded
      const notulensi = notulensiList.find(n => n.id === notulensiId)
      if (notulensi && !notulensi.agenda) {
        await fetchNotulensiDetails(notulensiId)
      }
    }
  }

  const handleExport = () => {
    if (!selectedNotulensi) {
      alert('Pilih satu notulensi untuk dicetak')
      return
    }
    onExportPDF(selectedNotulensi)
    onClose()
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'draft': return <AlertCircle className="w-4 h-4 text-gray-600" />
      default: return <FileText className="w-4 h-4 text-blue-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'Disetujui'
      case 'pending': return 'Menunggu'
      case 'draft': return 'Draft'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const filteredNotulensi = notulensiList.filter(notulensi =>
    notulensi.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (notulensi.sesi?.nama_sesi && notulensi.sesi.nama_sesi.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Pilih Notulensi untuk Cetak PDF
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari notulensi berdasarkan judul atau sesi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selected Count */}
          {selectedNotulensi && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>1</strong> notulensi dipilih untuk dicetak
              </p>
            </div>
          )}

          {/* Notulensi List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data notulensi...</p>
              </div>
            ) : filteredNotulensi.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Tidak ada notulensi ditemukan</p>
              </div>
            ) : (
              filteredNotulensi.map((notulensi) => (
                <Card key={notulensi.id} className={`border-2 transition-colors ${
                  selectedNotulensi === notulensi.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <CardContent className="p-4">
                    {/* Notulensi Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="selectedNotulensi"
                          checked={selectedNotulensi === notulensi.id}
                          onChange={() => setSelectedNotulensi(notulensi.id)}
                          className="mt-1 w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{notulensi.judul}</h3>
                          {notulensi.sesi && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4 mr-1" />
                              {notulensi.sesi.nama_sesi} • {new Date(notulensi.sesi.tanggal).toLocaleDateString('id-ID')} • {notulensi.sesi.waktu_mulai}
                            </div>
                          )}
                          {notulensi.sesi?.lokasi && (
                            <p className="text-sm text-gray-600 mt-1">{notulensi.sesi.lokasi}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNotulensiExpansion(notulensi.id)}
                        className="ml-2"
                      >
                        {expandedNotulensi.includes(notulensi.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Status and Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {getStatusIcon(notulensi.status)}
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notulensi.status)}`}>
                            {getStatusText(notulensi.status)}
                          </span>
                        </div>
                        {notulensi.dibuat_oleh && (
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            <span>{notulensi.dibuat_oleh.nama}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-gray-500">
                        {new Date(notulensi.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedNotulensi.includes(notulensi.id) && (
                      <div className="mt-4 pt-4 border-t">
                        {loadingDetails.includes(notulensi.id) ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Memuat detail notulensi...</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 mb-2">Preview Notulensi:</h4>
                            
                            {notulensi.agenda && (
                              <div>
                                <h5 className="font-medium text-sm text-gray-700">Agenda:</h5>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                  {notulensi.agenda.substring(0, 200)}
                                  {notulensi.agenda.length > 200 && '...'}
                                </p>
                              </div>
                            )}
                            
                            {notulensi.keputusan && (
                              <div>
                                <h5 className="font-medium text-sm text-gray-700">Keputusan:</h5>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {notulensi.keputusan.substring(0, 150)}
                                  {notulensi.keputusan.length > 150 && '...'}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <p className="text-sm text-gray-600">
              {selectedNotulensi ? '1' : '0'} dari {filteredNotulensi.length} notulensi dipilih
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button 
                onClick={handleExport}
                disabled={!selectedNotulensi}
                className="min-w-32"
              >
                <Download className="w-4 h-4 mr-2" />
                Cetak PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}