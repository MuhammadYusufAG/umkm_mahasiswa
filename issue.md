# Bug Fix: Penjual Tidak Bisa Hapus Pesanan yang Selesai

## Latar Belakang
Ketika penjual mencoba menghapus pesanan berstatus **Selesai** atau **Dibatalkan** di halaman Pesanan, operasi gagal.

**Penyebab Root**: Tabel `chat_messages` memiliki foreign key yang mengacu ke tabel `orders`. Saat pesanan dihapus, database menolak (constraint violation) karena masih ada data chat terkait pesanan tersebut.

## Yang Perlu Dilakukan

### Backend — `Order.java`
Tambahkan relasi dari `Order` ke `ChatMessage` dengan opsi cascade delete, sehingga saat sebuah pesanan dihapus, semua pesan chat-nya ikut terhapus secara otomatis.

### Verifikasi
Setelah perbaikan, coba hapus pesanan yang sudah memiliki histori chat. Tidak boleh ada error SQL constraint.

## File yang Perlu Diubah
- `src/main/java/com/umkm/entity/Order.java`
