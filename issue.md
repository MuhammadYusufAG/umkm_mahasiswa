# Fitur: Persiapan Deployment ke VPS dengan MariaDB

## Latar Belakang
Aplikasi saat ini berjalan di lingkungan lokal menggunakan MySQL. Untuk dipindahkan ke VPS, dibutuhkan beberapa penyesuaian agar aplikasi dapat berjalan dengan baik menggunakan **MariaDB**, serta menjadi lebih aman dan mudah dikonfigurasi di server produksi.

---

## Rencana Persiapan (High-Level)

### 1. Kompatibilitas Database: MySQL → MariaDB
MariaDB kompatibel dengan MySQL, sehingga perubahan yang dibutuhkan minimal:
- Di `pom.xml`: Tambahkan dependensi **MariaDB JDBC Connector** (`org.mariadb.jdbc:mariadb-java-client`) sebagai alternatif atau pengganti `mysql-connector-j`.
- Di `application.properties`: Ubah URL koneksi dari `jdbc:mysql://` menjadi `jdbc:mariadb://`. Ubah juga `driver-class-name` ke driver MariaDB (`org.mariadb.jdbc.Driver`).
- Pastikan `spring.jpa.properties.hibernate.dialect` tetap menggunakan `MySQLDialect` atau diganti ke `MariaDBDialect` jika tersedia di versi Hibernate yang dipakai.

### 2. Manajemen Konfigurasi dengan Spring Profiles
Saat ini semua konfigurasi ada dalam satu file `application.properties`. Untuk kebutuhan VPS (produksi), pisahkan konfigurasi menjadi dua profil:
- `application.properties`: Berisi konfigurasi umum dan default (development).
- `application-prod.properties`: Berisi konfigurasi khusus produksi (koneksi MariaDB VPS, port, dsb). File ini **tidak** perlu di-commit ke GitHub (tambahkan ke `.gitignore`).
- Di VPS, jalankan aplikasi dengan mengaktifkan profil produksi: `java -jar umkm.jar --spring.profiles.active=prod`.

### 3. Konfigurasi Sensitif via Environment Variables
Pastikan data sensitif (password database, kunci rahasia, dll) tidak di-hardcode, melainkan dibaca dari *environment variable* sistem. Pola `${DB_PASSWORD}` yang sudah ada di `application.properties` sudah benar, tinggal pastikan variabel-variabel tersebut di-set di VPS (misalnya melalui file `/etc/environment` atau `systemd` service unit).

### 4. Keamanan Produksi
- Ubah `spring.jpa.hibernate.ddl-auto` dari `update` menjadi `validate` atau `none` di profil produksi. Ini untuk mencegah Hibernate mengubah struktur database secara otomatis di server produksi.
- Nonaktifkan `spring.jpa.show-sql=true` di profil produksi agar log SQL tidak membanjiri log server.
- Pertimbangkan menambahkan konfigurasi HTTPS / SSL di level Nginx sebagai *reverse proxy* di depan aplikasi.

### 5. Build Artifact (JAR File)
- Pastikan proyek dapat di-build menjadi file `.jar` yang berdiri sendiri (*fat JAR / uber JAR*) menggunakan perintah: `./mvnw clean package -DskipTests`.
- Hasilnya adalah file `target/umkm-*.jar` yang bisa langsung dijalankan di VPS.

### 6. Konfigurasi Upload File di VPS
- Saat ini, file upload disimpan di folder `/uploads/` relatif terhadap direktori kerja aplikasi.
- Di VPS, tentukan dan pastikan path absolut untuk folder upload ada dan memiliki izin tulis yang benar.
- Konfigurasi di `application-prod.properties` untuk menentukan path absolut folder upload (jika diperlukan).

### 7. Opsional: Docker Compose untuk Kemudahan Deploy
Siapkan file `docker-compose.yml` yang berisi dua service:
- Service `db`: MariaDB dengan database `db_umkm`.
- Service `app`: Aplikasi Spring Boot yang membaca konfigurasi dari environment variable.

Pendekatan ini membuat deployment di VPS menjadi sangat sederhana hanya dengan menjalankan `docker-compose up -d`.

---

## Catatan Penting
- Prioritaskan poin 1–5 sebagai minimum yang wajib dikerjakan sebelum pindah ke VPS.
- Poin 6 dan 7 bersifat opsional namun sangat direkomendasikan untuk kemudahan jangka panjang.
