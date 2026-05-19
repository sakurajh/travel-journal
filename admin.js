// ===== 全局状态 =====
let currentSection = 'trips';
let currentUploadTripId = null;
let pendingUploads = [];

// ===== 页面初始化 =====
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化存储
    await storageManager.init();

    // 检查是否需要迁移旧数据
    const hasOld = localStorage.getItem('travelJournalData');
    if (hasOld) {
        if (confirm('检测到旧数据，是否迁移到新存储系统？')) {
            await storageManager.migrateFromLocalStorage();
            alert('数据迁移完成！');
        }
    }

    // 初始化界面
    initNavigation();
    setupUploadZone();
    await renderTrips();
    await loadSettings();

    // 如果不支持 File System Access API，显示提示
    if (!storageManager.hasFileSystemAccess()) {
        showCompatibilityWarning();
    }
});

// ===== 兼容性警告 =====
function showCompatibilityWarning() {
    const warning = document.createElement('div');
    warning.className = 'compat-warning';
    warning.innerHTML = `
        <div class="warning-content">
            <strong>提示：</strong>您的浏览器不支持文件系统访问，照片将存储在 IndexedDB 中（约 50MB 限制）。
            推荐使用 Chrome 或 Edge 浏览器以获得无限存储。
            <button onclick="this.parentElement.parentElement.remove()">知道了</button>
        </div>
    `;
    document.body.prepend(warning);
}

// ===== 导航 =====
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(item.dataset.section);
        });
    });
}

async function switchSection(section) {
    currentSection = section;

    // 更新导航状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // 更新内容区域
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `section-${section}`);
    });

    // 更新页面标题和按钮
    const titles = { trips: '旅行管理', photos: '照片管理', settings: '页面设置' };
    document.getElementById('pageTitle').textContent = titles[section] || '';

    const addBtn = document.getElementById('addNewBtn');
    if (section === 'trips') {
        addBtn.textContent = '+ 新建旅行';
        addBtn.onclick = createNewTrip;
        addBtn.style.display = '';
        await renderTrips();
    } else if (section === 'photos') {
        addBtn.textContent = '+ 添加照片';
        addBtn.onclick = () => openUploadModal();
        addBtn.style.display = '';
        await renderPhotosSection();
    } else {
        addBtn.style.display = 'none';
        await loadSettings();
    }
}

