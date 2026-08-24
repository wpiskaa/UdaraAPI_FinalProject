# 🌫️ UdaraAPI — Indonesian Air Quality (ISPU) Data SaaS Platform

> REST API penyedia data **Indeks Standar Pencemaran Udara (ISPU)** & parameter polutan (PM2.5, PM10, SO2, CO, NO2, O3) di seluruh Indonesia via API Key.
> Dibangun dengan **Express.js**, **Supabase (PostgreSQL)**, **JWT Authentication**, dan dideploy di **Vercel**.

---

## ✨ Fitur Unggulan

- 🔐 **JWT Authentication** — Registrasi & login developer aman dengan JSON Web Token
- 🔑 **API Key Management** — Generate, revoke, monitor rate limit API Key
- 📊 **Usage Analytics** — Tracking konsumsi harian & log request otomatis
- 🚦 **Rate Limiting** — Kuota harian (Free: 100 req/hari, Pro: 10.000 req/hari)
- 📡 **38 Stasiun SPKU** — Stasiun pemantau resmi di seluruh provinsi Indonesia
- 🌫️ **65+ Rekam ISPU** — Data riil termasuk simulasi musim karhutla (Riau, Palangka Raya, Jambi, dll)
- 🌐 **Modern Landing Page** — Interactive UI dengan efek asap canvas & live ticker ISPU

---

## 🗃️ Skema Database

| Tabel | Deskripsi |
|---|---|
| `users` | Akun developer (nama, email, hash password, tier plan) |
| `api_keys` | Kunci API developer dengan limit kuota harian |
| `stations` | Data Stasiun Pemantau Kualitas Udara (SPKU) se-Indonesia |
| `air_quality_records` | Data polutan harian & status ISPU per stasiun |
| `api_usage_logs` | Audit log request API untuk grafik statistik |

---

## 📡 Daftar Endpoint API

Semua endpoint data membutuhkan header:
```
X-API-Key: ck_live_xxxxxxxxxxxxxxxx
```

### Stasiun (SPKU)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/stations` | List semua stasiun pemantau |
| GET | `/api/v1/stations/provinces` | List provinsi yang memiliki stasiun |
| GET | `/api/v1/stations/:id` | Detail spesifik satu stasiun |
| GET | `/api/v1/stations/:id/records` | Riwayat pembacaan di stasiun tersebut |

### Data Kualitas Udara (ISPU)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/v1/records` | List rekam ISPU (filter kategori, provinsi, tanggal) |
| GET | `/api/v1/records/latest` | Snapshot terkini kualitas udara per stasiun |
| GET | `/api/v1/records/berbahaya` | Filter khusus zona SANGAT TIDAK SEHAT & BERBAHAYA |
| GET | `/api/v1/stats` | Statistik platform (**Public / Bebas API Key**) |

---

## 🚀 Panduan Setup & Menjalankan

### 1. Jalankan Database di Supabase
1. Buka project Supabase → **SQL Editor**
2. Jalankan isi file `database/schema.sql`
3. Jalankan isi file `database/seed.sql`

### 2. Konfigurasi Environment (`.env`)
```env
SUPABASE_URL=https://hblbwumwayrhvrzxwygi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

### 3. Jalankan Lokal
```bash
npm run dev
# Buka http://localhost:3000
```

---

## 📄 Laporan Proyek
Dokumen laporan lengkap mencakup ERD, Use Case Diagram, Activity Diagram, dan dokumentasi arsitektur tersedia di [`LAPORAN_UDARAAPI.md`](./LAPORAN_UDARAAPI.md).
