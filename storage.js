// ===== 存储管理器 =====
// 使用 File System Access API + IndexedDB 混合方案
// 元数据存 IndexedDB，照片存本地文件系统

class StorageManager {
    constructor() {
        this.dbName = 'TravelJournalDB';
        this.dbVersion = 1;
        this.db = null;
        this.dirHandle = null; // 文件系统目录句柄
        this.photosDir = 'photos'; // 照片子目录名
    }

    // ===== 初始化 =====
    async init() {
        await this.initDB();
        await this.loadDirHandle();
        return this;
    }

    // ===== IndexedDB 初始化 =====
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 旅行存储
                if (!db.objectStoreNames.contains('trips')) {
                    const tripStore = db.createObjectStore('trips', { keyPath: 'id' });
                    tripStore.createIndex('name', 'name', { unique: false });
                }

                // 设置存储
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }

                // 文件句柄存储
                if (!db.objectStoreNames.contains('handles')) {
                    db.createObjectStore('handles', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
        });
    }

    // ===== 文件系统访问 =====
    async loadDirHandle() {
        try {
            const handle = await this.getFromDB('handles', 'photosDir');
            if (handle) {
                // 验证权限
                if (await this.verifyPermission(handle)) {
                    this.dirHandle = handle;
                    return true;
                }
            }
        } catch (e) {
            console.log('需要重新授权文件夹');
        }
        return false;
    }

    async selectPhotosFolder() {
        try {
            this.dirHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'pictures'
            });

            // 保存句柄
            await this.saveToDB('handles', { key: 'photosDir', handle: this.dirHandle });

            // 创建照片子目录
            await this.dirHandle.getDirectoryHandle(this.photosDir, { create: true });

            return true;
        } catch (e) {
            console.error('选择文件夹失败:', e);
            return false;
        }
    }

    async verifyPermission(handle) {
        const options = { mode: 'readwrite' };
        if ((await handle.queryPermission(options)) === 'granted') {
            return true;
        }
        if ((await handle.requestPermission(options)) === 'granted') {
            return true;
        }
        return false;
    }

    hasFileSystemAccess() {
        return 'showDirectoryPicker' in window;
    }

    hasDirHandle() {
        return this.dirHandle !== null;
    }

    // ===== 照片存储 =====
    async savePhoto(tripId, destIndex, file) {
        if (!this.dirHandle) {
            throw new Error('请先选择照片保存文件夹');
        }

        // 创建目录结构: photos/tripId/destIndex/
        const photosDir = await this.dirHandle.getDirectoryHandle(this.photosDir, { create: true });
        const tripDir = await photosDir.getDirectoryHandle(tripId, { create: true });
        const destDir = await tripDir.getDirectoryHandle(String(destIndex), { create: true });

        // 生成文件名
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

        // 写入文件
        const fileHandle = await destDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();

        // 返回相对路径
        return {
            id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: `${tripId}/${destIndex}/${fileName}`,
            name: file.name,
            size: file.size,
            addedAt: new Date().toISOString()
        };
    }

    async getPhotoUrl(photoPath) {
        if (!this.dirHandle) return null;

        try {
            const parts = photoPath.split('/');
            let currentDir = await this.dirHandle.getDirectoryHandle(this.photosDir);

            for (let i = 0; i < parts.length - 1; i++) {
                currentDir = await currentDir.getDirectoryHandle(parts[i]);
            }

            const fileHandle = await currentDir.getFileHandle(parts[parts.length - 1]);
            const file = await fileHandle.getFile();
            return URL.createObjectURL(file);
        } catch (e) {
            console.error('读取照片失败:', e);
            return null;
        }
    }

    async deletePhoto(photoPath) {
        if (!this.dirHandle) return false;

        try {
            const parts = photoPath.split('/');
            let currentDir = await this.dirHandle.getDirectoryHandle(this.photosDir);

            for (let i = 0; i < parts.length - 1; i++) {
                currentDir = await currentDir.getDirectoryHandle(parts[i]);
            }

            await currentDir.removeEntry(parts[parts.length - 1]);
            return true;
        } catch (e) {
            console.error('删除照片失败:', e);
            return false;
        }
    }

    // ===== 元数据存储 (IndexedDB) =====
    async saveTrip(trip) {
        return this.saveToDB('trips', trip);
    }

    async getTrip(id) {
        return this.getFromDB('trips', id);
    }

    async getAllTrips() {
        return this.getAllFromDB('trips');
    }

    async deleteTrip(id) {
        // 删除照片文件夹
        if (this.dirHandle) {
            try {
                const photosDir = await this.dirHandle.getDirectoryHandle(this.photosDir);
                await photosDir.removeEntry(id, { recursive: true });
            } catch (e) {
                console.log('照片文件夹不存在或删除失败');
            }
        }

        // 删除元数据
        return this.deleteFromDB('trips', id);
    }

    async saveSettings(settings) {
        return this.saveToDB('settings', { key: 'main', ...settings });
    }

    async getSettings() {
        const settings = await this.getFromDB('settings', 'main');
        return settings || {
            siteTitle: '旅行摄影日志',
            siteSubtitle: '用镜头记录世界的美好',
            footerInfo: 'TRAVEL JOURNAL',
            theme: 'coral',
            filmStock: 'KODAK PORTRA 400'
        };
    }

    async setCurrentTripId(id) {
        return this.saveToDB('settings', { key: 'currentTripId', value: id });
    }

    async getCurrentTripId() {
        const data = await this.getFromDB('settings', 'currentTripId');
        return data ? data.value : null;
    }

    // ===== 通用数据库操作 =====
    saveToDB(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    getFromDB(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    getAllFromDB(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    deleteFromDB(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ===== 数据迁移 =====
    async migrateFromLocalStorage() {
        const saved = localStorage.getItem('travelJournalData');
        if (!saved) return false;

        try {
            const data = JSON.parse(saved);

            // 迁移设置
            if (data.settings) {
                await this.saveSettings(data.settings);
            }

            // 迁移旅行数据
            if (data.trips && data.trips.length > 0) {
                for (const trip of data.trips) {
                    // 照片需要特殊处理（从 Base64 转为文件）
                    const migratedTrip = { ...trip, photos: {} };

                    // 保留目的地照片的元数据，但不保留 Base64 数据
                    for (const [destIndex, photos] of Object.entries(trip.photos)) {
                        migratedTrip.photos[destIndex] = photos.map(p => ({
                            id: p.id,
                            path: null, // 旧数据没有路径
                            name: p.name,
                            size: p.size,
                            addedAt: p.addedAt,
                            legacySrc: p.src // 保留旧数据用于迁移
                        }));
                    }

                    await this.saveTrip(migratedTrip);
                }

                if (data.currentTripId) {
                    await this.setCurrentTripId(data.currentTripId);
                }
            }

            // 清除旧数据
            localStorage.removeItem('travelJournalData');

            return true;
        } catch (e) {
            console.error('迁移失败:', e);
            return false;
        }
    }

    // ===== 导出数据 =====
    async exportData() {
        const trips = await this.getAllTrips();
        const settings = await this.getSettings();
        const currentTripId = await this.getCurrentTripId();

        return {
            version: 2,
            exportDate: new Date().toISOString(),
            settings,
            currentTripId,
            trips
        };
    }

    // ===== 导入数据 =====
    async importData(data) {
        if (!data || !data.trips) {
            throw new Error('无效的数据格式');
        }

        // 导入设置
        if (data.settings) {
            await this.saveSettings(data.settings);
        }

        // 导入旅行
        for (const trip of data.trips) {
            await this.saveTrip(trip);
        }

        if (data.currentTripId) {
            await this.setCurrentTripId(data.currentTripId);
        }

        return true;
    }

    // ===== 存储统计 =====
    async getStorageStats() {
        const trips = await this.getAllTrips();
        let photoCount = 0;
        let tripCount = trips.length;

        trips.forEach(trip => {
            Object.values(trip.photos || {}).forEach(photos => {
                photoCount += photos.length;
            });
        });

        // 估算 IndexedDB 使用量
        let dbSize = 0;
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                dbSize = estimate.usage || 0;
            }
        } catch (e) {
            // 忽略
        }

        return {
            tripCount,
            photoCount,
            dbSize,
            formattedDbSize: this.formatBytes(dbSize),
            hasFileSystem: this.hasDirHandle()
        };
    }

    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
}

// 创建全局实例
const storageManager = new StorageManager();
