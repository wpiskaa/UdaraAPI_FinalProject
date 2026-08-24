-- =============================================================
-- UdaraAPI Seed Data
-- Jalankan SETELAH schema.sql
-- =============================================================

-- =============================================================
-- STATIONS (38 stasiun di seluruh Indonesia)
-- SPKU = Stasiun Pemantau Kualitas Udara
-- =============================================================
INSERT INTO stations (name, city, province, latitude, longitude, elevation_m, operator) VALUES
-- DKI Jakarta (5 stasiun)
('SPKU Bundaran HI', 'Jakarta Pusat', 'DKI Jakarta', -6.195031, 106.823151, 7, 'BPLHD DKI Jakarta'),
('SPKU Kelapa Gading', 'Jakarta Utara', 'DKI Jakarta', -6.157488, 106.908791, 4, 'BPLHD DKI Jakarta'),
('SPKU Lubang Buaya', 'Jakarta Timur', 'DKI Jakarta', -6.305200, 106.891600, 25, 'BPLHD DKI Jakarta'),
('SPKU Kebon Jeruk', 'Jakarta Barat', 'DKI Jakarta', -6.199900, 106.761900, 15, 'BPLHD DKI Jakarta'),
('SPKU Jagakarsa', 'Jakarta Selatan', 'DKI Jakarta', -6.355800, 106.826500, 43, 'BPLHD DKI Jakarta'),

-- Jawa Barat
('SPKU Bandung Cicaheum', 'Bandung', 'Jawa Barat', -6.900800, 107.654500, 709, 'DLHK Jawa Barat'),
('SPKU Depok', 'Depok', 'Jawa Barat', -6.402000, 106.794000, 80, 'DLHK Jawa Barat'),

-- Jawa Tengah
('SPKU Semarang Kaligawe', 'Semarang', 'Jawa Tengah', -6.986400, 110.434700, 3, 'DLHK Jawa Tengah'),
('SPKU Solo Banjarsari', 'Surakarta', 'Jawa Tengah', -7.559400, 110.831200, 95, 'DLHK Jawa Tengah'),

-- DI Yogyakarta
('SPKU Gondokusuman', 'Yogyakarta', 'DI Yogyakarta', -7.790800, 110.373100, 112, 'DLHK DIY'),

-- Jawa Timur
('SPKU Surabaya Wonokromo', 'Surabaya', 'Jawa Timur', -7.316400, 112.733800, 4, 'DLHK Jawa Timur'),
('SPKU Malang Kedungkandang', 'Malang', 'Jawa Timur', -8.021800, 112.660700, 440, 'DLHK Jawa Timur'),

-- Banten
('SPKU Serang Cipocok', 'Serang', 'Banten', -6.120600, 106.150700, 40, 'DLHK Banten'),

-- Bali
('SPKU Denpasar Renon', 'Denpasar', 'Bali', -8.670000, 115.212000, 28, 'DLHK Bali'),

-- Sumatera Utara
('SPKU Medan Polonia', 'Medan', 'Sumatera Utara', 3.557800, 98.671800, 22, 'DLHK Sumut'),

-- Sumatera Barat
('SPKU Padang Andalas', 'Padang', 'Sumatera Barat', -0.938100, 100.384900, 8, 'DLHK Sumbar'),

-- Riau (daerah karhutla parah)
('SPKU Pekanbaru Tampan', 'Pekanbaru', 'Riau', 0.507100, 101.447200, 37, 'DLHK Riau'),
('SPKU Dumai Bukit Kapur', 'Dumai', 'Riau', 1.683600, 101.440200, 24, 'DLHK Riau'),

-- Jambi (karhutla)
('SPKU Jambi Kota Baru', 'Jambi', 'Jambi', -1.607400, 103.616600, 35, 'DLHK Jambi'),

