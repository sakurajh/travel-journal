# 部署指南

## 方案一：GitHub Pages（推荐）

### 优点
- 完全免费
- 全球 CDN，国内访问速度也不错
- 稳定可靠
- 自定义域名支持

### 部署步骤

#### 1. 注册 GitHub 账号
访问 https://github.com 注册账号

#### 2. 创建新仓库
1. 点击右上角 `+` -> `New repository`
2. 填写信息：
   - Repository name: `travel-journal`
   - Description: `旅行摄影日志`
   - 选择 `Public`
3. 点击 `Create repository`

#### 3. 上传文件
在项目目录打开终端，执行：

```bash
# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 设置主分支
git branch -M main

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/travel-journal.git

# 推送
git push -u origin main
```

#### 4. 开启 GitHub Pages
1. 进入仓库页面
2. 点击 `Settings`
3. 左侧菜单选择 `Pages`
4. Source 选择 `Deploy from a branch`
5. Branch 选择 `main`，文件夹选择 `/ (root)`
6. 点击 `Save`

#### 5. 访问网站
等待 2-5 分钟后访问：
```
https://YOUR_USERNAME.github.io/travel-journal/
```

---

## 方案二：Vercel

### 优点
- 速度极快
- 自动 HTTPS
- 自定义域名
- 自动部署

### 部署步骤

1. 访问 https://vercel.com 注册账号
2. 连接 GitHub 账号
3. 点击 `New Project`
4. 选择你的仓库
5. 点击 `Deploy`

访问地址：`https://travel-journal.vercel.app`

---

## 方案三：Netlify

### 优点
- 免费静态托管
- 表单功能
- 自动 HTTPS

### 部署步骤

1. 访问 https://netlify.com 注册账号
2. 点击 `New site from Git`
3. 选择 GitHub
4. 选择仓库
5. 点击 `Deploy site`

访问地址：`https://随机名.netlify.app`

---

## 重要提示

### 数据存储说明
当前版本使用浏览器本地存储（localStorage/IndexedDB），这意味着：
- 数据存在用户浏览器中
- 不同设备间数据不共享
- 清除浏览器数据会丢失照片

### 如果需要多设备同步
需要额外的后端服务，可以考虑：
1. **Firebase** - Google 提供，有免费额度
2. **Supabase** - 开源 Firebase 替代品
3. **LeanCloud** - 国内服务，速度快

---

## 自定义域名（可选）

### GitHub Pages 自定义域名
1. 购买域名（如阿里云、腾讯云）
2. 在仓库 Settings -> Pages -> Custom domain 填入域名
3. 在域名服务商添加 CNAME 记录指向 `YOUR_USERNAME.github.io`

---

## 常见问题

### Q: 国内访问速度慢怎么办？
A: 可以使用 Vercel 或 Netlify，或者配置自定义域名 + CDN

### Q: 数据会丢失吗？
A: 当前版本数据存在浏览器本地，清除浏览器数据会丢失

### Q: 可以多人协作吗？
A: 当前版本不支持，需要后端服务

### Q: 可以上传多大的照片？
A: 取决于浏览器存储限制，建议每张照片不超过 2MB
