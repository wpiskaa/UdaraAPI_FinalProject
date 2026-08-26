// ===================================================
// UdaraAPI — Elite SaaS Analytics Dashboard JavaScript
// ===================================================

const API_BASE = '';
let token = localStorage.getItem('udaraapi_token');
let user = JSON.parse(localStorage.getItem('udaraapi_user') || 'null');
let usageData = null;
let newKeyValue = '';

// Guard: redirect to login if not authenticated
if (!token) {
  window.location.href = '/login';
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
  initUserInfo();
  drawSplineWave('splineCanvas');
  renderMiniPills();
  await Promise.all([loadUsage()]);
  await loadKeys();
});

function initUserInfo() {
  if (!user) return;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'H';
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl) avatarEl.textContent = initial;

  const planEl = document.getElementById('userPlanDisplay');
  if (planEl) {
    const planName = user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free';
    planEl.textContent = `${planName} Tier`;
  }
}

// =============================================
// PAGE & TAB SWITCHING
// =============================================
function switchPage(pageId, btnEl) {
  // Update dock buttons
  document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
  const targetDockBtn = document.getElementById(`dock-${pageId}`) || btnEl;
  if (targetDockBtn) targetDockBtn.classList.add('active');

  // Update top tab pills
  document.querySelectorAll('.nav-tab-item').forEach(t => t.classList.remove('active'));
  const targetTab = document.getElementById(`tab-${pageId}`);
  if (targetTab) targetTab.classList.add('active');

  // Show page
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(`page-${pageId}`);
  if (page) page.classList.add('active');

  if (pageId === 'metrics') {
    setTimeout(() => drawSplineWave('splineCanvas'), 50);
  } else if (pageId === 'usage') {
    renderUsagePage();
    setTimeout(() => drawSplineWave('usageChart2'), 50);
  }
}

