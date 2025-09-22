# Sistem Musyawarah PPG

Sistem manajemen musyawarah Program Penggerak Pembina Generasi dengan fitur notulensi digital, absensi real-time, dan dashboard peserta. Mendukung hingga 100 peserta dengan sistem role-based access control.

## 🚀 Fitur yang Berhasil Diterapkan

### 🔐 Sistem Role-Based Access Control ✅
- **Admin**: Login dan akses penuh ke dashboard admin
- **Peserta**: Akses absensi tanpa login dengan username
- Sistem autentikasi berbasis email dan password
- Session management dengan localStorage

### 📋 Manajemen Sesi Musyawarah ✅
- **Buat Sesi**: Form lengkap dengan informasi sesi dan pemilihan peserta
- **Edit Sesi**: Load data sesi dan peserta yang sudah dipilih
- **Hapus Sesi**: Cascade delete dengan relasi terkait
- **Assign Peserta**: Sistem pemilihan peserta dengan search dan filter
- **Status Sesi**: Scheduled, Active, Completed, Cancelled
- **Tipe Sesi**: Offline, Online, Hybrid

### ✅ Sistem Absensi Real-time ✅
- **URL Publik**: `/absen` untuk akses peserta tanpa login
- **Search Username**: Cari peserta berdasarkan email/username
- **Tampil Sesi**: Otomatis menampilkan sesi yang di-assign ke peserta
- **Status Kehadiran**: Hadir, Terlambat, Izin, Sakit
- **Catatan Opsional**: Input catatan tambahan
- **Validasi Duplikasi**: Mencegah absensi ganda
- **Logging**: IP address dan user agent tersimpan
- **Real-time Update**: Status langsung berubah setelah absen

### 📝 Manajemen Peserta ✅
- **Database Peserta**: Tabel peserta dengan role dan informasi lengkap
- **Relasi Sesi-Peserta**: Tabel `sesi_peserta` untuk assign peserta ke sesi
- **Search & Filter**: Pencarian nama dan filter berdasarkan bidang
- **Bulk Selection**: Pilih semua, pilih berdasarkan bidang, clear all

### 📊 Dashboard Admin ✅
- **Login Admin**: Sistem autentikasi untuk admin
- **Manajemen Sesi**: CRUD sesi musyawarah lengkap
- **Daftar Sesi**: Tampilan semua sesi dengan status
- **Navigation**: Menu admin dengan akses ke semua fitur

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Custom Auth System
- **Real-time**: Supabase Realtime
- **Deployment**: Vercel

## 📁 Struktur Folder

```
src/
├── app/
│   ├── absen/                    # Halaman absensi publik
│   ├── admin/                   # Dashboard admin
│   │   ├── login/               # Login admin
│   │   ├── sesi/                # Manajemen sesi
│   │   │   ├── buat/            # Buat sesi baru
│   │   │   └── [id]/edit/       # Edit sesi
│   │   └── notulensi/           # Manajemen notulensi
│   └── api/                     # API endpoints
│       ├── auth/                # Authentication
│       ├── sesi/                # Sesi CRUD
│       ├── peserta/             # Peserta management
│       └── absensi/             # Absensi system
├── components/
│   ├── admin/                   # Admin components
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── supabase/                # Supabase client config
│   └── utils.ts                 # Utility functions
└── types/
    └── database.ts              # TypeScript types
```

## 📱 Flow Aplikasi

### 1. 🏠 Halaman Utama (`/`)
```
Akses: https://ppgcgk-musyawarah.vercel.app/
- Tombol "Login Admin" → `/admin/login`
- Tombol "Absensi Peserta" → `/absen`
- Informasi fitur sistem
- Statistik sistem (100 peserta, 4 level akses, 24/7)
```

### 2. 👨‍💼 Flow Admin

#### Login Admin (`/admin/login`)
```
1. Input username (email) dan password
2. Klik "Masuk"
3. Validasi kredensial
4. Redirect ke dashboard admin (`/admin`)
```

#### Dashboard Admin (`/admin`)
```
- Overview statistik sistem
- Menu navigasi: Sesi, Peserta, Notulensi, Laporan
- Quick actions untuk manajemen
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
- Tampil nama dan bidang peserta
- Tampil daftar sesi wajib dihadiri
- Status absensi per sesi (Belum Absen/Hadir/dll)

Proses Absensi:
1. Klik "Klik untuk Absen" pada sesi
2. Form absensi muncul dengan detail sesi
3. Pilih Status Kehadiran:
   - ✅ Hadir
   - ⏰ Terlambat  
   - 📝 Izin
   - 🏥 Sakit
4. Input catatan (opsional)
5. Klik "Catat Kehadiran"
6. Data tersimpan ke database
7. Status berubah dan tombol absen hilang
```

## 🗄️ Struktur Database

### Tabel Utama
```sql
-- Tabel peserta
CREATE TABLE peserta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL, -- digunakan sebagai username
  nomor_hp VARCHAR(20),
  jabatan VARCHAR(255),
  instansi VARCHAR(255),
  foto_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'peserta', -- 'peserta', 'sekretaris_ppg', 'admin', 'super_admin'
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
  batas_absen_mulai INTEGER DEFAULT 30, -- menit sebelum mulai
  batas_absen_selesai INTEGER DEFAULT 15, -- menit setelah mulai
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
  wajib_hadir BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sesi_id, peserta_id)
);

-- Tabel absensi
CREATE TABLE absensi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peserta_id UUID NOT NULL REFERENCES peserta(id),
  sesi_id UUID NOT NULL REFERENCES sesi_musyawarah(id),
  waktu_absen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status_kehadiran VARCHAR(20) DEFAULT 'hadir', -- 'hadir', 'terlambat', 'izin', 'sakit'
  catatan TEXT,
  ip_address INET,
  user_agent TEXT,
  lokasi_koordinat POINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_sesi_peserta_sesi_id ON sesi_peserta(sesi_id);
CREATE INDEX idx_sesi_peserta_peserta_id ON sesi_peserta(peserta_id);
CREATE INDEX idx_absensi_sesi_id ON absensi(sesi_id);
CREATE INDEX idx_absensi_peserta_id ON absensi(peserta_id);
CREATE INDEX idx_peserta_email ON peserta(email);
CREATE INDEX idx_peserta_role ON peserta(role);
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
- **Next.js 14+** - React framework dengan App Router
- **TypeScript** - Type safety dan development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service (Database + Auth)
- **Radix UI** - Headless UI components
- **Lucide React** - Icon library
- **React Hook Form + Zod** - Form handling dan validation
- **Recharts** - Chart library untuk dashboard
- **XLSX & jsPDF** - Export functionality

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
- [x] Sistem login admin
- [x] CRUD sesi musyawarah
- [x] Assign peserta ke sesi
- [x] Sistem absensi publik
- [x] Database relational design
- [x] Real-time status update
- [x] Mobile responsive design

### 🚧 Fitur Dalam Pengembangan
- [ ] Sistem notulensi digital dengan approval workflow
- [ ] Dashboard analytics dengan charts
- [ ] Export laporan (PDF/Excel)
- [ ] Sistem komentar real-time
- [ ] Login dan dashboard peserta
- [ ] Email notifications
- [ ] Manajemen user admin

### 🎯 Roadmap Selanjutnya
- [ ] WhatsApp integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Video conference integration

## 📞 Support

Untuk pertanyaan dan dukungan:
- Email: support@ppg-musyawarah.id
- Issues: GitHub Issues

---

**Sistem Musyawarah PPG** - Dikembangkan untuk Program Penggerak Pembina Generasi Indonesia 🇮🇩