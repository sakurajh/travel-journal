// ===== Photo Data (from config or defaults) =====
const photos = (typeof PHOTO_CONFIG !== 'undefined' ? PHOTO_CONFIG.itinerary : null) || [
    {
        index: '01',
        location: 'BROMO',
        date: '04.26',
        region: 'JAVA',
        description: 'Volcanic sunrise over the Tengger caldera',
        colors: ['#E86435', '#8B2500', '#2D1B00', '#F4A460']
    },
    {
        index: '02',
        location: 'IJEN',
        date: '04.27',
        region: 'JAVA',
        description: 'Blue flames and sulfur miners at dawn',
        colors: ['#1a3a4a', '#0d2b3e', '#2d5a6b', '#4a90a4']
    },
    {
        index: '03',
        location: 'ULUWATU',
        date: '04.28',
        region: 'BALI',
        description: 'Clifftop temple and paragliders',
        colors: ['#2E8B57', '#1a5c3a', '#3cb371', '#87CEEB']
    },
    {
        index: '04',
        location: 'UBUD',
        date: '04.30',
        region: 'BALI',
        description: 'Terraced rice fields in morning mist',
        colors: ['#4a7c3f', '#2d5a2a', '#6b8e4e', '#c5d5a0']
    },
    {
        index: '05',
        location: 'NUSA PENIDA',
        date: '05.01',
        region: 'PENIDA',
        description: 'Dramatic coastal cliffs and turquoise water',
        colors: ['#00CED1', '#008B8B', '#20B2AA', '#48D1CC']
    },
    {
        index: '06',
        location: 'SEMINYAK',
        date: '05.02',
        region: 'BALI',
        description: 'Golden hour on the beach',
        colors: ['#DAA520', '#B8860B', '#F4A460', '#FFD700']
    },
    {
        index: '07',
        location: 'SINGAPORE',
        date: '05.04',
        region: 'SG',
        description: 'Departure — SQ flight home',
        colors: ['#4169E1', '#1a237e', '#283593', '#7986cb']
    }
];

// Store uploaded images
let uploadedImages = {};

// ===== Generate Placeholder Images =====
function generatePlaceholderImage(photo) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 800);
    gradient.addColorStop(0, photo.colors[0]);
    gradient.addColorStop(0.3, photo.colors[1]);
    gradient.addColorStop(0.7, photo.colors[2]);
    gradient.addColorStop(1, photo.colors[3]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Add some visual interest with shapes
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * 600;
        const y = Math.random() * 800;
        const radius = Math.random() * 150 + 50;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = photo.colors[Math.floor(Math.random() * 4)];
        ctx.fill();
    }

    // Add film-like horizontal lines
    ctx.globalAlpha = 0.05;
    for (let y = 0; y < 800; y += 3) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, y, 600, 1);
    }

    // Add location text
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(photo.location, 300, 350);

    // Add date
    ctx.font = '18px Space Grotesk, sans-serif';
    ctx.globalAlpha = 0.4;
    ctx.fillText(photo.date + ' · ' + photo.region, 300, 400);

    // Film frame border
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, 560, 760);

    // Film sprocket holes
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000';
    for (let y = 40; y < 780; y += 60) {
        ctx.beginPath();
        ctx.arc(10, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(590, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvas.toDataURL('image/jpeg', 0.9);
}

// ===== Create Photo Cards =====
function createPhotoCards() {
    const galleryTrack = document.getElementById('galleryTrack');
    galleryTrack.innerHTML = '';

    photos.forEach((photo, i) => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.index = i;

        // Use uploaded image if available, otherwise generate placeholder
        const imgSrc = uploadedImages[i] || photo.image || generatePlaceholderImage(photo);

        card.innerHTML = `
            <img class="card-image" src="${imgSrc}" alt="${photo.location}" loading="lazy">
            <div class="card-info-default">
                <div class="card-index">${photo.index}</div>
                <div class="card-location">${photo.location}</div>
                <div class="card-date">${photo.date}</div>
            </div>
            <div class="card-overlay">
                <div class="card-index">${photo.index}</div>
                <div class="card-location">${photo.location}</div>
                <div class="card-date">${photo.date} · ${photo.description}</div>
                <div class="card-region">${photo.region}</div>
            </div>
        `;

        // Hover events
        card.addEventListener('mouseenter', () => handleCardHover(i));
        card.addEventListener('mouseleave', () => handleCardLeave());
        card.addEventListener('click', () => openLightbox(i));

        galleryTrack.appendChild(card);
    });
}

// ===== Hover Handling =====
function handleCardHover(index) {
    const photo = photos[index];

    // Update hover status
    document.getElementById('hoverLocation').textContent = photo.location;
    document.getElementById('frameCount').textContent =
        `${photo.index} OF 36`;

    // Update itinerary active state
    document.querySelectorAll('.itinerary-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeItem = document.querySelector(`.itinerary-item[data-index="${index}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function handleCardLeave() {
    // Reset to default or keep last active
}

// ===== Itinerary Click =====
function setupItineraryClick() {
    document.querySelectorAll('.itinerary-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            scrollToCard(index);

            // Update active state
            document.querySelectorAll('.itinerary-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function scrollToCard(index) {
    const cards = document.querySelectorAll('.photo-card');
    const targetCard = cards[index];
    if (targetCard) {
        const galleryScroll = document.getElementById('galleryScroll');
        const cardLeft = targetCard.offsetLeft;
        const scrollTarget = cardLeft - (galleryScroll.clientWidth / 2) + (targetCard.clientWidth / 2);
        galleryScroll.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
}

// ===== Lightbox =====
let currentLightboxIndex = 0;

function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();

    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function updateLightbox() {
    const photo = photos[currentLightboxIndex];
    const cards = document.querySelectorAll('.photo-card');
    const img = cards[currentLightboxIndex].querySelector('.card-image');

    document.getElementById('lightboxImage').innerHTML =
        `<img class="card-image" src="${img.src}" alt="${photo.location}">`;
    document.getElementById('lightboxIndex').textContent = photo.index;
    document.getElementById('lightboxLocation').textContent = photo.location;
    document.getElementById('lightboxDate').textContent = photo.date;
}

function navigateLightbox(direction) {
    currentLightboxIndex = (currentLightboxIndex + direction + photos.length) % photos.length;
    updateLightbox();
}

function setupLightbox() {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));

    // Close on background click
    document.getElementById('lightbox').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox.classList.contains('active')) return;

        switch (e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowLeft': navigateLightbox(-1); break;
            case 'ArrowRight': navigateLightbox(1); break;
        }
    });
}

