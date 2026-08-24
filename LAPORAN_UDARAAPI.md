# 📋 Laporan Final Project — UdaraAPI SaaS Platform

| **Mata Kuliah** | Pengembangan Web Service (PWS) |
| **Semester** | Semester Antara 2026 |
| **Repositori GitHub** | [https://github.com/wpiskaa/UdaraAPI_FinalProject](https://github.com/wpiskaa/UdaraAPI_FinalProject) |
| **Live Deployment (Vercel)** | [https://udara-api-final-project.vercel.app](https://udara-api-final-project.vercel.app) |
| **Dokumentasi API** | [https://udara-api-final-project.vercel.app/#endpoints](https://udara-api-final-project.vercel.app/#endpoints) |

---

## 1. Deskripsi & Latar Belakang Proyek

**UdaraAPI** adalah platform SaaS (Software as a Service) berbasis REST API yang menyediakan data Indeks Standar Pencemaran Udara (**ISPU**) dan konsentrasi polutan udara di seluruh Indonesia.

Masalah polusi udara dan bencana asap akibat kebakaran hutan dan lahan (karhutla) merupakan isu nyata yang berulang setiap tahun di Indonesia (terutama di wilayah Riau, Jambi, Sumatera Selatan, dan Kalimantan Tengah). Platform UdaraAPI dirancang untuk memfasilitasi developer, peneliti, instansi kesehatan, dan pembuat aplikasi IoT agar dapat dengan mudah mengintegrasikan data kualitas udara real-time maupun historis ke dalam sistem mereka menggunakan **API Key** yang aman dan terukur.

---

## 2. Tech Stack

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Backend Runtime** | Node.js | Environment eksekusi server |
| **Framework** | Express.js | REST API routing & middleware |
| **Database** | PostgreSQL / Supabase | Relational Database terkelola |
| **Authentication** | JWT (jsonwebtoken) & bcryptjs | Autentikasi user & hash password |
| **Authorization / API Gate** | API Key (`ck_live_...`) | Validasi akses data & rate limiting harian |
| **Deployment** | Vercel | Serverless hosting platform |
| **Frontend** | HTML5, Vanilla CSS, JavaScript | Responsive UI + Canvas particle |

---

## 3. Database Schema & ERD

### Entity Relationship Diagram
- **users** (1) ── (N) **api_keys**
- **api_keys** (1) ── (N) **api_usage_logs**
- **stations** (1) ── (N) **air_quality_records**

### Deskripsi Tabel:
1. **`users`**: Identitas developer (Email, password ter-hash bcrypt, tier plan).
2. **`api_keys`**: Kunci API unik milik user beserta kuota harian (`rate_limit_per_day`) dan counter request.
3. **`stations`**: Stasiun Pemantau Kualitas Udara (SPKU) di 38 provinsi (latitude, longitude, operator).
4. **`air_quality_records`**: Pembacaan parameter polutan harian (PM2.5, PM10, SO2, CO, NO2, O3, skor ISPU, status/kategori).
5. **`api_usage_logs`**: Log audit request untuk analitik konsumsi di dashboard.

---

## 4. Spesifikasi Endpoint REST API

### 4.1 Autentikasi User (JWT)
- `POST /auth/register` — Pendaftaran akun (body: `name`, `email`, `password`)
- `POST /auth/login` — Login akun, menghasilkan JWT Bearer Token
- `GET /auth/me` — Profil user yang sedang login

### 4.2 Manajemen Dashboard (JWT Protected)
- `GET /dashboard/keys` — Menampilkan semua API Key milik user
- `POST /dashboard/keys` — Membuat API Key baru
- `PATCH /dashboard/keys/:id` — Mengaktifkan/menonaktifkan API Key
- `DELETE /dashboard/keys/:id` — Menghapus API Key
- `GET /dashboard/usage` — Analitik agregasi konsumsi 7 hari terakhir

### 4.3 Data Kualitas Udara (API Key Protected)
- `GET /api/v1/stations` — Daftar seluruh SPKU (filter: `province`, `city`, `search`, `page`, `limit`)
- `GET /api/v1/stations/provinces` — Agregasi daftar provinsi yang memiliki stasiun
- `GET /api/v1/stations/:id` — Detail satu stasiun
- `GET /api/v1/stations/:id/records` — Riwayat pembacaan khusus stasiun tertentu
- `GET /api/v1/records` — Seluruh data rekam udara (filter: `kategori`, `province`, `tanggal_mulai`, `tanggal_akhir`, `sort`, `order`)
- `GET /api/v1/records/latest` — Kondisi udara terkini (1 rekam terbaru per stasiun)
- `GET /api/v1/records/berbahaya` — Filter khusus zona `SANGAT TIDAK SEHAT` & `BERBAHAYA`
- `GET /api/v1/stats` — Statistik ringkas platform (Endpoint Public)

---

## 5. Deployment Guide (Vercel)

1. Push folder proyek ke repository GitHub.
2. Buka dashboard [Vercel](https://vercel.com) → Import Repository.
3. Masukkan Environment Variables:
   - `SUPABASE_URL` = `https://hblbwumwayrhvrzxwygi.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your_supabase_service_role_key_here`
   - `JWT_SECRET` = `your_jwt_secret_key_here`
4. Tekan tombol **Deploy**.
