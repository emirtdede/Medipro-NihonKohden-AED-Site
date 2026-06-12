const API_URL = '/api';
const AUTH_URL = '/api/auth';

// --- Authentication & Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initSortables();
});

function initSortables() {
    const containers = [
        'hero-grid',
        'features-list',
        'faq-list',
        'regulations-list-items',
        'staff-list'
    ];

    containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            new Sortable(el, {
                animation: 150,
                handle: '.drag-handle', // Drag handle selector within list items
                ghostClass: 'sortable-ghost'
            });
        }
    });
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        showDashboard();
        loadData();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';

    // Restore active tab
    const lastTab = localStorage.getItem('activeTab') || 'hero';
    switchTab(lastTab);
}

function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}

function toggleForgot(show) {
    document.getElementById('login-box').style.display = show ? 'none' : 'block';
    document.getElementById('forgot-box').style.display = show ? 'block' : 'none';
    document.getElementById('forgot-msg').textContent = '';
}

// Login & Forgot Password Event Listeners
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    try {
        const res = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            localStorage.setItem('token', data.token);
            checkAuth();
        } else {
            errorMsg.textContent = data.message || 'Hatalı giriş!';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Sunucu hatası.';
        errorMsg.style.display = 'block';
    }
});

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    const msg = document.getElementById('forgot-msg');
    msg.textContent = 'Gönderiliyor...';
    try {
        const res = await fetch(`${AUTH_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        msg.textContent = data.message || (data.success ? 'Gönderildi' : 'Hata');
        msg.style.color = data.success ? 'green' : 'red';
    } catch (err) {
        msg.textContent = 'Sunucu hatası.';
    }
});

// --- API Helpers ---

async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const options = { method, headers };
    if (body) options.body = body instanceof FormData ? body : JSON.stringify(body);

    try {
        const res = await fetch(API_URL + endpoint, options);
        if (res.status === 401 || res.status === 403) { logout(); return null; }
        return await res.json();
    } catch (err) {
        console.error('API Error:', err);
        return null;
    }
}

// --- Data Management ---

let currentData = {};

async function loadData() {
    const data = await apiCall('/content');
    if (data) {
        currentData = data;
        renderAll();
    }
}

async function saveAll() {
    try {
        if (!currentData) currentData = {};

        currentData.hero = getHeroData();
        currentData.product = getProductData();
        currentData.faq = getFaqData();
        currentData.regulations = getRegulationsData();
        currentData.about = getFooterData();

        if (!currentData.contact) currentData.contact = {};
        currentData.contact.staff = getStaffData();
        currentData.contact.info = getContactInfoData();

        const res = await apiCall('/content', 'POST', currentData);
        if (res && res.success) {
            showToast();
        } else {
            alert('Kaydetme hatası: ' + (res?.message || 'Bilinmeyen hata'));
        }
    } catch (err) {
        console.error('Save Error:', err);
        alert('Beklenmedik bir hata oluştu: ' + err.message);
    }
}

// --- Helper for Dual Language Inputs ---

function getTransInputs(data, prefix) {
    // data is { tr: "...", en: "..." }
    const tr = data?.tr || '';
    const en = data?.en || '';
    return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
                <label style="font-size: 0.8rem; color: #666;">TR</label>
                <input type="text" class="lang-tr ${prefix}" value="${escapeHtml(tr)}" placeholder="Türkçe">
            </div>
            <div>
                <label style="font-size: 0.8rem; color: #666;">EN</label>
                <input type="text" class="lang-en ${prefix}" value="${escapeHtml(en)}" placeholder="English">
            </div>
        </div>
    `;
}

function getTransTextarea(data, prefix) {
    const tr = data?.tr || '';
    const en = data?.en || '';
    return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <div>
                <label style="font-size: 0.8rem; color: #666;">TR</label>
                <textarea class="lang-tr ${prefix}" rows="3">${escapeHtml(tr)}</textarea>
            </div>
            <div>
                <label style="font-size: 0.8rem; color: #666;">EN</label>
                <textarea class="lang-en ${prefix}" rows="3">${escapeHtml(en)}</textarea>
            </div>
        </div>
    `;
}

function readTransInput(container, prefix) {
    const tr = container.querySelector(`.lang-tr.${prefix}`).value;
    const en = container.querySelector(`.lang-en.${prefix}`).value;
    return { tr, en };
}

function escapeHtml(text) {
    if (!text) return '';
    return text.toString().replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const DRAG_HANDLE_ICON = '<span class="drag-handle">☰</span>';

// --- Hero Slider ---

function renderHero() {
    const grid = document.getElementById('hero-grid');
    grid.innerHTML = '';
    (currentData.hero || []).forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'slide-card';
        div.innerHTML = `
            ${DRAG_HANDLE_ICON}
            <img src="${item.image}" alt="Slide">
            <div class="form-group">
                <label>Başlık</label>
                ${getTransInputs(item.title, 'hero-title')}
            </div>
             <div class="form-group">
                <label>Açıklama</label>
                ${getTransTextarea(item.desc, 'hero-desc')}
            </div>
            <div class="card-action-footer">
                <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
                <button class="btn-danger" onclick="deleteHeroImage(${index})">Sil</button>
            </div>
        `;
        grid.appendChild(div);
    });
}

function getHeroData() {
    // We scrape all slide cards in current DOM order
    const cards = document.querySelectorAll('#hero-grid .slide-card');
    const newHero = [];

    cards.forEach((card) => {
        const img = card.querySelector('img').getAttribute('src');
        newHero.push({
            image: img,
            title: readTransInput(card, 'hero-title'),
            desc: readTransInput(card, 'hero-desc')
        });
    });
    return newHero;
}

async function deleteHeroImage(index) {
    if (!confirm('Silmek istediğine emin misin?')) return;
    // We can't delete by index efficiently if order changed in UI but not saved.
    // Better to remove element from DOM and rely on saveAll.
    // But Render rerenders from currentData. 
    // Quick fix: Remove from DOM, update model then re-render?
    // Or just splice from currentData? 
    // If user reordered but didn't save, currentData is old order. 
    // We should probably rely on the DOM state for source of truth before delete.
    // Let's UPDATE currentData from DOM first, then delete.
    currentData.hero = getHeroData();
    currentData.hero.splice(index, 1);
    renderHero();
}

document.getElementById('hero-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiCall('/upload', 'POST', formData);
    if (res && res.success) {
        // First sync with DOM to keep current order/edits
        currentData.hero = getHeroData();

        if (!currentData.hero) currentData.hero = [];
        currentData.hero.push({
            image: res.filePath,
            title: { tr: '', en: '' },
            desc: { tr: '', en: '' }
        });
        renderHero();
    }
});

// --- Product ---

function renderProduct() {
    // General
    const p = currentData.product || {};
    const genDiv = document.getElementById('product-general');
    genDiv.innerHTML = `
        <div class="form-group">
            <label>Ürün Adı (Başlık)</label>
            ${getTransInputs(p.title, 'prod-title')}
        </div>
        <div class="form-group">
            <label>Açıklama / Alt Başlık</label>
            ${getTransTextarea(p.desc, 'prod-desc')}
        </div>
    `;

    // Features
    const list = document.getElementById('features-list');
    list.innerHTML = '';
    (p.features || []).forEach(f => {
        const div = document.createElement('div');
        div.className = 'feature-card';
        div.innerHTML = `
            ${DRAG_HANDLE_ICON}
            <div class="form-group">
                <label>Özellik Başlığı</label>
                ${getTransInputs(f.title, 'feat-title')}
            </div>
            <div class="form-group">
                <label>Özellik Açıklaması</label>
                ${getTransTextarea(f.desc, 'feat-desc')}
            </div>
            <div class="card-action-footer">
                <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
                <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function getProductData() {
    const genDiv = document.getElementById('product-general');

    const features = [];
    document.querySelectorAll('#features-list .feature-card').forEach(card => {
        features.push({
            title: readTransInput(card, 'feat-title'),
            desc: readTransInput(card, 'feat-desc')
        });
    });

    return {
        title: readTransInput(genDiv, 'prod-title'),
        desc: readTransInput(genDiv, 'prod-desc'),
        features: features
    };
}

function addFeatureItem() {
    const list = document.getElementById('features-list');
    const div = document.createElement('div');
    div.className = 'feature-card';
    div.innerHTML = `
        ${DRAG_HANDLE_ICON}
        <div class="form-group">
            <label>Özellik Başlığı</label>
            ${getTransInputs({}, 'feat-title')}
        </div>
        <div class="form-group">
            <label>Özellik Açıklaması</label>
            ${getTransTextarea({}, 'feat-desc')}
        </div>
        <div class="card-action-footer">
            <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
            <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
        </div>
    `;
    list.appendChild(div);
}

// --- FAQ ---

function renderFaq() {
    const list = document.getElementById('faq-list');
    list.innerHTML = '';
    (currentData.faq || []).forEach(f => {
        const div = document.createElement('div');
        div.className = 'feature-card';
        div.innerHTML = `
            ${DRAG_HANDLE_ICON}
            <div class="form-group">
                <label>Soru</label>
                ${getTransInputs(f.question, 'faq-q')}
            </div>
            <div class="form-group">
                <label>Cevap</label>
                ${getTransTextarea(f.answer, 'faq-a')}
            </div>
            <div class="card-action-footer">
                <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
                <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function getFaqData() {
    const items = [];
    document.querySelectorAll('#faq-list .feature-card').forEach(card => {
        items.push({
            question: readTransInput(card, 'faq-q'),
            answer: readTransInput(card, 'faq-a')
        });
    });
    return items;
}

function addFaqItem() {
    const list = document.getElementById('faq-list');
    const div = document.createElement('div');
    div.className = 'feature-card';
    div.innerHTML = `
        ${DRAG_HANDLE_ICON}
        <div class="form-group">
            <label>Soru</label>
            ${getTransInputs({}, 'faq-q')}
        </div>
        <div class="form-group">
            <label>Cevap</label>
            ${getTransTextarea({}, 'faq-a')}
        </div>
        <div class="card-action-footer">
            <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
            <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
        </div>
    `;
    list.appendChild(div);
}

// --- Regulations ---

function renderRegulations() {
    const r = currentData.regulations || {};
    const genDiv = document.getElementById('regulations-general');
    genDiv.innerHTML = `
        <div class="form-group">
            <label>Başlık</label>
            ${getTransInputs(r.title, 'reg-title')}
        </div>
        <div class="form-group">
            <label>Giriş Metni</label>
            ${getTransTextarea(r.desc, 'reg-desc')}
        </div>
    `;

    const list = document.getElementById('regulations-list-items');
    list.innerHTML = '';
    (r.items || []).forEach(item => {
        // item is { tr, en }
        const div = document.createElement('div');
        div.className = 'feature-card';
        div.innerHTML = `
            ${DRAG_HANDLE_ICON}
             <div class="form-group">
                <label>Madde Metni</label>
                ${getTransTextarea(item, 'reg-item')}
            </div>
            <div class="card-action-footer">
                <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
                <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
            </div>
        `;
        list.appendChild(div);
    });

    // Add Button (Manual injection if missing)
    if (!document.getElementById('add-reg-btn')) {
        const btn = document.createElement('button');
        btn.id = 'add-reg-btn';
        btn.textContent = '+ Madde Ekle';
        btn.className = 'btn-add'; // Add class for styling if needed
        btn.style.marginTop = '10px';
        btn.style.background = '#10b981';
        btn.style.width = 'auto';
        btn.onclick = () => {
            const div = document.createElement('div');
            div.className = 'feature-card';
            div.innerHTML = `
                ${DRAG_HANDLE_ICON}
                 <div class="form-group">
                    <label>Madde Metni</label>
                    ${getTransTextarea({}, 'reg-item')}
                </div>
                <div class="card-action-footer">
                    <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
                    <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
                </div>
            `;
            document.getElementById('regulations-list-items').appendChild(div);
        }
        genDiv.parentElement.insertBefore(btn, list.nextSibling); // Insert after items list
    }
}

function getRegulationsData() {
    const genDiv = document.getElementById('regulations-general');
    const items = [];
    document.querySelectorAll('#regulations-list-items .feature-card').forEach(card => {
        items.push(readTransInput(card, 'reg-item'));
    });

    return {
        title: readTransInput(genDiv, 'reg-title'),
        desc: readTransInput(genDiv, 'reg-desc'),
        items: items
    };
}

// --- Contact / Footer / Staff ---

function renderContact() {
    try {
        // Footer "About" (Medipro & Distributor)
        const about = currentData.about || {};
        const footMedi = document.getElementById('footer-medipro');
        const footDist = document.getElementById('footer-dist');

        if (footMedi) footMedi.innerHTML = getTransTextarea(about.medipro, 'foot-medi');
        if (footDist) footDist.innerHTML = getTransTextarea(about.distributor, 'foot-dist');

        // General Info
        const contact = currentData.contact || {};
        const info = contact.info || {};

        // Default values if empty
        if (!info.address) info.address = { tr: '', en: '' };
        if (!info.phone) info.phone = { tr: '', en: '' };

        const infoDiv = document.getElementById('contact-general-info');
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div class="form-group">
                    <label>Adres</label>
                    ${getTransTextarea(info.address, 'ci-addr')}
                </div>
                <div class="form-group">
                    <label>Telefon (Her satıra bir numara)</label>
                    ${getTransTextarea(info.phone, 'ci-phone')} 
                </div>
                 <div class="form-group">
                    <label>E-posta</label>
                     ${getTransInputs(info.email, 'ci-email')}
                </div>
            `;
        }

        // Staff
        const staff = contact.staff || [];
        const list = document.getElementById('staff-list');
        if (list) {
            list.innerHTML = '';
            staff.forEach(s => {
                const div = document.createElement('div');
                div.className = 'feature-card';
                div.innerHTML = `
                    ${DRAG_HANDLE_ICON}
                     <div class="form-group">
                        <label>Ünvan / İsim (Title)</label>
                        ${getTransInputs(s.title, 'st-title')}
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" class="st-phone" value="${s.phone || ''}" placeholder="Telefon">
                        <input type="text" class="st-email" value="${s.email || ''}" placeholder="E-posta">
                    </div>
                    <div class="card-action-footer">
                        <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
                        <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
                    </div>
                `;
                list.appendChild(div);
            });
        }
    } catch (error) {
        console.error("Error in renderContact:", error);
    }
}

function getContactInfoData() {
    const div = document.getElementById('contact-general-info');
    if (!div) return {};
    return {
        address: readTransInput(div, 'ci-addr'),
        phone: readTransInput(div, 'ci-phone'),
        email: readTransInput(div, 'ci-email')
    };
}

function getStaffData() {
    const items = [];
    document.querySelectorAll('#staff-list .feature-card').forEach(card => {
        items.push({
            title: readTransInput(card, 'st-title'),
            phone: card.querySelector('.st-phone').value,
            email: card.querySelector('.st-email').value
        });
    });
    return items;
}

function getFooterData() {
    const medDiv = document.getElementById('footer-medipro');
    const distDiv = document.getElementById('footer-dist');
    return {
        medipro: readTransInput(medDiv, 'foot-medi'),
        distributor: readTransInput(distDiv, 'foot-dist')
    };
}

function addStaffItem() {
    const list = document.getElementById('staff-list');
    const div = document.createElement('div');
    div.className = 'feature-card';
    div.innerHTML = `
        ${DRAG_HANDLE_ICON}
         <div class="form-group">
            <label>Ünvan / İsim (Title)</label>
            ${getTransInputs({}, 'st-title')}
        </div>
        <div style="display: flex; gap: 10px;">
            <input type="text" class="st-phone" placeholder="Telefon">
            <input type="text" class="st-email" placeholder="E-posta">
        </div>
        <div class="card-action-footer">
            <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
            <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
        </div>
    `;
    list.appendChild(div);
}

// --- Tabs & Profile ---

// --- Analytics Components --

// --- Analytics Components --

let currentPage = 1;
let currentSearch = '';
let searchTimeout = null;

function initAnalytics() {
    const select = document.getElementById('analytics-month');
    if (!select) return;

    // Only init if empty
    if (select.options.length > 0) return;

    const now = new Date();
    const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    select.innerHTML = '';
    // Add current month and previous 5 months
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const value = `${d.getFullYear()}-${d.getMonth() + 1}`; // YYYY-M
        const text = `${months[d.getMonth()]} ${d.getFullYear()}`;

        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
    }
}

async function fetchAnalytics() {
    const select = document.getElementById('analytics-month');
    if (!select) initAnalytics(); // Init if empty

    const [year, month] = select.value.split('-');

    // UI Loading States
    document.getElementById('kpi-unique').textContent = '...';
    document.getElementById('kpi-total').textContent = '...';
    document.getElementById('top-cities-list').innerHTML = '<li style="color:#94a3b8">Yükleniyor...</li>';

    try {
        // 1. Fetch Summary (KPI + Top Cities)
        const summary = await apiCall(`/admin/stats?month=${month}&year=${year}`);

        if (summary) {
            // Render KPIs
            const kpi = summary.kpi || {};
            document.getElementById('kpi-unique').textContent = kpi.unique_visitors || 0;
            document.getElementById('kpi-total').textContent = kpi.total_visits || 0;

            // Render Top Cities (Filter out UNKNOWN)
            const rawCities = summary.top_cities || [];
            const topCities = rawCities.filter(c =>
                !c.city.includes('UNKNOWN') &&
                !c.country.includes('UNKNOWN')
            );
            const cityList = document.getElementById('top-cities-list');
            cityList.innerHTML = '';
            if (topCities.length === 0) {
                cityList.innerHTML = '<li style="color:#94a3b8; font-style: italic;">Veri yok</li>';
            } else {
                topCities.forEach((city, index) => {
                    const li = document.createElement('li');
                    li.style.display = 'flex';
                    li.style.justifyContent = 'space-between';
                    li.style.alignItems = 'center';
                    li.style.padding = '10px 0';
                    li.style.borderBottom = '1px solid #f8fafc';
                    li.innerHTML = `
                        <span style="display: flex; align-items: center; gap: 10px;">
                            <span style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; background:#eff6ff; color:#3b82f6; border-radius:50%; font-size:0.75rem; font-weight:700;">${index + 1}</span> 
                            <span style="color: #334155; font-weight: 500;">${city.city || 'Bilinmiyor'}, ${city.country || ''}</span>
                        </span>
                        <strong style="color: #0f172a; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; font-size: 0.85rem;">${city.count}</strong>
                    `;
                    cityList.appendChild(li);
                });
            }
        }

        // 2. Fetch Table (Reset to page 1)
        currentPage = 1;
        fetchVisitorTable();

    } catch (err) {
        console.error('Stats Error:', err);
    }
}

async function fetchVisitorTable() {
    const select = document.getElementById('analytics-month');
    const [year, month] = select.value.split('-');
    const tbody = document.getElementById('visitor-stats-body');

    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Yükleniyor...</td></tr>';

    try {
        const url = `/admin/visitors?month=${month}&year=${year}&page=${currentPage}&search=${encodeURIComponent(currentSearch)}`;
        const res = await apiCall(url);

        if (!res || !res.data) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Veri alınamadı.</td></tr>';
            return;
        }

        const visitors = res.data;
        const pagination = res.pagination;

        // Update Page Info
        document.getElementById('page-info').textContent = `Sayfa ${pagination.page} / ${pagination.pages}`;

        tbody.innerHTML = '';
        if (visitors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Kayıt bulunamadı.</td></tr>';
            return;
        }

        visitors.forEach(row => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #e2e8f0';

            // Format Date (Last Seen)
            const date = new Date(row.last_seen);
            const dateStr = date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

            // Location
            let loc = row.country || '-';
            if (row.city) loc += ` / ${row.city}`;

            // Device
            const device = `${row.browser || ''} ${row.os ? '(' + row.os + ')' : ''}`;

            tr.innerHTML = `
                <td style="padding: 10px; font-family: monospace; font-size: 0.8rem; color: #64748b;" title="${row.ip_hash}">${row.ip_hash ? row.ip_hash.substring(0, 8) + '...' : '-'}</td>
                <td style="padding: 10px;">${loc}</td>
                <td style="padding: 10px;">${device}</td>
                <td style="padding: 10px; text-align: center;"><span style="background: #e2e8f0; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${row.visit_count}</span></td>
                <td style="padding: 10px; text-align: right; white-space: nowrap; color: #64748b;">${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error('Table Error:', err);
    }
}

function changePage(delta) {
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    fetchVisitorTable();
}

function searchVisitors() {
    const input = document.getElementById('visitor-search');
    currentSearch = input.value;

    // Debounce
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        fetchVisitorTable();
    }, 500);
}

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.section-content').forEach(c => c.classList.remove('active'));

    const tabs = document.querySelectorAll('.tab');
    for (let t of tabs) {
        if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(tabId)) {
            t.classList.add('active');
        }
    }
    document.getElementById(`${tabId}-content`).classList.add('active');
    localStorage.setItem('activeTab', tabId);

    if (tabId === 'profile' && typeof loadProfile === 'function') {
        loadProfile();
    }

    if (tabId === 'visitors') {
        initAnalytics();
        fetchAnalytics();
    }
}


function renderAll() {
    try { renderHero(); } catch (e) { console.error(e); }
    try { renderProduct(); } catch (e) { console.error(e); }
    try { renderFaq(); } catch (e) { console.error(e); }
    try { renderRegulations(); } catch (e) { console.error(e); }
    try { renderContact(); } catch (e) {
        console.error("renderContact error:", e);
        const div = document.getElementById('contact-general-info');
        if (div) div.innerHTML = `<p style="color:red">Error rendering contact info: ${e.message}</p>`;

        const list = document.getElementById('staff-list');
        if (list) list.innerHTML = `<p style="color:red">Error rendering staff list: ${e.message}</p>`;
    }
}

function renderContact() {
    // Footer "About" (Medipro & Distributor)
    const about = currentData.about || {};
    const footMedi = document.getElementById('footer-medipro');
    const footDist = document.getElementById('footer-dist');

    if (footMedi) footMedi.innerHTML = getTransTextarea(about.medipro, 'foot-medi');
    if (footDist) footDist.innerHTML = getTransTextarea(about.distributor, 'foot-dist');

    // General Info
    const contact = currentData.contact || {};
    const info = contact.info || {};

    // Default values if empty
    if (!info.address) info.address = { tr: '', en: '' };
    if (!info.phone) info.phone = { tr: '', en: '' };

    const infoDiv = document.getElementById('contact-general-info');
    if (infoDiv) {
        infoDiv.innerHTML = `
            <div class="form-group">
                <label>Adres</label>
                ${getTransTextarea(info.address, 'ci-addr')}
            </div>
            <div class="form-group">
                <label>Telefon (Her satıra bir numara)</label>
                ${getTransTextarea(info.phone, 'ci-phone')} 
            </div>
                <div class="form-group">
                <label>E-posta</label>
                    ${getTransInputs(info.email, 'ci-email')}
            </div>
        `;
    }

    // Staff
    const staff = contact.staff || [];
    const list = document.getElementById('staff-list');
    if (list) {
        list.innerHTML = '';
        staff.forEach(s => {
            const div = document.createElement('div');
            div.className = 'feature-card';
            div.innerHTML = `
                ${DRAG_HANDLE_ICON}
                    <div class="form-group">
                    <label>Ünvan / İsim (Title)</label>
                    ${getTransInputs(s.title, 'st-title')}
                </div>
                <div style="display: flex; gap: 10px;">
                    <input type="text" class="st-phone" value="${s.phone || ''}" placeholder="Telefon">
                    <input type="text" class="st-email" value="${s.email || ''}" placeholder="E-posta">
                </div>
                <div class="card-action-footer">
                    <button class="btn-primary-small" onclick="saveAll()">Kaydet</button>
                    <button class="btn-danger" onclick="this.closest('.feature-card').remove()">Sil</button>
                </div>
            `;
            list.appendChild(div);
        });
    }
}

function showToast() {
    const t = document.getElementById('toast');
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
}
