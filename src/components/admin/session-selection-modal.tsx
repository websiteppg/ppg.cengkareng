'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Calendar, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock, 
  FileText, 
  Heart,
  Search,
  Download
} from 'lucide-react'

interface SessionData {
  id: string
  nama_sesi: string
  tanggal: string
  waktu_mulai: string
  lokasi: string
  tipe: string
  status: string
  stats: {
    total_peserta: number
    hadir: number
    terlambat: number
    izin: number
    sakit: number
    tidak_hadir: number
  }
  peserta?: Array<{
    nama: string
    status_kehadiran: string | null
    waktu_absen: string | null
  }>
}

interface SessionSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onExportPDF: (selectedSessions: string[]) => void
}

export default function SessionSelectionModal({ 
  isOpen, 
  onClose, 
  onExportPDF 
}: SessionSelectionModalProps) {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [expandedSessions, setExpandedSessions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
      // Reset states when modal opens
      setSelectedSessions([])
      setExpandedSessions([])
      setSearchTerm('')
    }
  }, [isOpen])

  const fetchSessions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/laporan/sessions-with-stats')
      if (response.ok) {
        const data = await response.json()
        setSessions(data || [])
      } else {
        console.error('Failed to fetch sessions:', response.status)
        setSessions([])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessionDetails = async (sessionId: string) => {
    setLoadingDetails(prev => [...prev, sessionId])
    try {
      const response = await fetch(`/api/laporan/session-details/${sessionId}`)
      if (response.ok) {
        const details = await response.json()
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, peserta: details.peserta || [] }
            : session
        ))
      } else {
        console.error('Failed to fetch session details:', response.status)
      }
    } catch (error) {
      console.error('Error fetching session details:', error)
    } finally {
      setLoadingDetails(prev => prev.filter(id => id !== sessionId))
    }
  }

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    )
  }

  const toggleSessionExpansion = async (sessionId: string) => {
    const isExpanded = expandedSessions.includes(sessionId)
    
    if (isExpanded) {
      setExpandedSessions(prev => prev.filter(id => id !== sessionId))
    } else {
      setExpandedSessions(prev => [...prev, sessionId])
      
      // Fetch details if not already loaded
      const session = sessions.find(s => s.id === sessionId)
      if (session && !session.peserta) {
        await fetchSessionDetails(sessionId)
      }
    }
  }

  const selectAllSessions = () => {
    const filteredSessionIds = filteredSessions.map(s => s.id)
    setSelectedSessions(filteredSessionIds)
  }

  const clearAllSelections = () => {
    setSelectedSessions([])
  }

  const handleExport = () => {
    if (selectedSessions.length === 0) {
      alert('Pilih minimal satu sesi untuk dicetak')
      return
    }
    onExportPDF(selectedSessions)
    onClose()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hadir': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'terlambat': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'izin': return <FileText className="w-4 h-4 text-blue-600" />
      case 'sakit': return <Heart className="w-4 h-4 text-red-600" />
      default: return <X className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hadir': return 'Hadir'
      case 'terlambat': return 'Terlambat'
      case 'izin': return 'Izin'
      case 'sakit': return 'Sakit'
      default: return 'Tidak Hadir'
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.nama_sesi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.lokasi && session.lokasi.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Pilih Sesi untuk Cetak PDF
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Cari sesi berdasarkan nama atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllSessions}>
                Pilih Semua
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllSelections}>
                Batal Pilih
              </Button>
            </div>
          </div>

          {/* Selected Count */}
          {selectedSessions.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>{selectedSessions.length}</strong> sesi dipilih untuk dicetak
              </p>
            </div>
          )}

          {/* Sessions List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data sesi...</p>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Tidak ada sesi ditemukan</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <Card key={session.id} className={`border-2 transition-colors ${
                  selectedSessions.includes(session.id) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <CardContent className="p-4">
                    {/* Session Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedSessions.includes(session.id)}
                          onChange={() => toggleSessionSelection(session.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{session.nama_sesi}</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(session.tanggal).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} • {session.waktu_mulai}
                          </div>
                          {session.lokasi && (
                            <p className="text-sm text-gray-600 mt-1">{session.lokasi}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSessionExpansion(session.id)}
                        className="ml-2"
                      >
                        {expandedSessions.includes(session.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="font-medium">{session.stats.total_peserta}</span>
                        <span className="text-gray-600 ml-1">peserta</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                        <span className="font-medium text-green-600">{session.stats.hadir}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                        <span className="font-medium text-yellow-600">{session.stats.terlambat}</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-600 mr-1" />
                        <span className="font-medium text-blue-600">{session.stats.izin}</span>
                      </div>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-600 mr-1" />
                        <span className="font-medium text-red-600">{session.stats.sakit}</span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedSessions.includes(session.id) && (
                      <div className="mt-4 pt-4 border-t">
                        {loadingDetails.includes(session.id) ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Memuat detail peserta...</p>
                          </div>
                        ) : session.peserta && session.peserta.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            <h4 className="font-medium text-gray-900 mb-2">Detail Peserta:</h4>
                            {session.peserta.map((peserta, index) => (
                              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                                <span className="text-sm font-medium">{peserta.nama}</span>
                                <div className="flex items-center">
                                  {getStatusIcon(peserta.status_kehadiran || 'tidak_hadir')}
                                  <span className="text-sm ml-1">
                                    {getStatusText(peserta.status_kehadiran || 'tidak_hadir')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 py-4 text-center">
                            Belum ada data kehadiran untuk sesi ini
                          </p>
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
              {selectedSessions.length} dari {filteredSessions.length} sesi dipilih
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button 
                onClick={handleExport}
                disabled={selectedSessions.length === 0}
                className="min-w-32"
              >
                <Download className="w-4 h-4 mr-2" />
                Cetak PDF ({selectedSessions.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}