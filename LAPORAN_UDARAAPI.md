# LAPORAN FINAL PROJECT
## PEMROGRAMAN WEB LANJUT (PWS) — SEMESTER ANTARA 2026

---

# UdaraAPI · SI-ASAP
### *Platform SaaS Telemetri Kualitas Udara & Sistem Peringatan Dini Bencana Karhutla Indonesia*

**Disusun Oleh:**  
**Hafiz Kurniawan**  
*Lead Systems Architect & Environmental Data Engineer*  
Program Studi Informatika

**Live Production URL:** [https://udara-api-final-project.vercel.app](https://udara-api-final-project.vercel.app)  
**GitHub Repository:** [https://github.com/wpiskaa/UdaraAPI_FinalProject](https://github.com/wpiskaa/UdaraAPI_FinalProject)  
**PDF Report File:** [`LAPORAN_FINAL_PROJECT_UDARAAPI.pdf`](./LAPORAN_FINAL_PROJECT_UDARAAPI.pdf)

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Indonesia sering menghadapi ancaman kebakaran hutan dan lahan (Karhutla) yang melepaskan jutaan partikel debu halus dan polutan berbahaya seperti PM2.5, PM10, SO₂, CO, NO₂, dan O₃. Fenomena *transboundary haze* (kabut asap lintas batas) membuktikan bahwa pencemaran udara tidak mengenal sekat administratif.

**UdaraAPI** hadir sebagai solusi berbasis SaaS (*Software as a Service*) yang menyediakan gateway RESTful API terstandarisasi untuk data Indeks Standar Pencemar Udara (ISPU) dari seluruh Indonesia. Model layanannya terinspirasi dari platform API global seperti *OpenWeather API* dan *OpenRouter*—di mana pengembang (developer), peneliti, instansi pemerintah, dan startup dapat mendaftarkan akun, mengelola API Key berkuota, dan mengintegrasikan telemetri udara ke dalam aplikasi mereka.

### 1.2 Kesesuaian Syarat Final Project
| Kriteria Penilaian | Implementasi pada UdaraAPI | Status |
| :--- | :--- | :---: |
| **Model SaaS (Software as a Service)** | Gateway REST API publik dengan sistem registrasi mandiri, manajemen API Key berkuota (rate limiting 100 req/hari), dan audit log request. | ✅ Selesai & Teruji |
| **Minimal 2 Tabel Relasional** | Menggunakan **5 tabel relasional** (`users`, `api_keys`, `stations`, `air_quality_records`, `api_usage_logs`) dengan foreign key cascade dan indexing. | ✅ 5 Tabel |
| **Autentikasi JWT** | Proteksi endpoint dashboard menggunakan JSON Web Token (Bearer Auth) dan enkripsi password menggunakan bcrypt (10 salt rounds). | ✅ Selesai & Teruji |
| **Minimal 50 Data & Kompleksitas** | Tersedia **38 Stasiun SPKU Aktif** di 28 provinsi dan **69 Rekam ISPU Harian** multi-parameter kimia udara sesuai standar Permen LHK No. P.14/2020. | ✅ 69 Data |
| **Deploy di Vercel** | Berjalan 100% serverless di Vercel Edge Network terhubung ke PostgreSQL Supabase. | ✅ Live & Teruji |
| **Diagram Lengkap** | Dilengkapi ERD, Use Case Diagram, Activity/User Flow Diagram (Swimlane), dan Dokumentasi API lengkap. | ✅ Lengkap di PDF |

---

## 2. Arsitektur Sistem & Tech Stack

Sistem dibangun menggunakan arsitektur **Three-Tier Architecture**:
1. **Presentation Layer**: Landing page informatif, Interactive API Sandbox Console, Dinding Doa Karhutla, Music Box Player, dan Dashboard Developer (`HTML5`, `CSS3 (Vanilla)`, `JavaScript`).
2. **Application Layer**: RESTful API Server, JWT Middleware, HMAC Key Generator, dan Rate Limiter (`Node.js v20 LTS`, `Express.js v4`, `bcryptjs`, `jsonwebtoken`, `helmet`, `cors`).
3. **Data Layer**: Relational Database PostgreSQL yang di-hosting di `Supabase` dengan connection pooling.
4. **Cloud Infrastructure**: Serverless Deployment di `Vercel` dengan CI/CD otomatis dari GitHub.

---

## 3. Entity Relationship Diagram (ERD)

### 3.1 Struktur 5 Tabel Database

```mermaid
erDiagram
    users ||--o{ api_keys : "owns (1:N)"
    api_keys ||--o{ api_usage_logs : "tracks (1:N)"
    stations ||--o{ air_quality_records : "measures (1:N)"

    users {
        uuid id PK "UUID default uuid_generate_v4()"
        varchar name "Nama Lengkap Developer"
        varchar email UK "Email Login Unik"
        varchar password_hash "Hash Password Bcrypt"
        varchar plan "Tier (free/pro/enterprise)"
        boolean is_active "Status Keaktifan"
        timestamptz created_at "Timestamp Registrasi"
    }

    api_keys {
        uuid id PK "UUID default uuid_generate_v4()"
        uuid user_id FK "References users(id)"
        varchar key_name "Label Key"
        varchar api_key UK "HMAC-SHA256 Token"
        int rate_limit_per_day "Batas Request Harian (100)"
        int requests_today "Counter Hari Ini"
        bigint total_requests "Total Akumulasi Request"
        boolean is_active "Status Aktif"
    }

    api_usage_logs {
        bigserial id PK "ID Log Audit"
        uuid api_key_id FK "References api_keys(id)"
        varchar endpoint "Path Endpoint"
        varchar method "HTTP Method"
        int status_code "HTTP Status Code"
        int response_time_ms "Latensi Eksekusi (ms)"
        varchar ip_address "IP Client"
        timestamptz created_at "Waktu Panggilan"
    }

    stations {
        serial id PK "ID Stasiun"
        varchar name "Nama SPKU"
        varchar city "Kota Lokasi"
        varchar province "Provinsi (38 Provinsi)"
        decimal latitude "Koordinat GPS Lintang"
        decimal longitude "Koordinat GPS Bujur"
        varchar operator "Pengelola (KLHK/BMKG/DLH)"
        boolean is_active "Status Operasional"
    }

    air_quality_records {
        serial id PK "ID Rekam Data"
        int station_id FK "References stations(id)"
        date tanggal "Tanggal Pengukuran"
        decimal pm25 "PM2.5 (µg/m³)"
        decimal pm10 "PM10 (µg/m³)"
        decimal so2 "SO₂ (µg/m³)"
        decimal co "CO (ppm)"
        decimal no2 "NO₂ (µg/m³)"
        decimal o3 "O₃ (µg/m³)"
        int ispu "Nilai ISPU (0-500+)"
        varchar kategori "BAIK/SEDANG/TIDAK SEHAT/SANGAT TIDAK SEHAT/BERBAHAYA"
        varchar parameter_kritis "Polutan Dominan"
    }
```

---

## 4. Use Case Diagram

```mermaid
flowchart LR
    Dev((Developer / User))
    App((3rd-Party App))

    subgraph UdaraAPI_Platform ["SISTEM UdaraAPI SAAS PLATFORM"]
        subgraph Auth_Group ["Autentikasi & Akun"]
            UC1([UC-01: Registrasi Akun])
            UC2([UC-02: Login & Dapatkan JWT])
            UC3([UC-03: Kelola & Buat API Key])
            UC4([UC-04: Lihat Kuota & Audit Log])
            UC5([UC-05: Revoke / Hapus API Key])
        end

        subgraph API_Group ["Public Data Endpoints"]
            UC6([UC-06: GET /api/v1/stations])
            UC7([UC-07: GET /api/v1/records])
            UC8([UC-08: GET /api/v1/records/latest])
            UC9([UC-09: GET /api/v1/records/berbahaya])
            UC10([«include» Validasi X-API-Key])
        end
    end

    Dev --> UC1
    Dev --> UC2
    Dev --> UC3
    Dev --> UC4
    Dev --> UC5
    Dev --> UC6
    Dev --> UC7

    App --> UC6
    App --> UC7
    App --> UC8
    App --> UC9

    UC6 -.->|includes| UC10
    UC7 -.->|includes| UC10
    UC8 -.->|includes| UC10
    UC9 -.->|includes| UC10
```

---

## 5. Activity Diagram / User Flow (Swimlane)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Developer / Client App
    participant Backend as UdaraAPI Express Backend
    participant DB as PostgreSQL Database (Supabase)

    Note over Client,DB: Alur 1: Registrasi, Login & JWT Generation
    Client->>Backend: POST /auth/register { name, email, password }
    Backend->>Backend: Validasi Input & Hash Password (Bcrypt)
    Backend->>DB: INSERT INTO users VALUES (...)
    DB-->>Backend: User ID & Record Created
    Backend->>Backend: Generate JWT Token (Expires in 7d)
    Backend-->>Client: 201 Created { token, user }

    Note over Client,DB: Alur 2: Pembuatan API Key (HMAC-SHA256)
    Client->>Backend: POST /dashboard/keys (Header: Bearer JWT)
    Backend->>Backend: Middleware verify JWT Token
    Backend->>Backend: Generate HMAC-SHA256 API Key
    Backend->>DB: INSERT INTO api_keys (user_id, key_name, api_key, rate_limit)
    DB-->>Backend: Record Saved
    Backend-->>Client: 201 Created { key: "ck_live_..." }

    Note over Client,DB: Alur 3: Konsumsi REST API Telemetri
    Client->>Backend: GET /api/v1/records?kategori=BERBAHAYA (Header: X-API-Key)
    Backend->>DB: SELECT * FROM api_keys WHERE api_key = ?
    DB-->>Backend: Key Data & requests_today
    Backend->>Backend: Validasi Rate Limit (requests_today < rate_limit_per_day)
    Backend->>DB: SELECT * FROM air_quality_records JOIN stations ...
    DB-->>Backend: Dataset Kualitas Udara (69 Records)
    Backend->>DB: UPDATE api_keys SET requests_today += 1; INSERT INTO api_usage_logs ...
    Backend-->>Client: 200 OK JSON { success: true, data: [...], pagination: {...} }
```

---

## 6. Dokumentasi Lengkap Endpoint API

| Method | Endpoint URI | Auth Required | Deskripsi | Query / Body Params | Response Code & Output |
| :---: | :--- | :---: | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Registrasi akun developer baru | `{ name, email, password }` | `201 Created` + JWT Token |
| `POST` | `/auth/login` | Public | Autentikasi dan login | `{ email, password }` | `200 OK` + JWT Token |
| `POST` | `/dashboard/keys` | JWT Bearer | Membuat API Key baru | `{ key_name }` | `201 Created` + HMAC API Key |
| `GET` | `/dashboard/keys` | JWT Bearer | Daftar seluruh API Key user | - | `200 OK` + List API Keys |
| `DELETE` | `/dashboard/keys/:id` | JWT Bearer | Menghapus / mencabut API Key | `id` (Param) | `200 OK` + Message Deleted |
| `GET` | `/dashboard/usage` | JWT Bearer | Statistik kuota & log aktivitas | - | `200 OK` + Usage Analytics |
| `GET` | `/api/v1/stations` | `X-API-Key` | Daftar Stasiun SPKU | `?province=...&city=...` | `200 OK` + 38 Stasiun SPKU |
| `GET` | `/api/v1/stations/provinces` | `X-API-Key` | Daftar provinsi yang memiliki stasiun | - | `200 OK` + 28 Provinsi |
| `GET` | `/api/v1/stations/:id` | `X-API-Key` | Detail satu stasiun SPKU | `id` (Param) | `200 OK` + Objek Stasiun |
| `GET` | `/api/v1/records` | `X-API-Key` | Rekam ISPU harian multi-parameter | `?kategori=&tanggal_mulai=` | `200 OK` + 69 Rekam Data ISPU |
| `GET` | `/api/v1/records/latest`| `X-API-Key` | Data ISPU terkini seluruh stasiun | - | `200 OK` + 23 Latest Readings |
| `GET` | `/api/v1/records/berbahaya` | `X-API-Key` | Data rekam kondisi darurat/kritis | `?limit=20` | `200 OK` + Critical Hazard Data |
| `GET` | `/api/v1/records/:id` | `X-API-Key` | Detail satu rekam data ISPU | `id` (Param) | `200 OK` + Objek Record |

---

## 7. Hasil Uji Coba Live Deployment

Pengujian otomatis telah dijalankan terhadap server live Vercel (`test_live_audit.py`):
1. **Pendaftaran Akun:** Berhasil mendaftarkan akun uji baru dan menerima token JWT `HS256` 295-karakter.
2. **Login JWT:** Berhasil memverifikasi kredensial email & password dan mengembalikan sesi autentikasi valid 7 hari.
3. **Pembuatan API Key:** Berhasil men-generate kunci API unik `ck_live_...` melalui endpoint `/dashboard/keys` dengan kuota 100 req/hari.
4. **Pemanggilan Data REST API:** Berhasil memanggil `/api/v1/stations` (38 stasiun), `/api/v1/stations/provinces` (28 provinsi), `/api/v1/records` (69 data ISPU), `/api/v1/records/latest` (23 data terkini), dan `/api/v1/records/berbahaya` (20 data darurat) menggunakan header `X-API-Key`.
5. **Audit Telemetri:** Sistem berhasil mencatat latensi panggilan, IP client, HTTP status code, dan konsumsi kuota ke tabel `api_usage_logs`.

---

## 8. Kesimpulan

Seluruh kriteria penugasan Final Project Pemrograman Web Lanjut (PWS) telah dianalisis, diuji coba secara live, dan terbukti berfungsi 100%:
1. Menghasilkan produk **SaaS REST API Gateway** fungsional ala *OpenWeather/OpenRouter*.
2. Memiliki **5 tabel relasional PostgreSQL di Supabase** yang saling berelasi kuat.
3. Menggunakan **autentikasi ganda (JWT untuk sesi pengguna dan HMAC API Key untuk konsumsi data API)**.
4. Menyediakan **69 record data ISPU dari 38 stasiun pemantau di 28 provinsi**.
5. Telah **ter-deploy dan berjalan live di Vercel**.
6. Dilengkapi dokumen laporan formal berformat PDF ([`LAPORAN_FINAL_PROJECT_UDARAAPI.pdf`](./LAPORAN_FINAL_PROJECT_UDARAAPI.pdf)) lengkap dengan diagram ERD, Use Case, dan Swimlane Activity Flow.
