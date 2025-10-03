export interface Database {
  public: {
    Tables: {
      peserta: {
        Row: {
          id: string
          nama: string
          email: string
          nomor_hp: string | null
          jabatan: string | null
          instansi: string | null
          foto_url: string | null
          role: 'peserta' | 'sekretaris_ppg' | 'admin' | 'super_admin' | 'bidang_ppg' | 'admin_kmm' | 'kbm_desa_kalideres' | 'kbm_desa_bandara' | 'kbm_desa_kebon_jahe' | 'kbm_desa_cengkareng' | 'kbm_desa_kapuk_melati' | 'kbm_desa_taman_kota' | 'kbm_desa_jelambar' | 'kbm_desa_cipondoh'
          password_hash: string | null
          email_verified: boolean
          aktif: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama: string
          email: string
          nomor_hp?: string | null
          jabatan?: string | null
          instansi?: string | null
          foto_url?: string | null
          role?: 'peserta' | 'sekretaris_ppg' | 'admin' | 'super_admin' | 'bidang_ppg' | 'admin_kmm' | 'kbm_desa_kalideres' | 'kbm_desa_bandara' | 'kbm_desa_kebon_jahe' | 'kbm_desa_cengkareng' | 'kbm_desa_kapuk_melati' | 'kbm_desa_taman_kota' | 'kbm_desa_jelambar' | 'kbm_desa_cipondoh'
          password_hash?: string | null
          email_verified?: boolean
          aktif?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          email?: string
          nomor_hp?: string | null
          jabatan?: string | null
          instansi?: string | null
          foto_url?: string | null
          role?: 'peserta' | 'sekretaris_ppg' | 'admin' | 'super_admin' | 'bidang_ppg' | 'admin_kmm' | 'kbm_desa_kalideres' | 'kbm_desa_bandara' | 'kbm_desa_kebon_jahe' | 'kbm_desa_cengkareng' | 'kbm_desa_kapuk_melati' | 'kbm_desa_taman_kota' | 'kbm_desa_jelambar' | 'kbm_desa_cipondoh'
          password_hash?: string | null
          email_verified?: boolean
          aktif?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sesi_peserta: {
        Row: {
          id: string
          sesi_id: string
          peserta_id: string

          created_at: string
        }
        Insert: {
          id?: string
          sesi_id: string
          peserta_id: string
          created_at?: string
        }
        Update: {
          id?: string
          sesi_id?: string
          peserta_id?: string
          created_at?: string
        }
      }
      sesi_musyawarah: {
        Row: {
          id: string
          nama_sesi: string
          deskripsi: string | null
          tanggal: string
          waktu_mulai: string
          waktu_selesai: string
          timezone: string
          lokasi: string | null
          tipe: 'offline' | 'online' | 'hybrid'
          maksimal_peserta: number
          status: 'scheduled' | 'active' | 'completed' | 'cancelled'

          link_pendek: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama_sesi: string
          deskripsi?: string | null
          tanggal: string
          waktu_mulai: string
          waktu_selesai: string
          timezone?: string
          lokasi?: string | null
          tipe?: 'offline' | 'online' | 'hybrid'
          maksimal_peserta?: number
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          link_pendek?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama_sesi?: string
          deskripsi?: string | null
          tanggal?: string
          waktu_mulai?: string
          waktu_selesai?: string
          timezone?: string
          lokasi?: string | null
          tipe?: 'offline' | 'online' | 'hybrid'
          maksimal_peserta?: number
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          link_pendek?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }


      notulensi_sesi: {
        Row: {
          id: string
          sesi_id: string
          judul: string
          agenda: string
          pembahasan: string
          keputusan: string | null
          tindak_lanjut: string | null
          penanggung_jawab: string | null
          target_waktu: string | null
          lampiran_urls: string[] | null
          status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
          catatan_approval: string | null
          version: number
          dibuat_oleh: string
          disetujui_oleh: string | null
          tanggal_approval: string | null
          ditolak_oleh: string | null
          tanggal_penolakan: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sesi_id: string
          judul: string
          agenda: string
          pembahasan: string
          keputusan?: string | null
          tindak_lanjut?: string | null
          penanggung_jawab?: string | null
          target_waktu?: string | null
          lampiran_urls?: string[] | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'rejected'
          catatan_approval?: string | null
          version?: number
          dibuat_oleh: string
          disetujui_oleh?: string | null
          tanggal_approval?: string | null
          ditolak_oleh?: string | null
          tanggal_penolakan?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sesi_id?: string
          judul?: string
          agenda?: string
          pembahasan?: string
          keputusan?: string | null
          tindak_lanjut?: string | null
          penanggung_jawab?: string | null
          target_waktu?: string | null
          lampiran_urls?: string[] | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'rejected'
          catatan_approval?: string | null
          version?: number
          dibuat_oleh?: string
          disetujui_oleh?: string | null
          tanggal_approval?: string | null
          ditolak_oleh?: string | null
          tanggal_penolakan?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      komentar_notulensi: {
        Row: {
          id: string
          notulensi_id: string
          peserta_id: string
          komentar: string
          parent_id: string | null
          mentions: string[] | null
          edited_at: string | null
          aktif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          notulensi_id: string
          peserta_id: string
          komentar: string
          parent_id?: string | null
          mentions?: string[] | null
          edited_at?: string | null
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          notulensi_id?: string
          peserta_id?: string
          komentar?: string
          parent_id?: string | null
          mentions?: string[] | null
          edited_at?: string | null
          aktif?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      absensi: {
        Row: {
          id: string
          peserta_id: string
          sesi_id: string
          waktu_absen: string | null
          status_kehadiran: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'ghoib'
          catatan: string | null
          ip_address: string | null
          user_agent: string | null
          lokasi_koordinat: string | null
          created_at: string
        }
        Insert: {
          id?: string
          peserta_id: string
          sesi_id: string
          waktu_absen?: string | null
          status_kehadiran?: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'ghoib'
          catatan?: string | null
          ip_address?: string | null
          user_agent?: string | null
          lokasi_koordinat?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          peserta_id?: string
          sesi_id?: string
          waktu_absen?: string | null
          status_kehadiran?: 'hadir' | 'terlambat' | 'izin' | 'sakit' | 'ghoib'
          catatan?: string | null
          ip_address?: string | null
          user_agent?: string | null
          lokasi_koordinat?: string | null
          created_at?: string
        }
      }
      desa_master: {
        Row: {
          id: string
          nama_desa: string
          kelompok: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama_desa: string
          kelompok: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama_desa?: string
          kelompok?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      laporan_kbm_desa: {
        Row: {
          id: string
          desa_id: string
          kelompok: string
          periode: string
          kategori_program: 'paud_cbr' | 'pra_remaja' | 'remaja' | 'pra_nikah'
          jumlah_murid: number
          jumlah_kelas: number
          persentase_kehadiran: number
          pencapaian_target_materi: number
          pertemuan_kbm_kali: number
          sarpras: string
          tahfidz: number
          pengajar_mt_ms: string
          laporan_musyawarah: string | null
          kendala_saran: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          desa_id: string
          kelompok: string
          periode: string
          kategori_program: 'paud_cbr' | 'pra_remaja' | 'remaja' | 'pra_nikah'
          jumlah_murid: number
          jumlah_kelas: number
          persentase_kehadiran: number
          pencapaian_target_materi: number
          pertemuan_kbm_kali: number
          sarpras: string
          tahfidz: number
          pengajar_mt_ms: string
          laporan_musyawarah?: string | null
          kendala_saran?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          desa_id?: string
          kelompok?: string
          periode?: string
          kategori_program?: 'paud_cbr' | 'pra_remaja' | 'remaja' | 'pra_nikah'
          jumlah_murid?: number
          jumlah_kelas?: number
          persentase_kehadiran?: number
          pencapaian_target_materi?: number
          pertemuan_kbm_kali?: number
          sarpras?: string
          tahfidz?: number
          pengajar_mt_ms?: string
          laporan_musyawarah?: string | null
          kendala_saran?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      mediafire_files: {
        Row: {
          id: string
          filename: string
          mediafire_url: string
          category: 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'others'
          description: string | null
          file_size: string | null
          file_type: string | null
          tags: string[] | null
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          filename: string
          mediafire_url: string
          category?: 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'others'
          description?: string | null
          file_size?: string | null
          file_type?: string | null
          tags?: string[] | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          filename?: string
          mediafire_url?: string
          category?: 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'others'
          description?: string | null
          file_size?: string | null
          file_type?: string | null
          tags?: string[] | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      program_kerja_tahunan: {
        Row: {
          id: string
          tahun: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tahun: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tahun?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      kegiatan_bidang: {
        Row: {
          id: string
          program_kerja_tahunan_id: string
          nama_bidang: 'PENGURUS_HARIAN' | 'KURIKULUM' | 'TENAGA_PENDIDIK' | 'SARANA_DAN_PRA_SARANA' | 'MUDA_MUDI' | 'KEPUTRIAN' | 'HTQ' | 'KEMANDIRIAN' | 'SENI_OR' | 'BIMBINGAN_KONSELING' | 'PENGGALANG_DANA'
          no_urut: number
          bulan: 'JANUARI' | 'FEBRUARI' | 'MARET' | 'APRIL' | 'MEI' | 'JUNI' | 'JULI' | 'AGUSTUS' | 'SEPTEMBER' | 'OKTOBER' | 'NOVEMBER' | 'DESEMBER'
          nama_kegiatan: string
          tujuan_kegiatan: string
          keterangan: string | null
          alokasi_dana: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          program_kerja_tahunan_id: string
          nama_bidang: 'PENGURUS_HARIAN' | 'KURIKULUM' | 'TENAGA_PENDIDIK' | 'SARANA_DAN_PRA_SARANA' | 'MUDA_MUDI' | 'KEPUTRIAN' | 'HTQ' | 'KEMANDIRIAN' | 'SENI_OR' | 'BIMBINGAN_KONSELING' | 'PENGGALANG_DANA'
          no_urut: number
          bulan: 'JANUARI' | 'FEBRUARI' | 'MARET' | 'APRIL' | 'MEI' | 'JUNI' | 'JULI' | 'AGUSTUS' | 'SEPTEMBER' | 'OKTOBER' | 'NOVEMBER' | 'DESEMBER'
          nama_kegiatan: string
          tujuan_kegiatan: string
          keterangan?: string | null
          alokasi_dana?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          program_kerja_tahunan_id?: string
          nama_bidang?: 'PENGURUS_HARIAN' | 'KURIKULUM' | 'TENAGA_PENDIDIK' | 'SARANA_DAN_PRA_SARANA' | 'MUDA_MUDI' | 'KEPUTRIAN' | 'HTQ' | 'KEMANDIRIAN' | 'SENI_OR' | 'BIMBINGAN_KONSELING' | 'PENGGALANG_DANA'
          no_urut?: number
          bulan?: 'JANUARI' | 'FEBRUARI' | 'MARET' | 'APRIL' | 'MEI' | 'JUNI' | 'JULI' | 'AGUSTUS' | 'SEPTEMBER' | 'OKTOBER' | 'NOVEMBER' | 'DESEMBER'
          nama_kegiatan?: string
          tujuan_kegiatan?: string
          keterangan?: string | null
          alokasi_dana?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      rincian_biaya: {
        Row: {
          id: string
          kegiatan_bidang_id: string
          nama_item: string
          jumlah: number
          harga_satuan: number
          hari_kegiatan: number
          frekuensi: number
          sub_total: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          kegiatan_bidang_id: string
          nama_item: string
          jumlah: number
          harga_satuan: number
          hari_kegiatan: number
          frekuensi: number
          sub_total: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          kegiatan_bidang_id?: string
          nama_item?: string
          jumlah?: number
          harga_satuan?: number
          hari_kegiatan?: number
          frekuensi?: number
          sub_total?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
  }
}