-- Sumatera Selatan (karhutla parah)
('SPKU Palembang Kalidoni', 'Palembang', 'Sumatera Selatan', -2.943800, 104.787200, 8, 'DLHK Sumsel'),
('SPKU Palembang Talang Betutu', 'Palembang', 'Sumatera Selatan', -2.900700, 104.699500, 10, 'DLHK Sumsel'),

-- Bengkulu
('SPKU Bengkulu Ratu Samban', 'Bengkulu', 'Bengkulu', -3.800400, 102.265500, 15, 'DLHK Bengkulu'),

-- Lampung
('SPKU Bandar Lampung Kemiling', 'Bandar Lampung', 'Lampung', -5.392600, 105.232100, 96, 'DLHK Lampung'),

-- Aceh
('SPKU Banda Aceh Kuta Alam', 'Banda Aceh', 'Aceh', 5.543200, 95.318400, 20, 'DLHK Aceh'),

-- Kepulauan Riau
('SPKU Batam Batu Aji', 'Batam', 'Kepulauan Riau', 1.045900, 104.017200, 30, 'DLHK Kepri'),

-- Kalimantan Barat
('SPKU Pontianak Sungai Raya', 'Pontianak', 'Kalimantan Barat', -0.022800, 109.341900, 3, 'DLHK Kalbar'),

-- Kalimantan Tengah (karhutla PALING parah)
('SPKU Palangka Raya Pahandut', 'Palangka Raya', 'Kalimantan Tengah', -2.208700, 113.917900, 27, 'DLHK Kalteng'),
('SPKU Sampit Mentawa Baru', 'Sampit', 'Kalimantan Tengah', -2.534600, 112.950600, 20, 'DLHK Kalteng'),

-- Kalimantan Selatan
('SPKU Banjarmasin Banjar Timur', 'Banjarmasin', 'Kalimantan Selatan', -3.316600, 114.595400, 3, 'DLHK Kalsel'),

-- Kalimantan Timur
('SPKU Samarinda Sungai Kunjang', 'Samarinda', 'Kalimantan Timur', -0.502700, 117.123600, 15, 'DLHK Kaltim'),

-- Sulawesi Selatan
('SPKU Makassar Tamalate', 'Makassar', 'Sulawesi Selatan', -5.175300, 119.398200, 3, 'DLHK Sulsel'),

-- Sulawesi Utara
('SPKU Manado Wenang', 'Manado', 'Sulawesi Utara', 1.480500, 124.843200, 9, 'DLHK Sulut'),

-- Sulawesi Tengah
('SPKU Palu Palu Barat', 'Palu', 'Sulawesi Tengah', -0.900800, 119.861300, 11, 'DLHK Sulteng'),

-- NTB
('SPKU Mataram Cakranegara', 'Mataram', 'Nusa Tenggara Barat', -8.598600, 116.119300, 28, 'DLHK NTB'),

-- NTT
('SPKU Kupang Kelapa Lima', 'Kupang', 'Nusa Tenggara Timur', -10.174200, 123.610300, 85, 'DLHK NTT'),

-- Maluku
('SPKU Ambon Sirimau', 'Ambon', 'Maluku', -3.693800, 128.179600, 10, 'DLHK Maluku'),

-- Papua
('SPKU Jayapura Abepura', 'Jayapura', 'Papua', -2.601600, 140.676200, 27, 'DLHK Papua'),

-- Papua Barat
('SPKU Manokwari Sanggeng', 'Manokwari', 'Papua Barat', -0.862800, 134.063700, 12, 'DLHK Papua Barat');


-- =============================================================
-- AIR QUALITY RECORDS (65+ records)
-- Campuran data harian normal + musim karhutla
-- ISPU: BAIK(1-50) SEDANG(51-100) TIDAK SEHAT(101-199) SANGAT TIDAK SEHAT(200-299) BERBAHAYA(≥300)
-- =============================================================
INSERT INTO air_quality_records (station_id, tanggal, pm25, pm10, so2, co, no2, o3, ispu, kategori, parameter_kritis) VALUES

