# Fitur: Notifikasi Real-time ke Penjual Ketika Ada Pesanan Masuk

## Latar Belakang
Saat ini, ketika seorang pembeli berhasil melakukan checkout (membuat pesanan baru), penjual tidak mendapatkan notifikasi apapun secara instan. Penjual harus me-refresh halaman **Pesanan Penjual** secara manual untuk mengetahui ada pesanan baru yang masuk.

Proyek ini sudah memiliki infrastruktur **WebSocket (STOMP/SockJS)** yang dipakai untuk fitur chat. Infrastruktur ini dapat dimanfaatkan kembali untuk mengirimkan notifikasi pesanan secara real-time tanpa harus menambahkan teknologi baru.

---

## Rencana Penyelesaian (High-Level)

### 1. Modifikasi Backend — Kirim Notifikasi via WebSocket
Setelah pesanan baru berhasil dibuat di `OrderController` (endpoint `POST /api/orders`), backend harus mengirimkan *event* real-time ke penjual yang bersangkutan melalui `SimpMessagingTemplate`.

- Kirim *event* ke topic yang spesifik per penjual, misalnya:
  ```
  /topic/orders/{sellerId}
  ```
- Pesan yang dikirim cukup berisi sinyal sederhana seperti `"new-order"` atau data ringkasan pesanan (nama pembeli, total harga).
- Cukup tambahkan `SimpMessagingTemplate` ke dalam `OrderController` dan panggil `convertAndSend()` ke topic penjual setelah pesanan berhasil disimpan.

### 2. Modifikasi Frontend — Dengarkan Notifikasi di Halaman Penjual
Di halaman **Dashboard Penjual** (`dashboardPenjual.html` / JS terkait) dan **Pesanan Penjual** (`pesananPenjual.html` / `pesananPenjual.js`):

- Setelah koneksi WebSocket terbuka (menggunakan SockJS + STOMP yang sudah tersedia), subscribe ke topic:
  ```
  /topic/orders/{sellerId}
  ```
- Saat menerima *event* dari server:
  - Di halaman **Dashboard Penjual**: Tampilkan badge/notifikasi atau toast yang memberitahu ada pesanan baru masuk.
  - Di halaman **Pesanan Penjual**: Langsung panggil ulang fungsi `fetchOrders()` agar daftar pesanan diperbarui secara otomatis tanpa perlu refresh.

### 3. Cara Mendapatkan `sellerId` di Frontend
`sellerId` dapat diperoleh dari API yang sudah ada: `GET /api/auth/me`. Simpan `id` user ke variabel global setelah halaman pertama kali dimuat, lalu gunakan ID tersebut saat melakukan subscribe ke topic WebSocket.

---

## Catatan Penting
- Infrastruktur WebSocket (SockJS endpoint `/ws`, prefix `/topic`, SimpBroker) **sudah ada** di proyek ini. Tidak perlu konfigurasi tambahan.
- Fitur ini cukup dikerjakan dengan menambahkan beberapa baris kode di `OrderController.java` dan file JavaScript terkait.
- Pastikan Subscribe topic hanya dilakukan jika pengguna adalah **SELLER** untuk menghindari koneksi yang tidak perlu dari sisi pembeli.
