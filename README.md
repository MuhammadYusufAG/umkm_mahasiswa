# UNIP Market (UMKM Mahasiswa)

Proyek ini adalah aplikasi Spring Boot untuk marketplace UMKM Mahasiswa UNIP. Panduan ini akan membantu Anda untuk melakukan setup dan menjalankan aplikasi secara lokal.

## 🛠 Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan sistem Anda telah terinstal perangkat lunak berikut:

1. **Java Development Kit (JDK) 21**: Proyek ini menggunakan Java 21. Pastikan `JAVA_HOME` Anda mengarah ke instalasi JDK 21.
2. **Database MySQL**: MySQL Server harus sudah terinstal dan berjalan di komputer Anda.
3. **IDE (Opsional)**: Direkomendasikan menggunakan IntelliJ IDEA, Visual Studio Code, atau Eclipse dengan ekstensi Java.

## ⚙️ Konfigurasi Awal

Aplikasi ini menggunakan Environment Variables untuk mengamankan data kredensial (seperti username/password database) agar tidak terekspos di repositori. 

Secara default, aplikasi akan berjalan menggunakan fallback nilai lokal berikut:
*   `DB_URL`: `jdbc:mysql://localhost:3306/db_umkm?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC`
*   `DB_USERNAME`: `root`
*   `DB_PASSWORD`: ``

Jika Anda perlu menyesuaikan kredensial database di komputer lokal Anda:
1. Atur Environment Variables di sistem operasi Anda:
   *   `DB_URL`
   *   `DB_USERNAME`
   *   `DB_PASSWORD`
2. Atau, jalankan aplikasi dengan menyertakan variabel tersebut, contoh:
   *   Linux/macOS: `DB_PASSWORD=password_anda ./mvnw spring-boot:run`
   *   Windows (CMD): `set DB_PASSWORD=password_anda && mvnw.cmd spring-boot:run`
   *   Windows (PowerShell): `$env:DB_PASSWORD="password_anda"; mvnw.cmd spring-boot:run`


## 🚀 Cara Menjalankan Aplikasi

Anda tidak perlu menginstal Maven secara global di sistem Anda, karena proyek ini sudah menyertakan Maven Wrapper (`mvnw`).

1. **Buka Terminal/Command Prompt** di direktori root proyek ini.
2. **Compile proyek** (opsional, untuk memastikan tidak ada error kompilasi):
   - Linux/macOS: `./mvnw clean compile`
   - Windows: `mvnw.cmd clean compile`
3. **Jalankan aplikasi**:
   - Linux/macOS: `./mvnw spring-boot:run`
   - Windows: `mvnw.cmd spring-boot:run`

## 🌐 Akses Aplikasi & Autentikasi

Setelah aplikasi berhasil berjalan, Anda dapat mengaksesnya melalui browser:

* **URL Akses**: [http://localhost:8081/login](http://localhost:8081/login)

**Login Bawaan (Spring Security):**
Secara default, Spring Security mengamankan aplikasi. Username bawaannya adalah `user`, dan password akan di-generate secara acak setiap kali aplikasi dijalankan. Anda dapat melihat password ini di log console terminal Anda, seperti contoh berikut:

```
Using generated security password: a982febd-6290-409e-bb1a-28dec2b77da2
```
Gunakan password tersebut untuk masuk.
