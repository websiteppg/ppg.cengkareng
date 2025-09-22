'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home, FileText } from 'lucide-react'

export default function AttendanceSuccessPage() {
  const searchParams = useSearchParams()
  const participantName = searchParams.get('participant')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">
            Absensi Berhasil!
          </CardTitle>
          <CardDescription>
            Kehadiran Anda telah tercatat dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {participantName && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Peserta:</strong> {decodeURIComponent(participantName)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Waktu: {new Date().toLocaleString('id-ID', {
                  timeZone: 'Asia/Jakarta',
                  dateStyle: 'full',
                  timeStyle: 'short'
                })} WIB
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Terima kasih telah mengisi absensi. Data kehadiran Anda telah tersimpan 
              dan dapat dilihat oleh admin.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">
                Langkah Selanjutnya:
              </p>
              <ul className="text-sm text-blue-600 space-y-1 text-left">
                <li>• Ikuti sesi musyawarah dengan baik</li>
                <li>• Notulensi akan tersedia setelah sesi selesai</li>
                <li>• Anda dapat memberikan komentar pada notulensi</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/peserta/login" className="flex-1">
              <Button className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Login Peserta
              </Button>
            </Link>
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t">
            <p>Jika ada pertanyaan, hubungi panitia penyelenggara.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}