-- ===== DKI JAKARTA (Station 1-5) - Hari biasa =====
(1, '2024-08-01', 28.4, 54.2, 12.1, 1.8, 28.6, 45.2, 78, 'SEDANG', 'PM10'),
(1, '2024-08-02', 35.2, 68.5, 15.3, 2.1, 32.4, 52.1, 92, 'SEDANG', 'PM10'),
(1, '2024-08-05', 18.6, 38.4, 8.2, 1.2, 19.8, 38.6, 48, 'BAIK', 'PM25'),
(1, '2024-08-10', 42.7, 82.3, 18.6, 2.8, 41.5, 58.3, 108, 'TIDAK SEHAT', 'PM10'),
(1, '2024-08-15', 55.1, 98.7, 22.4, 3.2, 48.7, 62.1, 128, 'TIDAK SEHAT', 'PM25'),

(2, '2024-08-01', 22.1, 45.8, 10.2, 1.5, 25.3, 42.1, 65, 'SEDANG', 'PM10'),
(2, '2024-08-03', 31.5, 60.2, 14.1, 1.9, 30.2, 48.7, 85, 'SEDANG', 'PM10'),
(2, '2024-08-07', 15.8, 32.6, 7.4, 1.1, 18.2, 35.4, 42, 'BAIK', 'PM25'),

(3, '2024-08-02', 38.9, 74.2, 16.8, 2.4, 36.8, 55.2, 98, 'SEDANG', 'PM10'),
(3, '2024-08-08', 24.3, 50.1, 11.5, 1.6, 22.6, 44.8, 71, 'SEDANG', 'PM25'),

-- ===== JAWA BARAT (Station 6-7) =====
(6, '2024-08-01', 32.5, 65.3, 14.8, 2.0, 31.2, 50.8, 88, 'SEDANG', 'PM10'),
(6, '2024-08-04', 20.1, 42.6, 9.8, 1.4, 22.4, 40.3, 58, 'SEDANG', 'PM25'),
(6, '2024-08-09', 12.4, 28.7, 6.2, 0.9, 15.8, 32.1, 35, 'BAIK', 'PM25'),

(7, '2024-08-02', 26.8, 55.4, 12.8, 1.7, 28.1, 46.5, 75, 'SEDANG', 'PM10'),
(7, '2024-08-06', 18.2, 38.8, 8.6, 1.2, 20.3, 37.9, 50, 'BAIK', 'PM10'),

-- ===== JAWA TENGAH + DIY (Station 8-10) =====
(8, '2024-08-01', 29.6, 58.4, 13.5, 1.9, 29.8, 48.1, 80, 'SEDANG', 'PM10'),
(8, '2024-08-05', 16.3, 34.2, 7.8, 1.1, 18.9, 36.2, 44, 'BAIK', 'PM25'),

(10, '2024-08-03', 22.8, 47.6, 10.8, 1.5, 24.1, 43.2, 67, 'SEDANG', 'PM10'),
(10, '2024-08-07', 14.6, 30.8, 6.8, 1.0, 17.2, 33.8, 38, 'BAIK', 'PM25'),

-- ===== JAWA TIMUR (Station 11-12) =====
(11, '2024-08-01', 34.2, 67.8, 15.6, 2.2, 33.5, 52.4, 90, 'SEDANG', 'PM10'),
(11, '2024-08-04', 25.6, 52.3, 12.0, 1.7, 26.8, 47.3, 72, 'SEDANG', 'PM25'),
(11, '2024-08-08', 48.3, 91.2, 20.8, 2.9, 44.6, 60.5, 118, 'TIDAK SEHAT', 'PM10'),

(12, '2024-08-02', 19.8, 41.5, 9.2, 1.3, 21.5, 39.7, 54, 'SEDANG', 'PM25'),
(12, '2024-08-06', 28.4, 57.6, 13.2, 1.8, 29.2, 49.4, 78, 'SEDANG', 'PM10'),

