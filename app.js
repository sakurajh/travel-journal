// ===== 旅行摄影日志 - 前台展示 =====

class TravelApp {
    constructor() {
        this.currentTrip = null;
        this.currentPhotos = [];
        this.currentLightboxIndex = 0;
    }

    async init() {
        try {
            // 初始化存储
            await storageManager.init();

            // 获取当前旅行
            const trips = await storageManager.getAllTrips();

            if (trips.length === 0) {
                this.hideLoader();
                this.showEmptyState();
                return;
            }

            const currentTripId = await storageManager.getCurrentTripId();
            this.currentTrip = trips.find(t => t.id === currentTripId) || trips[0];

            // 显示加载动画
            this.showLoader();

            await this.render();

            // 隐藏加载动画
            setTimeout(() => this.hideLoader(), 800);

            this.setupEventListeners();
            this.initCursor();
            this.initParticles();
            this.initTiltEffect();
            this.initRippleEffect();
            this.initMagneticButtons();
            this.animateTitle();
            this.initToolbar();
            this.initFilters();
            this.initExif();
            this.initTransitionAnimations();
        } catch (err) {
            console.error('init error:', err);
            this.hideLoader();
            this.showEmptyState();
        }
    }

    // ===== 加载动画 =====
    showLoader() {
        const loader = document.getElementById('pageLoader');
        const progress = document.getElementById('loaderProgress');

        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 30;
            if (width > 100) width = 100;
            progress.style.width = width + '%';

            if (width >= 100) {
                clearInterval(interval);
            }
        }, 100);
    }

    hideLoader() {
        const loader = document.getElementById('pageLoader');
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
    }

    // ===== 自定义光标 =====
    initCursor() {
        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('cursorFollower');

        if (!cursor || !follower) return;

        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursor.style.left = cursorX - 4 + 'px';
            cursor.style.top = cursorY - 4 + 'px';
        });

        // 平滑跟随
        const animateFollower = () => {
            followerX += (cursorX - followerX) * 0.15;
            followerY += (cursorY - followerY) * 0.15;
            follower.style.left = followerX - 18 + 'px';
            follower.style.top = followerY - 18 + 'px';
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        // 悬停效果
        const hoverElements = document.querySelectorAll('button, a, .itinerary-item, .photo-card, .trip-switch-btn');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            });
        });
    }

    // ===== 粒子效果 =====
    initParticles() {
        const container = document.createElement('div');
        container.className = 'particles';
        document.body.appendChild(container);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.width = particle.style.height = (Math.random() * 3 + 1) + 'px';
            container.appendChild(particle);
        }
    }

    // ===== 3D倾斜效果 =====
    initTiltEffect() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.photo-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX;
                const mouseY = e.clientY;

                const rotateY = ((mouseX - centerX) / rect.width) * 10;
                const rotateX = ((centerY - mouseY) / rect.height) * 10;

                card.style.setProperty('--rotate-y', rotateY + 'deg');
                card.style.setProperty('--rotate-x', rotateX + 'deg');

                // 光晕位置
                const x = ((mouseX - rect.left) / rect.width) * 100;
                const y = ((mouseY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', x + '%');
                card.style.setProperty('--mouse-y', y + '%');

                if (card.matches(':hover')) {
                    card.classList.add('tilt');
                }
            });
        });

        document.querySelectorAll('.photo-card').forEach(card => {
            card.addEventListener('mouseleave', () => {
                card.classList.remove('tilt');
                card.style.setProperty('--rotate-y', '0deg');
                card.style.setProperty('--rotate-x', '0deg');
            });
        });
    }

    // ===== 波纹效果 =====
    initRippleEffect() {
        document.querySelectorAll('.itinerary-item').forEach(item => {
            item.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple';

                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - size / 2 + 'px';

                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ===== 磁性按钮效果 =====
    initMagneticButtons() {
        const buttons = document.querySelectorAll('.enter-btn, .trip-switch-btn');

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // ===== 标题动画 =====
    animateTitle() {
        const title = document.getElementById('titleMain');
        if (!title) return;

        const text = title.textContent;
        title.innerHTML = '';

        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char;
            span.style.animationDelay = (i * 0.05) + 's';
            title.appendChild(span);
        });
    }

    // ===== 工具栏 =====
    initToolbar() {
        // 快捷键帮助
        document.getElementById('btnKeyboardHelp').addEventListener('click', () => {
            document.getElementById('keyboardModal').classList.add('active');
        });

        // 全屏
        document.getElementById('btnFullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // 分享
        document.getElementById('btnShare').addEventListener('click', () => {
            this.openShareModal();
        });

        // 统计
        document.getElementById('btnStats').addEventListener('click', () => {
            this.openStatsModal();
        });

        // 旅行地图
        document.getElementById('btnMap').addEventListener('click', () => {
            this.openMapModal();
        });

        // 键盘快捷键 F
        document.addEventListener('keydown', (e) => {
            if (e.key === 'f' || e.key === 'F') {
                if (!document.querySelector('.modal-overlay.active') &&
                    !document.getElementById('fullscreenSlider').classList.contains('active')) {
                    this.toggleFullscreen();
                }
            }
        });
    }

    // ===== 全屏功能 =====
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('全屏失败:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // ===== 分享功能 =====
    openShareModal() {
        const modal = document.getElementById('shareModal');
        const linkInput = document.getElementById('shareLink');

        // 生成分享链接
        const shareUrl = window.location.href;
        linkInput.value = shareUrl;

        modal.classList.add('active');
    }

    copyShareLink() {
        const linkInput = document.getElementById('shareLink');
        linkInput.select();
        document.execCommand('copy');

        // 显示复制成功提示
        this.showToast('链接已复制');
    }

    downloadScreenshot() {
        // 使用 html2canvas 截图（需要引入库）
        this.showToast('截图功能需要 html2canvas 库');
    }

    // ===== 统计功能 =====
    openStatsModal() {
        const modal = document.getElementById('statsModal');
        const grid = document.getElementById('statsGrid');
        const destList = document.getElementById('statsDestinations');

        if (!this.currentTrip) return;

        const trip = this.currentTrip;
        let totalPhotos = 0;
        Object.values(trip.photos || {}).forEach(photos => {
            totalPhotos += photos.length;
        });

        // 统计卡片
        grid.innerHTML = `
            <div class="stat-card">
                <div class="stat-card-value">${trip.destinations.length}</div>
                <div class="stat-card-label">目的地</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${totalPhotos}</div>
                <div class="stat-card-label">照片</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-value">${trip.year}</div>
                <div class="stat-card-label">年份</div>
            </div>
        `;

        // 目的地列表
        destList.innerHTML = trip.destinations.map((dest, index) => {
            const photoCount = (trip.photos[index] || []).length;
            return `
                <div class="stats-dest-item">
                    <span class="stats-dest-name">${dest.index || String(index + 1).padStart(2, '0')} ${dest.name}</span>
                    <span class="stats-dest-count">${photoCount} 张照片</span>
                </div>
            `;
        }).join('');

        modal.classList.add('active');
    }

    // ===== 旅行地图 (Leaflet.js) =====
    openMapModal() {
        const modal = document.getElementById('mapModal');
        const legend = document.getElementById('mapLegend');

        if (!this.currentTrip) return;

        const trip = this.currentTrip;
        modal.classList.add('active');

        // 城市真实经纬度
        const CITY_COORDS = {
            'BALI': [-8.3405, 115.092],
            'BROMO': [-7.9425, 112.953],
            'IJEN': [-8.0583, 114.242],
            'UBUD': [-8.5069, 115.262],
            'ULUWATU': [-8.8291, 115.085],
            'NUSA PENIDA': [-8.7279, 115.544],
            'SEMINYAK': [-8.6900, 115.157],
            'SINGAPORE': [1.3521, 103.819],
            'JAKARTA': [-6.2088, 106.846],
            'TOKYO': [35.6762, 139.650],
            'OSAKA': [34.6937, 135.502],
            'SEOUL': [37.5665, 126.978],
            'BANGKOK': [13.7563, 100.502],
            'LONDON': [51.5074, -0.1278],
            'PARIS': [48.8566, 2.3522],
            'NEW YORK': [40.7128, -74.006],
            'LOS ANGELES': [34.0522, -118.244],
            'SYDNEY': [-33.8688, 151.209],
            'MELBOURNE': [-37.8136, 144.963],
            'DUBAI': [25.2048, 55.2708],
            'MALDIVES': [3.2028, 73.2207],
            'HAWAII': [21.3069, -157.858],
            'FIJI': [-17.7134, 178.065],
        };

        // 查找匹配坐标
        function findCoords(destName) {
            const upperName = destName.toUpperCase();
            for (const [key, coords] of Object.entries(CITY_COORDS)) {
                if (upperName.includes(key)) return coords;
            }
            return [-8 + Math.random() * 4, 110 + Math.random() * 10];
        }

        // 首次初始化地图
        if (!this.leafletMap) {
            this.leafletMap = L.map('travelMap', {
                zoomControl: true,
                attributionControl: false,
            }).setView([-8, 115], 6);

            // 暗色底图 (CartoDB Dark Matter)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(this.leafletMap);
        }

        // 清除旧图层
        if (this.leafletLayers) {
            this.leafletLayers.forEach(layer => this.leafletMap.removeLayer(layer));
        }
        this.leafletLayers = [];

        const colors = ['#E85D4A', '#E86435', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        const latlngs = [];
        legend.innerHTML = '';

        trip.destinations.forEach((dest, index) => {
            const coords = findCoords(dest.name);
            const color = colors[index % colors.length];
            latlngs.push(coords);

            // 外圈发光
            const glow = L.circleMarker(coords, {
                radius: 18,
                fillColor: color,
                fillOpacity: 0.2,
                stroke: false,
            }).addTo(this.leafletMap);
            this.leafletLayers.push(glow);

            // 内圈标记
            const marker = L.circleMarker(coords, {
                radius: 7,
                fillColor: color,
                fillOpacity: 0.9,
                color: '#fff',
                weight: 2,
            }).addTo(this.leafletMap);

            // 弹出框
            const popupContent = `
                <div style="text-align:center;font-family:'Space Grotesk',sans-serif;">
                    <div style="font-size:1.2rem;font-weight:700;color:${color};margin-bottom:4px;">${dest.index || String(index + 1).padStart(2, '0')}</div>
                    <div style="font-size:0.95rem;font-weight:600;color:#F5F0E8;margin-bottom:2px;">${dest.name}</div>
                    <div style="font-size:0.75rem;color:#999;">${dest.date || ''} ${dest.region ? '· ' + dest.region : ''}</div>
                </div>
            `;
            marker.bindPopup(popupContent, {
                className: 'dark-popup',
                closeButton: false,
                offset: [0, -8],
            });
            this.leafletLayers.push(marker);

            // 图例
            legend.innerHTML += `
                <div class="map-legend-item">
                    <div class="map-legend-dot" style="background: ${color}"></div>
                    <span>${dest.name}</span>
                </div>
            `;
        });

        // 路线连线
        if (latlngs.length > 1) {
            const route = L.polyline(latlngs, {
                color: '#E85D4A',
                weight: 2,
                opacity: 0.5,
                dashArray: '8, 8',
            }).addTo(this.leafletMap);
            this.leafletLayers.push(route);
        }

        // 自动缩放到所有标记范围
        if (latlngs.length > 0) {
            const bounds = L.latLngBounds(latlngs);
            this.leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
        }

        // 刷新地图尺寸（解决隐藏容器内地图渲染问题）
        setTimeout(() => this.leafletMap.invalidateSize(), 200);
    }

    // ===== 照片详情 =====
    openPhotoDetail(index) {
        const photo = this.currentPhotos[index];
        if (!photo) return;

        const modal = document.getElementById('photoDetailModal');
        const imageDiv = document.getElementById('photoDetailImage');
        const infoDiv = document.getElementById('photoDetailInfo');

        imageDiv.innerHTML = `<img src="${photo.src}" alt="${photo.destination.name}">`;

        infoDiv.innerHTML = `
            <div class="detail-field">
                <span class="detail-label">目的地</span>
                <span class="detail-value">${photo.destination.name}</span>
            </div>
            <div class="detail-field">
                <span class="detail-label">地区</span>
                <span class="detail-value">${photo.destination.region || '--'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-label">日期</span>
                <span class="detail-value">${photo.destination.date || '--'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-label">文件名</span>
                <span class="detail-value">${photo.name || '--'}</span>
            </div>
            <div class="detail-field">
                <span class="detail-label">大小</span>
                <span class="detail-value">${photo.size ? (photo.size / 1024).toFixed(1) + ' KB' : '--'}</span>
            </div>
        `;

        modal.classList.add('active');
    }

    // ===== 提示消息 =====
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    showEmptyState() {
        document.querySelector('.container').innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 24px; opacity: 0.5;">🗺️</div>
                <h2 style="font-size: 1.5rem; margin-bottom: 12px; color: #F5F0E8;">还没有旅行记录</h2>
                <p style="font-size: 1rem; color: #888; margin-bottom: 32px;">登录后在后台创建你的第一个旅行摄影日志</p>
                <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
                    <a href="login.html" style="padding: 14px 32px; background: #E85D4A; color: white; text-decoration: none; border-radius: 8px; font-size: 1rem;">登录 / 注册</a>
                    <a href="admin.html" style="padding: 14px 32px; background: #333; color: white; text-decoration: none; border-radius: 8px; font-size: 1rem;">后台管理</a>
                </div>
            </div>
        `;
    }

    async render() {
        if (!this.currentTrip) return;

        const trip = this.currentTrip;
        const settings = await storageManager.getSettings();

        // 更新标题
        const mainTitle = trip.name.split(' ')[0] || 'TRAVEL';
        document.getElementById('titleMain').textContent = mainTitle;
        document.getElementById('titleYear').textContent = trip.year;
        document.getElementById('subtitleCn').textContent = trip.description || settings.site_subtitle || '';
        document.getElementById('subtitleEn').textContent = trip.subtitle || 'A PHOTOGRAPHIC JOURNAL';
        document.getElementById('subtitleDesc').textContent = this.getRegions(trip);

        document.title = `${trip.name} - 旅行摄影日志`;

        // 渲染行程
        this.renderItinerary(trip);

        // 渲染照片
        await this.renderGallery(trip);

        // 更新信息
        document.getElementById('footerInfo').textContent = settings.footer_info || 'TRAVEL JOURNAL';
        document.getElementById('filmStock').textContent = settings.film_stock || 'KODAK PORTRA 400';
        document.getElementById('rollInfo').textContent = `${trip.name.replace(/\s+/g, '-').toUpperCase()}-R1`;

        // 应用主题
        this.applyTheme(settings.theme || 'coral');

        // 重新初始化交互效果
        this.initTiltEffect();
        this.initRippleEffect();
        this.animateTitle();
        this.initButtonRipple();
    }

    getRegions(trip) {
        const regions = [...new Set(trip.destinations.map(d => d.region).filter(r => r))];
        return regions.length > 0 ? regions.join(' · ') : '—';
    }

    renderItinerary(trip) {
        const list = document.getElementById('itineraryList');
        list.innerHTML = trip.destinations.map((dest, index) => `
            <li class="itinerary-item ${index === 0 ? 'active' : ''}" data-dest-index="${index}">
                <span class="item-index">${dest.index || String(index + 1).padStart(2, '0')}</span>
                <span class="item-date">${dest.date || '--'}</span>
                <span class="item-location">${dest.name}</span>
                <span class="item-region">${dest.region || ''}</span>
            </li>
        `).join('');

        list.querySelectorAll('.itinerary-item').forEach(item => {
            item.addEventListener('click', () => {
                const destIndex = parseInt(item.dataset.destIndex);
                const photoIndex = this.findPhotoIndexByDest(destIndex);
                if (photoIndex !== -1) {
                    this.scrollToCard(photoIndex);
                    this.handleCardHover(photoIndex);
                }
            });
        });
    }

    // 根据目的地索引找到对应的照片索引
    findPhotoIndexByDest(destIndex) {
        return this.currentPhotos.findIndex(p => p.destIndex === destIndex);
    }

    async renderGallery(trip) {
        const track = document.getElementById('galleryTrack');
        this.currentPhotos = [];

        for (let index = 0; index < trip.destinations.length; index++) {
            const dest = trip.destinations[index];
            const photos = trip.photos[index] || [];

            if (photos.length > 0) {
                for (const photo of photos) {
                    let photoSrc = photo.legacySrc || '';

                    if (photo.path) {
                        photoSrc = await storageManager.getPhotoUrl(photo.path) || photoSrc;
                    }

                    this.currentPhotos.push({
                        ...photo,
                        src: photoSrc,
                        destination: dest,
                        destIndex: index
                    });
                }
            } else {
                this.currentPhotos.push({
                    id: `placeholder_${index}`,
                    src: this.generatePlaceholder(dest),
                    name: `${dest.name} 占位图`,
                    destination: dest,
                    destIndex: index,
                    isPlaceholder: true
                });
            }
        }

        track.innerHTML = this.currentPhotos.map((photo, index) => `
            <div class="photo-card" data-index="${index}">
                <img class="card-image" src="${photo.src}" alt="${photo.destination.name}" loading="lazy">
                <div class="card-info-default">
                    <div class="card-index">${photo.destination.index || String(photo.destIndex + 1).padStart(2, '0')}</div>
                    <div class="card-location">${photo.destination.name}</div>
                    <div class="card-date">${photo.destination.date || ''}</div>
                </div>
                <div class="card-overlay">
                    <div class="card-index">${photo.destination.index || String(photo.destIndex + 1).padStart(2, '0')}</div>
                    <div class="card-location">${photo.destination.name}</div>
                    <div class="card-date">${photo.destination.date || ''} · ${photo.destination.region || ''}</div>
                    <div class="card-region">${photo.destination.region || ''}</div>
                </div>
            </div>
        `).join('');

        track.querySelectorAll('.photo-card').forEach((card, index) => {
            card.addEventListener('mouseenter', () => this.handleCardHover(index));
            card.addEventListener('mouseleave', () => this.handleCardLeave());
            card.addEventListener('click', () => this.openLightbox(index));

            // 图片加载动画
            const img = card.querySelector('.card-image');
            if (img) {
                img.onload = () => img.classList.add('loaded');
                if (img.complete) img.classList.add('loaded');
            }
        });

        document.getElementById('frameCount').textContent = `${String(this.currentPhotos.length).padStart(2, '0')} OF 36`;

        if (this.currentPhotos.length > 0) {
            document.getElementById('hoverLocation').textContent = this.currentPhotos[0].destination.name;
        }
    }

    generatePlaceholder(dest) {
        const colors = this.getDestinationColors(dest.name);
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 600, 800);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.3, colors[1]);
        gradient.addColorStop(0.7, colors[2]);
        gradient.addColorStop(1, colors[3]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 800);

        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 600, Math.random() * 800, Math.random() * 150 + 50, 0, Math.PI * 2);
            ctx.fillStyle = colors[Math.floor(Math.random() * 4)];
            ctx.fill();
        }

        ctx.globalAlpha = 0.05;
        for (let y = 0; y < 800; y += 3) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, y, 600, 1);
        }

        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Space Grotesk, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dest.name, 300, 350);

        ctx.font = '18px Space Grotesk, sans-serif';
        ctx.globalAlpha = 0.4;
        ctx.fillText(`${dest.date || ''} · ${dest.region || ''}`, 300, 400);

        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 560, 760);

        return canvas.toDataURL('image/jpeg', 0.9);
    }

    getDestinationColors(name) {
        const colorMap = {
            'BROMO': ['#E86435', '#8B2500', '#2D1B00', '#F4A460'],
            'IJEN': ['#1a3a4a', '#0d2b3e', '#2d5a6b', '#4a90a4'],
            'ULUWATU': ['#2E8B57', '#1a5c3a', '#3cb371', '#87CEEB'],
            'UBUD': ['#4a7c3f', '#2d5a2a', '#6b8e4e', '#c5d5a0'],
            'NUSA PENIDA': ['#00CED1', '#008B8B', '#20B2AA', '#48D1CC'],
            'SEMINYAK': ['#DAA520', '#B8860B', '#F4A460', '#FFD700'],
            'SINGAPORE': ['#4169E1', '#1a237e', '#283593', '#7986cb']
        };

        for (const [key, colors] of Object.entries(colorMap)) {
            if (name.toUpperCase().includes(key)) return colors;
        }

        return ['#E85D4A', '#8B2500', '#2D1B00', '#F4A460'];
    }

    applyTheme(theme) {
        const themes = {
            coral: '#E85D4A',
            orange: '#E86435',
            blue: '#4169E1',
            green: '#2E8B57'
        };
        const color = themes[theme] || themes.coral;
        document.documentElement.style.setProperty('--accent-coral', color);
        document.documentElement.style.setProperty('--accent-orange', color);
    }

    handleCardHover(index) {
        const photo = this.currentPhotos[index];
        if (!photo) return;

        document.getElementById('hoverLocation').textContent = photo.destination.name;
        document.getElementById('frameCount').textContent = `${String(index + 1).padStart(2, '0')} OF 36`;
        this.setActiveDestination(photo.destIndex);
    }

    handleCardLeave() {}

    setActiveDestination(destIndex) {
        document.querySelectorAll('.itinerary-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.destIndex) === destIndex);
        });
    }

    scrollToCard(index) {
        const cards = document.querySelectorAll('.photo-card');
        const targetCard = cards[index];
        if (targetCard) {
            const galleryScroll = document.getElementById('galleryScroll');
            const scrollTarget = targetCard.offsetLeft - (galleryScroll.clientWidth / 2) + (targetCard.clientWidth / 2);
            galleryScroll.scrollTo({ left: scrollTarget, behavior: 'smooth' });
        }
    }

    openLightbox(index) {
        this.currentLightboxIndex = index;
        this.updateLightbox();
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }

    updateLightbox(animate = false) {
        const photo = this.currentPhotos[this.currentLightboxIndex];
        if (!photo) return;

        const imageContainer = document.getElementById('lightboxImage');
        const info = document.querySelector('.lightbox-info');

        if (animate) {
            // 交叉淡入淡出动画
            imageContainer.querySelector('.card-image')?.classList.add('switching');
            info?.classList.add('switching');

            setTimeout(() => {
                imageContainer.innerHTML = `<img class="card-image ${this.currentFilter || ''}" src="${photo.src}" alt="${photo.destination.name}">`;
                document.getElementById('lightboxIndex').textContent = photo.destination.index || String(photo.destIndex + 1).padStart(2, '0');
                document.getElementById('lightboxLocation').textContent = photo.destination.name;
                document.getElementById('lightboxDate').textContent = `${photo.destination.date || ''} · ${photo.destination.region || ''}`;

                info?.classList.remove('switching');
                this.updateExifInfo(photo);
            }, 250);
        } else {
            imageContainer.innerHTML = `<img class="card-image ${this.currentFilter || ''}" src="${photo.src}" alt="${photo.destination.name}">`;
            document.getElementById('lightboxIndex').textContent = photo.destination.index || String(photo.destIndex + 1).padStart(2, '0');
            document.getElementById('lightboxLocation').textContent = photo.destination.name;
            document.getElementById('lightboxDate').textContent = `${photo.destination.date || ''} · ${photo.destination.region || ''}`;
            this.updateExifInfo(photo);
        }
    }

    navigateLightbox(direction) {
        this.currentLightboxIndex = (this.currentLightboxIndex + direction + this.currentPhotos.length) % this.currentPhotos.length;
        this.updateLightbox(true);
    }

    // ===== 滤镜功能 =====
    initFilters() {
        this.currentFilter = '';
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                this.currentFilter = filter === 'none' ? '' : `filter-${filter}`;

                const img = document.querySelector('#lightboxImage .card-image');
                if (img) {
                    img.className = `card-image ${this.currentFilter}`;
                }
            });
        });
    }

    // ===== EXIF 信息 =====
    initExif() {
        document.getElementById('exifToggle').addEventListener('click', () => {
            document.getElementById('exifPanel').classList.toggle('show');
        });
    }

    updateExifInfo(photo) {
        const content = document.getElementById('exifContent');
        const img = document.querySelector('#lightboxImage .card-image');

        if (!img || !photo.src) {
            content.innerHTML = '<div class="exif-item"><span class="exif-label">暂无信息</span></div>';
            return;
        }

        // 基础信息
        let html = `
            <div class="exif-item">
                <span class="exif-label">文件名</span>
                <span class="exif-value">${photo.name || '--'}</span>
            </div>
            <div class="exif-item">
                <span class="exif-label">大小</span>
                <span class="exif-value">${photo.size ? (photo.size / 1024).toFixed(1) + ' KB' : '--'}</span>
            </div>
            <div class="exif-item">
                <span class="exif-label">目的地</span>
                <span class="exif-value">${photo.destination.name}</span>
            </div>
            <div class="exif-item">
                <span class="exif-label">日期</span>
                <span class="exif-value">${photo.destination.date || '--'}</span>
            </div>
        `;

        // 图片尺寸（加载后获取）
        if (img.complete && img.naturalWidth) {
            html += `
                <div class="exif-item">
                    <span class="exif-label">尺寸</span>
                    <span class="exif-value">${img.naturalWidth} × ${img.naturalHeight}</span>
                </div>
            `;
        } else {
            img.onload = () => {
                const sizeItem = document.createElement('div');
                sizeItem.className = 'exif-item';
                sizeItem.innerHTML = `
                    <span class="exif-label">尺寸</span>
                    <span class="exif-value">${img.naturalWidth} × ${img.naturalHeight}</span>
                `;
                content.appendChild(sizeItem);
            };
        }

        content.innerHTML = html;
    }

    // ===== 切换动画效果 =====
    initTransitionAnimations() {
        // 行程项交错入场
        this.animateItineraryItems();

        // 照片卡片交错入场
        this.animatePhotoCards();

        // 工具栏和切换按钮入场
        setTimeout(() => {
            document.querySelector('.toolbar')?.classList.add('visible');
            document.querySelector('.trip-switch-btn')?.classList.add('visible');
        }, 800);

        // 按钮涟漪效果
        this.initButtonRipple();

        // 内容就绪动画
        document.querySelector('.container')?.classList.add('content-ready');
    }

    animateItineraryItems() {
        const items = document.querySelectorAll('.itinerary-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, 300 + index * 80);
        });
    }

    animatePhotoCards() {
        const cards = document.querySelectorAll('.photo-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, 500 + index * 100);
        });
    }

    initButtonRipple() {
        document.querySelectorAll('.enter-btn, .filter-btn, .share-btn, .upload-btn').forEach(btn => {
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
                ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 500);
            });
        });
    }

    setupEventListeners() {
        // 开始浏览按钮 - 打开全屏轮播
        document.getElementById('enterBtn').addEventListener('click', () => {
            this.openFullscreenSlider(0);
        });

        // 全屏轮播控制
        document.getElementById('sliderClose').addEventListener('click', () => this.closeFullscreenSlider());
        document.getElementById('sliderPrev').addEventListener('click', () => this.sliderNavigate(-1));
        document.getElementById('sliderNext').addEventListener('click', () => this.sliderNavigate(1));

        // 灯箱控制
        document.getElementById('lightboxClose').addEventListener('click', () => this.closeLightbox());
        document.getElementById('lightboxPrev').addEventListener('click', () => this.navigateLightbox(-1));
        document.getElementById('lightboxNext').addEventListener('click', () => this.navigateLightbox(1));

        document.getElementById('lightbox').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeLightbox();
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            // 全屏轮播模式
            if (document.getElementById('fullscreenSlider').classList.contains('active')) {
                if (e.key === 'Escape') this.closeFullscreenSlider();
                if (e.key === 'ArrowLeft') this.sliderNavigate(-1);
                if (e.key === 'ArrowRight') this.sliderNavigate(1);
                if (e.key === ' ') {
                    e.preventDefault();
                    this.toggleSliderPlay();
                }
                return;
            }

            // 灯箱模式
            if (document.getElementById('lightbox').classList.contains('active')) {
                if (e.key === 'Escape') this.closeLightbox();
                if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
                if (e.key === 'ArrowRight') this.navigateLightbox(1);
                return;
            }

            // 普通模式
            const activeItem = document.querySelector('.itinerary-item.active');
            if (!activeItem) return;
            const destIndex = parseInt(activeItem.dataset.destIndex);
            const photoIndex = this.findPhotoIndexByDest(destIndex);

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = Math.min(photoIndex + 1, this.currentPhotos.length - 1);
                this.scrollToCard(nextIndex);
                this.handleCardHover(nextIndex);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIndex = Math.max(photoIndex - 1, 0);
                this.scrollToCard(prevIndex);
                this.handleCardHover(prevIndex);
            } else if (e.key === 'Enter') {
                this.openFullscreenSlider(photoIndex);
            }
        });

        // 旅行切换
        document.getElementById('tripSwitchBtn').addEventListener('click', () => this.openTripSelector());
        document.getElementById('tripSelectorClose').addEventListener('click', () => this.closeTripSelector());

        // 初始滚动到第一张
        setTimeout(() => this.scrollToCard(0), 1200);
    }

    // ===== 全屏轮播 =====
    openFullscreenSlider(startIndex) {
        this.sliderIndex = startIndex || 0;
        this.sliderPlaying = true;
        this.sliderTimer = null;

        const slider = document.getElementById('fullscreenSlider');
        slider.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 渲染缩略图
        this.renderSliderThumbnails();

        // 显示第一张
        this.updateSliderImage(false);

        // 开始自动播放
        this.startSliderTimer();

        // 监听鼠标移动显示/隐藏控制按钮
        let hideTimer;
        slider.addEventListener('mousemove', () => {
            slider.classList.remove('hide-controls');
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                if (this.sliderPlaying) {
                    slider.classList.add('hide-controls');
                }
            }, 2000);
        });
    }

    closeFullscreenSlider() {
        const slider = document.getElementById('fullscreenSlider');
        slider.classList.remove('active');
        document.body.style.overflow = '';
        this.stopSliderTimer();
    }

    renderSliderThumbnails() {
        const container = document.getElementById('sliderThumbnails');
        container.innerHTML = this.currentPhotos.map((photo, index) => `
            <div class="slider-thumb ${index === this.sliderIndex ? 'active' : ''}" data-index="${index}">
                <img src="${photo.src}" alt="${photo.destination.name}">
            </div>
        `).join('');

        container.querySelectorAll('.slider-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.sliderIndex = parseInt(thumb.dataset.index);
                this.updateSliderImage(true);
                this.resetSliderTimer();
            });
        });

        document.getElementById('sliderTotal').textContent = String(this.currentPhotos.length).padStart(2, '0');
    }

    updateSliderImage(animate = true) {
        const photo = this.currentPhotos[this.sliderIndex];
        if (!photo) return;

        const image = document.getElementById('sliderImage');
        const background = document.getElementById('sliderBackground');

        if (animate) {
            image.classList.add('entering');
            image.classList.remove('active');

            setTimeout(() => {
                image.src = photo.src;
                image.alt = photo.destination.name;
                background.style.backgroundImage = `url(${photo.src})`;

                setTimeout(() => {
                    image.classList.remove('entering');
                    image.classList.add('active');
                }, 50);
            }, 300);
        } else {
            image.src = photo.src;
            image.alt = photo.destination.name;
            background.style.backgroundImage = `url(${photo.src})`;
            image.classList.add('active');
        }

        // 更新信息
        const index = photo.destination.index || String(photo.destIndex + 1).padStart(2, '0');
        document.getElementById('sliderCurrent').textContent = String(this.sliderIndex + 1).padStart(2, '0');
        document.getElementById('sliderIndex').textContent = index;
        document.getElementById('sliderLocation').textContent = photo.destination.name;
        document.getElementById('sliderDate').textContent = `${photo.destination.date || ''} · ${photo.destination.region || ''}`;

        // 更新缩略图
        document.querySelectorAll('.slider-thumb').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === this.sliderIndex);
        });

        // 更新进度条
        this.updateSliderProgress();

        // 更新主页行程高亮
        this.setActiveDestination(photo.destIndex);
    }

    updateSliderProgress() {
        const progress = document.getElementById('sliderProgress');
        progress.style.transition = 'none';
        progress.style.width = '0%';

        setTimeout(() => {
            progress.style.transition = `width ${this.sliderPlaying ? '3' : '0'}s linear`;
            progress.style.width = '100%';
        }, 50);
    }

    sliderNavigate(direction) {
        this.sliderIndex = (this.sliderIndex + direction + this.currentPhotos.length) % this.currentPhotos.length;
        this.updateSliderImage(true);
        this.resetSliderTimer();
    }

    toggleSliderPlay() {
        if (this.sliderPlaying) {
            this.stopSliderTimer();
            this.sliderPlaying = false;
        } else {
            this.startSliderTimer();
            this.sliderPlaying = true;
        }
        this.updateSliderProgress();
    }

    startSliderTimer() {
        this.stopSliderTimer();
        this.sliderTimer = setInterval(() => {
            this.sliderIndex = (this.sliderIndex + 1) % this.currentPhotos.length;
            this.updateSliderImage(true);
        }, 3000);
    }

    stopSliderTimer() {
        if (this.sliderTimer) {
            clearInterval(this.sliderTimer);
            this.sliderTimer = null;
        }
    }

    resetSliderTimer() {
        if (this.sliderPlaying) {
            this.startSliderTimer();
        }
    }

    async openTripSelector() {
        const trips = await storageManager.getAllTrips();
        const panel = document.getElementById('tripSelectorPanel');
        const list = document.getElementById('tripSelectorList');

        list.innerHTML = trips.map(trip => `
            <div class="trip-selector-item ${trip.id === this.currentTrip.id ? 'active' : ''}" data-id="${trip.id}">
                <div class="trip-selector-item-title">${trip.name}</div>
                <div class="trip-selector-item-year">${trip.year}</div>
                <div class="trip-selector-item-desc">${trip.subtitle || ''}</div>
            </div>
        `).join('');

        list.querySelectorAll('.trip-selector-item').forEach(item => {
            item.addEventListener('click', async () => {
                await this.switchTrip(item.dataset.id);
                this.closeTripSelector();
            });
        });

        panel.classList.add('active');
    }

    closeTripSelector() {
        document.getElementById('tripSelectorPanel').classList.remove('active');
    }

    async switchTrip(tripId) {
        const trip = await storageManager.getTrip(tripId);
        if (trip) {
            this.currentTrip = trip;
            await storageManager.setCurrentTripId(tripId);

            // 添加切换过渡动画
            const container = document.querySelector('.container');
            container.classList.add('switching');

            setTimeout(async () => {
                await this.render();
                container.classList.remove('switching');
                this.animateItineraryItems();
                this.animatePhotoCards();
            }, 300);
        }
    }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    const app = new TravelApp();

    // 最大加载时间保护 - 5秒后强制隐藏加载动画
    const loaderTimeout = setTimeout(() => {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }
    }, 5000);

    app.init().catch(err => {
        console.error('初始化失败:', err);
        clearTimeout(loaderTimeout);
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }
        app.showEmptyState();
    }).finally(() => {
        clearTimeout(loaderTimeout);
    });
});
