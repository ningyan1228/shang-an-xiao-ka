# Supabase 免费版备份

Supabase Storage 不是漫画原稿仓库。请把所有原始 PNG/JPG 漫画按专题保存在本地硬盘，并只把压缩后的 WebP 上传到 `card-images`。

## 每周数据库备份

在已登录 Supabase CLI 的电脑执行：

```bash
supabase db dump --project-ref YOUR_PROJECT_REF -f backups/database-YYYY-MM-DD.sql
```

也可在 Supabase Dashboard 的 SQL Editor 或数据库连接信息中使用 `pg_dump`。不要把数据库密码提交到 Git 仓库。

## 内容与 Storage

- 管理员在后台使用 CSV 模板导入题库；请同时保留 CSV 原稿。
- 在 Storage 页面确认每批上传结果；原图保存在本地，而不是仅存在 Supabase。
- 定期在 Dashboard 检查 Storage 总量、数据库大小和实际流量。
- 免费项目长时间没有真实活动时可能被暂停；在 Dashboard 手动恢复即可，无须制造无意义访问流量。
