# Plan: Sistem Pilihan Pesanan (Order Selector) dan Chat Terpisah per Toko

Rencana pengerjaan agar pembeli yang memiliki beberapa pesanan aktif (terutama setelah checkout dari penjual yang berbeda) dapat memilih pesanan mana yang ingin dilihat detailnya dan melakukan chat dengan penjual dari pesanan tersebut secara terpisah di halaman `/pesanan.html`.

---

## 1. Pembuatan UI Pilihan Pesanan (Order List/Selector)

#### [MODIFY] [pesanan.html](file:///home/cup/dev/playground/java/vibe-code/umkm/src/main/resources/static/pesanan.html)
- Tambahkan container daftar pesanan melayang (sidebar atau panel horizontal di bagian atas halaman) yang menampilkan daftar pesanan aktif milik pembeli.
- Setiap item di daftar pesanan menampilkan minimal: ID Pesanan (`#ORD-xxx`), Nama Toko/Penjual, dan Status Pesanan (`BARU`, `DIPROSES`, dll).

## 2. Manajemen Navigasi Detail & Chat Dinamis

#### [MODIFY] [pesanan.js](file:///home/cup/dev/playground/java/vibe-code/umkm/src/main/resources/static/js/pesanan.js)
- **Tampilkan Daftar Pesanan**:
  - Ambil semua pesanan pembeli dari `/api/orders/buyer`.
  - Render semuanya ke dalam UI Pilihan Pesanan yang baru dibuat.
- **Tukar Tampilan Detail (Toko & Chat)**:
  - Ketika pembeli mengeklik salah satu pesanan dari daftar:
    - Set pesanan tersebut sebagai pesanan aktif yang sedang dilihat.
    - Render ulang detail produk, total harga, status bar, dan ikon status sesuai data pesanan yang dipilih.
    - Bersihkan kotak chat (`#chatBox`) dan isi ulang chat history berdasarkan kolom `notes` dari pesanan yang dipilih.
    - Simpan ID pesanan terpilih di `sessionStorage` sebagai `activeOrderId` agar fungsi `kirimChat()` mengirim pesan ke endpoint yang tepat: `PATCH /api/orders/{activeOrderId}/notes`.
- **Inisialisasi Awal**:
  - Secara default saat pertama kali masuk ke halaman pesanan, pilih pesanan teratas (pesanan paling baru) untuk ditampilkan.
