# 🎯 PANDUAN LENGKAP PRESENTASI FINAL PROJECT
## UDARAAPI — SAAS AIR QUALITY & KARHUTLA TELEMETRY GATEWAY
**Presenter:** Hafiz Kurniawan (Lead Systems Architect)  
**Mata Kuliah:** Pemrograman Web Lanjut (PWS) — Semester Antara 2026

---

## ⏱️ STRUKTUR PRESENTASI (DURASI ± 7-10 MENIT)

```
[00:00 - 01:30] 1. Pembukaan, Latar Belakang & Elevator Pitch
[01:30 - 03:00] 2. Arsitektur SaaS & Tech Stack
[03:00 - 05:00] 3. Struktur Database (ERD) & Kompleksitas Data
[05:00 - 06:30] 4. Alur Kerja Sistem (Use Case & Swimlane Activity)
[06:30 - 08:30] 5. Live Demo Aplikasi (Landing Page, Sandbox, Dashboard, API Key)
[08:30 - 10:00] 6. Kesimpulan & Sesi Tanya Jawab (Q&A)
```

---

## 🎙️ SCRIPT & POIN BICARA PER BAGIAN

### 1. PEMBUKAAN & LATAR BELAKANG (1.5 Menit)
* **Salam Pembuka:**
  > "Selamat pagi/siang Bapak/Ibu Dosen penguji dan rekan-rekan sekalian. Saya **Hafiz Kurniawan**, akan mempresentasikan Final Project Pemrograman Web Lanjut berjudul **UdaraAPI**."

* **Masalah Riil (Problem Statement):**
  > "Di Indonesia, kebakaran hutan dan lahan (Karhutla) di Kalimantan, Sumatera, hingga Papua sering memicu bencana kabut asap pekat. Fenomena *Transboundary Haze* membuktikan bahwa polusi PM2.5 tidak mengenal sekat wilayah administratif. Sayangnya, data kualitas udara sering kali terfragmentasi dan sulit diakses oleh para developer secara terprogram."

* **Solusi & Elevator Pitch:**
  > "Oleh karena itu, lahirlah **UdaraAPI**—sebuah platform **SaaS (Software as a Service) RESTful API Gateway** yang terinspirasi dari model layanan *OpenWeather API* dan *OpenRouter*. Melalui platform ini, siapa pun dapat mendaftar mandiri, memperoleh API Key berkuota, dan mengintegrasikan telemetri ISPU real-time ke dalam sistem mereka."

---

### 2. ARSITEKTUR SAAS & TECH STACK (1.5 Menit)
* **Arsitektur Three-Tier:**
  1. **Presentation Layer:** Vanilla HTML5, CSS3 kustom (Tema *Flame Charcoal*), dan Vanilla JS untuk performa ultra-ringan tanpa framework bloat.
  2. **Application Layer:** Express.js (Node.js 20 LTS) sebagai serverless REST API Gateway yang menangani JWT Auth, HMAC API Key generation, CORS, security headers (Helmet), dan rate limiting.
  3. **Data Layer:** PostgreSQL 15 di Supabase dengan koneksi aman dan foreign key cascading.
  4. **Deployment:** 100% Serverless di Vercel Edge Network dengan CI/CD otomatis terhubung ke GitHub.

* **Keamanan Ganda (Dual-Layer Security):**
  * **JWT (JSON Web Token):** Untuk mengamankan sesi login developer pada dashboard (`Bearer Token` masa aktif 7 hari).
  * **HMAC-SHA256 API Key:** Kunci API 64-karakter unik dengan enkripsi hash untuk membatasi kuota panggilan data (100 request/hari).

---

### 3. DATABASE (ERD) & KOMPLEKSITAS DATA (2 Menit)
* **5 Tabel Relasional di PostgreSQL:**
  1. `users`: Menyimpan akun developer (UUID PK, email unik, hash bcrypt).
  2. `api_keys`: Menyimpan token API Key (UUID PK, FK ke `users`, rate limit, counter harian).
  3. `stations`: Master data 38 Stasiun Pemantau Kualitas Udara (SPKU) di 28 provinsi beserta koordinat GPS.
  4. `air_quality_records`: Rekam 69 data ISPU harian multi-parameter polutan (FK ke `stations`).
  5. `api_usage_logs`: Audit telemetri request real-time (FK ke `api_keys`, waktu respons ms, IP client, status code).

* **Kompleksitas Data yang Memenuhi Penilaian:**
  > "Syarat minimal project adalah 50 data. UdaraAPI menyediakan total **107 data utama** (38 stasiun + 69 rekam harian). Data ini sangat kompleks karena mencakup **6 parameter kimia udara** (PM2.5, PM10, SO2, CO, NO2, O3), **Indeks ISPU 0-500+**, penentuan **Parameter Kritis**, dan pemetaan ke **5 Kategori Permen LHK No. P.14/2020** (Baik, Sedang, Tidak Sehat, Sangat Tidak Sehat, dan Berbahaya)."

---