function setTimeFilter(filterName, btn) {
  document.querySelectorAll('.time-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(`Filter data diubah ke rentang: ${filterName.toUpperCase()}`, 'info');
  // Re-render visualizer bars
  renderPillBars(filterName);
}

// =============================================
// API REQUEST HELPER
// =============================================
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      logout();
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('API Request error:', err);
    return null;
  }
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast`;
  toast.innerHTML = `<span>${icons[type] || '✨'}</span><span>${message}</span>`;
  const container = document.getElementById('toastContainer');
  if (container) container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =============================================
// MODALS
// =============================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
  if (id === 'viewKeyModal') loadKeys();
}

function openCreateKeyModal() {
  const input = document.getElementById('newKeyName');
  if (input) input.value = '';
  openModal('createKeyModal');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// =============================================
// LOAD USAGE DATA & ANALYTICS
// =============================================
async function loadUsage() {
  const data = await apiRequest('/dashboard/usage');
  if (!data?.success) return;
  usageData = data.data;

  const total = usageData.summary?.total_requests || 0;
  const today = usageData.summary?.requests_today || 0;

  const totalEl = document.getElementById('totalRequests');
  if (totalEl) totalEl.textContent = formatNumber(total > 0 ? total : 18420);

  const uTotal = document.getElementById('u-totalRequests');
  if (uTotal) uTotal.textContent = formatNumber(total);

  renderPillBars('week', usageData.daily_usage);
}

function renderPillBars(range = 'week', customDaily) {
  const container = document.getElementById('pillBarsContainer');
  if (!container) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const sampleHeights = [48, 72, 55, 40, 86, 100, 64];

  container.innerHTML = days.map((day, idx) => `
    <div class="pill-bar-col">
      <div class="pill-bar-track">
        <div class="pill-bar-fill ${idx === 5 ? 'active-day' : ''}" style="height:${sampleHeights[idx]}%"></div>
      </div>
      <span class="pill-bar-label">${day}</span>
    </div>
  `).join('');
}

function renderMiniPills() {
  const container = document.getElementById('miniPillsContainer');
  if (!container) return;

  const heights = [35, 55, 80, 45, 90, 60, 75, 40, 100, 65, 85, 50, 70, 95];
  container.innerHTML = heights.map(h => `
    <div class="pill-bar-col" style="gap:4px">
      <div class="pill-bar-track" style="max-width:18px">
        <div class="pill-bar-fill" style="height:${h}%;background:linear-gradient(180deg,#38bdf8,#0284c7)"></div>
      </div>
    </div>
  `).join('');
}

function renderUsagePage() {
  if (!usageData) return;

  const topEl = document.getElementById('topEndpoints');
  if (topEl) {
    if (usageData.top_endpoints?.length > 0) {
      const maxCount = usageData.top_endpoints[0].count;
      topEl.innerHTML = usageData.top_endpoints.map(ep => `
        <div style="display:flex;flex-direction:column;gap:4px;padding:8px 12px;background:var(--c-surface-subtle);border-radius:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700">
            <span style="font-family:monospace;color:var(--c-primary)">${ep.endpoint}</span>
            <span>${ep.count} reqs</span>
          </div>
          <div style="height:6px;background:#e2e8f0;border-radius:4px;overflow:hidden">
            <div style="height:100%;background:linear-gradient(90deg,#ea580c,#f97316);width:${Math.round((ep.count / maxCount) * 100)}%"></div>
          </div>
        </div>
      `).join('');
    } else {
      topEl.innerHTML = '<div style="text-align:center;padding:24px 0;color:var(--c-text-muted);font-size:12px">Belum ada panggilan API tercatat.</div>';
    }
  }
}

// =============================================
// SMOOTH SPLINE BEZIER CANVAS CHART
// =============================================
function drawSplineWave(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  const W = rect.width;
  const H = 140;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, W, H);

  const points = [
    { x: 0, y: H * 0.7 },
    { x: W * 0.18, y: H * 0.55 },
    { x: W * 0.38, y: H * 0.25 },
    { x: W * 0.58, y: H * 0.65 },
    { x: W * 0.78, y: H * 0.3 },
    { x: W, y: H * 0.2 }
  ];

  // Draw Area Gradient Fill
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, 'rgba(234, 88, 12, 0.28)');
  gradient.addColorStop(0.7, 'rgba(249, 115, 22, 0.08)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = (points[i].x + points[i + 1].x) / 2;
    const cp1y = points[i].y;
    const cp2x = (points[i].x + points[i + 1].x) / 2;
    const cp2y = points[i + 1].y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
  }

  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw Curved Stroke Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length - 1; i++) {
    const cp1x = (points[i].x + points[i + 1].x) / 2;
    const cp1y = points[i].y;
    const cp2x = (points[i].x + points[i + 1].x) / 2;
    const cp2y = points[i + 1].y;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i + 1].x, points[i + 1].y);
  }
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Glowing Circle Dots on Peaks
  [points[2], points[4], points[5]].forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });
}

// =============================================
// API KEYS MANAGEMENT (CRUD)
// =============================================
async function loadKeys() {
  const data = await apiRequest('/dashboard/keys');
  const listEl = document.getElementById('keysList');
  if (!listEl) return;

  if (!data?.success || !data.data || data.data.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:40px 0;color:var(--c-text-muted)">
        <p style="font-size:14px;margin-bottom:12px">Anda belum memiliki API Key aktif.</p>
        <button class="btn-pill btn-pill-primary" onclick="openCreateKeyModal()">+ Buat API Key Pertama</button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = data.data.map(k => {
    const maskedKey = k.api_key ? (k.api_key.substring(0, 14) + '••••••••••••••••••••' + k.api_key.slice(-6)) : 'Key Hidden';
    const dateStr = k.created_at ? new Date(k.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja';
    
    return `
      <div class="key-item-card">
        <div class="key-info-left">
          <div class="key-title-row">
            <span class="key-name-text">${k.key_name || 'Production Key'}</span>
            <span class="status-badge-pill badge-completed">${k.is_active ? 'ACTIVE' : 'REVOKED'}</span>
          </div>
          <div>
            <code class="key-secret-code">${maskedKey}</code>
          </div>
          <div class="key-meta-muted">
            Dibuat: ${dateStr} • Kuota: ${k.requests_today || 0} / ${k.rate_limit_per_day || 100} reqs hari ini • Total: ${formatNumber(k.total_requests || 0)} calls
          </div>
        </div>

        <div class="key-actions-right">
          <button class="btn-pill" onclick="copyFullKey('${k.api_key}')" title="Copy Key">📋 Salin</button>
          <button class="btn-pill" onclick="deleteKey('${k.id}')" style="color:#ef4444" title="Revoke Key">🗑️ Hapus</button>
        </div>
      </div>
    `;
  }).join('');
}

async function submitCreateKey() {
  const nameInput = document.getElementById('newKeyName');
  const name = nameInput?.value?.trim() || 'My API Key';

  const res = await apiRequest('/dashboard/keys', {
    method: 'POST',
    body: JSON.stringify({ key_name: name }),
  });

  if (res?.success && res.data) {
    closeModal('createKeyModal');
    newKeyValue = res.data.api_key || res.data.key;
    document.getElementById('newKeyValueDisplay').textContent = newKeyValue;
    openModal('viewKeyModal');
    loadKeys();
    showToast('API Key berhasil dibuat!', 'success');
  } else {
    showToast(res?.error || 'Gagal membuat API Key.', 'error');
  }
}

function copyNewKeyAndClose() {
  if (newKeyValue) {
    navigator.clipboard.writeText(newKeyValue).then(() => {
      showToast('API Key berhasil disalin ke clipboard!', 'success');
      closeModal('viewKeyModal');
    });
  } else {
    closeModal('viewKeyModal');
  }
}

function copyFullKey(keyString) {
  navigator.clipboard.writeText(keyString).then(() => {
    showToast('Kunci API berhasil disalin!', 'success');
  });
}

async function deleteKey(keyId) {
  if (!confirm('Apakah Anda yakin ingin mencabut dan menghapus API Key ini?')) return;
  const res = await apiRequest(`/dashboard/keys/${keyId}`, { method: 'DELETE' });
  if (res?.success) {
    showToast('API Key berhasil dihapus.', 'success');
    loadKeys();
  } else {
    showToast(res?.error || 'Gagal menghapus API Key.', 'error');
  }
}

function copySnippet(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    navigator.clipboard.writeText(el.textContent).then(() => {
      showToast('Cuplikan kode cURL berhasil disalin!', 'success');
    });
  }
}

function logout() {
  localStorage.removeItem('udaraapi_token');
  localStorage.removeItem('udaraapi_user');
  window.location.href = '/login';
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString('en-US');
}
