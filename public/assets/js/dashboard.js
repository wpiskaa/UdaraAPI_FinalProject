// ===================================================
// CineAPI - Dashboard JavaScript
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
  setGreeting();
  await Promise.all([loadUsage()]);
  await loadKeys();
});

function initUserInfo() {
  if (!user) return;
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
  const planBadge = document.getElementById('userPlanBadge');
  planBadge.innerHTML = `<span class="badge badge-${user.plan}">${user.plan}</span>`;
  document.getElementById('planLimit').textContent = { free: '100/day', pro: '10K/day', enterprise: '100K/day' }[user.plan] || '100/day';
}

function setGreeting() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.name?.split(' ')[0] || 'there';
  document.getElementById('greeting').textContent = `${greet}, ${name}! 👋`;
}

// =============================================
// NAVIGATION
// =============================================
function switchPage(pageId, el) {
  if (el) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  const titles = { overview: 'Overview', keys: 'API Keys', usage: 'Usage Analytics', docs: 'API Documentation' };
  document.getElementById('pageTitle').textContent = titles[pageId] || pageId;

  if (pageId === 'usage') renderUsagePage();
  if (pageId === 'keys') updateKeysInfo();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// =============================================
// API HELPER
// =============================================
async function apiRequest(endpoint, options = {}) {
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

  return res.json();
}

// =============================================
// TOAST
// =============================================
function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =============================================
// MODALS
// =============================================
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  if (id === 'viewKeyModal') loadKeys();
}

function openCreateKeyModal() {
  document.getElementById('newKeyName').value = '';
  openModal('createKeyModal');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
});

// =============================================
// USAGE DATA
// =============================================
async function loadUsage() {
  const data = await apiRequest('/dashboard/usage');
  if (!data?.success) return;
  usageData = data.data;

  // Update overview stats
  document.getElementById('totalRequests').textContent = formatNumber(usageData.summary.total_requests);
  document.getElementById('requestsToday').textContent = formatNumber(usageData.summary.requests_today);
  document.getElementById('activeKeys').textContent = usageData.summary.active_keys;

  // Draw overview chart
  drawChart('usageChart', usageData.daily_usage);
}

function renderUsagePage() {
  if (!usageData) return;

  document.getElementById('u-totalRequests').textContent = formatNumber(usageData.summary.total_requests);
  document.getElementById('u-today').textContent = formatNumber(usageData.summary.requests_today);
  document.getElementById('u-keys').textContent = usageData.summary.active_keys;

  drawChart('usageChart2', usageData.daily_usage);

  // Top endpoints
  const topEl = document.getElementById('topEndpoints');
  if (usageData.top_endpoints?.length > 0) {
    const maxCount = usageData.top_endpoints[0].count;
    topEl.innerHTML = usageData.top_endpoints.map(ep => `
      <div class="endpoint-row">
        <div class="endpoint-row-body">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span class="endpoint-row-path">${ep.endpoint}</span>
            <span class="endpoint-row-count">${ep.count}</span>
          </div>
          <div class="endpoint-bar" style="width:${Math.round((ep.count / maxCount) * 100)}%"></div>
        </div>
      </div>
    `).join('');
  } else {
    topEl.innerHTML = '<div style="text-align:center;color:var(--color-text-3);padding:32px 0">No usage data yet</div>';
  }

  // Per-key usage
  const perKeyEl = document.getElementById('perKeyUsage');
  if (usageData.keys?.length > 0) {
    perKeyEl.innerHTML = usageData.keys.map(k => `
      <div class="per-key-row">
        <div>
          <div class="per-key-name">${k.key_name}</div>
          <div style="font-size:12px;color:var(--color-text-3)">Today: ${k.requests_today || 0}</div>
        </div>
        <div class="per-key-count">Total: ${formatNumber(k.total_requests || 0)}</div>
      </div>
    `).join('');
  } else {
    perKeyEl.innerHTML = '<div style="text-align:center;color:var(--color-text-3);padding:32px 0">No keys yet</div>';
  }
}

// =============================================
// CHART (vanilla canvas, no dependencies)
// =============================================
function drawChart(canvasId, dailyUsage) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 200 * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = '200px';
  ctx.scale(dpr, dpr);

  const W = rect.width;
  const H = 200;
  const padding = { top: 20, right: 20, bottom: 36, left: 40 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const values = dailyUsage.map(d => d.requests);
  const maxVal = Math.max(...values, 1);
  const labels = dailyUsage.map(d => {
    const [, m, day] = d.date.split('-');
    return `${day}/${m}`;
  });

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
    const y = padding.top + chartH * (1 - ratio);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(maxVal * ratio), padding.left - 8, y + 4);
  });

  const points = values.map((v, i) => ({
    x: padding.left + (i / (values.length - 1 || 1)) * chartW,
    y: padding.top + chartH * (1 - v / maxVal),
  }));

  if (points.length < 2) return;

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  gradient.addColorStop(0, 'rgba(31, 90, 44, 0.18)');
  gradient.addColorStop(1, 'rgba(31, 90, 44, 0.01)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, padding.top + chartH);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#1f5a2c';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Data points
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1f5a2c';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // X labels
  ctx.fillStyle = '#64748b';
  ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
  ctx.textAlign = 'center';
  labels.forEach((label, i) => {
    ctx.fillText(label, points[i].x, H - 8);
  });
}

