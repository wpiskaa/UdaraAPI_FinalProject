// ===================================================
// UdaraAPI — C-GEM Inspired Landing Page Script
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  initDispatchTicker();
  initSandboxConsole();
  loadBackendStatistics();
});

// ===================================================
// 1. LIVE DISPATCH TICKER (ASAP KARHUTLA & ISPU)
// ===================================================
const DISPATCH_DATA = [
  { city: 'Palangka Raya (Kalteng)', ispu: 432, cat: 'BERBAHAYA', cls: 'text-berbahaya' },
  { city: 'Sampit (Kalteng)', ispu: 362, cat: 'BERBAHAYA', cls: 'text-berbahaya' },
  { city: 'Palembang (Sumsel)', ispu: 375, cat: 'BERBAHAYA', cls: 'text-berbahaya' },
  { city: 'Jambi (Jambi)', ispu: 368, cat: 'BERBAHAYA', cls: 'text-berbahaya' },
  { city: 'Pekanbaru (Riau)', ispu: 308, cat: 'BERBAHAYA', cls: 'text-berbahaya' },
  { city: 'Banjarmasin (Kalsel)', ispu: 278, cat: 'SANGAT T.S.', cls: 'text-sangat-ts' },
  { city: 'Pontianak (Kalbar)', ispu: 148, cat: 'TIDAK SEHAT', cls: 'text-tidak-sehat' },
  { city: 'Jakarta Pusat (DKI)', ispu: 128, cat: 'TIDAK SEHAT', cls: 'text-tidak-sehat' },
  { city: 'Surabaya (Jatim)', ispu: 118, cat: 'TIDAK SEHAT', cls: 'text-tidak-sehat' },
  { city: 'Bandung (Jabar)', ispu: 88, cat: 'SEDANG', cls: 'text-sedang' },
  { city: 'Denpasar (Bali)', ispu: 40, cat: 'BAIK', cls: 'text-baik' },
  { city: 'Jayapura (Papua)', ispu: 22, cat: 'BAIK', cls: 'text-baik' },
];

function initDispatchTicker() {
  const container = document.getElementById('dispatchScroll');
  if (!container) return;

  container.innerHTML = DISPATCH_DATA.map(item => `
    <div class="dispatch-card">
      <div class="dispatch-city">${item.city}</div>
      <div class="dispatch-val ${item.cls}">${item.ispu}</div>
      <div class="dispatch-status ${item.cls}">ISPU: ${item.cat}</div>
    </div>
  `).join('');
}

