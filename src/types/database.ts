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
          role: 'peserta' | 'sekretaris_ppg' | 'admin' | 'super_admin'
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
          role?: 'peserta' | 'sekretaris_ppg' | 'admin' | 'super_admin'
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
          role?: 'peserta' | 'sekretaris_ppg' | 'admin' | 'super_admin'
          password_hash?: string | null
          email_verified?: boolean
          aktif?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
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
          batas_absen_mulai: number
          batas_absen_selesai: number
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
          batas_absen_mulai?: number
          batas_absen_selesai?: number
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
          batas_absen_mulai?: number
          batas_absen_selesai?: number
          link_pendek?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      absensi: {
        Row: {
          id: string
          peserta_id: string
          sesi_id: string
          waktu_absen: string
          status_kehadiran: 'hadir' | 'terlambat' | 'izin' | 'sakit'
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
          waktu_absen?: string
          status_kehadiran?: 'hadir' | 'terlambat' | 'izin' | 'sakit'
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
          waktu_absen?: string
          status_kehadiran?: 'hadir' | 'terlambat' | 'izin' | 'sakit'
          catatan?: string | null
          ip_address?: string | null
          user_agent?: string | null
          lokasi_koordinat?: string | null
          created_at?: string
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
    }
  }
}