// ===== 旅行管理 =====
async function renderTrips() {
    const trips = await storageManager.getAllTrips();
    const grid = document.getElementById('tripsGrid');
    const emptyState = document.getElementById('emptyTrips');

    if (trips.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.add('active');
        return;
    }

    emptyState.classList.remove('active');
    grid.innerHTML = trips.map(trip => {
        const photoCount = Object.values(trip.photos || {}).reduce(
            (sum, arr) => sum + arr.length, 0
        );

        return `
            <div class="trip-card" data-id="${trip.id}">
                <div class="trip-card-header">
                    <div class="trip-card-title">${trip.name}</div>
                    <div class="trip-card-year">${trip.year}</div>
                    ${trip.subtitle ? `<div class="trip-card-subtitle">${trip.subtitle}</div>` : ''}
                </div>
                <div class="trip-card-body">
                    <div class="trip-card-stats">
                        <div class="stat-item">
                            <span class="stat-icon">📍</span>
                            <span>${trip.destinations.length} 个目的地</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-icon">📷</span>
                            <span>${photoCount} 张照片</span>
                        </div>
                    </div>
                    <div class="trip-card-destinations">
                        ${trip.destinations.map(d => `<span class="destination-tag">${d.name}</span>`).join('')}
                    </div>
                </div>
                <div class="trip-card-actions">
                    <button class="btn btn-secondary" onclick="editTrip('${trip.id}')">✏️ 编辑</button>
                    <button class="btn btn-secondary" onclick="manageTripPhotos('${trip.id}')">📷 照片</button>
                    <button class="btn btn-danger" onclick="deleteTrip('${trip.id}')">🗑️ 删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function createNewTrip() {
    document.getElementById('tripModalTitle').textContent = '新建旅行';
    document.getElementById('tripName').value = '';
    document.getElementById('tripYear').value = new Date().getFullYear().toString();
    document.getElementById('tripSubtitle').value = '';
    document.getElementById('tripDescription').value = '';
    document.getElementById('destinationsList').innerHTML = '';

    addDestination();
    addDestination();

    document.getElementById('tripModal').classList.add('active');
    document.getElementById('tripModal').dataset.editId = '';
}

async function editTrip(id) {
    const trip = await storageManager.getTrip(id);
    if (!trip) return;

    document.getElementById('tripModalTitle').textContent = '编辑旅行';
    document.getElementById('tripName').value = trip.name;
    document.getElementById('tripYear').value = trip.year;
    document.getElementById('tripSubtitle').value = trip.subtitle || '';
    document.getElementById('tripDescription').value = trip.description || '';

    const list = document.getElementById('destinationsList');
    list.innerHTML = '';
    trip.destinations.forEach(dest => addDestination(dest));

    document.getElementById('tripModal').classList.add('active');
    document.getElementById('tripModal').dataset.editId = id;
}

function closeTripModal() {
    document.getElementById('tripModal').classList.remove('active');
}

function addDestination(data = null) {
    const list = document.getElementById('destinationsList');
    const item = document.createElement('div');
    item.className = 'destination-item';
    item.innerHTML = `
        <input type="text" placeholder="目的地名称" value="${data ? data.name : ''}">
        <input type="text" placeholder="地区" value="${data ? data.region : ''}" style="max-width: 100px;">
        <input type="text" placeholder="日期" value="${data ? data.date : ''}" style="max-width: 100px;">
        <button class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
    `;
    list.appendChild(item);
}

async function saveTrip() {
    const name = document.getElementById('tripName').value.trim();
    const year = document.getElementById('tripYear').value.trim();
    const subtitle = document.getElementById('tripSubtitle').value.trim();
    const description = document.getElementById('tripDescription').value.trim();
    const editId = document.getElementById('tripModal').dataset.editId;

    if (!name) {
        alert('请输入旅行名称');
        return;
    }

    const destItems = document.querySelectorAll('#destinationsList .destination-item');
    const destinations = [];
    destItems.forEach((item, index) => {
        const inputs = item.querySelectorAll('input');
        const destName = inputs[0].value.trim();
        if (destName) {
            destinations.push({
                name: destName,
                region: inputs[1].value.trim() || '',
                date: inputs[2].value.trim() || '',
                index: String(index + 1).padStart(2, '0')
            });
        }
    });

    if (editId) {
        // 编辑现有旅行
        const existing = await storageManager.getTrip(editId);
        await storageManager.saveTrip({
            ...existing,
            name, year, subtitle, description, destinations
        });
    } else {
        // 新建旅行
        await storageManager.saveTrip({
            id: 'trip_' + Date.now(),
            name, year, subtitle, description, destinations,
            photos: {},
            createdAt: new Date().toISOString()
        });
    }

    closeTripModal();
    await renderTrips();
}

async function deleteTrip(id) {
    if (confirm('确定要删除这个旅行吗？所有照片也会被删除。')) {
        await storageManager.deleteTrip(id);
        await renderTrips();
    }
}

function manageTripPhotos(id) {
    currentUploadTripId = id;
    switchSection('photos');
}

// ===== 照片管理 =====
async function renderPhotosSection() {
    const trips = await storageManager.getAllTrips();
    const select = document.getElementById('photoTripSelect');

    select.innerHTML = '<option value="">请选择旅行</option>';
    trips.forEach(trip => {
        select.innerHTML += `<option value="${trip.id}">${trip.name} (${trip.year})</option>`;
    });

    if (currentUploadTripId) {
        select.value = currentUploadTripId;
    }

    select.onchange = () => {
        currentUploadTripId = select.value;
        document.getElementById('uploadPhotosBtn').disabled = !select.value;
        renderPhotos();
    };

    document.getElementById('uploadPhotosBtn').onclick = () => openUploadModal();
    document.getElementById('uploadPhotosBtn').disabled = !currentUploadTripId;

    await renderPhotos();
}

async function renderPhotos() {
    const grid = document.getElementById('photosGrid');
    const emptyState = document.getElementById('emptyPhotos');

    if (!currentUploadTripId) {
        grid.innerHTML = '';
        emptyState.classList.add('active');
        return;
    }

    const trip = await storageManager.getTrip(currentUploadTripId);
    if (!trip) {
        grid.innerHTML = '';
        emptyState.classList.add('active');
        return;
    }

    let allPhotos = [];
    for (const [destIndex, photos] of Object.entries(trip.photos || {})) {
        const dest = trip.destinations[parseInt(destIndex)];
        if (!dest) continue;

        for (const photo of photos) {
            let photoSrc = photo.legacySrc || '';
            if (photo.path && storageManager.hasDirHandle()) {
                photoSrc = await storageManager.getPhotoUrl(photo.path) || '';
            }

            allPhotos.push({
                ...photo,
                src: photoSrc,
                destination: dest.name,
                destIndex: parseInt(destIndex)
            });
        }
    }

    if (allPhotos.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.add('active');
        return;
    }

    emptyState.classList.remove('active');
    grid.innerHTML = allPhotos.map(photo => `
        <div class="photo-card">
            <img src="${photo.src}" alt="${photo.name}" loading="lazy">
            <div class="photo-card-overlay">
                <div class="photo-card-info">
                    <div>${photo.destination}</div>
                    <div style="font-size: 0.65rem; opacity: 0.7;">${photo.name}</div>
                </div>
                <div class="photo-card-actions">
                    <button class="btn btn-danger" onclick="deletePhoto('${currentUploadTripId}', ${photo.destIndex}, '${photo.id}')">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== 上传功能 =====
function openUploadModal() {
    if (!currentUploadTripId) {
        alert('请先选择一个旅行');
        return;
    }

    renderUploadDestinations();
    pendingUploads = [];
    document.getElementById('uploadPreview').innerHTML = '';
    document.getElementById('uploadModal').classList.add('active');

    // 显示存储状态
    updateUploadStorageStatus();
}

async function renderUploadDestinations() {
    const trip = await storageManager.getTrip(currentUploadTripId);
    if (!trip) return;

    const select = document.getElementById('uploadDestination');
    select.innerHTML = '<option value="">请选择目的地</option>';
    trip.destinations.forEach((dest, index) => {
        select.innerHTML += `<option value="${index}">${dest.index} - ${dest.name}</option>`;
    });
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('active');
    pendingUploads = [];
}

function setupUploadZone() {
    const zone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    zone.addEventListener('click', () => fileInput.click());

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        handleFileSelect(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            handleFileSelect(fileInput.files);
        }
        setTimeout(() => fileInput.value = '', 100);
    });
}

function handleFileSelect(files) {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (fileArray.length === 0) {
        alert('请选择图片文件');
        return;
    }

    fileArray.forEach(file => {
        // 创建预览
        const reader = new FileReader();
        reader.onload = (e) => {
            pendingUploads.push({
                file: file,
                preview: e.target.result,
                name: file.name,
                size: file.size
            });
            renderUploadPreview();
        };
        reader.readAsDataURL(file);
    });
}

function renderUploadPreview() {
    const preview = document.getElementById('uploadPreview');
    preview.innerHTML = pendingUploads.map((photo, index) => `
        <div class="preview-item">
            <img src="${photo.preview}" alt="${photo.name}">
            <button class="remove-btn" onclick="removePendingUpload(${index})">×</button>
            <div class="preview-info">${(photo.size / 1024).toFixed(0)}KB</div>
        </div>
    `).join('');
}

function removePendingUpload(index) {
    pendingUploads.splice(index, 1);
    renderUploadPreview();
}

async function confirmUpload() {
    const destIndex = document.getElementById('uploadDestination').value;
    if (destIndex === '') {
        alert('请选择目的地');
        return;
    }

    if (pendingUploads.length === 0) {
        alert('请先选择照片');
        return;
    }

    const trip = await storageManager.getTrip(currentUploadTripId);
    if (!trip) return;

    let successCount = 0;
    let failCount = 0;

    for (const photo of pendingUploads) {
        try {
            let photoData;

            if (storageManager.hasDirHandle()) {
                // 使用文件系统存储
                photoData = await storageManager.savePhoto(
                    currentUploadTripId,
                    parseInt(destIndex),
                    photo.file
                );
            } else {
                // 回退到 IndexedDB 存储 Base64
                photoData = {
                    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    path: null,
                    name: photo.name,
                    size: photo.size,
                    addedAt: new Date().toISOString(),
                    legacySrc: photo.preview
                };
            }

            // 添加到旅行数据
            if (!trip.photos[destIndex]) {
                trip.photos[destIndex] = [];
            }
            trip.photos[destIndex].push(photoData);
            successCount++;
        } catch (e) {
            console.error('上传失败:', photo.name, e);
            failCount++;
        }
    }

    // 保存旅行数据
    await storageManager.saveTrip(trip);

    closeUploadModal();
    await renderPhotos();

    if (failCount > 0) {
        alert(`上传完成：${successCount} 成功，${failCount} 失败`);
    } else {
        alert(`成功上传 ${successCount} 张照片`);
    }
}

async function deletePhoto(tripId, destIndex, photoId) {
    if (!confirm('确定要删除这张照片吗？')) return;

    const trip = await storageManager.getTrip(tripId);
    if (!trip || !trip.photos[destIndex]) return;

    const photoIndex = trip.photos[destIndex].findIndex(p => p.id === photoId);
    if (photoIndex === -1) return;

    const photo = trip.photos[destIndex][photoIndex];

    // 删除文件
    if (photo.path && storageManager.hasDirHandle()) {
        await storageManager.deletePhoto(photo.path);
    }

    // 删除元数据
    trip.photos[destIndex].splice(photoIndex, 1);
    await storageManager.saveTrip(trip);

    await renderPhotos();
}

// ===== 设置管理 =====
async function loadSettings() {
    const settings = await storageManager.getSettings();

    document.getElementById('siteTitle').value = settings.siteTitle || '';
    document.getElementById('siteSubtitle').value = settings.siteSubtitle || '';
    document.getElementById('footerInfo').value = settings.footerInfo || '';
    document.getElementById('filmStock').value = settings.filmStock || '';

    const themeRadio = document.querySelector(`input[name="theme"][value="${settings.theme}"]`);
    if (themeRadio) themeRadio.checked = true;

    // 更新存储统计
    await updateStorageStats();
}

async function saveSettings() {
    const settings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteSubtitle: document.getElementById('siteSubtitle').value,
        footerInfo: document.getElementById('footerInfo').value,
        filmStock: document.getElementById('filmStock').value,
        theme: document.querySelector('input[name="theme"]:checked').value
    };

    await storageManager.saveSettings(settings);
    alert('设置已保存');
}

