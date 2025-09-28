import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
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

    // Fetch attendance data with JOIN to get latest status per peserta
    const { data: attendanceWithPeserta, error: attendanceError } = await (supabase as any)
      .from('absensi')
      .select(`
        peserta_id,
        status_kehadiran,
        waktu_absen,
        peserta:peserta_id(nama)
      `)
      .eq('sesi_id', sesiId)
      .order('waktu_absen', { ascending: false })

    if (attendanceError) {
      console.error('Attendance error:', attendanceError)
      return NextResponse.json({ error: 'Gagal mengambil data absensi' }, { status: 500 })
    }

    // Create attendance map - only keep latest record per peserta
    const attendanceMap = new Map()
    const seenPeserta = new Set()
    
    attendanceWithPeserta?.forEach((item: any) => {
      if (!seenPeserta.has(item.peserta_id)) {
        attendanceMap.set(item.peserta_id, item.status_kehadiran)
        seenPeserta.add(item.peserta_id)
      }
    })

    console.log(`PDF Generation - Session: ${sesiId}, Participants: ${participants?.length}, Attendance records: ${attendanceWithPeserta?.length}`)
    console.log('Raw attendance data:', attendanceWithPeserta)
    console.log('Final attendance map:', Array.from(attendanceMap.entries()))
    console.log('Timestamp:', new Date().toISOString())

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

      // Log for debugging
      console.log(`PDF Row ${index + 1}: ${peserta.nama} - ID: ${peserta.id} - Status: ${status} (${statusText})`)

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

    // Calculate statistics from attendance map (latest data only)
    const totalParticipants = participants?.length || 0
    const statusCounts = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      ghoib: 0
    }
    
    // Count from attendance map
    attendanceMap.forEach((status) => {
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status as keyof typeof statusCounts]++
      }
    })
    
    // Count participants without attendance record as ghoib
    const participantsWithRecord = attendanceMap.size
    const ghoibCount = totalParticipants - participantsWithRecord + statusCounts.ghoib
    
    const stats = {
      hadir: statusCounts.hadir,
      izin: statusCounts.izin,
      sakit: statusCounts.sakit,
      ghoib: ghoibCount
    }
    
    console.log('PDF Statistics:', stats, 'Total participants:', totalParticipants)

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
        'Content-Disposition': `attachment; filename="Absensi-${(session as any).nama_sesi}-${new Date().toISOString().split('T')[0]}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Gagal membuat PDF' }, { status: 500 })
  }
}