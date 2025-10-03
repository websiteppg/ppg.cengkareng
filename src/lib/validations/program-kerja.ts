import { z } from 'zod'

export const createProgramKerjaSchema = z.object({
  tahun: z.number()
    .min(2026, "Tahun minimal 2026")
    .max(2100, "Tahun maksimal 2100")
})

export const createKegiatanSchema = z.object({
  programKerjaTahunanId: z.string().uuid(),
  namaBidang: z.enum([
    "PENGURUS_HARIAN",
    "KURIKULUM", 
    "TENAGA_PENDIDIK",
    "SARANA_DAN_PRA_SARANA",
    "MUDA_MUDI",
    "KEPUTRIAN",
    "HTQ",
    "KEMANDIRIAN",
    "SENI_OR",
    "BIMBINGAN_KONSELING",
    "PENGGALANG_DANA"
  ]),
  noUrut: z.number().positive("No urut harus positif"),
  bulan: z.enum([
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ]),
  namaKegiatan: z.string().min(3, "Nama kegiatan minimal 3 karakter"),
  tujuanKegiatan: z.string().min(3, "Tujuan kegiatan minimal 3 karakter"),
  keterangan: z.string().nullable().optional()
})

export const createRincianBiayaSchema = z.object({
  kegiatanBidangId: z.string().uuid(),
  namaItem: z.string().min(3, "Nama item minimal 3 karakter"),
  jumlah: z.number().positive("Jumlah harus positif"),
  hargaSatuan: z.number().positive("Harga satuan harus positif"),
  hariKegiatan: z.number().positive("Hari kegiatan harus positif"),
  frekuensi: z.number().positive("Frekuensi harus positif")
})

export type CreateProgramKerjaInput = z.infer<typeof createProgramKerjaSchema>
export type CreateKegiatanInput = z.infer<typeof createKegiatanSchema>
export type CreateRincianBiayaInput = z.infer<typeof createRincianBiayaSchema>