# Website PPG Jakarta Barat Cengkareng

Platform terintegrasi untuk mengelola musyawarah, notulensi digital, laporan KBM desa, program kerja, dan manajemen file MediaFire untuk PPG Daerah Jakarta Barat Cengkareng. Mendukung multi-role access dengan sistem yang komprehensif dan real-time.

## 🚀 Fitur Utama Sistem

### 🔐 Sistem Role-Based Access Control ✅
- **Super Admin**: Akses penuh ke semua fitur sistem
- **Admin**: Manajemen musyawarah dan laporan
- **Admin KMM**: Khusus manajemen sesi musyawarah
- **Bidang PPG**: Manajemen program kerja bidang
- **Sekretaris PPG**: Akses notulensi dan laporan
- **KBM Desa**: Admin per desa (8 desa: Kalideres, Bandara, Kebon Jahe, Cengkareng, Kapuk Melati, Taman Kota, Jelambar, Cipondoh)
- **Peserta**: Akses absensi publik tanpa login

### 📋 Manajemen Sesi Musyawarah ✅
- **CRUD Sesi Lengkap**: Buat, edit, hapus sesi dengan validasi
- **Assign Peserta**: Sistem pemilihan peserta dengan bulk selection
- **Status Management**: Scheduled, Active, Completed, Cancelled
- **Tipe Sesi**: Offline, Online, Hybrid
- **Auto-assign Peserta**: Berdasarkan kriteria tertentu
- **Print Absensi**: Generate PDF form absensi untuk sesi
- **Absensi Manual**: Interface admin untuk input kehadiran manual

### ✅ Sistem Absensi Real-time ✅
- **URL Publik**: `/absen` untuk akses peserta tanpa login
- **Search Peserta**: Cari berdasarkan username/email
- **Multi Status**: Hadir, Terlambat, Izin, Sakit, Ghoib
- **Absensi Manual**: Admin dapat input/update absensi manual
- **Bulk Update**: Update status kehadiran secara massal
- **Upsert System**: Update berulang tanpa duplikasi error
- **Audit Trail**: Log IP address dan user agent
- **Real-time Sync**: Update otomatis di dashboard admin
- **PDF Export**: Print absensi dengan data terbaru

### 📝 Sistem Notulensi Digital ✅
- **Rich Text Editor**: Quill.js untuk editing notulensi
- **Workflow Approval**: Draft → Pending → Approved/Rejected
- **Komentar Kolaboratif**: Sistem komentar dengan mentions
- **Version Control**: Tracking perubahan notulensi
- **Template System**: Template notulensi standar
- **Export PDF**: Export notulensi individual ke PDF
- **Multi-Session**: Notulensi untuk berbagai sesi musyawarah

### 🏘️ Sistem KBM Desa ✅
- **8 Desa Terdaftar**: Kalideres, Bandara, Kebon Jahe, Cengkareng, Kapuk Melati, Taman Kota, Jelambar, Cipondoh
- **Laporan Per Kelompok**: Multiple kelompok per desa
- **4 Kategori Program**: PAUD CBR, Pra Remaja, Remaja, Pra Nikah
- **Periode Bulanan**: Laporan per bulan dengan selector periode
- **Dashboard KBM**: Statistik dan rangkuman per desa
- **Template Laporan**: Form terstruktur untuk konsistensi data
- **Role-based Access**: Admin per desa dengan akses terbatas

### 💼 Sistem Program Kerja ✅
- **Multi-Tahun**: Program kerja 2026-2100
- **Multi-Bidang**: Setiap bidang dapat buat program kerja
- **Kegiatan Terstruktur**: Nomor urut, bulan, tujuan, keterangan
- **Rincian Biaya Fleksibel**: Dynamic budget items dengan unlimited items
- **Kategori Biaya**: Konsumsi, Transport, Akomodasi, Dokumentasi, Lainnya
- **Auto Calculate**: Total biaya otomatis terhitung
- **Export Program**: Export ke PDF dengan format profesional
- **Statistics Dashboard**: Analisis program per bidang dan tahun

