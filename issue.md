# Fitur: Membuat Dokumentasi Skema Database dalam Format SQL

## Latar Belakang
Saat ini, skema database dibuat secara otomatis oleh Hibernate (Spring JPA) berdasarkan anotasi di kelas Entity Java. Tidak ada file SQL resmi yang mendokumentasikan struktur tabel secara eksplisit. Hal ini menyulitkan proses:
- Migrasi database ke VPS/MariaDB secara manual
- Pembuatan database baru dari nol tanpa perlu menjalankan aplikasi terlebih dahulu
- Pemahaman cepat bagi anggota tim baru tentang struktur data

## Tujuan
Membuat file `schema.sql` yang berisi perintah SQL `CREATE TABLE` untuk semua tabel yang ada di database aplikasi ini.

---

## Rencana Pembuatan (High-Level)

### 1. Identifikasi Semua Tabel
Berdasarkan Entity yang ada di dalam kode, tabel-tabel yang perlu didokumentasikan adalah:

| Nama Tabel | Berdasarkan Entity |
|---|---|
| `users` | `User.java` |
| `products` | `Product.java` |
| `orders` | `Order.java` |
| `order_items` | `OrderItem.java` |
| `chat_messages` | `ChatMessage.java` |
| `password_reset_token` | `PasswordResetToken.java` |

### 2. Buat File `schema.sql`
Buat sebuah file SQL di direktori root proyek dengan nama `schema.sql`.

Isi file ini harus mencakup:
- Statement `CREATE TABLE IF NOT EXISTS` untuk setiap tabel di atas
- Definisi kolom lengkap: nama, tipe data, ukuran, dan constraint (`NOT NULL`, `UNIQUE`, `DEFAULT`)
- Definisi primary key dan foreign key untuk setiap tabel
- Agar mudah di-reset, sertakan `DROP TABLE IF EXISTS` di bagian awal, **dalam urutan yang benar** (tabel yang memiliki foreign key dihapus lebih dulu dari tabel induknya)

### 3. Detail Skema Berdasarkan Entity

- **`users`**: id (PK), username (UNIQUE NOT NULL), email (UNIQUE NOT NULL), password (NOT NULL), role (ENUM: BUYER/SELLER, NOT NULL)
- **`products`**: id (PK), name, category, description, price, stock, is_active, image_url, ingredients, seller_id (FK → users.id)
- **`orders`**: id (PK), buyer_id (FK → users.id), seller_id (FK → users.id), buyer_name, seller_name, notes, total_price, status (ENUM: BARU/DIPROSES/SELESAI/DIBATALKAN), created_at
- **`order_items`**: id (PK), order_id (FK → orders.id), product_id (FK → products.id), product_name, product_image_url, quantity, price, notes
- **`chat_messages`**: id (PK), order_id (FK → orders.id), sender_role, content (TEXT), created_at
- **`password_reset_token`**: id (PK), token, user_id (FK → users.id), expiry_date

### 4. Kompatibilitas MariaDB
Pastikan tipe data dan sintaks SQL yang digunakan kompatibel dengan **MariaDB**:
- Gunakan `BIGINT AUTO_INCREMENT` untuk kolom id
- Gunakan `DECIMAL(19,2)` untuk kolom harga
- Gunakan `ENUM(...)` atau `VARCHAR` untuk kolom status dan role
- Gunakan `DATETIME` untuk kolom timestamp

---

## Catatan Penting
- File `schema.sql` ini bersifat dokumentasi sekaligus dapat langsung dijalankan untuk membuat database dari nol.
- Jika sudah ada data penting di database lokal, tambahkan juga file `data.sql` opsional berisi contoh data awal (*seed data*) untuk kemudahan pengembangan.
