'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Square,
  Timer,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface KegiatanBidang {
  id: string
  no_urut: number
  nama_kegiatan: string
  bulan: string
  tujuan_kegiatan: string
  keterangan: string
  alokasi_dana: number
  rincian_biaya?: any
}

interface AutoAdvancePresentationProps {
  programKerja: {
    tahun: number
    nama_bidang: string
    kegiatan_bidang: KegiatanBidang[]
  }
  tahun: string
  bidang: string
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export function AutoAdvancePresentation({ programKerja, tahun, bidang }: AutoAdvancePresentationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideInterval, setSlideInterval] = useState(10) // seconds
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(slideInterval)

  // Create slides data
  const slides = [
    {
      type: 'title',
      title: 'Program Kerja PPG Jakarta Barat Cengkareng',
      subtitle: `Tahun ${tahun} - ${bidang}`,
      content: {
        totalKegiatan: programKerja.kegiatan_bidang.length,
        totalBiaya: programKerja.kegiatan_bidang.reduce((sum, k) => sum + (k.alokasi_dana || 0), 0)
      }
    },
    ...MONTHS.map(month => {
      const kegiatanBulan = programKerja.kegiatan_bidang.filter(k => k.bulan === month)
      return {
        type: 'month',
        title: `${month} ${tahun}`,
        subtitle: bidang,
        content: {
          kegiatan: kegiatanBulan,
          totalBiaya: kegiatanBulan.reduce((sum, k) => sum + (k.alokasi_dana || 0), 0)
        }
      }
    }).filter(slide => slide.content.kegiatan.length > 0),
    {
      type: 'closing',
      title: 'Terima Kasih',
      subtitle: 'PPG Jakarta Barat Cengkareng',
      content: {
        message: 'Semoga mendapat ridho Allah SWT dan bermanfaat untuk umat'
      }
    }
  ]

  // Auto-advance logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCurrentSlide(current => 
              current >= slides.length - 1 ? 0 : current + 1
            )
            return slideInterval
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, slideInterval, slides.length])

  // Reset timer when slide changes manually
  useEffect(() => {
    setTimeRemaining(slideInterval)
  }, [currentSlide, slideInterval])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          nextSlide()
          break
        case 'ArrowLeft':
          prevSlide()
          break
        case 'p':
        case 'P':
          togglePlay()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'Escape':
          if (isFullscreen) toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isFullscreen])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const nextSlide = () => {
    setCurrentSlide(current => 
      current >= slides.length - 1 ? 0 : current + 1
    )
  }

  const prevSlide = () => {
    setCurrentSlide(current => 
      current <= 0 ? slides.length - 1 : current - 1
    )
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  const renderSlide = (slide: any) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-white mb-4">{slide.title}</h1>
              <h2 className="text-3xl text-green-200">{slide.subtitle}</h2>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-white">{slide.content.totalKegiatan}</div>
                <div className="text-xl text-green-200">Total Kegiatan</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-white">{formatCurrency(slide.content.totalBiaya)}</div>
                <div className="text-xl text-green-200">Total Anggaran</div>
              </div>
            </div>
            <div className="mt-12 text-lg text-green-200">
              Presentasi untuk Para Kyai - Sabtu Malam Minggu ke-4
            </div>
          </div>
        )

      case 'month':
        return (
          <div className="h-full flex flex-col">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-2">{slide.title}</h1>
              <h2 className="text-2xl text-green-200">{slide.subtitle}</h2>
              <div className="text-xl text-yellow-300 mt-4">
                Total: {formatCurrency(slide.content.totalBiaya)}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 gap-6 max-h-[500px] overflow-y-auto">
              {slide.content.kegiatan.map((kegiatan: KegiatanBidang) => (
                <div key={kegiatan.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white">
                      {kegiatan.no_urut}. {kegiatan.nama_kegiatan}
                    </h3>
                    <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                      {formatCurrency(kegiatan.alokasi_dana)}
                    </Badge>
                  </div>
                  <div className="text-green-200 mb-2">
                    <strong>Tujuan:</strong> {kegiatan.tujuan_kegiatan}
                  </div>
                  <div className="text-green-200">
                    <strong>Keterangan:</strong> {kegiatan.keterangan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'closing':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-6xl font-bold text-white mb-8">{slide.title}</h1>
            <h2 className="text-3xl text-green-200 mb-12">{slide.subtitle}</h2>
            <div className="text-2xl text-green-200 mb-8">
              Program Kerja {bidang} Tahun {tahun}
            </div>
            <div className="text-xl text-yellow-300">
              {slide.content.message}
            </div>
          </div>
        )

      default:
        return <div>Unknown slide type</div>
    }
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} bg-gradient-to-br from-green-600 via-blue-600 to-purple-700`}>
      {/* Controls */}
      {!isFullscreen && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="flex justify-between items-center bg-black/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <Button onClick={togglePlay} variant="outline" size="sm">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button onClick={prevSlide} variant="outline" size="sm">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button onClick={nextSlide} variant="outline" size="sm">
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button onClick={toggleFullscreen} variant="outline" size="sm">
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span>{timeRemaining}s</span>
              </div>
              <div>
                {currentSlide + 1} / {slides.length}
              </div>
              <select 
                value={slideInterval} 
                onChange={(e) => setSlideInterval(Number(e.target.value))}
                className="bg-black/50 text-white rounded px-2 py-1 text-sm"
              >
                <option value={5}>5s</option>
                <option value={10}>10s</option>
                <option value={15}>15s</option>
                <option value={30}>30s</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Slide Content */}
      <div className={`${isFullscreen ? 'h-screen' : 'h-[600px]'} p-8 ${!isFullscreen ? 'pt-20' : ''}`}>
        {renderSlide(slides[currentSlide])}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
        <div 
          className="h-full bg-green-400 transition-all duration-1000 ease-linear"
          style={{ width: `${((slideInterval - timeRemaining) / slideInterval) * 100}%` }}
        />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div>Shortcuts:</div>
          <div>Space/→: Next | ←: Previous</div>
          <div>P: Play/Pause | F: Fullscreen | Esc: Exit</div>
        </div>
      )}
    </div>
  )
}