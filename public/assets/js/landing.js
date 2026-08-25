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

function getApiBase() {
  return window.location.origin.includes('localhost') ? window.location.origin : 'https://udara-api-final-project.vercel.app';
}

function selectEndpointPreset(presetKey, btn) {
  document.querySelectorAll('.s-endpoint-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentPreset = presetKey;

  const p = SANDBOX_PRESETS[presetKey];
  document.getElementById('lblMethod').textContent = p.method;
  document.getElementById('lblUrl').textContent = `${getApiBase()}${p.path}`;
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
  const url = `${getApiBase()}${p.path}`;

  setTimeout(() => {
    btn.innerHTML = '<span>⚡ Eksekusi Request</span>';
    btn.disabled = false;

    const lat = Math.floor(Math.random() * 20 + 22);
    latEl.textContent = `${lat}ms`;

    const jsonStr = JSON.stringify(p.payload, null, 2);
    sizeEl.textContent = `${(jsonStr.length / 1024).toFixed(1)} KB`;

    let snippetCode = '';
    if (currentLanguage === 'curl') {
      snippetCode = `curl -X GET "${url}" \\\n  -H "X-API-Key: ck_live_demo_key_here"`;
    } else if (currentLanguage === 'js') {
      snippetCode = `const res = await fetch("${url}", {\n  headers: { "X-API-Key": "ck_live_demo_key_here" }\n});\nconst data = await res.json();\nconsole.log(data);`;
    } else if (currentLanguage === 'python') {
      snippetCode = `import requests\n\nurl = "${url}"\nheaders = {"X-API-Key": "ck_live_demo_key_here"}\nres = requests.get(url, headers=headers)\nprint(res.json())`;
    } else if (currentLanguage === 'php') {
      snippetCode = `<?php\n$ch = curl_init("${url}");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: ck_live_demo_key_here"]);\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n$res = curl_exec($ch);\ncurl_close($ch);\necho $res;`;
    }

    out.textContent = `# Contoh Request (${currentLanguage.toUpperCase()}):\n${snippetCode}\n\n# Response Output (HTTP 200 OK):\n${jsonStr}`;
    window._lastSandboxSnippet = snippetCode;
    window._lastSandboxUrl = url;
  }, 200);
}

function copySandboxCode() {
  const codeToCopy = window._lastSandboxSnippet || document.getElementById('sandboxOutput').textContent;
  navigator.clipboard.writeText(codeToCopy).then(() => {
    showToast('Kode request berhasil disalin ke clipboard!', 'success');
  });
}

function copySandboxUrl() {
  const urlToCopy = window._lastSandboxUrl || document.getElementById('lblUrl').textContent;
  navigator.clipboard.writeText(urlToCopy).then(() => {
    showToast('URL Endpoint berhasil disalin!', 'success');
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
// 5. CIRCULAR RESPECT MINI MUSIC BOX (RADIOHEAD - LET DOWN)
// ===================================================
let isMusicPlaying = false;
let isPopoverOpen = false;
let currentVolume = 0.5;
let audioElement = null;

function initAudioElement() {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.src = '/assets/audio/let_down.mp3';
    audioElement.onerror = () => {
      audioElement.src = '/songs/Let%20Down%20Remastered.mp3';
    };
    audioElement.loop = true;
    audioElement.volume = currentVolume;
  }
}

function updateMusicUI(playing) {
  const wrapper = document.getElementById('musicFloatingWrapper');
  const icon = document.getElementById('musicPlayIcon');
  const ind = document.getElementById('musicLiveInd');

  if (playing) {
    if (wrapper) wrapper.classList.add('playing');
    if (icon) icon.textContent = '⏸';
    if (ind) {
      ind.textContent = '● PLAYING';
      ind.style.color = '#c8e86a';
    }
  } else {
    if (wrapper) wrapper.classList.remove('playing');
    if (icon) icon.textContent = '▶';
    if (ind) {
      ind.textContent = '○ PAUSED';
      ind.style.color = '#9cbca0';
    }
  }
}

function toggleMusic() {
  initAudioElement();

  if (!isMusicPlaying) {
    audioElement.volume = currentVolume;
    audioElement.play().then(() => {
      isMusicPlaying = true;
      updateMusicUI(true);
      showToast('🎵 Memutar: Radiohead — Let Down (Remastered) • Tribute for Indonesia', 'info');
    }).catch(err => {
      console.log('Autoplay policy caught:', err);
    });
  } else {
    isMusicPlaying = false;
    audioElement.pause();
    updateMusicUI(false);
  }
}

function toggleMusicPopover(forceState) {
  const card = document.getElementById('musicPopoverCard');
  if (!card) return;

  if (typeof forceState === 'boolean') {
    isPopoverOpen = forceState;
  } else {
    isPopoverOpen = !isPopoverOpen;
  }

  if (isPopoverOpen) {
    card.classList.remove('hidden');
    // If not playing when opened, start playback!
    if (!isMusicPlaying) {
      toggleMusic();
    }
  } else {
    card.classList.add('hidden');
  }
}

function setVolume(val) {
  currentVolume = parseFloat(val);
  if (audioElement) {
    audioElement.volume = currentVolume;
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
    const prev = slider.dataset.prevVol || 0.5;
    slider.value = prev;
    setVolume(prev);
  }
}

// Aggressive responsive autoplay on load or any first touch/scroll/interaction
function startAutoRespectMusic() {
  initAudioElement();

  // Hide popover by default so it's a sleek circular button
  const card = document.getElementById('musicPopoverCard');
  if (card) card.classList.add('hidden');

  // Attempt instant play
  audioElement.volume = currentVolume;
  const playPromise = audioElement.play();

  if (playPromise !== undefined) {
    playPromise.then(() => {
      isMusicPlaying = true;
      updateMusicUI(true);
    }).catch(() => {
      // If blocked by browser security policy, auto-start on ANY interaction
      const onFirstInteract = () => {
        if (!isMusicPlaying) {
          audioElement.play().then(() => {
            isMusicPlaying = true;
            updateMusicUI(true);
            showToast('🎵 Memutar: Radiohead — Let Down (Remastered) • Tribute for Indonesia', 'info');
          });
        }
        ['click', 'scroll', 'touchstart', 'keydown'].forEach(evt => {
          window.removeEventListener(evt, onFirstInteract);
        });
      };

      ['click', 'scroll', 'touchstart', 'keydown'].forEach(evt => {
        window.addEventListener(evt, onFirstInteract, { once: true, passive: true });
      });
    });
  }
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
  startAutoRespectMusic();
});