// ===== Enter Roll Button =====
function setupEnterButton() {
    const btn = document.getElementById('enterBtn');
    btn.addEventListener('click', () => {
        // Scroll to first card with animation
        scrollToCard(0);

        // Flash effect on button
        btn.style.background = 'var(--accent-coral)';
        btn.style.color = 'var(--bg-primary)';
        btn.textContent = 'VIEWING ROLL →';

        setTimeout(() => {
            btn.style.background = 'none';
            btn.style.color = 'var(--accent-coral)';
            btn.textContent = 'ENTER ROLL →';
        }, 2000);
    });
}

// ===== Keyboard Navigation for Gallery =====
function setupKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox.classList.contains('active')) return;

        const activeItem = document.querySelector('.itinerary-item.active');
        if (!activeItem) return;

        const currentIndex = parseInt(activeItem.dataset.index);

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = Math.min(currentIndex + 1, photos.length - 1);
            scrollToCard(nextIndex);
            handleCardHover(nextIndex);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = Math.max(currentIndex - 1, 0);
            scrollToCard(prevIndex);
            handleCardHover(prevIndex);
        } else if (e.key === 'Enter') {
            openLightbox(currentIndex);
        }
    });
}

// ===== Film Strip Decoration =====
function addFilmStripDecoration() {
    const gallery = document.querySelector('.right-panel');
    const strip = document.createElement('div');
    strip.style.cssText = `
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background: repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 15px,
            rgba(255,255,255,0.03) 15px,
            rgba(255,255,255,0.03) 16px
        );
        pointer-events: none;
        z-index: 0;
    `;
    gallery.appendChild(strip);
}

// ===== Photo Upload Panel =====
function setupUploadPanel() {
    const uploadPanel = document.getElementById('uploadPanel');
    const settingsBtn = document.getElementById('settingsBtn');
    const uploadClose = document.getElementById('uploadClose');
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const uploadList = document.getElementById('uploadList');
    const applyBtn = document.getElementById('applyPhotos');
    const resetBtn = document.getElementById('resetPhotos');

    // Toggle panel
    settingsBtn.addEventListener('click', () => {
        uploadPanel.classList.toggle('active');
    });

    uploadClose.addEventListener('click', () => {
        uploadPanel.classList.remove('active');
    });

    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
        fileInput.value = '';
    });

    // Apply changes
    applyBtn.addEventListener('click', () => {
        createPhotoCards();
        uploadPanel.classList.remove('active');
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        uploadedImages = {};
        uploadList.innerHTML = '';
        createPhotoCards();
    });
}

function handleFiles(files) {
    const uploadList = document.getElementById('uploadList');

    Array.from(files).forEach((file, i) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const index = Object.keys(uploadedImages).length;
            if (index >= photos.length) {
                alert('Maximum ' + photos.length + ' photos allowed');
                return;
            }

            uploadedImages[index] = e.target.result;
            addUploadItem(file.name, file.size, e.target.result, index);
        };
        reader.readAsDataURL(file);
    });
}

function addUploadItem(name, size, src, index) {
    const uploadList = document.getElementById('uploadList');

    const item = document.createElement('div');
    item.className = 'upload-item';
    item.innerHTML = `
        <img class="upload-item-preview" src="${src}" alt="${name}">
        <div class="upload-item-info">
            <div class="upload-item-name">${name}</div>
            <div class="upload-item-size">${formatFileSize(size)} → ${photos[index].location}</div>
        </div>
        <button class="upload-item-remove" data-index="${index}">×</button>
    `;

    item.querySelector('.upload-item-remove').addEventListener('click', () => {
        delete uploadedImages[index];
        item.remove();
    });

    uploadList.appendChild(item);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    createPhotoCards();
    setupItineraryClick();
    setupLightbox();
    setupEnterButton();
    setupKeyboardNav();
    addFilmStripDecoration();
    setupUploadPanel();

    // Initial scroll to middle
    setTimeout(() => {
        scrollToCard(0);
    }, 1200);
});
