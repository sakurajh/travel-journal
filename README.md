# 旅行摄影日志

一个复古胶片风格的旅行摄影日志网站，支持后台管理、全屏轮播、多种交互效果。

## 快速开始

### 本地运行
1. 双击 `index.html` 打开前台
2. 双击 `admin.html` 打开后台管理

### 远程部署
双击 `deploy.bat` 查看部署教程，支持：
- **Vercel**（推荐，速度最快）→ [VERCEL.md](VERCEL.md)
- **GitHub Pages**（稳定）→ [DEPLOY.md](DEPLOY.md)

### 推荐：Vercel 部署
1. 上传代码到 GitHub
2. 访问 https://vercel.com 用 GitHub 登录
3. 导入仓库，一键部署
4. 获得链接：`https://travel-journal.vercel.app`

详细教程见 [VERCEL.md](VERCEL.md)

## 功能特性

### 前台展示
- 复古胶片风格设计
- 全屏放大轮播效果
- 3D 卡片倾斜效果
- 自定义光标
- 粒子背景动画
- 磁性按钮效果
- 快捷键支持
- 旅行统计
- 分享功能

### 后台管理
- 用户注册/登录（Supabase Auth）
- 旅行管理（创建、编辑、删除）
- 目的地管理
- 照片上传（支持批量，存储到云端）
- 页面设置
- 数据导入/导出
- 多设备数据同步

## 文件结构

```
├── index.html      # 前台展示
├── admin.html      # 后台管理
├── login.html      # 登录/注册页面
├── style.css       # 前台样式
├── admin.css       # 后台样式
├── app.js          # 前台逻辑
├── admin.js        # 后台逻辑
├── storage.js      # 存储管理（Supabase）
├── supabase.js     # Supabase 客户端配置
├── vercel.json     # Vercel 配置
├── deploy.bat      # 部署脚本（Windows）
├── deploy.sh       # 部署脚本（Mac/Linux）
├── VERCEL.md       # Vercel 部署教程
├── DEPLOY.md       # GitHub Pages 教程
├── SUPABASE.md     # Supabase 配置教程
└── README.md       # 说明文档
```

## Supabase 配置（必须）

本项目使用 Supabase 作为后端，提供用户认证、数据存储和照片存储。

### 快速配置
1. 访问 https://supabase.com 创建项目
2. 获取 Project URL 和 anon key
3. 填入 `supabase.js`
4. 在 SQL Editor 执行建表语句
5. 创建 Storage bucket

详细教程见 [SUPABASE.md](SUPABASE.md)

## 快捷键

| 按键 | 功能 |
|------|------|
| ← → | 切换照片 |
| ↑ ↓ | 切换目的地 |
| Enter | 打开轮播 |
| Esc | 关闭弹窗 |
| 空格 | 暂停/继续轮播 |
| F | 全屏切换 |

## 浏览器要求

- **推荐**：Chrome 86+ 或 Edge 86+（支持文件系统存储）
- **兼容**：Firefox、Safari（使用 IndexedDB）

## 数据存储

- **Supabase 云端**：数据和照片存储在云端，支持多设备同步
- **免费额度**：500MB 数据库 + 1GB 文件存储
- **认证**：邮箱密码注册/登录

## 许可

MIT License
