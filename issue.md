# Fitur: Database Otomatis Dibuat Saat Deploy ke VPS

## Latar Belakang
Saat ini, konfigurasi produksi (`application-prod.properties`) menggunakan `spring.jpa.hibernate.ddl-auto=validate`. Ini berarti ketika aplikasi pertama kali dijalankan di VPS dengan database MariaDB yang masih kosong, aplikasi akan **langsung error** karena tidak ada tabel yang ditemukan.

Kita perlu mekanisme agar database dan semua tabelnya **dibuat secara otomatis** saat pertama kali aplikasi dijalankan di server baru, tanpa perlu menjalankan SQL secara manual.

---

## Rencana Penyelesaian (High-Level)

### Pilihan Pendekatan: Flyway (Direkomendasikan)

Gunakan **Flyway** sebagai solusi *database migration*. Flyway adalah library yang akan:
1. Secara otomatis mendeteksi file SQL migrasi yang kita sediakan.
2. Menjalankan file SQL tersebut untuk membuat tabel saat aplikasi pertama kali dijalankan.
3. Melacak versi migrasi yang sudah dijalankan agar tidak diulang.

### 1. Tambahkan Dependensi Flyway ke `pom.xml`
Tambahkan dependency `spring-boot-starter-flyway` atau `flyway-core` ke dalam `pom.xml`. Spring Boot akan secara otomatis mendeteksi dan menginisialisasi Flyway.

### 2. Buat File Migrasi SQL
Flyway membaca file SQL dari direktori `src/main/resources/db/migration/`. Buat sebuah file di sana dengan format nama yang Flyway kenali, misalnya:
```
src/main/resources/db/migration/V1__initial_schema.sql
```

Isi file ini dapat diambil dari `schema.sql` yang sudah ada di root proyek, namun **tanpa** perintah `DROP TABLE` (karena di produksi kita tidak ingin menghapus data yang sudah ada).

### 3. Sesuaikan Konfigurasi Produksi
Di `application-prod.properties`, ubah konfigurasi DDL Hibernate agar tidak berkonflik dengan Flyway:
- Ubah `spring.jpa.hibernate.ddl-auto` dari `validate` menjadi `none` (Flyway yang akan mengurus pembuatan skema, bukan Hibernate).

### 4. Konfigurasi Lokal (Development)
Di `application-local.properties`, Flyway bisa tetap aktif atau dinonaktifkan. Disarankan dinonaktifkan di lokal (`spring.flyway.enabled=false`) karena lokal masih menggunakan `ddl-auto=update` yang lebih fleksibel untuk pengembangan aktif.

---

## Catatan Penting
- File migrasi Flyway bersifat **tidak boleh diubah setelah di-commit**. Jika ada perubahan skema di masa depan, buat file migrasi baru (misal: `V2__add_column_xyz.sql`).
- Pendekatan ini juga memudahkan migrasi skema ke depannya secara terstruktur dan terdokumentasi.
- Alternatif yang lebih sederhana (tapi kurang direkomendasikan untuk produksi) adalah menggunakan `spring.sql.init.mode=always` bersama dengan konfigurasi `spring.datasource.schema=classpath:schema.sql`. Namun, ini kurang andal dibanding Flyway.

---

## Tambahan: Nonaktifkan OpenAPI/Swagger UI di Produksi

Saat ini proyek menggunakan `springdoc-openapi` yang menampilkan Swagger UI (`/swagger-ui.html`) dan dokumentasi API (`/v3/api-docs`). Halaman ini **tidak aman untuk dibuka ke publik** di VPS karena:
- Mengekspos seluruh daftar endpoint API beserta parameternya.
- Memungkinkan siapapun mencoba memanggil endpoint langsung dari browser.
- Membantu *attacker* memetakan celah keamanan aplikasi.

**Langkah yang perlu dilakukan**: Di `application-prod.properties`, tambahkan konfigurasi berikut untuk menonaktifkan Swagger UI sepenuhnya di lingkungan produksi:
```properties
springdoc.swagger-ui.enabled=false
springdoc.api-docs.enabled=false
```

Di `application-local.properties`, biarkan tetap aktif (default) untuk kemudahan pengembangan.