-- ===== BALI (Station 14) =====
(14, '2024-08-01', 15.2, 31.8, 7.0, 1.0, 17.6, 34.5, 40, 'BAIK', 'PM25'),
(14, '2024-08-05', 21.4, 44.3, 10.1, 1.4, 23.2, 42.0, 62, 'SEDANG', 'PM25'),
(14, '2024-08-10', 18.6, 39.2, 8.8, 1.2, 20.8, 38.4, 50, 'BAIK', 'PM25'),

-- ===== SUMATERA UTARA (Station 15) =====
(15, '2024-08-01', 36.8, 72.4, 16.5, 2.3, 35.2, 53.8, 95, 'SEDANG', 'PM10'),
(15, '2024-08-06', 28.2, 56.8, 13.0, 1.8, 29.6, 48.9, 78, 'SEDANG', 'PM10'),
(15, '2024-08-12', 52.4, 96.3, 22.1, 3.1, 47.8, 61.2, 124, 'TIDAK SEHAT', 'PM25'),

-- ===== RIAU - MUSIM KARHUTLA (Station 17-18) - PARAH! =====
(17, '2024-08-01', 82.5, 145.2, 38.6, 5.2, 58.4, 72.1, 168, 'TIDAK SEHAT', 'PM25'),
(17, '2024-08-05', 148.3, 268.7, 72.4, 9.8, 89.2, 95.3, 224, 'SANGAT TIDAK SEHAT', 'PM25'),
(17, '2024-08-10', 245.6, 412.8, 118.5, 15.6, 124.8, 108.2, 308, 'BERBAHAYA', 'PM25'),
(17, '2024-08-15', 198.4, 358.6, 95.2, 12.8, 108.6, 102.5, 265, 'SANGAT TIDAK SEHAT', 'PM25'),
(17, '2024-08-20', 168.2, 302.4, 82.6, 10.9, 94.3, 98.1, 238, 'SANGAT TIDAK SEHAT', 'PM25'),
(17, '2024-09-01', 312.8, 524.6, 148.2, 19.8, 158.6, 112.4, 387, 'BERBAHAYA', 'PM25'),
(17, '2024-09-05', 278.4, 468.2, 132.5, 17.6, 142.8, 108.9, 356, 'BERBAHAYA', 'PM25'),

(18, '2024-08-08', 118.6, 214.8, 58.4, 7.8, 74.2, 88.3, 195, 'TIDAK SEHAT', 'PM25'),
(18, '2024-08-12', 185.2, 318.4, 88.6, 11.8, 102.4, 98.6, 248, 'SANGAT TIDAK SEHAT', 'PM25'),
(18, '2024-09-03', 268.4, 448.6, 128.4, 17.2, 138.6, 106.8, 342, 'BERBAHAYA', 'PM25'),

-- ===== JAMBI - KARHUTLA (Station 19) =====
(19, '2024-08-03', 95.4, 168.6, 45.8, 6.2, 64.8, 80.4, 178, 'TIDAK SEHAT', 'PM25'),
(19, '2024-08-10', 172.6, 298.4, 82.4, 10.8, 98.6, 95.2, 236, 'SANGAT TIDAK SEHAT', 'PM25'),
(19, '2024-09-02', 234.8, 398.6, 112.5, 14.9, 128.4, 104.8, 298, 'SANGAT TIDAK SEHAT', 'PM25'),
(19, '2024-09-08', 289.6, 478.4, 138.6, 18.4, 148.6, 110.2, 368, 'BERBAHAYA', 'PM25'),

-- ===== SUMATERA SELATAN - KARHUTLA (Station 20-21) =====
(20, '2024-08-05', 108.4, 192.6, 52.4, 7.0, 70.8, 84.6, 184, 'TIDAK SEHAT', 'PM25'),
(20, '2024-08-12', 195.6, 342.8, 92.8, 12.4, 112.4, 100.8, 258, 'SANGAT TIDAK SEHAT', 'PM25'),
(20, '2024-09-05', 298.4, 498.6, 142.5, 18.9, 152.6, 112.1, 375, 'BERBAHAYA', 'PM25'),

