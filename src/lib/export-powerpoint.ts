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

export async function exportPowerPointPresentation(programKerja: ProgramKerja, tahun: string, bidang: string) {
  try {
    console.log('Starting PowerPoint export for:', { tahun, bidang, kegiatanCount: programKerja.kegiatan_bidang.length })
    // Create HTML content for PowerPoint-like presentation
    const totalBiaya = programKerja.kegiatan_bidang.reduce((total, k) => total + (k.alokasi_dana || 0), 0)
    const totalKegiatan = programKerja.kegiatan_bidang.length

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Presentasi Program Kerja ${bidang} ${tahun}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
        }
        .slide { 
          width: 1024px; 
          height: 768px; 
          margin: 20px auto; 
          background: white; 
          padding: 40px; 
          border-radius: 10px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          page-break-after: always;
          display: flex;
          flex-direction: column;
        }
        .slide-header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #22C55E;
          padding-bottom: 20px;
        }
        .slide-title { 
          font-size: 36px; 
          font-weight: bold; 
          color: #1F2937; 
          margin-bottom: 10px;
        }
        .slide-subtitle { 
          font-size: 24px; 
          color: #6B7280; 
        }
        .content { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
        }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 20px; 
          margin: 30px 0; 
        }
        .stat-card { 
          background: #F3F4F6; 
          padding: 20px; 
          border-radius: 8px; 
          text-align: center;
          border-left: 4px solid #22C55E;
        }
        .stat-number { 
          font-size: 32px; 
          font-weight: bold; 
          color: #22C55E; 
        }
        .stat-label { 
          font-size: 14px; 
          color: #6B7280; 
          margin-top: 5px;
        }
        .month-grid { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 15px; 
          margin-top: 20px;
        }
        .month-card { 
          background: #F9FAFB; 
          border: 2px solid #E5E7EB; 
          border-radius: 8px; 
          padding: 15px; 
          min-height: 120px;
        }
        .month-card.has-activity { 
          border-color: #22C55E; 
          background: #F0FDF4;
        }
        .month-title { 
          font-weight: bold; 
          color: #1F2937; 
          margin-bottom: 10px; 
          text-align: center;
        }
        .activity { 
          font-size: 12px; 
          background: white; 
          padding: 8px; 
          border-radius: 4px; 
          margin-bottom: 5px;
          border-left: 3px solid #22C55E;
        }
        .activity-name { 
          font-weight: bold; 
          color: #1F2937; 
        }
        .activity-budget { 
          color: #059669; 
          font-size: 11px;
        }
        .detail-slide { 
          background: #FAFAFA;
        }
        .detail-content { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 30px; 
          margin-top: 20px;
        }
        .detail-section { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          border: 1px solid #E5E7EB;
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          color: #1F2937; 
          margin-bottom: 15px;
          border-bottom: 2px solid #22C55E;
          padding-bottom: 5px;
        }
        .budget-item { 
          display: flex; 
          justify-content: space-between; 
          padding: 8px 0; 
          border-bottom: 1px solid #F3F4F6;
        }
        .footer { 
          text-align: center; 
          margin-top: auto; 
          padding-top: 20px; 
          border-top: 1px solid #E5E7EB; 
          color: #6B7280; 
          font-size: 12px;
        }
        @media print {
          body { background: white; }
          .slide { box-shadow: none; margin: 0; }
        }
      </style>
    </head>
    <body>
  `

  // Slide 1: Title Slide
  htmlContent += `
    <div class="slide">
      <div class="slide-header">
        <div class="slide-title">PROGRAM KERJA PPG</div>
        <div class="slide-title">JAKARTA BARAT CENGKARENG</div>
        <div class="slide-subtitle">Tahun ${tahun} - ${bidang}</div>
      </div>
      <div class="content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${totalKegiatan}</div>
            <div class="stat-label">Total Kegiatan</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${formatCurrency(totalBiaya)}</div>
            <div class="stat-label">Total Anggaran</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">12</div>
            <div class="stat-label">Bulan Periode</div>
          </div>
        </div>
        <div class="footer">
          Musyawarah PPG Daerah - Sabtu Malam Minggu ke-4<br>
          ${new Date().toLocaleDateString('id-ID')}
        </div>
      </div>
    </div>
  `

  // Slide 2: Timeline Overview
  htmlContent += `
    <div class="slide">
      <div class="slide-header">
        <div class="slide-title">Timeline Kegiatan ${tahun}</div>
        <div class="slide-subtitle">${bidang}</div>
      </div>
      <div class="content">
        <div class="month-grid">
  `

  MONTHS.forEach(month => {
    const kegiatanBulan = programKerja.kegiatan_bidang.filter(k => k.bulan?.toUpperCase() === month.toUpperCase())
    const hasActivity = kegiatanBulan.length > 0
    const totalBulan = kegiatanBulan.reduce((total, k) => total + (k.alokasi_dana || 0), 0)

    htmlContent += `
      <div class="month-card ${hasActivity ? 'has-activity' : ''}">
        <div class="month-title">${month}</div>
        ${hasActivity ? `
          ${kegiatanBulan.slice(0, 2).map(k => `
            <div class="activity">
              <div class="activity-name">${k.no_urut}. ${k.nama_kegiatan}</div>
              <div class="activity-budget">${formatCurrency(k.alokasi_dana)}</div>
            </div>
          `).join('')}
          ${kegiatanBulan.length > 2 ? `<div style="text-align: center; font-size: 11px; color: #6B7280;">+${kegiatanBulan.length - 2} lainnya</div>` : ''}
          <div style="text-align: center; font-weight: bold; color: #059669; font-size: 12px; margin-top: 10px;">
            Total: ${formatCurrency(totalBulan)}
          </div>
        ` : '<div style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 40px;">Tidak ada kegiatan</div>'}
      </div>
    `
  })

  htmlContent += `
        </div>
      </div>
    </div>
  `

  // Detail slides for each month with activities
  MONTHS.forEach(month => {
    const kegiatanBulan = programKerja.kegiatan_bidang.filter(k => k.bulan?.toUpperCase() === month.toUpperCase())
    
    if (kegiatanBulan.length > 0) {
      const totalBulan = kegiatanBulan.reduce((total, k) => total + (k.alokasi_dana || 0), 0)
      
      htmlContent += `
        <div class="slide detail-slide">
          <div class="slide-header">
            <div class="slide-title">Detail Kegiatan ${month} ${tahun}</div>
            <div class="slide-subtitle">Total Anggaran: ${formatCurrency(totalBulan)}</div>
          </div>
          <div class="content">
      `

      kegiatanBulan.forEach(kegiatan => {
        htmlContent += `
          <div class="detail-content">
            <div class="detail-section">
              <div class="section-title">${kegiatan.no_urut}. ${kegiatan.nama_kegiatan}</div>
              <p><strong>Tujuan:</strong><br>${kegiatan.tujuan_kegiatan || '-'}</p>
              <p><strong>Keterangan:</strong><br>${kegiatan.keterangan || '-'}</p>
              <p><strong>Total Biaya:</strong><br>
                <span style="color: #059669; font-size: 20px; font-weight: bold;">
                  ${formatCurrency(kegiatan.alokasi_dana)}
                </span>
              </p>
            </div>
            <div class="detail-section">
              <div class="section-title">Rincian Biaya</div>
              ${kegiatan.rincian_biaya ? `
                  <div class="budget-item">
                    <span>Peserta</span>
                    <span>${kegiatan.rincian_biaya.peserta || 0} orang</span>
                  </div>
                  <div class="budget-item">
                    <span>Konsumsi</span>
                    <span>${formatCurrency(kegiatan.rincian_biaya.konsumsi || 0)}</span>
                  </div>
                  <div class="budget-item">
                    <span>Akomodasi</span>
                    <span>${formatCurrency(kegiatan.rincian_biaya.akomodasi || 0)}</span>
                  </div>
                  <div class="budget-item">
                    <span>Dokumentasi</span>
                    <span>${formatCurrency(kegiatan.rincian_biaya.dokumentasi || 0)}</span>
                  </div>
                ` : `
                  <div class="budget-item">
                    <span>Total Alokasi</span>
                    <span>${formatCurrency(kegiatan.alokasi_dana)}</span>
                  </div>
                `
              }
            </div>
          </div>
        `
      })

      htmlContent += `
          </div>
        </div>
      `
    }
  })

  // Closing slide
  htmlContent += `
    <div class="slide">
      <div class="slide-header">
        <div class="slide-title">Terima Kasih</div>
        <div class="slide-subtitle">PPG Jakarta Barat Cengkareng</div>
      </div>
      <div class="content">
        <div style="text-align: center; margin-top: 100px;">
          <div style="font-size: 24px; color: #6B7280; margin-bottom: 30px;">
            Program Kerja ${bidang} Tahun ${tahun}
          </div>
          <div style="font-size: 18px; color: #9CA3AF;">
            Semoga mendapat ridho Allah SWT<br>
            dan bermanfaat untuk umat
          </div>
        </div>
        <div class="footer">
          Musyawarah PPG Daerah - ${new Date().toLocaleDateString('id-ID')}
        </div>
      </div>
    </div>
  `

  htmlContent += `
    </body>
    </html>
  `

  // Create and download HTML file
  console.log('Creating HTML file...')
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Presentasi_Program_Kerja_${bidang.replace(/[^a-zA-Z0-9]/g, '_')}_${tahun}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  console.log('PowerPoint export completed successfully')
  } catch (error) {
    console.error('Error exporting PowerPoint:', error)
    alert('Gagal mengexport PowerPoint: ' + error)
  }
}