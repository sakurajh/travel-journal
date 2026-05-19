// ===== 存储管理器 (Supabase 版) =====
// 使用 Supabase 作为后端：Auth + Database + Storage

class StorageManager {
    constructor() {
        this.client = null;
        this.user = null;
    }

    // ===== 初始化 =====
    async init() {
        // 等待 Supabase 客户端就绪
        this.client = window.supabaseClient || (window.initSupabase && window.initSupabase());

        if (!this.client) {
            console.warn('Supabase 未配置，使用本地模式');
            return this;
        }

        // 检查登录状态
        const { data: { session } } = await this.client.auth.getSession();
        this.user = session?.user || null;

        // 监听登录状态变化
        this.client.auth.onAuthStateChange((event, session) => {
            this.user = session?.user || null;
        });

        return this;
    }

    // ===== 认证方法 =====
    isLoggedIn() {
        return this.user !== null;
    }

    getCurrentUser() {
        return this.user;
    }

    async signOut() {
        if (!this.client) return;
        await this.client.auth.signOut();
        this.user = null;
        window.location.href = 'login.html';
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // ===== 照片存储 (Supabase Storage) =====
    async savePhoto(tripId, destIndex, file) {
        if (!this.client || !this.user) {
            throw new Error('请先登录');
        }

        // 压缩图片
        const compressed = await this.compressImage(file);

        // 生成路径: userId/tripId/destIndex/timestamp_random.ext
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;
        const filePath = `${this.user.id}/${tripId}/${destIndex}/${fileName}`;

        // 上传到 Supabase Storage
        const { data, error } = await this.client.storage
            .from('photos')
            .upload(filePath, compressed, {
                contentType: file.type || 'image/jpeg',
                upsert: false
            });

        if (error) {
            console.error('上传失败:', error);
            throw new Error('照片上传失败: ' + error.message);
        }

        return {
            id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            path: filePath,
            name: file.name,
            size: compressed.size,
            addedAt: new Date().toISOString()
        };
    }

    async getPhotoUrl(photoPath) {
        if (!this.client || !photoPath) return null;

        try {
            const { data } = this.client.storage
                .from('photos')
                .getPublicUrl(photoPath);

            return data?.publicUrl || null;
        } catch (err) {
            console.error('获取照片URL失败:', err);
            return null;
        }
    }

    async deletePhoto(photoPath) {
        if (!this.client || !photoPath) return false;

        try {
            const { error } = await this.client.storage
                .from('photos')
                .remove([photoPath]);

            return !error;
        } catch (err) {
            console.error('删除照片失败:', err);
            return false;
        }
    }

    // ===== 图片压缩 =====
    async compressImage(file, maxWidth = 1200, quality = 0.7) {
        // 小于 500KB 不压缩
        if (file.size < 500 * 1024) return file;

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;

                    if (w > maxWidth) {
                        h = (maxWidth / w) * h;
                        w = maxWidth;
                    }

                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // ===== 旅行数据 (Supabase Database) =====
    async saveTrip(trip) {
        if (!this.client || !this.user) {
            throw new Error('请先登录');
        }

        const tripData = {
            id: trip.id,
            user_id: this.user.id,
            name: trip.name,
            year: trip.year,
            subtitle: trip.subtitle || '',
            description: trip.description || '',
            destinations: trip.destinations || [],
            photos: trip.photos || {},
            created_at: trip.createdAt || new Date().toISOString()
        };

        const { error } = await this.client
            .from('trips')
            .upsert(tripData);

        if (error) {
            console.error('保存旅行失败:', error);
            throw new Error('保存失败: ' + error.message);
        }

        return trip;
    }

    async getTrip(id) {
        if (!this.client) return null;

        const { data, error } = await this.client
            .from('trips')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) return null;

        return this.formatTrip(data);
    }

    async getAllTrips() {
        if (!this.client) return [];

        const { data, error } = await this.client
            .from('trips')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        return data.map(d => this.formatTrip(d));
    }

    async deleteTrip(id) {
        if (!this.client) return;

        // 删除该旅行的所有照片
        try {
            const trip = await this.getTrip(id);
            if (trip && trip.photos) {
                for (const photos of Object.values(trip.photos)) {
                    for (const photo of photos) {
                        if (photo.path) {
                            await this.deletePhoto(photo.path);
                        }
                    }
                }
            }
        } catch (e) {
            console.log('清理照片时出错:', e);
        }

        // 删除旅行记录
        const { error } = await this.client
            .from('trips')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('删除旅行失败:', error);
        }
    }

    formatTrip(data) {
        return {
            id: data.id,
            name: data.name,
            year: data.year,
            subtitle: data.subtitle,
            description: data.description,
            destinations: data.destinations || [],
            photos: data.photos || {},
            createdAt: data.created_at
        };
    }

    // ===== 设置 (Supabase Database) =====
    async saveSettings(settings) {
        if (!this.client || !this.user) return;

        const { error } = await this.client
            .from('user_settings')
            .upsert({
                user_id: this.user.id,
                ...settings
            });

        if (error) {
            console.error('保存设置失败:', error);
        }
    }

    async getSettings() {
        const defaults = {
            site_title: '旅行摄影日志',
            site_subtitle: '用镜头记录世界的美好',
            footer_info: 'TRAVEL JOURNAL',
            theme: 'coral',
            film_stock: 'KODAK PORTRA 400',
            current_trip_id: null
        };

        if (!this.client || !this.user) return defaults;

        const { data, error } = await this.client
            .from('user_settings')
            .select('*')
            .eq('user_id', this.user.id)
            .single();

        if (error || !data) return defaults;

        return { ...defaults, ...data };
    }

    async setCurrentTripId(id) {
        if (!this.client || !this.user) return;

        await this.client
            .from('user_settings')
            .upsert({
                user_id: this.user.id,
                current_trip_id: id
            });
    }

    async getCurrentTripId() {
        if (!this.client || !this.user) return null;

        const { data } = await this.client
            .from('user_settings')
            .select('current_trip_id')
            .eq('user_id', this.user.id)
            .single();

        return data?.current_trip_id || null;
    }

    // ===== 数据导入导出 =====
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

    async importData(data) {
        if (!data || !data.trips) {
            throw new Error('无效的数据格式');
        }

        if (data.settings) {
            await this.saveSettings(data.settings);
        }

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

        trips.forEach(trip => {
            Object.values(trip.photos || {}).forEach(photos => {
                photoCount += photos.length;
            });
        });

        return {
            tripCount: trips.length,
            photoCount,
            hasFileSystem: false,
            dbSize: 0,
            formattedDbSize: '云端存储'
        };
    }

    // ===== 兼容方法 (不再使用) =====
    hasFileSystemAccess() {
        return false;
    }

    hasDirHandle() {
        return false;
    }

    async selectPhotosFolder() {
        console.log('云端模式无需选择文件夹');
        return true;
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
