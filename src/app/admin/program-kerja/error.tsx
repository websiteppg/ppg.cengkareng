'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-500 text-center mb-4">
            Gagal memuat halaman Program Kerja PPG
          </p>
          <Button onClick={reset}>
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}