async function resetSettings() {
    if (confirm('确定要重置为默认设置吗？')) {
        await storageManager.saveSettings({
            siteTitle: '旅行摄影日志',
            siteSubtitle: '用镜头记录世界的美好',
            footerInfo: 'TRAVEL JOURNAL',
            theme: 'coral',
            filmStock: 'KODAK PORTRA 400'
        });
        await loadSettings();
    }
}

// ===== 存储统计 =====
async function updateStorageStats() {
    const stats = await storageManager.getStorageStats();

    document.getElementById('statTrips').textContent = stats.tripCount;
    document.getElementById('statPhotos').textContent = stats.photoCount;
    document.getElementById('statStorage').textContent = stats.formattedDbSize;
    document.getElementById('statFileSystem').textContent = stats.hasFileSystem ? '已启用' : '未启用';

    const fsStatus = document.getElementById('fileSystemStatus');
    if (storageManager.hasFileSystemAccess()) {
        if (stats.hasFileSystem) {
            fsStatus.innerHTML = '<span class="status-ok">✓ 文件系统已连接</span>';
        } else {
            fsStatus.innerHTML = `
                <span class="status-warn">未连接文件系统</span>
                <button class="btn btn-primary btn-sm" onclick="connectFileSystem()">选择照片文件夹</button>
            `;
        }
    } else {
        fsStatus.innerHTML = '<span class="status-warn">浏览器不支持文件系统访问，使用 IndexedDB 存储</span>';
    }
}