### 4. ALUR SISTEM (USE CASE & ACTIVITY DIAGRAM) (1.5 Menit)
* **2 Aktor Utama:**
  * **Developer:** Mendaftar akun, login JWT, generate API Key, dan memantau analitik penggunaan kuota pada dashboard.
  * **3rd-Party Client:** Memanggil endpoint publik seperti `/api/v1/stations` dan `/api/v1/records` menggunakan header `X-API-Key`.

* **3 Alur Swimlane Activity:**
  1. *Registrasi/Login:* Form input -> Express Backend hash password -> Simpan ke DB -> Kembalikan Token JWT.
  2. *Pembuatan API Key:* Dashboard request key -> Verify JWT -> Generate HMAC Key -> Simpan ke DB -> Tampilkan sekali di layar.
  3. *Konsumsi API:* Client request data -> Middleware cek API Key & sisa kuota -> DB query -> Response JSON 200 OK -> Catat audit log telemetri ke `api_usage_logs`.

---

### 5. LIVE DEMO WALKTHROUGH (2 Menit)
Urutan yang perlu Anda klik/demokan saat presentasi di browser:
1. **Buka Live URL:** `https://udara-api-final-project.vercel.app`
2. **Landing Page:** Tunjukkan radar ISPU visual, galeri foto kabut asap, section *Solidaritas Pray for Indonesia*, dan *Music Box respect*.
3. **Interactive Developer Sandbox:** Tunjukkan bagaimana developer bisa mencoba API langsung dari landing page (klik tombol 'Send Request' dan lihat JSON output real-time).
4. **Login / Register:** Masuk ke halaman login (`/login.html`), demokan proses login JWT.
5. **Dashboard Portal (`/dashboard.html`):**
   * Tunjukkan menu **Overview** (metrik real-time).
   * Tunjukkan menu **API Keys**: Buat satu key baru, perlihatkan key HMAC yang dihasilkan.
   * Tunjukkan menu **Usage**: Perlihatkan grafik log request yang tercatat secara dinamis dari database.

---

### 6. KESIMPULAN (30 Detik)
> "Kesimpulannya, UdaraAPI bukan hanya sekadar tugas kuliah, melainkan prototipe produk SaaS telemetri kualitas udara yang fungsional, aman dengan JWT dan API Key, memiliki database relasional 5 tabel yang kompleks, dan telah berjalan 100% secara live di Vercel. Terima kasih."

---

## ❓ ANTISIPASI TANYA JAWAB DOSEN (Q&A CHEAT SHEET)

#### 1. Dosen: *"Kenapa menggunakan model SaaS dengan API Key, bukan website biasa?"*
* **Jawaban:**  
  *"Karena data kualitas udara bernilai tinggi jika bisa dikonsumsi oleh aplikasi pihak ketiga (seperti aplikasi mobile cuaca, IoT smart home air purifier, atau riset akademis). Model SaaS dengan API Key memungkinkan kita mengontrol akses, menerapkan kuota rate-limiting (misal 100 req/hari), dan memonitor analitik penggunaan data secara terukur layaknya OpenWeather atau OpenRouter."*

#### 2. Dosen: *"Bagaimana cara kerja autentikasi JWT di sistem ini?"*
* **Jawaban:**  
  *"Saat developer login dengan email & password yang cocok (diverifikasi via bcrypt), backend Express membuat token JWT bertanda tangan digital (HMAC-SHA256) yang berisi payload ID dan email pengguna dengan masa berlaku 7 hari. Setiap kali browser mengakses endpoint dashboard, token dikirim melalui header `Authorization: Bearer <token>` dan diverifikasi oleh middleware `requireAuth` sebelum diizinkan mengakses database."*

#### 3. Dosen: *"Bagaimana membedakan autentikasi JWT dengan autentikasi API Key?"*
* **Jawaban:**  
  *"JWT digunakan untuk **autentikasi sesi developer di dashboard web**, sedangkan API Key (`X-API-Key`) digunakan untuk **autentikasi pemanggilan data mesin/aplikasi pihak ketiga** terhadap endpoint `/api/v1/*`. Ini memisahkan kredensial akun pengguna dengan kredensial akses data programatik."*

#### 4. Dosen: *"Apakah rate limit dan pencatatan log benar-benar tersimpan di database?"*
* **Jawaban:**  
  *"Benar. Setiap kali ada request masuk dengan header `X-API-Key`, middleware akan mengecek kolom `requests_today` dan `rate_limit_per_day` pada tabel `api_keys`. Jika kuota masih ada, data dikirim dan otomatis dicatat satu baris log baru ke tabel `api_usage_logs` berisi endpoint yang dipanggil, waktu respons (ms), status code, dan IP client."*

#### 5. Dosen: *"Berapa banyak data yang sudah dimasukkan dan apa saja kompleksitasnya?"*
* **Jawaban:**  
  *"Terdapat total **107 data**, terdiri dari 38 stasiun pemantau di 28 provinsi dan 69 data rekam harian. Kompleksitasnya mencakup 6 parameter kimiawi (PM2.5, PM10, SO2, CO, NO2, O3), formula perhitungan indeks ISPU 0-500+, penentuan polutan kritis penentu bahaya, dan pemetaan ke 5 skala mutu udara standar Permen LHK No. P.14/2020."*