### 📁 Sistem Manajemen File MediaFire ✅
- **File Management**: Upload, edit, delete file MediaFire
- **Kategori File**: Organisasi file berdasarkan kategori
- **Bulk Operations**: Upload dan manage multiple files
- **Activity Log**: Tracking aktivitas file management
- **Search & Filter**: Pencarian file berdasarkan nama, kategori, tags
- **Statistics**: Dashboard statistik file dan aktivitas
- **Export Data**: Export daftar file ke Excel/PDF

### 📊 Dashboard & Laporan ✅
- **Dashboard Admin**: Statistik real-time sistem
- **Dashboard KBM**: Overview per desa dengan metrics
- **Dashboard Program Kerja**: Analisis program per bidang
- **Dashboard MediaFire**: Statistik file dan aktivitas
- **Export Multi-Format**: Excel dan PDF untuk semua laporan
- **Laporan Kustom**: Buat laporan sesuai kebutuhan
- **Analytics**: Tingkat kehadiran, approval rate, aktivitas user
- **Debug Tools**: Endpoint debugging untuk troubleshooting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide Icons
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase) dengan Real-time subscriptions
- **Authentication**: Custom Auth dengan bcrypt hashing
- **Export**: XLSX, jsPDF, jsPDF-AutoTable
- **Editor**: React Quill untuk rich text editing
- **Charts**: Recharts untuk visualisasi data
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS + CVA (Class Variance Authority)
- **Icons**: Lucide React
- **Toast**: Sonner + Radix UI Toast
- **Deployment**: Vercel dengan auto-deploy dari GitHub
- **Version Control**: Git dengan GitHub integration

## 📁 Struktur Folder