(21, '2024-08-08', 128.6, 228.4, 62.4, 8.4, 80.6, 88.8, 202, 'SANGAT TIDAK SEHAT', 'PM25'),
(21, '2024-09-06', 322.8, 538.4, 158.2, 21.2, 168.4, 115.6, 402, 'BERBAHAYA', 'PM25'),

-- ===== KALIMANTAN TENGAH - TERPARAH (Station 27-28) =====
(27, '2024-08-01', 125.4, 224.8, 60.2, 8.1, 78.4, 90.2, 196, 'TIDAK SEHAT', 'PM25'),
(27, '2024-08-07', 218.6, 378.4, 102.5, 13.6, 118.6, 104.2, 278, 'SANGAT TIDAK SEHAT', 'PM25'),
(27, '2024-08-15', 348.6, 578.4, 168.4, 22.4, 178.6, 118.4, 432, 'BERBAHAYA', 'PM25'),
(27, '2024-08-22', 412.8, 648.6, 198.4, 26.4, 208.6, 124.8, 512, 'BERBAHAYA', 'PM25'),
(27, '2024-09-01', 298.4, 498.6, 148.2, 19.8, 158.4, 112.6, 378, 'BERBAHAYA', 'PM25'),
(27, '2024-09-12', 452.6, 718.4, 218.6, 29.2, 228.8, 128.4, 568, 'BERBAHAYA', 'PM25'),
(27, '2024-10-01', 68.4, 128.6, 32.4, 4.4, 46.8, 62.4, 148, 'TIDAK SEHAT', 'PM25'),
(27, '2024-11-01', 28.4, 56.8, 14.2, 1.9, 29.6, 48.4, 78, 'SEDANG', 'PM10'),

(28, '2024-08-10', 168.4, 298.6, 80.2, 10.6, 96.8, 96.4, 228, 'SANGAT TIDAK SEHAT', 'PM25'),
(28, '2024-08-18', 285.6, 478.4, 138.4, 18.4, 148.2, 108.6, 362, 'BERBAHAYA', 'PM25'),
(28, '2024-09-08', 378.4, 618.6, 182.4, 24.4, 192.6, 120.8, 478, 'BERBAHAYA', 'PM25'),

-- ===== KALIMANTAN SELATAN (Station 29) =====
(29, '2024-08-05', 78.4, 138.6, 36.4, 4.9, 54.8, 74.2, 158, 'TIDAK SEHAT', 'PM25'),
(29, '2024-08-15', 142.6, 252.4, 68.4, 9.1, 84.6, 88.4, 212, 'SANGAT TIDAK SEHAT', 'PM25'),
(29, '2024-09-04', 218.4, 368.6, 108.4, 14.4, 118.4, 102.8, 278, 'SANGAT TIDAK SEHAT', 'PM25'),

-- ===== DAERAH AMAN (Pulau Timur) =====
(14, '2024-09-01', 12.8, 26.4, 5.8, 0.8, 15.2, 30.8, 32, 'BAIK', 'PM25'),
(35, '2024-08-01', 8.4, 18.6, 4.2, 0.6, 12.4, 25.6, 22, 'BAIK', 'PM25'),
(35, '2024-09-01', 10.2, 22.4, 4.8, 0.7, 14.2, 28.4, 28, 'BAIK', 'PM25'),
(36, '2024-08-01', 9.6, 20.8, 4.5, 0.6, 13.6, 27.2, 25, 'BAIK', 'PM25'),
(37, '2024-08-01', 11.2, 24.6, 5.2, 0.7, 14.8, 29.6, 30, 'BAIK', 'PM25'),
(38, '2024-08-01', 7.8, 16.4, 3.8, 0.5, 11.6, 23.8, 20, 'BAIK', 'PM25');
