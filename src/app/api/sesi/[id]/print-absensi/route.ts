import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const sesiId = params.id

    // Fetch session data
    const { data: session, error: sessionError } = await supabase
      .from('sesi_musyawarah')
      .select('*')
      .eq('id', sesiId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Sesi tidak ditemukan' }, { status: 404 })
    }

    // Fetch participants with attendance status
    const { data: participants, error: participantsError } = await supabase
      .from('sesi_peserta')
      .select(`
        peserta:peserta_id (
          id,
          nama,
          email,
          jabatan,
          instansi
        )
      `)
      .eq('sesi_id', sesiId)

    if (participantsError) {
      return NextResponse.json({ error: 'Gagal mengambil data peserta' }, { status: 500 })
    }

    // Fetch attendance data
    const { data: attendance, error: attendanceError } = await supabase
      .from('absensi')
      .select('peserta_id, status_kehadiran')
      .eq('sesi_id', sesiId)

    if (attendanceError) {
      return NextResponse.json({ error: 'Gagal mengambil data absensi' }, { status: 500 })
    }

    // Create attendance map
    const attendanceMap = new Map()
    attendance?.forEach((item: any) => {
      attendanceMap.set(item.peserta_id, item.status_kehadiran)
    })

    // Generate PDF
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(16)
    doc.text('DAFTAR HADIR MUSYAWARAH', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Sesi: ${(session as any).nama_sesi}`, 20, 35)
    doc.text(`Tanggal: ${new Date((session as any).tanggal).toLocaleDateString('id-ID')}`, 20, 45)
    doc.text(`Waktu: ${(session as any).waktu_mulai} - ${(session as any).waktu_selesai}`, 20, 55)
    doc.text(`Lokasi: ${(session as any).lokasi || 'Tidak ditentukan'}`, 20, 65)

    // Table header
    const startY = 80
    doc.setFontSize(10)
    doc.text('No', 20, startY)
    doc.text('Nama Peserta', 35, startY)
    doc.text('Username', 90, startY)
    doc.text('Bidang', 130, startY)
    doc.text('Status', 170, startY)

    // Draw header line
    doc.line(15, startY + 3, 195, startY + 3)

    // Table content
    let currentY = startY + 10
    participants?.forEach((item: any, index: number) => {
      const peserta = item.peserta
      const status = attendanceMap.get(peserta.id) || 'ghoib'
      
      // Status mapping
      const statusText = ({
        'hadir': 'Hadir',
        'izin': 'Izin', 
        'sakit': 'Sakit',
        'ghoib': 'Ghoib'
      } as any)[status] || 'Ghoib'

      doc.text((index + 1).toString(), 20, currentY)
      doc.text(peserta.nama || '', 35, currentY)
      doc.text(peserta.email || '', 90, currentY)
      doc.text(peserta.instansi || '', 130, currentY)
      doc.text(statusText, 170, currentY)

      currentY += 8

      // Add new page if needed
      if (currentY > 270) {
        doc.addPage()
        currentY = 20
      }
    })

    // Statistics
    const stats = {
      hadir: attendance?.filter((a: any) => a.status_kehadiran === 'hadir').length || 0,
      izin: attendance?.filter((a: any) => a.status_kehadiran === 'izin').length || 0,
      sakit: attendance?.filter((a: any) => a.status_kehadiran === 'sakit').length || 0,
      ghoib: attendance?.filter((a: any) => a.status_kehadiran === 'ghoib').length || 0
    }

    // Add statistics at the bottom
    currentY += 10
    doc.text('REKAPITULASI:', 20, currentY)
    currentY += 8
    doc.text(`Hadir: ${stats.hadir} orang`, 20, currentY)
    doc.text(`Izin: ${stats.izin} orang`, 70, currentY)
    doc.text(`Sakit: ${stats.sakit} orang`, 120, currentY)
    doc.text(`Ghoib: ${stats.ghoib} orang`, 170, currentY)

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Absensi-${(session as any).nama_sesi}-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Gagal membuat PDF' }, { status: 500 })
  }
}