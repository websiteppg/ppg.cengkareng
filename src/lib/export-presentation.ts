import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { formatCurrency } from './utils'

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

interface ProgramKerja {
  id: string
  tahun: number
  nama_bidang: string
  kegiatan_bidang: KegiatanBidang[]
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export async function exportPresentationPDF(programKerja: ProgramKerja, tahun: string, bidang: string) {
  try {
    console.log('Starting PDF export for:', { tahun, bidang, kegiatanCount: programKerja.kegiatan_bidang.length })
    const doc = new jsPDF('landscape', 'mm', 'a4')
  
  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('PROGRAM KERJA PPG JAKARTA BARAT CENGKARENG', 148, 20, { align: 'center' })
  
  doc.setFontSize(16)
  doc.text(`TAHUN ${tahun} - BIDANG ${bidang.toUpperCase()}`, 148, 30, { align: 'center' })
  
  // Summary
  const totalBiaya = programKerja.kegiatan_bidang.reduce((total, k) => total + (k.alokasi_dana || 0), 0)
  const totalKegiatan = programKerja.kegiatan_bidang.length
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Kegiatan: ${totalKegiatan} | Total Anggaran: ${formatCurrency(totalBiaya)}`, 148, 40, { align: 'center' })
  
  let yPosition = 55
  
  // Timeline per bulan
  MONTHS.forEach((month, monthIndex) => {
    const kegiatanBulan = programKerja.kegiatan_bidang.filter(k => k.bulan?.toUpperCase() === month.toUpperCase())
    
    if (kegiatanBulan.length > 0) {
      // Check if we need new page
      if (yPosition > 180) {
        doc.addPage()
        yPosition = 20
      }
      
      // Month header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`${month} ${tahun}`, 20, yPosition)
      
      const totalBulan = kegiatanBulan.reduce((total, k) => total + (k.alokasi_dana || 0), 0)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Total: ${formatCurrency(totalBulan)}`, 200, yPosition)
      
      yPosition += 10
      
      // Table data
      const tableData = kegiatanBulan.map(kegiatan => [
        kegiatan.no_urut.toString(),
        kegiatan.nama_kegiatan,
        kegiatan.tujuan_kegiatan || '-',
        formatCurrency(kegiatan.alokasi_dana)
      ])
      
      // @ts-ignore
      doc.autoTable({
        startY: yPosition,
        head: [['No', 'Nama Kegiatan', 'Tujuan', 'Biaya']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [34, 197, 94], // Green
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 80 },
          2: { cellWidth: 120 },
          3: { cellWidth: 40, halign: 'right' }
        },
        margin: { left: 20, right: 20 }
      })
      
      // @ts-ignore
      yPosition = doc.lastAutoTable.finalY + 15
    }
  })
  
  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Presentasi Program Kerja - ${new Date().toLocaleDateString('id-ID')} - Halaman ${i} dari ${pageCount}`,
      148, 200, 
      { align: 'center' }
    )
  }
  
  // Save
  console.log('Saving PDF...')
  doc.save(`Presentasi_Program_Kerja_${bidang}_${tahun}.pdf`)
  console.log('PDF export completed successfully')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Gagal mengexport PDF: ' + error)
  }
}

export async function exportDetailKegiatanPDF(kegiatan: KegiatanBidang, bidang: string, tahun: string) {
  const doc = new jsPDF('portrait', 'mm', 'a4')
  
  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DETAIL KEGIATAN PROGRAM KERJA', 105, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(`${bidang.toUpperCase()} - TAHUN ${tahun}`, 105, 30, { align: 'center' })
  
  let yPos = 50
  
  // Kegiatan Info
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(`${kegiatan.no_urut}. ${kegiatan.nama_kegiatan}`, 20, yPos)
  yPos += 15
  
  // Details
  const details = [
    ['Bulan Pelaksanaan', kegiatan.bulan],
    ['Total Biaya', formatCurrency(kegiatan.alokasi_dana)],
    ['Tujuan', kegiatan.tujuan_kegiatan || '-'],
    ['Keterangan', kegiatan.keterangan || '-']
  ]
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, 20, yPos)
    doc.setFont('helvetica', 'normal')
    
    // Handle long text
    const splitText = doc.splitTextToSize(value, 150)
    doc.text(splitText, 20, yPos + 7)
    yPos += 7 + (splitText.length * 5) + 5
  })
  
  // Rincian Biaya
  if (kegiatan.rincian_biaya) {
    yPos += 10
    doc.setFont('helvetica', 'bold')
    doc.text('Rincian Biaya:', 20, yPos)
    yPos += 10
    
    const rincianData = [
      ['Peserta', kegiatan.rincian_biaya.peserta?.toString() || '0'],
      ['Konsumsi', formatCurrency(kegiatan.rincian_biaya.konsumsi || 0)],
      ['Akomodasi', formatCurrency(kegiatan.rincian_biaya.akomodasi || 0)],
      ['Dokumentasi', formatCurrency(kegiatan.rincian_biaya.dokumentasi || 0)],
      ['Extra Biaya', formatCurrency(kegiatan.rincian_biaya.extra_biaya || 0)]
    ]
    
    // @ts-ignore
    doc.autoTable({
      startY: yPos,
      head: [['Item', 'Nilai']],
      body: rincianData,
      theme: 'grid',
      headStyles: { 
        fillColor: [34, 197, 94],
        textColor: 255,
        fontSize: 10
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        1: { halign: 'right' }
      }
    })
  }
  
  // Footer
  doc.setFontSize(8)
  doc.text(
    `Dicetak pada: ${new Date().toLocaleDateString('id-ID')} - PPG Jakarta Barat Cengkareng`,
    105, 280, 
    { align: 'center' }
  )
  
  doc.save(`Detail_${kegiatan.nama_kegiatan.replace(/[^a-zA-Z0-9]/g, '_')}_${tahun}.pdf`)
}