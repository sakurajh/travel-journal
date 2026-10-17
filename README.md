<div align="center">

# 📷 Travel Journal · 旅行摄影日志

**一个复古胶片风格的旅行摄影日志网站 —— 前台展示 + 后台管理，纯前端 + Supabase 云服务**

[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)]()

</div>

---

## ✨ 功能特性

### 前台展示

- 🎞️ **复古胶片风格**整体视觉设计
- 🖼️ **全屏放大轮播**，照片沉浸式浏览
- 🃏 **3D 卡片倾斜**跟随鼠标的立体效果
- ✨ **粒子背景动画** + 自定义光标
- 🧲 **磁性按钮**吸附交互
- ⌨️ 快捷键支持（键盘切换 / 关闭）
- 📊 旅行统计（城市、里程、照片数）
- 🔗 一键分享

### 后台管理

- 🔐 用户注册 / 登录（Supabase Auth）
- ✈️ 旅行记录管理（创建 / 编辑 / 删除）
- 📍 目的地管理
- ☁️ 照片批量上传（存储到 Supabase Storage）
- 🎨 页面设置
- 📥 数据导入 / 导出

## 🚀 快速开始

### 本地运行

```text
1. 双击 index.html   打开前台
2. 双击 admin.html   打开后台管理
```

> 涉及云端数据的功能需要先在 `config.js` / `supabase.js` 里填入自己的 Supabase 项目地址与 Key，详见 [SUPABASE.md](SUPABASE.md)。

### 远程部署

双击 `deploy.bat` 查看部署教程，支持：

- **Vercel**（推荐，速度最快）→ [VERCEL.md](VERCEL.md)
- **GitHub Pages**（稳定）→ [DEPLOY.md](DEPLOY.md)

#### 推荐：Vercel 部署

1. 项目上传到 GitHub
2. 打开 https://vercel.com，用 GitHub 登录
3. 导入本仓库，一键部署
4. 获得链接：`https://你的项目.vercel.app`

## 📁 项目结构

```text
travel-journal/
├── index.html          # 前台首页
├── admin.html          # 后台管理
├── login.html          # 登录页
├── app.js              # 前台交互（轮播/3D倾斜/粒子…）
├── admin.js            # 后台逻辑（CRUD）
├── script.js           # 通用脚本
├── style.css           # 前台样式（复古胶片风）
├── admin.css           # 后台样式
├── config.js           # 站点配置
├── supabase.js         # Supabase 客户端封装
├── storage.js          # 照片存储封装
├── server.py           # 本地调试服务器（可选）
├── vercel.json         # Vercel 部署配置
├── SUPABASE.md         # Supabase 配置教程
├── VERCEL.md           # Vercel 部署教程
└── DEPLOY.md           # GitHub Pages 部署教程
```

## 🛠 技术栈

- **纯原生 JavaScript + CSS**（无框架，零构建）
- **Supabase**：Auth 认证 + Postgres 数据库 + Storage 对象存储
- **Vercel / GitHub Pages**：静态部署

## 📄 License

[MIT](LICENSE)