```
src/
├── app/
│   ├── absen/                    # Halaman absensi publik
│   │   ├── [sessionId]/          # Absensi per sesi
│   │   │   ├── success/          # Halaman sukses absensi
│   │   │   └── page.tsx          # Form absensi sesi
│   │   └── page.tsx              # Landing absensi
│   ├── admin/                   # Dashboard admin
│   │   ├── login/               # Login admin
│   │   ├── sesi/                # Manajemen sesi musyawarah
│   │   │   ├── buat/            # Buat sesi baru
│   │   │   └── [id]/            # Detail & edit sesi
│   │   │       ├── edit/        # Edit sesi
│   │   │       └── absensi/     # Absensi manual per sesi
│   │   ├── peserta/             # Manajemen peserta
│   │   │   └── tambah/          # Tambah peserta baru
│   │   ├── notulensi/           # Sistem notulensi digital
│   │   │   ├── buat/            # Buat notulensi
│   │   │   └── [id]/edit/       # Edit notulensi
│   │   ├── kbm-desa/            # Sistem KBM Desa
│   │   │   └── [desa_id]/       # Laporan per desa
│   │   ├── program-kerja-admin/ # Sistem Program Kerja
│   │   │   ├── [tahun]/         # Program kerja per tahun
│   │   │   │   └── [bidang]/    # Program kerja per bidang
│   │   │   └── stats-dashboard/ # Dashboard statistik
│   │   ├── mediafire-manager/   # Manajemen file MediaFire
│   │   │   └── activity/        # Log aktivitas file
│   │   ├── laporan/             # Dashboard laporan & export
│   │   ├── absensi/             # Monitor absensi global
│   │   └── dashboard-kbm/       # Dashboard KBM overview
│   └── api/                     # API endpoints
│       ├── auth/                # Authentication
│       │   ├── login/           # Login API
│       │   └── logout/          # Logout API
│       ├── sesi/                # Sesi CRUD & management
│       │   └── [id]/            # Sesi specific APIs
│       │       ├── absensi-manual/ # Absensi manual API
│       │       └── print-absensi/  # Print PDF absensi
│       ├── peserta/             # Peserta management
│       ├── absensi/             # Absensi system
│       │   ├── all/             # All absensi data
│       │   ├── peserta/         # Absensi per peserta
│       │   ├── sesi/            # Absensi per sesi
│       │   ├── submit/          # Submit absensi publik
│       │   └── upsert/          # Upsert absensi (update/insert)
│       ├── admin/               # Admin specific APIs
│       │   └── attendance/      # Attendance management
│       │       └── bulk-update/ # Bulk update absensi
│       ├── notulensi/           # Notulensi CRUD
│       ├── kbm-desa/            # KBM Desa APIs
│       │   ├── dashboard/       # Dashboard data
│       │   ├── laporan/         # Laporan APIs
│       │   ├── master/          # Master data desa
│       │   └── rangkuman/       # Rangkuman laporan
│       ├── program-kerja-api/   # Program Kerja APIs
│       │   ├── kegiatan/        # Kegiatan management
│       │   └── stats/           # Statistics API
│       ├── mediafire-manager/   # MediaFire management APIs
│       │   ├── files/           # File operations
│       │   ├── activity/        # Activity logging
│       │   ├── bulk/            # Bulk operations
│       │   ├── export/          # Export data
│       │   └── stats/           # File statistics
│       ├── laporan/             # Laporan & export APIs
│       │   ├── custom/          # Custom reports
│       │   ├── session-details/ # Session detail reports
│       │   └── notulensi-export/ # Notulensi export
│       └── debug/               # Debug endpoints
│           ├── absensi/         # Debug absensi
│           ├── absensi-check/   # Check absensi data
│           └── attendance/      # Debug attendance
├── components/
│   ├── admin/                   # Admin components
│   │   ├── admin-navigation.tsx # Admin navigation
│   │   ├── session-selection-modal.tsx
│   │   ├── notulensi-selection-modal.tsx
│   │   ├── rangkuman-laporan-modal.tsx
│   │   ├── bulk-attendance-modal.tsx
│   │   ├── manual-attendance-modal.tsx
│   │   ├── custom-report-modal.tsx
│   │   └── role-guard.tsx       # Role-based access control
│   └── ui/                      # Reusable UI components
│       ├── button.tsx           # Button component
│       ├── card.tsx             # Card component
│       ├── dialog.tsx           # Dialog/Modal component
│       ├── input.tsx            # Input component
│       ├── select.tsx           # Select dropdown
│       ├── textarea.tsx         # Textarea component
│       ├── tabs.tsx             # Tabs component
│       ├── toast.tsx            # Toast notification
│       ├── badge.tsx            # Badge component
│       ├── checkbox.tsx         # Checkbox component
│       └── label.tsx            # Label component
├── hooks/
│   └── use-toast.ts             # Toast hook
├── lib/
│   ├── supabase/                # Supabase client config
│   │   ├── client.ts            # Client-side Supabase
│   │   └── server.ts            # Server-side Supabase
│   ├── templates/               # Template systems
│   │   └── notulensi-template.ts # Notulensi templates
│   ├── export.ts                # Export utilities
│   ├── auth.ts                  # Auth utilities
│   ├── utils.ts                 # Utility functions
│   └── toast-context.tsx        # Toast context provider
└── types/
    ├── database.ts              # TypeScript database types
    └── jspdf.d.ts              # jsPDF type definitions
```

## 📱 Flow Aplikasi

### 1. 🏠 Halaman Utama (`/`)
```
Akses: https://ppgcgk-musyawarah.vercel.app/
- Header: Logo PPG Jakarta Barat Cengkareng
- Tombol "Login Admin/Laporan KBM Desa" → `/admin/login`
- 4 Fitur Utama: Manajemen Sesi, Notulensi Digital, Manajemen Peserta, Laporan & Analitik
- Statistik sistem: 100 peserta, 4 level akses, 24/7 real-time
- Footer dengan copyright PPG Jakarta Barat Cengkareng
```

### 2. 👨‍💼 Flow Admin Multi-Role

#### Login Admin (`/admin/login`)
```
1. Input username (email) dan password
2. Klik "Masuk"
3. Validasi kredensial dengan bcrypt
4. Auto-redirect berdasarkan role:
   - admin_kmm → `/admin/sesi`
   - bidang_ppg → `/admin/program-kerja`
   - kbm_desa_* → `/admin/kbm-desa`
   - admin/super_admin → `/admin` (dashboard utama)
```