// ===================================================
// 2. DEVELOPER SANDBOX CONSOLE
// ===================================================
const SANDBOX_PRESETS = {
  latest: {
    method: 'GET',
    path: '/api/v1/records/latest',
    payload: {
      success: true,
      data: [
        {
          id: 53,
          station_id: 27,
          tanggal: "2024-08-15",
          pm25: 348.6, pm10: 578.4, so2: 168.4, co: 22.4, no2: 178.6, o3: 118.4,
          ispu: 432,
          kategori: "BERBAHAYA",
          parameter_kritis: "PM2.5",
          station: { name: "SPKU Palangka Raya Pahandut", city: "Palangka Raya", province: "Kalimantan Tengah", latitude: -2.2087, longitude: 113.9179 }
        },
        {
          id: 33,
          station_id: 17,
          tanggal: "2024-09-01",
          pm25: 312.8, pm10: 524.6, so2: 148.2, co: 19.8, no2: 158.6, o3: 112.4,
          ispu: 387,
          kategori: "BERBAHAYA",
          parameter_kritis: "PM2.5",
          station: { name: "SPKU Pekanbaru Tampan", city: "Pekanbaru", province: "Riau", latitude: 0.5071, longitude: 101.4472 }
        }
      ],
      count: 2
    }
  },
  berbahaya: {
    method: 'GET',
    path: '/api/v1/records/berbahaya?limit=2',
    payload: {
      success: true,
      data: [
        { id: 64, station_id: 27, tanggal: "2024-09-12", pm25: 452.6, pm10: 718.4, ispu: 568, kategori: "BERBAHAYA", parameter_kritis: "PM2.5", stations: { city: "Sampit", province: "Kalimantan Tengah" } },
        { id: 62, station_id: 27, tanggal: "2024-08-22", pm25: 412.8, pm10: 648.6, ispu: 512, kategori: "BERBAHAYA", parameter_kritis: "PM2.5", stations: { city: "Palangka Raya", province: "Kalimantan Tengah" } }
      ],
      pagination: { page: 1, limit: 2, total: 18, total_pages: 9 }
    }
  },
  kalimantan: {
    method: 'GET',
    path: '/api/v1/stations?province=Kalimantan',
    payload: {
      success: true,
      data: [
        { id: 27, name: "SPKU Palangka Raya Pahandut", city: "Palangka Raya", province: "Kalimantan Tengah", latitude: -2.2087, longitude: 113.9179, operator: "DLHK Kalteng" },
        { id: 28, name: "SPKU Sampit Mentawa Baru", city: "Sampit", province: "Kalimantan Tengah", latitude: -2.5346, longitude: 112.9506, operator: "DLHK Kalteng" },
        { id: 26, name: "SPKU Pontianak Sungai Raya", city: "Pontianak", province: "Kalimantan Barat", latitude: -0.0228, longitude: 109.3419, operator: "DLHK Kalbar" }
      ],
      pagination: { page: 1, limit: 50, total: 5, total_pages: 1 }
    }
  },
  stats: {
    method: 'GET',
    path: '/api/v1/stats',
    payload: {
      success: true,
      data: {
        platform: "UdaraAPI",
        version: "1.0",
        total_stations: 38,
        total_records: 65,
        coverage: "38 Provinsi Indonesia",
        pollutants: ["PM2.5", "PM10", "SO2", "CO", "NO2", "O3"],
        categories: {
          BAIK: 12, SEDANG: 14, "TIDAK SEHAT": 9,
          "SANGAT TIDAK SEHAT": 14, BERBAHAYA: 16
        }
      }
    }
  }
};

let currentPreset = 'latest';
let currentLanguage = 'curl';

function initSandboxConsole() {
  runSandboxRequest();
}

function selectEndpointPreset(presetKey, btn) {
  document.querySelectorAll('.s-endpoint-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPreset = presetKey;

  const p = SANDBOX_PRESETS[presetKey];
  document.getElementById('lblMethod').textContent = p.method;
  document.getElementById('lblUrl').textContent = `https://udara-api.vercel.app${p.path}`;
  runSandboxRequest();
}

function setLang(lang, btn) {
  document.querySelectorAll('.s-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentLanguage = lang;
  runSandboxRequest();
}

function runSandboxRequest() {
  const btn = document.getElementById('btnRunSandbox');
  const out = document.getElementById('sandboxOutput');
  const latEl = document.getElementById('lblLatency');
  const sizeEl = document.getElementById('lblSize');

  btn.innerHTML = '<div class="spinner"></div>';
  btn.disabled = true;

  const p = SANDBOX_PRESETS[currentPreset];
  const url = `https://udara-api.vercel.app${p.path}`;

  setTimeout(() => {
    btn.innerHTML = '<span>⚡ Eksekusi Request</span>';
    btn.disabled = false;

    const lat = Math.floor(Math.random() * 20 + 22);
    latEl.textContent = `${lat}ms`;

    const jsonStr = JSON.stringify(p.payload, null, 2);
    sizeEl.textContent = `${(jsonStr.length / 1024).toFixed(1)} KB`;

    if (currentLanguage === 'curl') {
      out.textContent = `# cURL Request:\ncurl -X GET "${url}" \\\n  -H "X-API-Key: ck_live_demo_key_here"\n\n# Response Payload (HTTP 200 OK):\n${jsonStr}`;
    } else if (currentLanguage === 'js') {
      out.textContent = `// JavaScript (Fetch API):\nconst res = await fetch("${url}", {\n  headers: { "X-API-Key": "ck_live_demo_key_here" }\n});\nconst data = await res.json();\nconsole.log(data);\n\n// Response:\n${jsonStr}`;
    } else if (currentLanguage === 'python') {
      out.textContent = `# Python (requests):\nimport requests\n\nurl = "${url}"\nheaders = {"X-API-Key": "ck_live_demo_key_here"}\nres = requests.get(url, headers=headers)\nprint(res.json())\n\n# Response:\n${jsonStr}`;
    } else if (currentLanguage === 'php') {
      out.textContent = `<?php\n$ch = curl_init("${url}");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: ck_live_demo_key_here"]);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$res = curl_exec($ch);\ncurl_close($ch);\necho $res;\n\n// Response:\n${jsonStr}`;
    }
  }, 200);
}

function copySandboxCode() {
  const text = document.getElementById('sandboxOutput').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Kode & contoh payload berhasil disalin!', 'success');
  });
}

