# 上岸小卡

中文考公常识刷卡学习网站。游客可直接使用本地题库与 localStorage；配置 Supabase 免费版后，用户可登录并跨设备同步学习进度、收藏、错题与学习总结。前端始终可部署到 GitHub Pages。

## 本地启动

需要 Node.js 22.13 或更高版本。仓库使用 pnpm 锁定文件：

```bash
pnpm install
pnpm run dev
```

访问终端显示的本地地址。生产构建：

```bash
pnpm run build
pnpm run preview
```

## GitHub Pages 部署

1. 将仓库推送至 GitHub 的 `main` 或 `master` 分支。
2. 在仓库 **Settings → Pages** 中，将 Source 设为 **GitHub Actions**。
3. 推送后，`.github/workflows/deploy.yml` 会构建 `dist` 并发布。可在 Actions 查看部署结果。

项目使用 `HashRouter` 和 Vite 的相对 `base: './'`，可在仓库子路径正常加载和刷新二级页面。

## Supabase 免费版配置

1. 注册 Supabase 并创建 **Free Plan** 项目；不要升级套餐、不要配置 service_role 到前端。
2. 在 SQL Editor 按顺序执行 `supabase/migrations/001_initial_schema.sql`、`002_rls_policies.sql`、`003_seed_demo_data.sql`。
3. 在 Project Settings → API 复制 Project URL 和 **anon public key**，写入本地 `.env.local`：

   ```env
   VITE_SUPABASE_URL=https://你的项目.supabase.co
   VITE_SUPABASE_ANON_KEY=你的匿名公钥
   ```

4. Auth → URL Configuration：Site URL 填 GitHub Pages 地址，例如 `https://ningyan1228.github.io/shang-an-xiao-ka/`；Redirect URLs 加入同一地址及 `http://localhost:5173/`。
5. Auth → Providers → Email：按需开启邮箱确认。注册后，数据库触发器会自动创建 profile 和用户设置。
6. 在 GitHub 仓库 Settings → Secrets and variables → Actions 添加 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`。这两个值会在构建时注入，**不要**提交 `.env.local`。

### 设置管理员

先用你的邮箱在网站注册，再在 Supabase SQL Editor 执行（替换邮箱）：

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = '你的管理员邮箱');
```

刷新网站后访问 `#/admin`。RLS 会在数据库层阻止普通用户写入内容或 Storage。

### 题库与漫画批量导入

- 下载/使用 `public/templates/knowledge-cards-import-template.csv`，在管理员后台 `#/admin/import` 上传；一次最多 50 条。
- 漫画文件使用 `<card-slug>-question.png` 和 `<card-slug>-answer.png` 命名，在 `#/admin/storage` 批量选择。浏览器会压缩成 WebP、生成缩略图；单图原始文件超过 1 MB 会被阻止。
- Storage 中只保存压缩图。请保留原始漫画、本地 CSV 和导出文件。

### 免费额度与故障处理

- 本项目不使用付费图片转换、Edge Functions、service_role、Notion 或付费 API。
- Storage 超过约 700 MB 应减少上传，850 MB 以上应立即清理不再使用的版本化图片；实际用量以 Supabase Dashboard 为准。
- 免费项目低活动时可能暂停，在 Dashboard 手动恢复即可。网站请求失败会继续保留本地学习记录。
- 常见 “没有权限” 错误：确认已执行 `002_rls_policies.sql`、当前账户的 profile 已标为 admin，且上传到正确 bucket。

详细备份步骤见 [docs/FREE_PLAN_BACKUP.md](docs/FREE_PLAN_BACKUP.md)。

## 已实现

- 今日学习完整刷卡流程、键盘快捷键、收藏与学习总结
- 透明的间隔复习规则，错题本与收藏夹复习
- 24 条本地演示知识卡、题库搜索/筛选/详情
- 学习数据、最近七天图表、分类进度
- 设置、JSON 数据导入导出、二次确认清空
- 桌面与移动端适配及 GitHub Pages 自动部署
