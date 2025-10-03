export const NOTULENSI_TEMPLATE = `
<h1>NOTULENSI MUSYAWARAH PPG</h1>

<p><strong>Sesi:</strong> [NAMA_SESI]</p>
<p><strong>Tanggal:</strong> [TANGGAL]</p>
<p><strong>Waktu:</strong> [WAKTU_MULAI] - [WAKTU_SELESAI] WIB</p>
<p><strong>Tempat:</strong> [LOKASI]</p>
<p><strong>Total Peserta:</strong> [TOTAL_PESERTA] orang</p>

<hr>

<h2>📋 AGENDA PEMBAHASAN</h2>
<ol>
    <li>Pembukaan dan Pengenalan</li>
    <li>Presentasi Materi Utama</li>
    <li>Diskusi dan Tanya Jawab</li>
    <li>Perumusan Keputusan</li>
    <li>Penutup dan Tindak Lanjut</li>
</ol>

<h2>💬 PEMBAHASAN</h2>

<h3>Poin 1: [Judul Pembahasan]</h3>
<p><strong>Penyampaian:</strong></p>
<p>[Detail pembahasan yang disampaikan]</p>
<p><strong>Tanggapan/Diskusi:</strong></p>
<p>[Ringkasan tanggapan peserta dan diskusi yang terjadi]</p>

<h3>Poin 2: [Judul Pembahasan]</h3>
<p><strong>Penyampaian:</strong></p>
<p>[Detail pembahasan yang disampaikan]</p>
<p><strong>Tanggapan/Diskusi:</strong></p>
<p>[Ringkasan tanggapan peserta dan diskusi yang terjadi]</p>

<h2>✅ KEPUTUSAN</h2>
<ol>
    <li>
        <p><strong>Keputusan 1:</strong> [Detail keputusan yang diambil]</p>
        <ul>
            <li><strong>Dasar Pertimbangan:</strong> [Alasan diambilnya keputusan ini]</li>
            <li><strong>Dampak:</strong> [Dampak yang diharapkan]</li>
        </ul>
    </li>
    <li>
        <p><strong>Keputusan 2:</strong> [Detail keputusan yang diambil]</p>
        <ul>
            <li><strong>Dasar Pertimbangan:</strong> [Alasan diambilnya keputusan ini]</li>
            <li><strong>Dampak:</strong> [Dampak yang diharapkan]</li>
        </ul>
    </li>
</ol>

<h2>📝 TINDAK LANJUT</h2>
<table border="1">
    <thead>
        <tr>
            <th>No</th>
            <th>Kegiatan</th>
            <th>Penanggung Jawab</th>
            <th>Target Waktu</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>[Kegiatan]</td>
            <td>[Nama PJ]</td>
            <td>[DD/MM/YYYY]</td>
            <td>Belum Mulai</td>
        </tr>
        <tr>
            <td>2</td>
            <td>[Kegiatan]</td>
            <td>[Nama PJ]</td>
            <td>[DD/MM/YYYY]</td>
            <td>Belum Mulai</td>
        </tr>
    </tbody>
</table>

<hr>

<p><strong>Notulis:</strong> [NAMA_SEKRETARIS]</p>
<p><strong>Tanggal Dibuat:</strong> [TANGGAL_DIBUAT]</p>
<p><strong>Status:</strong> [STATUS]</p>
`;

export function generateNotulensiTemplate(
  session: any, 
  totalParticipants: number,
  secretaryName: string = '[Nama akan diisi otomatis]'
): string {
  return NOTULENSI_TEMPLATE
    .replace('[NAMA_SESI]', session.nama_sesi)
    .replace('[TANGGAL]', new Date(session.tanggal).toLocaleDateString('id-ID'))
    .replace('[WAKTU_MULAI]', session.waktu_mulai)
    .replace('[WAKTU_SELESAI]', session.waktu_selesai)
    .replace('[LOKASI]', session.lokasi || 'Tidak ditentukan')
    .replace('[TOTAL_PESERTA]', totalParticipants.toString())
    .replace('[NAMA_SEKRETARIS]', secretaryName)
    .replace('[TANGGAL_DIBUAT]', new Date().toLocaleDateString('id-ID'))
    .replace('[STATUS]', 'Draft');
}