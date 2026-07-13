# Bug: Error SSE 504 Gateway Timeout di Production

## Latar Belakang

Di lingkungan **produksi** (VPS dengan Nginx sebagai reverse proxy), fitur real-time update produk mengalami error:

```
GET http://202.134.242.131/api/products/stream 504 (Gateway Time-out)
SSE Error: Event {type: "error", target: EventSource, readyState: 2, ...}
```

Fitur ini menggunakan **Server-Sent Events (SSE)** untuk mendeteksi produk baru/update dari penjual secara real-time di halaman dashboard pembeli.

## Akar Masalah (Root Cause)

SSE adalah koneksi HTTP yang **tetap terbuka** (long-lived connection). Nginx sebagai reverse proxy memiliki timeout bawaan (`proxy_read_timeout`) yang biasanya hanya **60 detik**. Ketika tidak ada data yang dikirimkan melewati batas timeout ini, Nginx memutus koneksi dan mengembalikan error 504, sehingga SSE di sisi frontend langsung mati.

Ada **dua cara** penyelesaian yang bisa dipilih:

---

## Opsi A: Konfigurasi Nginx (Solusi di Level Infrastruktur)

Tambahkan konfigurasi khusus pada blok `location` yang menangani endpoint SSE (`/api/products/stream`) di file konfigurasi Nginx.

Konfigurasi yang perlu ditambahkan:
- `proxy_read_timeout` dinaikan ke nilai tinggi (misal: `3600s`)
- `proxy_buffering off` — matikan buffering agar data SSE langsung diteruskan ke client
- Header `X-Accel-Buffering: no` agar Nginx tidak mem-buffer response streaming

Ini adalah **solusi yang paling bersih** dan tidak memerlukan perubahan kode aplikasi sama sekali.

---

## Opsi B: Ganti SSE dengan Polling (Solusi di Level Kode)

Jika konfigurasi Nginx tidak bisa diakses atau terlalu berisiko, ganti mekanisme SSE di sisi frontend dan backend dengan **polling interval**.

### Frontend (`dashboard.js` dan `produk.js`)
- Hapus semua kode `EventSource` / SSE.
- Ganti dengan `setInterval` yang memanggil `fetchPublicProducts()` setiap **30-60 detik** di latar belakang secara diam-diam.

### Backend (`ProductController.java`)
- Endpoint `/api/products/stream` tidak lagi diperlukan dan bisa **dihapus**.
- Tidak ada perubahan lain di backend.

---

## Rekomendasi

| | Opsi A (Nginx Config) | Opsi B (Polling) |
|---|---|---|
| Perubahan kode | ❌ Tidak ada | ✅ Hapus SSE, tambah polling |
| Kompleksitas | Rendah (edit 1 file config) | Rendah (edit 2 file JS) |
| Performa | ✅ Lebih efisien | ⚠️ Ada delay + beban request periodik |
| Cocok jika | Punya akses server Nginx | Tidak punya akses konfigurasi Nginx |

**Rekomendasi utama: Gunakan Opsi A jika memungkinkan. Jika tidak, Opsi B sudah cukup untuk kasus ini.**

---

## Persyaratan Tambahan

- **Sembunyikan error SSE dari browser console** — Hapus kode berikut agar tidak mencemari log:
```javascript
    eventSource.onerror = function(err) {
        console.error("SSE Error:", err);
        eventSource.close();
        // Reconnect after 5 seconds
        setTimeout(setupProductRealtimeUpdates, 5000);
    };
```
Jika dibutuhkan, cukup gunakan `console.warn` dengan pesan yang tidak mencolok, atau hilangkan sama sekali agar console tetap bersih di production.

---

## File yang Perlu Dimodifikasi

### Opsi A
| File | Perubahan |
|------|-----------|
| `/etc/nginx/sites-available/[nama-site]` | Tambah konfigurasi SSE timeout & buffering di blok `location /api/` |

### Opsi B
| File | Perubahan |
|------|-----------|
| `dashboard.js` | Hapus `EventSource`, ganti dengan `setInterval` polling |
| `produk.js` | Hapus `EventSource`, ganti dengan `setInterval` polling |
| `ProductController.java` | Hapus endpoint `/stream` (opsional, cleanup) |
