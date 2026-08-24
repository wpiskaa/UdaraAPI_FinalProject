-- =============================================================
-- UdaraAPI Database Schema
-- Jalankan di Supabase SQL Editor (DROP + CREATE ulang)
-- =============================================================

-- Drop tabel lama (kalau ada)
DROP TABLE IF EXISTS api_usage_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS air_quality_records CASCADE;
DROP TABLE IF EXISTS stations CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLE 1: users
-- =============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE 2: api_keys
-- =============================================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(80) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  rate_limit_per_day INTEGER DEFAULT 100,
  requests_today INTEGER DEFAULT 0,
  total_requests BIGINT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE 3: stations
-- Stasiun Pemantau Kualitas Udara (SPKU) di seluruh Indonesia
-- =============================================================
CREATE TABLE stations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,6) NOT NULL,
  longitude DECIMAL(10,6) NOT NULL,
  elevation_m INTEGER DEFAULT 0,
  operator VARCHAR(100) DEFAULT 'KLHK',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE 4: air_quality_records
-- Data ISPU harian per stasiun
-- =============================================================
CREATE TABLE air_quality_records (
  id SERIAL PRIMARY KEY,
  station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  tanggal DATE NOT NULL,
  pm25 DECIMAL(8,2),
  pm10 DECIMAL(8,2),
  so2 DECIMAL(8,2),
  co DECIMAL(8,2),
  no2 DECIMAL(8,2),
  o3 DECIMAL(8,2),
  ispu INTEGER NOT NULL CHECK (ispu >= 0),
  kategori VARCHAR(30) NOT NULL CHECK (kategori IN ('BAIK','SEDANG','TIDAK SEHAT','SANGAT TIDAK SEHAT','BERBAHAYA')),
  parameter_kritis VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABLE 5: api_usage_logs
-- =============================================================
CREATE TABLE api_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) DEFAULT 'GET',
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(api_key);
CREATE INDEX idx_usage_logs_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_usage_logs_created ON api_usage_logs(created_at);
CREATE INDEX idx_aqr_station_id ON air_quality_records(station_id);
CREATE INDEX idx_aqr_tanggal ON air_quality_records(tanggal);
CREATE INDEX idx_aqr_ispu ON air_quality_records(ispu);
CREATE INDEX idx_aqr_kategori ON air_quality_records(kategori);
CREATE INDEX idx_stations_province ON stations(province);

-- =============================================================
-- TRIGGER: auto update_at pada tabel users
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
