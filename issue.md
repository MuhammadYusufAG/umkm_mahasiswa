# Fitur: Ganti Semua Pop-up Browser Menjadi Notifikasi & Konfirmasi Elegan

## Latar Belakang
Aplikasi saat ini menggunakan dua jenis pop-up bawaan browser yang mengganggu pengalaman pengguna:
1. **`alert()`** — untuk menampilkan pesan sukses/error. Tampilannya primitif dan memblokir layar.
2. **`confirm()`** — untuk meminta konfirmasi sebelum aksi (hapus, batalkan, dll). Juga memblokir UI dan tidak konsisten dengan desain.

## Tujuan
Ganti **semua** `alert()` dan `confirm()` dengan komponen notifikasi/modal kustom yang terintegrasi dengan desain aplikasi yang sudah ada.

---

## Rencana Penyelesaian (High-Level)

### 1. Buat Toast Notification Global (untuk mengganti `alert()`)
- Buat file `js/toast.js` berisi fungsi `showToast(message, type)` dengan tipe: `success`, `error`, dan `info`.
- Toast muncul di pojok kanan atas, menggunakan animasi masuk (slide/fade), dan menghilang otomatis setelah beberapa detik.
- Style-nya menyesuaikan desain aplikasi yang sudah ada (warna, border-radius, font).

### 2. Buat Modal Konfirmasi Global (untuk mengganti `confirm()`)
- Buat fungsi `showConfirm(message)` yang menampilkan modal konfirmasi kustom.
- Modal memiliki dua tombol: **Ya, Lanjutkan** dan **Batal**.
- Fungsi ini mengembalikan sebuah `Promise`, sehingga dapat digunakan dengan `await` sebagai pengganti `confirm()` yang sinkron.

### 3. Hubungkan ke Semua Halaman
- Muat `toast.js` dan fungsi modal konfirmasi di semua halaman yang memerlukannya.
- Cara termudah: muat script secara dinamis dari dalam file JS yang sudah ada, sehingga tidak perlu mengubah banyak file HTML.

### 4. Ganti Semua Penggunaan di File JS
Ganti `alert(...)` dengan `showToast(...)` dan `confirm(...)` dengan `await showConfirm(...)` di seluruh file berikut:
- `js/pesananPenjual.js`
- `js/kelolaProduk.js`
- `js/dashboard.js`
- `js/stokProduk.js`
- `js/produk.js`

## Catatan Penting
- `showToast` untuk respons aksi (sukses/gagal).
- `showConfirm` untuk pengganti `confirm()` sebelum aksi destruktif (hapus, batalkan, dll).