async function connectFileSystem() {
    const success = await storageManager.selectPhotosFolder();
    if (success) {
        alert('文件系统已连接！照片将保存到本地文件夹。');
        await updateStorageStats();
    }
}

async function updateUploadStorageStatus() {
    const stats = await storageManager.getStorageStats();
    const statusEl = document.getElementById('uploadStorageStatus');

    if (statusEl) {
        if (stats.hasFileSystem) {
            statusEl.innerHTML = '<span class="status-ok">✓ 使用本地文件存储（无限制）</span>';
        } else {
            statusEl.innerHTML = `<span class="status-warn">使用 IndexedDB 存储（已用 ${stats.formattedDbSize}）</span>`;
        }
    }
}

// ===== 数据导入导出 =====
async function exportData() {
    try {
        const data = await storageManager.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `travel-journal-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('数据导出成功');
    } catch (e) {
        alert('导出失败: ' + e.message);
    }
}

function importData() {
    document.getElementById('importFile').click();
}

async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.trips) {
            alert('无效的数据文件');
            return;
        }

        if (confirm(`确定要导入数据吗？将导入 ${data.trips.length} 个旅行。`)) {
            await storageManager.importData(data);
            alert('导入成功！');
            location.reload();
        }
    } catch (e) {
        alert('导入失败: ' + e.message);
    }

    event.target.value = '';
}

async function clearAllData() {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
    if (!confirm('再次确认：所有旅行和照片数据都将被删除！')) return;

    // 清除 IndexedDB
    const trips = await storageManager.getAllTrips();
    for (const trip of trips) {
        await storageManager.deleteTrip(trip.id);
    }

    alert('数据已清空');
    location.reload();
}
