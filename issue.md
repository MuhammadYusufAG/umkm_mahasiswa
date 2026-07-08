# Fitur: Notifikasi Real-time Pesanan Masuk di Halaman Penjual

## Latar Belakang
Saat pembeli melakukan checkout, penjual tidak mendapatkan pemberitahuan secara instan.
Penjual harus me-refresh halaman **Pesanan Penjual** secara manual untuk melihat pesanan baru.

Proyek sudah memiliki infrastruktur **WebSocket (STOMP/SockJS)** yang digunakan di fitur chat.
Infrastruktur ini bisa dimanfaatkan ulang tanpa menambahkan teknologi baru.

---

## Rencana (High-Level)

### 1. Backend — Kirim Notifikasi Saat Pesanan Dibuat
Di `OrderController`, setelah pesanan berhasil disimpan ke database,
kirimkan event real-time ke penjual yang bersangkutan menggunakan `SimpMessagingTemplate`.

- Topic yang dituju: `/topic/orders/{sellerId}`
- Payload: cukup string sederhana seperti `"new-order"`

### 2. Frontend — Dengarkan Notifikasi di Halaman Pesanan Penjual
Di `pesananPenjual.js`:

- Ambil data user login (termasuk `id` penjual) dari `GET /api/auth/me`.
- Buka koneksi STOMP WebSocket ke endpoint `/ws`.
- Subscribe ke topic `/topic/orders/{sellerId}`.
- Ketika event `"new-order"` diterima:
  - Refresh daftar pesanan otomatis (panggil ulang fungsi `fetchOrders()`).
  - Tampilkan toast notifikasi kepada penjual.

### 3. Catatan Teknis
- Library SockJS dan STOMP **sudah tersedia** di halaman `pesananPenjual.html`.
- Subscribe topic hanya dilakukan jika user memiliki role **SELLER**.
- Jika koneksi WebSocket terputus, lakukan reconnect otomatis setelah beberapa detik.

---

## File yang Perlu Dimodifikasi

| File | Perubahan |
|------|-----------|
| `OrderController.java` | Inject `SimpMessagingTemplate`, kirim event setelah pesanan disimpan |
| `pesananPenjual.js` | Tambahkan koneksi STOMP dan handler event notifikasi |
