-- ========================================================
-- daily_readings 表结构设计 (技术博客/精读记录)
-- 在 Supabase SQL Editor 中执行即可
-- ========================================================

create table if not exists daily_readings (
  id uuid default gen_random_uuid() primary key,
  title text not null,                 -- 文章标题 (例如：深入理解 Raft 分布式一致性)
  url text not null,                   -- 原文链接
  source text default '',              -- 来源/企业 (例如：Uber, Cloudflare, OpenAI, Netflix, Paper)
  summary text not null,               -- 核心要点 / 思考 / 启发总结
  tags text[] default array[]::text[], -- 技术分类标签 (例如：['Distributed', 'Raft', 'Architecture'])
  author_github text not null,         -- 记录人 GitHub 用户名
  is_pinned boolean default false,     -- 是否置顶 (可选能力)
  created_at timestamptz default now()
);

-- 创建索引以加速按时间排序与按标签查询
create index if not exists idx_daily_readings_created_at on daily_readings (created_at desc);
create index if not exists idx_daily_readings_tags on daily_readings using gin(tags);

-- 开启行级安全策略 (RLS)
alter table daily_readings enable row level security;

-- 策略 1：所有人均可阅读
create policy "Anyone can read daily_readings"
  on daily_readings for select
  using (true);

-- 策略 2：仅已登录用户可插入
create policy "Authenticated users can insert daily_readings"
  on daily_readings for insert
  to authenticated
  with check (true);

-- 策略 3：仅已登录用户可更新
create policy "Authenticated users can update daily_readings"
  on daily_readings for update
  to authenticated
  using (true);

-- 策略 4：仅已登录用户可删除
create policy "Authenticated users can delete daily_readings"
  on daily_readings for delete
  to authenticated
  using (true);

