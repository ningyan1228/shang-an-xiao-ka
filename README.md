# 上岸小卡

纯前端的中文考公常识刷卡学习 MVP。核心是“看问题 → 查看答案 → 评价掌握度 → 自动安排间隔复习”，所有学习数据都保存于浏览器 `localStorage`，无需登录或后端。

## 本地启动

需要 Node.js 20 或更高版本。仓库同时提供 pnpm 锁定文件，推荐使用 pnpm：

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

## 已实现

- 今日学习完整刷卡流程、键盘快捷键、收藏与学习总结
- 透明的间隔复习规则，错题本与收藏夹复习
- 24 条本地演示知识卡、题库搜索/筛选/详情
- 学习数据、最近七天图表、分类进度
- 设置、JSON 数据导入导出、二次确认清空
- 桌面与移动端适配及 GitHub Pages 自动部署