// ===================================================
// 3. LOAD BACKEND STATS
// ===================================================
async function loadBackendStatistics() {
  try {
    const res = await fetch('/api/v1/stats');
    const json = await res.json();
    if (json.success && json.data) {
      if (json.data.total_stations) {
        document.getElementById('statStationsNum').textContent = json.data.total_stations;
      }
      if (json.data.total_records) {
        document.getElementById('statRecordsNum').textContent = `${json.data.total_records}+`;
      }
    }
  } catch (err) {}
}

// ===================================================
// 4. PRAY FOR INDONESIA — SOLIDARITAS & CANDLE WALL
// ===================================================
let candleCount = parseInt(localStorage.getItem('udara_candle_count')) || 4289;

const INITIAL_PRAYERS = [
  { name: 'Keluarga Rahmad (Palangka Raya)', text: 'Semoga hujan deras segera turun membasahi gambut Kalteng. Tetap kuat saudaraku & para relawan!', time: 'Baru saja' },
  { name: 'Siti Aminah (Pekanbaru)', text: 'Doa kami dari Riau untuk seluruh petugas pemadam Manggala Agni yang bertaruh nyawa di garis api.', time: '2 menit lalu' },
  { name: 'Wayan Suartana (Lombok)', text: 'Semoga lereng savana dan hutan kita lekas pulih. Jaga alam, jaga bumi Nusantara.', time: '8 menit lalu' },
  { name: 'Markus Kogoya (Jayapura)', text: 'Salam solidaritas dari Papua untuk saudara-saudara kami di Kalimantan dan Sumatera. Kita bersama.', time: '15 menit lalu' },
  { name: 'Rangga & Komunitas (Bandung)', text: 'Respect tak terhingga untuk seluruh pejuang pemadam kebakaran hutan di seluruh Indonesia! 🕯️🌲', time: '24 menit lalu' },
];

let prayersData = JSON.parse(localStorage.getItem('udara_prayers')) || INITIAL_PRAYERS;

function initPrayersWall() {
  const countEl = document.getElementById('candleCount');
  if (countEl) countEl.textContent = candleCount.toLocaleString('id-ID');
  renderPrayersList();
}

function renderPrayersList() {
  const list = document.getElementById('prayerList');
  if (!list) return;

  list.innerHTML = prayersData.map(p => `
    <div class="prayer-item">
      <div class="prayer-item-top">
        <span class="prayer-sender">🕊️ ${escapeHtml(p.name)}</span>
        <span class="prayer-time">${p.time}</span>
      </div>
      <div class="prayer-text">"${escapeHtml(p.text)}"</div>
    </div>
  `).join('');
}

function lightCandle() {
  candleCount++;
  localStorage.setItem('udara_candle_count', candleCount);
  const countEl = document.getElementById('candleCount');
  if (countEl) countEl.textContent = candleCount.toLocaleString('id-ID');

  const btn = document.getElementById('btnLightCandle');
  if (btn) {
    btn.innerHTML = '<span>✨ Lilin Doa Menyala (+1)</span>';
    setTimeout(() => {
      btn.innerHTML = '<span>✨ Nyalakan Lilin Doa & Respect</span>';
    }, 1500);
  }

  showToast('🕯️ Terima kasih! Lilin doamu telah menyala untuk langit & hutan Indonesia.', 'success');
}

