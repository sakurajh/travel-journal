// ===== Supabase 客户端 =====
// 在 Supabase 项目设置中获取这两个值
// Settings → API → Project URL 和 anon public key

const SUPABASE_URL = 'https://你的项目ID.supabase.co';
const SUPABASE_ANON_KEY = '你的anon key';

// 初始化 Supabase 客户端
function initSupabase() {
    if (window.supabaseClient) return window.supabaseClient;

    // 检查配置
    if (SUPABASE_URL.includes('你的项目ID')) {
        console.warn('请先配置 Supabase：编辑 supabase.js 填入 Project URL 和 anon key');
        return null;
    }

    try {
        window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase 客户端初始化成功');
        return window.supabaseClient;
    } catch (err) {
        console.error('Supabase 初始化失败:', err);
        return null;
    }
}

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});
