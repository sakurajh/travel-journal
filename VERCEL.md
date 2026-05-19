# Vercel 部署教程

## 优势
- 完全免费
- 速度极快（全球 CDN）
- 自动 HTTPS
- 自定义域名支持
- 自动部署（代码更新自动同步）

## 部署步骤

### 第一步：上传代码到 GitHub

1. 打开 https://github.com 注册账号（如果没有）

2. 创建新仓库：
   - 点击右上角 `+` → `New repository`
   - Repository name: `travel-journal`
   - 选择 `Public`
   - 点击 `Create repository`

3. 在项目目录打开终端，执行：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/travel-journal.git
   git push -u origin main
   ```

### 第二步：连接 Vercel

1. 打开 https://vercel.com

2. 点击 `Sign Up` 注册

3. 选择 `Continue with GitHub`（用 GitHub 账号登录）

4. 授权 Vercel 访问你的 GitHub

### 第三步：导入项目

1. 登录后点击 `Add New...` → `Project`

2. 找到 `travel-journal` 仓库

3. 点击 `Import`

4. 配置如下：
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: 留空
   - Output Directory: `.`

5. 点击 `Deploy`

### 第四步：完成

等待 1-2 分钟部署完成，你会得到一个链接：
```
https://travel-journal-xxx.vercel.app
```

## 自定义域名（可选）

1. 在 Vercel 项目页面点击 `Settings`
2. 左侧选择 `Domains`
3. 输入你的域名（如 `travel.example.com`）
4. 按提示在域名服务商添加 CNAME 记录
5. 等待生效（约 10 分钟）

## 自动部署

以后每次修改代码，只需要：
```bash
git add .
git commit -m "更新说明"
git push
```

Vercel 会自动检测到更新并重新部署（约 1 分钟）。

## 访问速度

Vercel 在全球有 CDN 节点：
- 国内访问速度：⭐⭐⭐⭐（比 GitHub Pages 快）
- 国外访问速度：⭐⭐⭐⭐⭐（极快）

## 常见问题

### Q: 部署失败怎么办？
A: 检查 `vercel.json` 文件是否正确，确保 Root Directory 是 `./`

### Q: 国内访问慢怎么办？
A: 可以绑定自定义域名 + Cloudflare CDN

### Q: 有流量限制吗？
A: 免费版每月 100GB 流量，个人使用足够

### Q: 支持 HTTPS 吗？
A: 支持，自动配置 SSL 证书