// =============================================
// API KEYS
// =============================================
async function loadKeys() {
  const data = await apiRequest('/dashboard/keys');
  const container = document.getElementById('keysList');

  if (!data?.success) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><h3>Failed to load keys</h3></div>';
    return;
  }

  if (data.data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔑</div>
        <h3>No API Keys Yet</h3>
        <p>Buat API Key pertamamu untuk mulai mengakses data UdaraAPI.</p>
        <button class="btn btn-primary" style="margin-top:16px" onclick="openCreateKeyModal()">Create Your First Key</button>
      </div>
    `;
    return;
  }

  const planLimits = { free: 2, pro: 10, enterprise: 50 };
  const maxKeys = planLimits[user?.plan] || 2;

  container.innerHTML = data.data.map(key => `
    <div class="key-card ${key.is_active ? '' : 'inactive'}" id="key-${key.id}">
      <div class="key-icon">${key.is_active ? '🟢' : '🔴'}</div>
      <div class="key-body">
        <div class="key-top">
          <div class="key-name">${escapeHtml(key.key_name)}</div>
          <span class="badge ${key.is_active ? 'badge-success' : 'badge-error'}">${key.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <div class="key-value">
          <span id="keyval-${key.id}">${maskKey(key.api_key)}</span>
          <button class="copy-key-btn" onclick="copyKey('${escapeHtml(key.api_key)}', this)" title="Copy API Key">📋</button>
          <button class="copy-key-btn" onclick="toggleKeyVisibility('${key.id}', '${escapeHtml(key.api_key)}')" title="Show/Hide">👁</button>
        </div>
        <div class="key-meta">
          <div class="key-meta-item">📡 <strong>${formatNumber(key.total_requests || 0)}</strong> total requests</div>
          <div class="key-meta-item">📅 Today: <strong>${key.requests_today || 0}</strong> / ${key.rate_limit_per_day}</div>
          <div class="key-meta-item">🕐 Created: <strong>${formatDate(key.created_at)}</strong></div>
          ${key.last_used_at ? `<div class="key-meta-item">Last used: <strong>${formatDate(key.last_used_at)}</strong></div>` : ''}
        </div>
      </div>
      <div class="key-actions">
        <button class="btn btn-sm ${key.is_active ? 'btn-warning' : 'btn-success'}" onclick="toggleKeyActive('${key.id}', ${key.is_active})">
          ${key.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${key.id}')">Delete</button>
      </div>
    </div>
  `).join('');

  updateKeysInfo(data.count, maxKeys);
}

function updateKeysInfo(count, max) {
  if (count === undefined) return;
  document.getElementById('keysInfo').textContent = `${count} / ${max} keys used (${user?.plan || 'free'} plan)`;
}

function maskKey(key) {
  if (!key) return '—';
  return key.substring(0, 12) + '••••••••••••••••••••' + key.slice(-6);
}

let keyVisible = {};
function toggleKeyVisibility(keyId, fullKey) {
  const el = document.getElementById('keyval-' + keyId);
  if (!el) return;
  if (keyVisible[keyId]) {
    el.textContent = maskKey(fullKey);
    keyVisible[keyId] = false;
  } else {
    el.textContent = fullKey;
    keyVisible[keyId] = true;
  }
}

function copyKey(key, btn) {
  navigator.clipboard.writeText(key).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓';
    showToast('API key copied to clipboard!', 'success');
    setTimeout(() => { btn.textContent = orig; }, 2000);
  });
}

async function toggleKeyActive(keyId, currentStatus) {
  const data = await apiRequest(`/dashboard/keys/${keyId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: !currentStatus }),
  });

  if (data?.success) {
    showToast(data.message, 'success');
    loadKeys();
  } else {
    showToast(data?.error || 'Failed to update key', 'error');
  }
}

function openDeleteModal(keyId) {
  document.getElementById('deleteKeyId').value = keyId;
  openModal('deleteKeyModal');
}

async function confirmDeleteKey() {
  const keyId = document.getElementById('deleteKeyId').value;
  const data = await apiRequest(`/dashboard/keys/${keyId}`, { method: 'DELETE' });

  closeModal('deleteKeyModal');

  if (data?.success) {
    showToast('API key deleted.', 'success');
    loadKeys();
    loadUsage();
  } else {
    showToast(data?.error || 'Failed to delete key', 'error');
  }
}

async function handleCreateKey(e) {
  e.preventDefault();
  const name = document.getElementById('newKeyName').value.trim();
  const btn = document.getElementById('createKeyBtn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div>';

  const data = await apiRequest('/dashboard/keys', {
    method: 'POST',
    body: JSON.stringify({ key_name: name }),
  });

  btn.disabled = false;
  btn.innerHTML = 'Create Key';

  if (!data?.success) {
    showToast(data?.error || 'Failed to create key', 'error');
    return;
  }

  closeModal('createKeyModal');
  newKeyValue = data.data.api_key;
  document.getElementById('newKeyDisplay').textContent = newKeyValue;
  openModal('viewKeyModal');
  loadUsage();
}

function copyNewKey() {
  navigator.clipboard.writeText(newKeyValue).then(() => {
    showToast('API key copied!', 'success');
  });
}

// =============================================
// UTILITIES
// =============================================
function formatNumber(n) {
  if (n === null || n === undefined) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function logout() {
  localStorage.removeItem('udaraapi_token');
  localStorage.removeItem('udaraapi_user');
  window.location.href = '/login';
}

// Update quickstart code with first key
async function updateQuickstart() {
  const data = await apiRequest('/dashboard/keys');
  if (data?.success && data.data.length > 0) {
    const key = data.data[0].api_key;
    document.getElementById('quickstartCode').textContent =
      `curl -H "X-API-Key: ${key}" \\
  https://udara-api.vercel.app/api/v1/records/latest`;
  }
}
updateQuickstart();
