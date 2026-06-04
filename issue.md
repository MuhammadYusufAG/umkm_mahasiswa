# Rencana Setup Project Spring Boot UMKM

Dokumen ini berisi panduan tingkat tinggi (high-level planning) untuk melakukan setup awal project Spring Boot dengan dependensi yang ditentukan, hingga struktur folder dan instalasi selesai.

## Deskripsi Tugas
Melakukan inisialisasi project Spring Boot baru di dalam folder ini dan mengonfigurasi seluruh dependensi dasar yang dibutuhkan, serta menyiapkan struktur folder standar agar siap digunakan untuk pengembangan fitur berikutnya.

## Kebutuhan Project & Dependensi

1. **Framework Utama**: Spring Boot (disarankan versi stabil terbaru, misalnya 3.x)
2. **Dependensi Terpilih**:
   - **Spring Web**: Untuk menangani request web/MVC.
   - **Thymeleaf**: Sebagai template engine untuk UI.
   - **Spring Security**: Untuk keamanan dan autentikasi.
   - **Lombok**: Untuk mereduksi boilerplate code (getter, setter, builder, dll.).
   - **MySQL Driver**: Untuk koneksi ke database MySQL.
   - **Spring Data JPA**: Untuk interaksi dengan database menggunakan ORM.
   - **Spring Boot Validation**: Untuk validasi input data.
   - **Tailwind CSS**: Framework CSS utility-first untuk styling halaman Thymeleaf.

---

## Langkah-Langkah Implementasi (High-Level)

### 1. Inisialisasi Project Spring Boot
- Buat project Spring Boot baru langsung di dalam direktori saat ini (`./`).
- Gunakan Maven atau Gradle (disarankan Maven dengan Java 17 atau yang lebih baru).
- Tentukan Group ID dan Artifact ID yang sesuai (misalnya `com.umkm` atau sejenisnya).
- Masukkan semua dependensi Spring Boot yang dibutuhkan:
  - Spring Web
  - Thymeleaf
  - Spring Security
  - Lombok
  - MySQL Driver
  - Spring Data JPA
  - Validation

### 2. Setup Tailwind CSS
- Integrasikan Tailwind CSS ke dalam project Spring Boot.
- Konfigurasikan agar Tailwind CSS memindai file template Thymeleaf (`.html`) untuk utility classes.
- Jalankan proses build/watch CSS agar file output CSS ter-generate dan dapat di-load oleh Thymeleaf.

### 3. Konfigurasi Awal Aplikasi
- Siapkan file `application.properties` atau `application.yml`.
- Konfigurasikan koneksi database MySQL dasar (URL, username, password).
- Tambahkan konfigurasi dasar Spring Security (misalnya menonaktifkan sementara atau menyiapkan form login default agar tidak menghalangi pengujian awal).

### 4. Setup Struktur Folder
- Buat struktur paket (packages) standar di bawah `src/main/java/<group>/<artifact>/`:
  - `config` (Konfigurasi Spring Security, MVC, dll.)
  - `controller` (Web controller)
  - `model` / `entity` (Entitas database JPA)
  - `repository` (Interface Spring Data JPA)
  - `service` (Logika bisnis)
  - `dto` (Data Transfer Object untuk request/response)
- Buat struktur folder di `src/main/resources/`:
  - `templates/` (Untuk file HTML Thymeleaf)
  - `static/` (Untuk asset statis seperti CSS hasil compile Tailwind, JS, gambar)

---

## Kriteria Selesai (Definition of Done)
1. Project Spring Boot berhasil terinisialisasi tanpa error.
2. File konfigurasi database dan dependensi terinstal dengan benar (bisa dicek melalui `pom.xml` atau `build.gradle`).
3. Tailwind CSS terpasang dan file output CSS berhasil di-generate ke folder static.
4. Aplikasi dapat di-build dan dijalankan secara lokal (running status `UP`) tanpa error.
