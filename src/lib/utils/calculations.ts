export function calculateSubTotal(
  jumlah: number,
  hargaSatuan: number,
  hariKegiatan: number,
  frekuensi: number
): number {
  return jumlah * hargaSatuan * hariKegiatan * frekuensi
}

export function calculateAlokasiDanaKegiatan(
  rincianBiayaList: Array<{ sub_total: number; deleted_at: string | null }>
): number {
  return rincianBiayaList
    .filter(item => !item.deleted_at)
    .reduce((sum, item) => sum + Number(item.sub_total), 0)
}

export function calculateTotalAlokasiBidang(
  kegiatanList: Array<{ alokasi_dana: number; deleted_at: string | null }>
): number {
  return kegiatanList
    .filter(kegiatan => !kegiatan.deleted_at)
    .reduce((sum, kegiatan) => sum + Number(kegiatan.alokasi_dana), 0)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

export function getBidangLabel(bidang: string): string {
  const labels = {
    PENGURUS_HARIAN: "Pengurus Harian",
    KURIKULUM: "Kurikulum",
    TENAGA_PENDIDIK: "Tenaga Pendidik",
    SARANA_DAN_PRA_SARANA: "Sarana dan Pra Sarana",
    MUDA_MUDI: "Muda-Mudi",
    KEPUTRIAN: "Keputrian",
    HTQ: "HTQ",
    KEMANDIRIAN: "Kemandirian",
    SENI_OR: "Seni-OR (Olahraga, PPA, Seni Baca Qur'an)",
    BIMBINGAN_KONSELING: "Bimbingan Konseling",
    PENGGALANG_DANA: "Penggalang Dana"
  }
  return labels[bidang as keyof typeof labels] || bidang
}

export function getBulanLabel(bulan: string): string {
  const labels = {
    JANUARI: "Januari",
    FEBRUARI: "Februari", 
    MARET: "Maret",
    APRIL: "April",
    MEI: "Mei",
    JUNI: "Juni",
    JULI: "Juli",
    AGUSTUS: "Agustus",
    SEPTEMBER: "September",
    OKTOBER: "Oktober",
    NOVEMBER: "November",
    DESEMBER: "Desember"
  }
  return labels[bulan as keyof typeof labels] || bulan
}