#### Dashboard Admin (`/admin`)
```
- Statistik real-time: Total peserta, sesi, notulensi pending
- Quick Actions: Buat Sesi, Tambah Peserta, Kelola Notulensi
- Sesi Terbaru: 5 sesi musyawarah terbaru dengan status
- Status Sistem: Database, Real-time, Notifikasi (semua hijau)
- Role-based navigation dengan RoleGuard component
```

#### Sistem KBM Desa (`/admin/kbm-desa`) **[NEW]**
```
Dashboard KBM Desa:
- Role-based access: 8 desa (Kalideres, Bandara, Kebon Jahe, dll)
- Periode selector: Bulan/Tahun dengan dropdown
- Card per desa dengan jumlah kelompok
- Tombol "Kelola Laporan" dan "Rangkuman" per desa

Laporan per Desa/Kelompok:
- 4 kategori program: PAUD CBR, Pra Remaja, Remaja, Pra Nikah
- Form terstruktur: Jumlah murid, kelas, kehadiran, pencapaian
- Data pengajar MT/MS, sarpras, tahfidz
- Kendala dan saran
- Auto-save dan validasi form
```

#### Sistem Program Kerja (`/admin/program-kerja`) **[NEW]**
```
Pilih Tahun & Bidang:
- Dropdown tahun: 2026-2100
- Input nama bidang bebas
- Navigate ke `/admin/program-kerja/[tahun]/[bidang]`

Manajemen Kegiatan:
- CRUD kegiatan dengan nomor urut otomatis
- Rincian Biaya Fleksibel:
  * Mode Simple: 7 field fixed (legacy)
  * Mode Fleksibel: Dynamic items unlimited
  * Kategori: Konsumsi, Transport, Akomodasi, Dokumentasi, Lainnya
  * Satuan: Orang, Hari, Dus, Paket, Unit, dll
  * Auto-calculate subtotal dan total
- Export program kerja ke PDF
```

#### Laporan & Export (`/admin/laporan`)
```
Dashboard Laporan:
- Overview stats: Total peserta, sesi, notulensi, approval rate
- 6 kategori laporan: Peserta, Sesi, Notulensi, Aktivitas, Kustom
- Export Excel/PDF per kategori
- Notulensi Selection Modal untuk export PDF individual
```

#### Manajemen Sesi (`/admin/sesi`)
```
Daftar Sesi:
- Tampil semua sesi dengan status
- Tombol: Buat Sesi, Edit, Hapus
- Filter dan pencarian sesi

Buat Sesi (`/admin/sesi/buat`):
1. Isi Informasi Sesi:
   - Nama Sesi
   - Deskripsi
   - Tanggal & Waktu
   - Lokasi
   - Tipe (Offline/Online/Hybrid)
   - Maksimal Peserta

2. Pilih Peserta:
   - Search peserta by nama/username
   - Filter by bidang
   - Bulk selection (Pilih Semua, Clear All)
   - Quick select by bidang

3. Klik "Buat Sesi"
4. Data tersimpan ke database
5. Redirect ke daftar sesi

Edit Sesi (`/admin/sesi/[id]/edit`):
1. Load data sesi existing
2. Load peserta yang sudah dipilih
3. Edit informasi dan peserta
4. Klik "Simpan Perubahan"
5. Update database
```

### 3. 👥 Flow Peserta - Absensi

#### Akses Absensi (`/absen`)
```
1. Buka: https://ppgcgk-musyawarah.vercel.app/absen
2. Input username (email peserta)
3. Klik tombol search
4. Sistem cari peserta di database
5. Tampil data peserta dan sesi yang di-assign

Jika peserta ditemukan:
- Tampil nama dan instansi peserta
- Tampil daftar sesi wajib dihadiri
- Status absensi per sesi dengan color coding

Proses Absensi:
1. Klik "Klik untuk Absen" pada sesi
2. Form absensi muncul dengan detail sesi
3. Pilih Status Kehadiran:
   - ✅ Hadir
   - ⏰ Terlambat  
   - 📝 Izin
   - 🏥 Sakit
   - ❌ Ghoib
4. Input catatan (opsional)
5. Klik "Catat Kehadiran"
6. Data tersimpan dengan IP address dan user agent
7. Status berubah real-time di dashboard admin
```

