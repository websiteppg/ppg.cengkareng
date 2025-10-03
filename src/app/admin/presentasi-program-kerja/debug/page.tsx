'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function DebugPresentasiPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      if (!supabase) {
        setDebugInfo({ error: 'Supabase client is null' })
        return
      }
      
      // Check program_kerja_tahunan table (correct name)
      const { data: programKerja, error: errorPK } = await supabase
        .from('program_kerja_tahunan')
        .select('*')
        .limit(5)

      // Check kegiatan_bidang table (correct name)
      const { data: kegiatanProgram, error: errorKP } = await supabase
        .from('kegiatan_bidang')
        .select('*')
        .limit(5)

      // Check rincian_biaya table (correct name)
      const { data: rincianBiaya, error: errorRB } = await supabase
        .from('rincian_biaya')
        .select('*')
        .limit(5)

      setDebugInfo({
        programKerja: { data: programKerja, error: errorPK },
        kegiatanProgram: { data: kegiatanProgram, error: errorKP },
        rincianBiaya: { data: rincianBiaya, error: errorRB }
      })
    } catch (error: any) {
      console.error('Debug error:', error)
      setDebugInfo({ error: error?.message || 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Debug Presentasi Program Kerja</h1>
          <Button onClick={checkDatabase} disabled={loading}>
            {loading ? 'Checking...' : 'Refresh Database Check'}
          </Button>
        </div>

        {debugInfo && (
          <div className="grid gap-6">
            {/* Program Kerja */}
            <Card>
              <CardHeader>
                <CardTitle>Tabel: program_kerja_tahunan</CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.programKerja?.error ? (
                  <div className="text-red-600">
                    Error: {JSON.stringify(debugInfo.programKerja.error, null, 2)}
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">Records found: {debugInfo.programKerja?.data?.length || 0}</p>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(debugInfo.programKerja?.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kegiatan Program */}
            <Card>
              <CardHeader>
                <CardTitle>Tabel: kegiatan_bidang</CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.kegiatanProgram?.error ? (
                  <div className="text-red-600">
                    Error: {JSON.stringify(debugInfo.kegiatanProgram.error, null, 2)}
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">Records found: {debugInfo.kegiatanProgram?.data?.length || 0}</p>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(debugInfo.kegiatanProgram?.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rincian Biaya */}
            <Card>
              <CardHeader>
                <CardTitle>Tabel: rincian_biaya</CardTitle>
              </CardHeader>
              <CardContent>
                {debugInfo.rincianBiaya?.error ? (
                  <div className="text-red-600">
                    Error: {JSON.stringify(debugInfo.rincianBiaya.error, null, 2)}
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">Records found: {debugInfo.rincianBiaya?.data?.length || 0}</p>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(debugInfo.rincianBiaya?.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}