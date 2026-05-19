# Supabase 配置指南

## 第一步：创建 Supabase 项目

1. 访问 https://supabase.com 注册账号
2. 点击 `New Project` 创建项目
3. 填写项目名称（如 `travel-journal`）
4. 设置数据库密码（记住它）
5. 选择区域（推荐 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
6. 点击 `Create Project`

## 第二步：获取 API 密钥

1. 进入项目后，点击左侧 `Settings`（齿轮图标）
2. 点击 `API`
3. 复制 `Project URL` 和 `anon public` key

## 第三步：配置代码

打开 `supabase.js`，替换这两个值：

```javascript
const SUPABASE_URL = '你的Project URL';
const SUPABASE_ANON_KEY = '你的anon key';
```

## 第四步：创建数据库表

1. 点击左侧 `SQL Editor`
2. 点击 `New Query`
3. 粘贴以下 SQL 并点击 `Run`：

```sql
-- 用户资料表
create table profiles (
  id uuid references auth.users primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);

-- 旅行表（使用 JSONB 存储嵌套数据）
create table trips (
  id text primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text,
  year text,
  subtitle text default '',
  description text default '',
  destinations jsonb default '[]'::jsonb,
  photos jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 用户设置表
create table user_settings (
  user_id uuid references profiles(id) primary key,
  site_title text default '旅行摄影日志',
  site_subtitle text default '用镜头记录世界的美好',
  footer_info text default 'TRAVEL JOURNAL',
  theme text default 'coral',
  film_stock text default 'KODAK PORTRA 400',
  current_trip_id text
);

-- 自动创建用户资料的触发器
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- RLS 策略（行级安全）
alter table profiles enable row level security;
alter table trips enable row level security;
alter table user_settings enable row level security;

-- profiles: 用户只能读写自己的资料
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- trips: 用户只能读写自己的旅行
create policy "Users can view own trips"
  on trips for select using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on trips for insert with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on trips for update using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on trips for delete using (auth.uid() = user_id);

-- user_settings: 用户只能读写自己的设置
create policy "Users can view own settings"
  on user_settings for select using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on user_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on user_settings for update using (auth.uid() = user_id);
```

## 第五步：创建存储桶（照片存储）

1. 点击左侧 `Storage`
2. 点击 `New Bucket`
3. 填写：
   - Bucket name: `photos`
   - Public bucket: ✅ 勾选（这样照片可以通过 URL 直接访问）
4. 点击 `Create Bucket`

### 设置存储策略

点击 `photos` 桶，然后点击 `Policies` 标签，添加以下策略：

**上传策略（INSERT）：**
- Policy name: `Authenticated users can upload`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `true`

**查看策略（SELECT）：**
- Policy name: `Anyone can view photos`
- Allowed operation: `SELECT`
- Target roles: `public`（所有人）
- USING expression: `true`

**删除策略（DELETE）：**
- Policy name: `Users can delete own photos`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `true`

## 第六步：部署

```bash
git add .
git commit -m "Add Supabase auth and cloud storage"
git push
```

Vercel 会自动重新部署。

## 常见问题

### Q: 注册后收不到确认邮件？
A: Supabase 默认需要邮箱确认。可以在 `Authentication` → `Providers` → `Email` 中关闭 `Confirm email` 选项（仅开发时建议）。

### Q: 照片上传失败？
A: 检查 Storage bucket 的策略是否正确配置，确保 authenticated 用户有 INSERT 权限。

### Q: 数据库查询失败？
A: 检查 RLS 策略是否正确，确保用户只能访问自己的数据。

### Q: 免费额度够用吗？
A: Supabase 免费版提供：
- 500MB 数据库存储
- 1GB 文件存储
- 50,000 月活用户
- 2GB 带宽

个人使用完全足够。
