# /draw/ 的 Excalidraw 静态页面

这个子项目用官方 `@excalidraw/excalidraw` React 组件构建 `/draw/` 页面。
构建产物直接写入 Hexo 的 `source/draw/`，再由 Hexo 原样复制到 `public/draw/`。

## 命令

```bash
cd "$HOME/LEO BLOG/excalidraw-app"
npm install
npm run dev      # 本地 Vite 调试，默认 http://127.0.0.1:5173/draw/
npm run build    # 输出到 ../source/draw/，并复制自托管字体
```

## 页面特性

- `langCode="zh-CN"` 强制简体中文，不依赖浏览器语言。
- 独立 `index.html`，不经过 Hexo 主题布局，全屏显示。
- 画布自动保存到浏览器 `localStorage`，键名：
  `cly-excalidraw-scene-v1`。
- 退出/刷新页面后自动恢复；建议仍用 Excalidraw 菜单定期导出
  `.excalidraw` 文件备份。

## 重新生成并发布

Cloudflare Pages 从 GitHub 仓库（`CLY-orz/CLY666` 的 `main` 分支）执行
`npx hexo generate` 构建，构建过程中不会安装或执行 `excalidraw-app`，
因此 `source/draw/` 里的**构建产物必须提交到 Git**，否则线上 `/draw/`
会返回 404（这正是之前打不开的原因）。

发布新版本：

```bash
cd "$HOME/LEO BLOG"
npm --prefix excalidraw-app run build   # 重新生成 source/draw/
npx hexo clean && npx hexo generate     # 本地预览
git add source/draw
git commit -m "update draw build"
git push                                # 触发 Cloudflare Pages 自动部署
```

如果手动 `hexo deploy` 到 `CLY666-deploy`，则用：

```bash
npm --prefix excalidraw-app run build
npx hexo clean && npx hexo generate && npx hexo deploy
```

## .gitignore 注意事项

**不要**把 `source/draw/` 加入 `.gitignore`。它现在约有 20 MB（JS 分包 +
自托管字体），但必须随源码一起提交，Cloudflare Pages 才能发布 `/draw/`。
`source/draw/.DS_Store` 由根目录 `.gitignore` 的 `.DS_Store` 规则忽略。