### 4. 📝 Flow Notulensi Digital

#### Buat Notulensi (`/admin/notulensi/buat`)
```
1. Pilih sesi musyawarah dari dropdown
2. Isi form notulensi:
   - Judul notulensi
   - Agenda pembahasan
   - Pembahasan detail (Rich Text Editor)
   - Keputusan yang diambil
   - Tindak lanjut dan penanggung jawab
3. Simpan sebagai Draft atau Submit untuk Approval
4. Sistem tracking version dan audit trail
```

#### Workflow Approval
```
Draft → Pending Approval → Approved/Rejected
- Sekretaris PPG dapat approve/reject
- Sistem komentar untuk feedback
- Email notification (jika dikonfigurasi)
- Export PDF untuk notulensi yang approved
```

## 🗄️ Struktur Database

### Tabel Utama
```sql
-- Tabel peserta dengan multi-role support
CREATE TABLE peserta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL, -- digunakan sebagai username
  nomor_hp VARCHAR(20),
  jabatan VARCHAR(255),
  instansi VARCHAR(255),
  foto_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'peserta', 
  -- Roles: 'peserta', 'sekretaris_ppg', 'admin', 'super_admin', 'bidang_ppg', 'admin_kmm'
  -- KBM Desa: 'kbm_desa_kalideres', 'kbm_desa_bandara', 'kbm_desa_kebon_jahe', 
  --           'kbm_desa_cengkareng', 'kbm_desa_kapuk_melati', 'kbm_desa_taman_kota', 
  --           'kbm_desa_jelambar', 'kbm_desa_cipondoh'
  password_hash VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  aktif BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel sesi musyawarah
CREATE TABLE sesi_musyawarah (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_sesi VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  tanggal DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  waktu_selesai TIME NOT NULL,
  timezone VARCHAR(10) DEFAULT 'WIB',
  lokasi VARCHAR(200),
  tipe VARCHAR(20) DEFAULT 'offline', -- 'offline', 'online', 'hybrid'
  maksimal_peserta INTEGER DEFAULT 100,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'active', 'completed', 'cancelled'
  link_pendek VARCHAR(100),
  created_by UUID NOT NULL REFERENCES peserta(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel relasi sesi-peserta
CREATE TABLE sesi_peserta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id) ON DELETE CASCADE,
  peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sesi_id, peserta_id)
);

-- Tabel absensi dengan upsert support
CREATE TABLE absensi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peserta_id UUID NOT NULL REFERENCES peserta(id),
  sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id),
  waktu_absen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_kehadiran VARCHAR(20) DEFAULT 'hadir', -- 'hadir', 'terlambat', 'izin', 'sakit', 'ghoib'
  catatan TEXT,
  ip_address INET,
  user_agent TEXT,
  lokasi_koordinat POINT,
  admin_override BOOLEAN DEFAULT false,
  admin_notes TEXT,
  modified_by UUID REFERENCES peserta(id),
  modification_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel notulensi sesi
CREATE TABLE notulensi_sesi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id),
  judul VARCHAR(255) NOT NULL,
  agenda TEXT NOT NULL,
  pembahasan TEXT NOT NULL,
  keputusan TEXT,
  tindak_lanjut TEXT,
  penanggung_jawab TEXT,
  target_waktu DATE,
  lampiran_urls TEXT[],
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'rejected'
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

-- Tabel komentar notulensi
CREATE TABLE komentar_notulensi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notulensi_id UUID NOT NULL REFERENCES notulensi_sesi(id),
  peserta_id UUID NOT NULL REFERENCES peserta(id),
  komentar TEXT NOT NULL,
  parent_id UUID REFERENCES komentar_notulensi(id),
  mentions TEXT[],
  edited_at TIMESTAMP WITH TIME ZONE,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel KBM Desa
CREATE TABLE desa_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_desa VARCHAR(255) NOT NULL,
  kelompok TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE laporan_kbm_desa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  desa_id UUID NOT NULL REFERENCES desa_master(id),
  kelompok VARCHAR(255) NOT NULL,
  periode VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  kategori_program VARCHAR(20) NOT NULL, -- 'paud_cbr', 'pra_remaja', 'remaja', 'pra_nikah'
  jumlah_murid INTEGER NOT NULL,
  jumlah_kelas INTEGER NOT NULL,
  persentase_kehadiran DECIMAL(5,2) NOT NULL,
  pencapaian_target_materi DECIMAL(5,2) NOT NULL,
  pertemuan_kbm_kali INTEGER NOT NULL,
  sarpras TEXT NOT NULL,
  tahfidz INTEGER NOT NULL,
  pengajar_mt_ms TEXT NOT NULL,
  laporan_musyawarah TEXT,
  kendala_saran TEXT,
  created_by UUID NOT NULL REFERENCES peserta(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Program Kerja
CREATE TABLE program_kerja (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tahun INTEGER NOT NULL,
  nama_bidang VARCHAR(255) NOT NULL,
  created_by UUID NOT NULL REFERENCES peserta(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kegiatan_program (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_kerja_id UUID NOT NULL REFERENCES program_kerja(id),
  no_urut INTEGER NOT NULL,
  nama_kegiatan VARCHAR(255) NOT NULL,
  bulan VARCHAR(20) NOT NULL,
  tujuan TEXT,
  keterangan TEXT,
  total_alokasi DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel rincian biaya (legacy)
CREATE TABLE rincian_biaya (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kegiatan_id UUID NOT NULL REFERENCES kegiatan_program(id),
  peserta INTEGER DEFAULT 0,
  konsumsi DECIMAL(15,2) DEFAULT 0,
  akomodasi DECIMAL(15,2) DEFAULT 0,
  dokumentasi DECIMAL(15,2) DEFAULT 0,
  hari_kegiatan INTEGER DEFAULT 1,
  frekuensi_konsumsi INTEGER DEFAULT 1,
  extra_biaya DECIMAL(15,2) DEFAULT 0,
  total_biaya DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel MediaFire Management
CREATE TABLE mediafire_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  mediafire_url TEXT NOT NULL,
  category VARCHAR(100),
  description TEXT,
  file_size VARCHAR(50),
  file_type VARCHAR(50),
  upload_date DATE DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES peserta(id),
  tags JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mediafire_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES mediafire_files(id),
  action VARCHAR(50) NOT NULL, -- 'upload', 'edit', 'delete', 'view'
  user_id UUID NOT NULL REFERENCES peserta(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique Constraints
CREATE UNIQUE INDEX idx_absensi_unique_peserta_sesi ON absensi(peserta_id, sesi_id);
CREATE UNIQUE INDEX idx_sesi_peserta_unique ON sesi_peserta(sesi_id, peserta_id);

-- Performance Indexes
CREATE INDEX idx_sesi_peserta_sesi_id ON sesi_peserta(sesi_id);
CREATE INDEX idx_sesi_peserta_peserta_id ON sesi_peserta(peserta_id);
CREATE INDEX idx_absensi_sesi_id ON absensi(sesi_id);
CREATE INDEX idx_absensi_peserta_id ON absensi(peserta_id);
CREATE INDEX idx_absensi_status ON absensi(status_kehadiran);
CREATE INDEX idx_peserta_email ON peserta(email);
CREATE INDEX idx_peserta_role ON peserta(role);
CREATE INDEX idx_notulensi_sesi_id ON notulensi_sesi(sesi_id);
CREATE INDEX idx_notulensi_status ON notulensi_sesi(status);
CREATE INDEX idx_komentar_notulensi_id ON komentar_notulensi(notulensi_id);
CREATE INDEX idx_laporan_kbm_desa_id ON laporan_kbm_desa(desa_id);
CREATE INDEX idx_laporan_kbm_periode ON laporan_kbm_desa(periode);
CREATE INDEX idx_program_kerja_tahun ON program_kerja(tahun);
CREATE INDEX idx_mediafire_files_category ON mediafire_files(category);
CREATE INDEX idx_mediafire_files_active ON mediafire_files(is_active);
CREATE INDEX idx_mediafire_activity_user ON mediafire_activity_log(user_id);
CREATE INDEX idx_mediafire_activity_action ON mediafire_activity_log(action);
```

