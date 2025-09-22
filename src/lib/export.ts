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