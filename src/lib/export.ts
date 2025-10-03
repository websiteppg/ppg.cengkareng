import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF interface
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void
  }
}

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export const exportToPDF = async (data: any[], filename: string, title: string) => {
  try {
    // Validasi data
    if (!data || data.length === 0) {
      alert('Tidak ada data untuk diekspor')
      return
    }

    // Flatten nested objects untuk display yang lebih baik
    const flattenedData = data.map(item => {
      const flattened: any = {}
      Object.keys(item).forEach(key => {
        if (typeof item[key] === 'object' && item[key] !== null) {
          // Handle nested objects (seperti peserta, sesi)
          if (item[key].nama) flattened[`${key}_nama`] = item[key].nama
          else if (item[key].nama_sesi) flattened[`${key}_nama`] = item[key].nama_sesi
          else if (item[key].email) flattened[`${key}_email`] = item[key].email
          else flattened[key] = JSON.stringify(item[key])
        } else {
          flattened[key] = formatCellValue(item[key])
        }
      })
      return flattened
    })

    // Buat PDF menggunakan jsPDF
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' })
    
    // Info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const dateStr = new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    doc.text(`Tanggal Cetak: ${dateStr}`, 20, 30)
    doc.text(`Total Data: ${flattenedData.length} record`, 20, 35)
    
    // Prepare table data
    const headers = Object.keys(flattenedData[0] || {})
    const tableHeaders = headers.map(key => key.replace(/_/g, ' ').toUpperCase())
    const tableData = flattenedData.map(row => 
      headers.map(key => String(row[key] || '-'))
    )
    
    // Generate table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 45, left: 10, right: 10 },
      tableWidth: 'auto',
      columnStyles: {
        // Auto-adjust column widths
      }
    })
    
    // Download PDF
    doc.save(`${filename}.pdf`)
    
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Gagal mengekspor PDF. Silakan coba lagi.')
  }
}

// Helper function to strip HTML tags and preserve formatting
const stripHtmlTags = (html: string): string => {
  if (!html) return ''
  
  let text = html
  
  // Convert HTML breaks and paragraphs to line breaks
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/p>/gi, '\n\n')
  text = text.replace(/<p[^>]*>/gi, '')
  
  // Convert strong tags to preserve emphasis (optional)
  text = text.replace(/<strong[^>]*>/gi, '')
  text = text.replace(/<\/strong>/gi, '')
  
  // Remove all other HTML tags
  text = text.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&nbsp;/g, ' ')
  
  // Clean up excessive line breaks but preserve structure
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive line breaks
  text = text.replace(/^\s+|\s+$/g, '') // Trim start and end
  
  return text
}

// Export Notulensi to PDF with structured format
export const exportNotulensiToPDF = async (notulensiData: any, filename: string) => {
  try {
    if (!notulensiData) {
      alert('Tidak ada data notulensi untuk diekspor')
      return
    }

    const doc = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 30

    // Header - Logo dan Judul
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('SISTEM MUSYAWARAH PPG', pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 10
    doc.setFontSize(14)
    doc.text(notulensiData.judul, pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 15
    
    // Info Sesi
    if (notulensiData.sesi) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMASI SESI', margin, yPosition)
      yPosition += 8
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Sesi: ${notulensiData.sesi.nama_sesi}`, margin, yPosition)
      yPosition += 5
      doc.text(`Tanggal: ${new Date(notulensiData.sesi.tanggal).toLocaleDateString('id-ID')}`, margin, yPosition)
      yPosition += 5
      doc.text(`Waktu: ${notulensiData.sesi.waktu_mulai} - ${notulensiData.sesi.waktu_selesai || 'Selesai'}`, margin, yPosition)
      yPosition += 5
      if (notulensiData.sesi.lokasi) {
        doc.text(`Lokasi: ${notulensiData.sesi.lokasi}`, margin, yPosition)
        yPosition += 5
      }
      doc.text(`Dibuat oleh: ${notulensiData.dibuat_oleh}`, margin, yPosition)
      yPosition += 5
      
      // Status
      doc.setFont('helvetica', 'bold')
      const statusText = notulensiData.status.toUpperCase()
      if (notulensiData.status === 'approved') {
        doc.setTextColor(0, 128, 0)
      } else {
        doc.setTextColor(255, 165, 0)
      }
      doc.text(`STATUS: ${statusText}`, margin, yPosition)
      doc.setTextColor(0, 0, 0)
      yPosition += 15
    }

    // Function to add section with text wrapping
    const addSection = (title: string, content: string) => {
      if (!content || content.trim() === '') return
      
      // Clean HTML tags from content
      const cleanContent = stripHtmlTags(content)
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 30
      }
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(title.toUpperCase(), margin, yPosition)
      yPosition += 8
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      // Split text into lines that fit the page width
      const maxWidth = pageWidth - (margin * 2)
      const lines = doc.splitTextToSize(cleanContent, maxWidth)
      
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 30
        }
        doc.text(line, margin, yPosition)
        yPosition += 5
      })
      
      yPosition += 10
    }

    // Add content sections
    addSection('AGENDA', notulensiData.agenda)
    addSection('PEMBAHASAN', notulensiData.pembahasan)
    addSection('KEPUTUSAN', notulensiData.keputusan)
    addSection('TINDAK LANJUT', notulensiData.tindak_lanjut)

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Halaman ${i} dari ${totalPages} | Dicetak: ${new Date().toLocaleDateString('id-ID')} | Sistem Musyawarah PPG`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
    }

    // Download PDF
    doc.save(`${filename}.pdf`)
    
  } catch (error) {
    console.error('Error exporting notulensi PDF:', error)
    alert('Gagal mengekspor PDF notulensi. Silakan coba lagi.')
  }
}

// Helper function untuk format nilai cell
function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
    // Format tanggal ISO
    try {
      return new Date(value).toLocaleDateString('id-ID')
    } catch {
      return value
    }
  }
  return String(value)
}