## 📦 Instalasi & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd ppgcgk-musyawarah-main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NODE_ENV=development
```

### 4. Setup Database Supabase
```sql
-- Buat tabel sesi_peserta jika belum ada
CREATE TABLE sesi_peserta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id) ON DELETE CASCADE,
    peserta_id UUID NOT NULL REFERENCES peserta(id) ON DELETE CASCADE,
    wajib_hadir BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sesi_id, peserta_id)
);

-- Index untuk performa
CREATE INDEX idx_sesi_peserta_sesi_id ON sesi_peserta(sesi_id);
CREATE INDEX idx_sesi_peserta_peserta_id ON sesi_peserta(peserta_id);
```

### 5. Jalankan Development
```bash
npm run dev
```

### Scripts Available
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

### Dependencies Utama
```json
{
  "dependencies": {
    "next": "^14.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.2",
    "@supabase/supabase-js": "^2.38.0",
    "tailwindcss": "^3.3.5",
    "lucide-react": "^0.290.0",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "date-fns": "^2.30.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.6.0",
    "recharts": "^2.8.0",
    "react-quill": "^2.0.0",
    "quill": "^1.3.7",
    "sonner": "^1.2.0",
    "bcryptjs": "^2.4.3",
    "nodemailer": "^6.9.7",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

**Key Libraries:**
- **Next.js 14+** - React framework dengan App Router
- **TypeScript** - Type safety dan development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (Database + Auth + Real-time)
- **Radix UI** - Headless UI components untuk accessibility
- **Lucide React** - Modern icon library
- **React Hook Form + Zod** - Form handling dan validation
- **Recharts** - Chart library untuk dashboard analytics
- **XLSX & jsPDF** - Export functionality untuk laporan
- **React Quill** - Rich text editor untuk notulensi
- **bcryptjs** - Password hashing untuk authentication
- **Sonner** - Toast notifications

## 🔧 Troubleshooting

### Common Issues
1. **Database Connection Error**: Pastikan environment variables Supabase sudah benar
2. **Build Error**: Jalankan `npm run type-check` untuk cek TypeScript errors
3. **Styling Issues**: Pastikan Tailwind CSS sudah ter-configure dengan benar
4. **API Errors**: Cek Supabase RLS policies dan table permissions

## 🚀 Deployment

### Vercel Deployment
1. Push code ke GitHub repository
2. Connect repository di Vercel dashboard
3. Set environment variables di Vercel
4. Deploy otomatis akan berjalan

### URL Production
- **Main**: https://ppgcgk-musyawarah.vercel.app/
- **Admin**: https://ppgcgk-musyawarah.vercel.app/admin/login
- **Absensi**: https://ppgcgk-musyawarah.vercel.app/absen

## 🎯 Status Pengembangan

### ✅ Fitur Selesai
- [x] Halaman utama dan navigasi
- [x] Sistem login admin dengan role-based access
- [x] CRUD sesi musyawarah lengkap
- [x] Assign peserta ke sesi dengan bulk selection
- [x] Sistem absensi publik real-time
- [x] Database relational design dengan indexing
- [x] Real-time status update
- [x] Mobile responsive design
- [x] **Dashboard laporan & analytics** ✅
- [x] **Export laporan Excel/PDF** ✅
- [x] **Hybrid Approach PDF Export** ✅
- [x] **Session Selection Modal** ✅
- [x] **Terminologi sesuai PPG** ✅
- [x] **CRUD Peserta lengkap** ✅
- [x] **Monitor absensi admin** ✅
- [x] **API endpoints untuk laporan** ✅

### 🚧 Fitur Dalam Pengembangan
- [ ] Sistem notulensi digital dengan approval workflow
- [ ] Sistem komentar real-time
- [ ] Login dan dashboard peserta
- [ ] Email notifications
- [ ] Advanced charts dan visualisasi

### 🎯 Roadmap Selanjutnya
- [ ] WhatsApp integration untuk notifikasi
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Video conference integration
- [ ] Advanced filtering dan search
- [ ] Backup dan restore data

## 🆕 Update Terbaru (Latest)

### 🔧 Sistem Absensi Upsert (FIXED) ✅
- **Update Berulang**: Peserta dapat mengubah status berulang kali tanpa error
- **Upsert Logic**: Check-then-update/insert approach yang robust
- **PDF Sync**: Print PDF selalu menampilkan data terbaru
- **No Duplication**: Unique constraint mencegah duplikasi record
- **Debug Tools**: Endpoint debugging untuk troubleshooting
- **Real-time Updates**: UI dan PDF sinkron dengan database

### 📁 Sistem Manajemen File MediaFire ✅
- **File CRUD**: Create, Read, Update, Delete file MediaFire
- **Bulk Operations**: Upload dan manage multiple files sekaligus
- **Category Management**: Organisasi file berdasarkan kategori
- **Activity Logging**: Tracking semua aktivitas file management
- **Search & Filter**: Pencarian advanced dengan multiple criteria
- **Statistics Dashboard**: Analytics file dan user activity
- **Export Capabilities**: Export data file ke Excel/PDF

### 💼 Sistem Program Kerja dengan Dynamic Budget ✅
- **Rincian Biaya Fleksibel**: Toggle antara mode Simple dan Dynamic
- **Unlimited Budget Items**: Tambah item biaya tanpa batas
- **5 Kategori Biaya**: Konsumsi, Transport, Akomodasi, Dokumentasi, Lainnya
- **10+ Satuan**: Orang, Hari, Dus, Paket, Unit, Meter, Set, Buah, Porsi, Kotak
- **Auto Calculate**: Subtotal dan total otomatis terhitung
- **Statistics Dashboard**: Analytics program kerja per bidang dan tahun

### 🏘️ Sistem KBM Desa Terintegrasi ✅
- **8 Desa Support**: Kalideres, Bandara, Kebon Jahe, Cengkareng, Kapuk Melati, Taman Kota, Jelambar, Cipondoh
- **Role-based Access**: Admin per desa dengan akses terbatas
- **Periode Management**: Laporan bulanan dengan selector periode
- **4 Kategori Program**: PAUD CBR, Pra Remaja, Remaja, Pra Nikah
- **Rangkuman Modal**: Dashboard statistik per desa

### 📝 Sistem Notulensi Digital Lengkap ✅
- **Rich Text Editor**: Quill.js untuk editing profesional
- **Workflow Approval**: Draft → Pending → Approved/Rejected
- **Komentar System**: Kolaborasi dengan mentions
- **Template System**: Template notulensi standar
- **Version Control**: Tracking perubahan dan audit trail

### 🔧 Technical Excellence ✅
- **Multi-Role Architecture**: 12+ role dengan auto-redirect
- **Database Optimization**: Proper indexing dan relational design
- **Upsert System**: Robust update/insert logic untuk absensi
- **Export System**: Excel dan PDF untuk semua modul
- **Real-time Updates**: Supabase realtime subscriptions
- **Type Safety**: 100% TypeScript dengan proper database types
- **Security**: bcrypt hashing, role guards, input validation
- **Debug Endpoints**: Comprehensive debugging tools
- **Error Handling**: Graceful error handling dengan detailed logging

## 📞 Support

Untuk pertanyaan dan dukungan:
- Email: support@ppg-musyawarah.id
- Issues: GitHub Issues
- Documentation: README.md (selalu update)

## 🏆 Achievements

- ✅ **Production Ready**: Deployed dan stabil di Vercel
- ✅ **Type Safe**: 100% TypeScript dengan proper typing
- ✅ **Mobile Responsive**: Optimal di semua device
- ✅ **Real-time**: Live updates untuk absensi dan statistik
- ✅ **Scalable**: Mendukung hingga 100+ peserta
- ✅ **User Friendly**: Interface intuitif dengan UX terbaik
- ✅ **Secure**: Role-based access control dan data validation
- ✅ **Fast**: Optimized performance dengan lazy loading

---

**Website PPG Jakarta Barat Cengkareng** - Platform Terintegrasi untuk Program Penggerak Pembina Generasi 🇮🇩

*Last Updated: December 2024 - Absensi Upsert Fix & MediaFire Management System*