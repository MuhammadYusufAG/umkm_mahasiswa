# Rencana Penyelarasan Tema UI: Lupa Password & Reset Password

Dokumen ini berisi rencana tingkat tinggi (*high-level*) untuk memperbaiki dan menyelaraskan tema, warna, dan gaya visual pada halaman Lupa Password dan Reset Password agar konsisten dengan halaman Login, Registrasi, atau Dashboard aplikasi.

---

## 1. Penyelarasan Warna Utama (Primary Color)
- **Tujuan:** Memastikan warna tombol, ikon, dan garis batas (border) saat elemen aktif (focus) memiliki skema warna yang seragam dengan halaman otentikasi utama.
- **Instruksi:**
  1. Periksa `forgot-password.html` dan `reset-password.html`.
  2. Ganti class warna Tailwind yang tidak konsisten (misalnya warna hijau atau gaya lain yang berbeda) menjadi warna utama aplikasi, seperti aksen biru khas login (contohnya `bg-[#0046ff]` dan variasi hover `bg-[#0035cc]`).

## 2. Penyelarasan Ikon dan Latar Belakang Lingkaran (Icon Backgrounds)
- **Tujuan:** Menyamakan gaya dekorasi ikon (seperti ikon gembok atau kunci di atas formulir) agar memiliki identitas visual yang sama.
- **Instruksi:**
  1. Ubah warna latar belakang (background) lingkaran yang membungkus ikon di atas form pada halaman pemulihan sandi agar menggunakan kombinasi *soft background* yang sesuai dengan identitas warna utama (misal menggunakan warna biru muda/`bg-blue-50` dan ikon biru).

## 3. Penyelarasan Efek Interaksi (Focus & Hover)
- **Tujuan:** Menjaga pengalaman pengguna (UX) yang seragam saat berinteraksi dengan formulir.
- **Instruksi:**
  1. Pastikan efek *focus* pada kotak input (*input fields*) menggunakan *border-color* dan *ring-color* yang selaras dengan halaman login dan registrasi (menggunakan skema biru).
  2. Pastikan gaya *hover* pada tombol dan tautan (links) konsisten perilakunya.

## Kesimpulan
Setelah perubahan ini diimplementasikan, pengguna yang beralih dari halaman Login menuju halaman Lupa Password dan Reset Password tidak akan merasakan perbedaan tema visual, memberikan kesan aplikasi yang profesional dan terintegrasi dengan baik.
