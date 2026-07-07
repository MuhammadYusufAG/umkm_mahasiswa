# Fitur: Ganti Semua `alert()` Menjadi Notifikasi Toast

## Latar Belakang
Saat ini, aplikasi menggunakan fungsi `alert()` bawaan browser untuk menampilkan pesan sukses, error, dan konfirmasi. Tampilan ini primitif, memblokir UI, dan tidak konsisten dengan desain aplikasi.

## Tujuan
Ganti semua penggunaan `alert()` dengan komponen notifikasi **toast/snackbar** yang muncul di sudut layar, terlihat elegan, dan menghilang otomatis setelah beberapa detik.

## Rencana Penyelesaian (High-Level)

### 1. Buat Komponen Toast Global
- Tambahkan elemen container HTML untuk toast di bagian bawah setiap halaman (atau buat satu tempat di layout/partial yang di-include semua halaman).
- Buat file CSS baru atau tambahkan style untuk toast: animasi slide-in dari bawah/atas, warna berbeda untuk **sukses** (hijau), **error** (merah), dan **info** (biru).
- Buat fungsi JavaScript global `showToast(pesan, tipe)` yang dapat dipanggil dari file JS manapun.

### 2. Ganti Semua `alert()` di File JS
Ganti setiap `alert(...)` dengan pemanggilan `showToast(...)` di seluruh file berikut:
- `js/pesananPenjual.js`
- `js/kelolaProduk.js`
- `js/dashboard.js`
- `js/stokProduk.js`
- `js/produk.js`

### 3. Tangani `confirm()` (Opsional tapi Dianjurkan)
Untuk dialog `confirm()` (contoh: "Apakah Anda yakin ingin menghapus?"), ganti dengan **modal konfirmasi** kecil yang lebih elegan agar pengalaman pengguna lebih baik.

## Catatan Teknis
- Fungsi `showToast` sebaiknya diletakkan di file JS bersama (misalnya `js/utils.js` atau `js/toast.js`) dan di-load di semua halaman.
- Toast harus bisa muncul lebih dari satu sekaligus (stacked).
- Durasi tampil yang disarankan: **3 detik** untuk sukses/info, **5 detik** untuk error.
