-- =============================================
-- SCHEMA DATABASE SISTEM MUSYAWARAH PPG
-- =============================================

-- 1. TABEL PESERTA
CREATE TABLE peserta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    nomor_hp VARCHAR(20),
    jabatan VARCHAR(255),
    instansi VARCHAR(255),
    foto_url VARCHAR(500),
    role VARCHAR(50) DEFAULT 'peserta' CHECK (role IN ('peserta', 'sekretaris_ppg', 'admin', 'super_admin')),
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    aktif BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL SESI MUSYAWARAH
CREATE TABLE sesi_musyawarah (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_sesi VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    timezone VARCHAR(10) DEFAULT 'WIB',
    lokasi VARCHAR(200),
    tipe VARCHAR(20) DEFAULT 'offline' CHECK (tipe IN ('offline', 'online', 'hybrid')),
    maksimal_peserta INTEGER DEFAULT 100,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    batas_absen_mulai INTEGER DEFAULT 30,
    batas_absen_selesai INTEGER DEFAULT 15,
    link_pendek VARCHAR(100),
    created_by UUID NOT NULL REFERENCES peserta(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL RELASI SESI-PESERTA
CREATE TABLE sesi_peserta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id) ON DELETE CASCADE,
    peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
    wajib_hadir BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sesi_id, peserta_id)
);

-- 4. TABEL ABSENSI
CREATE TABLE absensi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    peserta_id UUID NOT NULL REFERENCES peserta(id),
    sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id),
    waktu_absen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_kehadiran VARCHAR(20) DEFAULT 'hadir' CHECK (status_kehadiran IN ('hadir', 'terlambat', 'izin', 'sakit')),
    catatan TEXT,
    ip_address INET,
    user_agent TEXT,
    lokasi_koordinat POINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL NOTULENSI SESI
CREATE TABLE notulensi_sesi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id),
    judul VARCHAR(255) NOT NULL,
    agenda TEXT NOT NULL,
    pembahasan TEXT NOT NULL,
    keputusan TEXT,
    tindak_lanjut TEXT,
    penanggung_jawab VARCHAR(255),
    target_waktu DATE,
    lampiran_urls TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
    catatan_approval TEXT,
    version INTEGER DEFAULT 1,
    dibuat_oleh UUID NOT NULL REFERENCES peserta(id),
    disetujui_oleh UUID REFERENCES peserta(id),
    tanggal_approval TIMESTAMP WITH TIME ZONE,
    ditolak_oleh UUID REFERENCES peserta(id),
    tanggal_penolakan TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABEL KOMENTAR NOTULENSI
CREATE TABLE komentar_notulensi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notulensi_id UUID NOT NULL REFERENCES notulensi_sesi(id) ON DELETE CASCADE,
    peserta_id UUID NOT NULL REFERENCES peserta(id),
    komentar TEXT NOT NULL,
    parent_id UUID REFERENCES komentar_notulensi(id),
    mentions TEXT[],
    edited_at TIMESTAMP WITH TIME ZONE,
    aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES UNTUK PERFORMA
-- =============================================

-- Index untuk peserta
CREATE INDEX idx_peserta_email ON peserta(email);
CREATE INDEX idx_peserta_role ON peserta(role);
CREATE INDEX idx_peserta_aktif ON peserta(aktif);

-- Index untuk sesi_musyawarah
CREATE INDEX idx_sesi_tanggal ON sesi_musyawarah(tanggal);
CREATE INDEX idx_sesi_status ON sesi_musyawarah(status);
CREATE INDEX idx_sesi_created_by ON sesi_musyawarah(created_by);

-- Index untuk sesi_peserta
CREATE INDEX idx_sesi_peserta_sesi_id ON sesi_peserta(sesi_id);
CREATE INDEX idx_sesi_peserta_peserta_id ON sesi_peserta(peserta_id);

-- Index untuk absensi
CREATE INDEX idx_absensi_sesi_id ON absensi(sesi_id);
CREATE INDEX idx_absensi_peserta_id ON absensi(peserta_id);
CREATE INDEX idx_absensi_waktu ON absensi(waktu_absen);

-- Index untuk notulensi
CREATE INDEX idx_notulensi_sesi_id ON notulensi_sesi(sesi_id);
CREATE INDEX idx_notulensi_status ON notulensi_sesi(status);
CREATE INDEX idx_notulensi_dibuat_oleh ON notulensi_sesi(dibuat_oleh);

-- Index untuk komentar
CREATE INDEX idx_komentar_notulensi_id ON komentar_notulensi(notulensi_id);
CREATE INDEX idx_komentar_peserta_id ON komentar_notulensi(peserta_id);
CREATE INDEX idx_komentar_parent_id ON komentar_notulensi(parent_id);

-- =============================================
-- TRIGGER UNTUK AUTO UPDATE TIMESTAMP
-- =============================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk tabel peserta
CREATE TRIGGER update_peserta_updated_at 
    BEFORE UPDATE ON peserta 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk tabel sesi_musyawarah
CREATE TRIGGER update_sesi_musyawarah_updated_at 
    BEFORE UPDATE ON sesi_musyawarah 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk tabel notulensi_sesi
CREATE TRIGGER update_notulensi_sesi_updated_at 
    BEFORE UPDATE ON notulensi_sesi 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk tabel komentar_notulensi
CREATE TRIGGER update_komentar_notulensi_updated_at 
    BEFORE UPDATE ON komentar_notulensi 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DATA SAMPLE ADMIN DEFAULT
-- =============================================

-- Insert admin default
INSERT INTO peserta (
    nama, 
    email, 
    role, 
    password_hash, 
    aktif, 
    email_verified,
    created_at
) VALUES (
    'Admin PPG',
    'admin@ppg.id',
    'admin',
    'admin123',
    true,
    true,
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- =============================================

-- Enable RLS pada semua tabel
ALTER TABLE peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesi_musyawarah ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesi_peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE notulensi_sesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE komentar_notulensi ENABLE ROW LEVEL SECURITY;

-- Policy untuk public access (sesuaikan dengan kebutuhan)
CREATE POLICY "Allow public read access" ON peserta FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON peserta FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON peserta FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON sesi_musyawarah FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON sesi_musyawarah FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON sesi_musyawarah FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON sesi_musyawarah FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON sesi_peserta FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON sesi_peserta FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON sesi_peserta FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON sesi_peserta FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON absensi FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON absensi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON absensi FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON notulensi_sesi FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON notulensi_sesi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON notulensi_sesi FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON notulensi_sesi FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON komentar_notulensi FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON komentar_notulensi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON komentar_notulensi FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON komentar_notulensi FOR DELETE USING (true);