function submitPrayer(e) {
  e.preventDefault();
  const nameInput = document.getElementById('prayerName');
  const textInput = document.getElementById('prayerText');

  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  if (!name || !text) return;

  const newPrayer = {
    name: name,
    text: text,
    time: 'Baru saja'
  };

  prayersData.unshift(newPrayer);
  if (prayersData.length > 20) prayersData.pop();
  localStorage.setItem('udara_prayers', JSON.stringify(prayersData));

  renderPrayersList();
  nameInput.value = '';
  textInput.value = '';

  showToast('🕊️ Doa dan pesan solidaritasmu berhasil dikirimkan!', 'success');
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

// ===================================================
// 5. RESPECT MINI MUSIC BOX PLAYER (RADIOHEAD - LET DOWN)
// ===================================================
let isMusicPlaying = false;
let audioCtx = null;
let masterGain = null;
let currentVolume = 0.4;
let musicInterval = null;

// Let Down Acoustic Ambient Motif Notes (A - E - F#m - D chords in Hz)
const LET_DOWN_NOTES = [
  // Intro/Verse motif: A chord arpeggio
  440.00, 554.37, 659.25, 880.00, 659.25, 554.37,
  // E chord arpeggio
  329.63, 493.88, 659.25, 783.99, 659.25, 493.88,
  // F#m chord arpeggio
  369.99, 440.00, 554.37, 739.99, 554.37, 440.00,
  // D chord arpeggio
  293.66, 440.00, 587.33, 739.99, 587.33, 440.00
];

function initAudioEngine() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playNote(freq, time, duration = 0.6) {
  if (!audioCtx || !isMusicPlaying) return;

  const osc = audioCtx.createOscillator();
  const noteGain = audioCtx.createGain();

  // Warm gentle ambient acoustic electric piano timbre
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);

  noteGain.gain.setValueAtTime(0, time);
  noteGain.gain.linearRampToValueAtTime(0.35, time + 0.04);
  noteGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc.connect(noteGain);
  noteGain.connect(masterGain);

  osc.start(time);
  osc.stop(time + duration);
}

function startLetDownArpeggio() {
  if (!audioCtx) initAudioEngine();
  let step = 0;

  function scheduleNextNotes() {
    if (!isMusicPlaying || !audioCtx) return;
    const now = audioCtx.currentTime;
    const noteFreq = LET_DOWN_NOTES[step % LET_DOWN_NOTES.length];
    playNote(noteFreq, now, 0.85);

    // Occasional gentle low bass root
    if (step % 6 === 0) {
      const bassFreq = noteFreq / 2;
      playNote(bassFreq, now, 1.4);
    }

    step++;
  }

  scheduleNextNotes();
  musicInterval = setInterval(scheduleNextNotes, 380);
}

function toggleMusic() {
  const box = document.getElementById('musicBox');
  const icon = document.getElementById('musicPlayIcon');
  const ind = document.getElementById('musicLiveInd');

  if (!isMusicPlaying) {
    initAudioEngine();
    isMusicPlaying = true;
    startLetDownArpeggio();

    if (box) box.classList.add('playing');
    if (icon) icon.textContent = '⏸';
    if (ind) {
      ind.textContent = '● PLAYING';
      ind.style.color = '#c8e86a';
    }
    showToast('🎵 Memutar: Radiohead — Let Down (Remastered) • Tribute for Indonesia', 'info');
  } else {
    isMusicPlaying = false;
    if (musicInterval) clearInterval(musicInterval);

    if (box) box.classList.remove('playing');
    if (icon) icon.textContent = '▶';
    if (ind) {
      ind.textContent = '○ PAUSED';
      ind.style.color = '#9cbca0';
    }
  }
}

function setVolume(val) {
  currentVolume = parseFloat(val);
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
  }
  const icon = document.getElementById('musicVolIcon');
  if (icon) {
    icon.textContent = currentVolume === 0 ? '🔇' : currentVolume < 0.5 ? '🔉' : '🔊';
  }
}

function toggleMute() {
  const slider = document.getElementById('musicVolSlider');
  if (currentVolume > 0) {
    slider.dataset.prevVol = currentVolume;
    slider.value = 0;
    setVolume(0);
  } else {
    const prev = slider.dataset.prevVol || 0.4;
    slider.value = prev;
    setVolume(prev);
  }
}

// Gentle auto-play on first user interaction if not playing
function setupAutoRespectMusic() {
  function startOnInteraction() {
    if (!isMusicPlaying) {
      toggleMusic();
    }
    document.removeEventListener('click', startOnInteraction);
    document.removeEventListener('keydown', startOnInteraction);
  }

  document.addEventListener('click', startOnInteraction, { once: true });
  document.addEventListener('keydown', startOnInteraction, { once: true });
}

// Global Toast helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '🕯️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initPrayersWall();
  setupAutoRespectMusic();
});
