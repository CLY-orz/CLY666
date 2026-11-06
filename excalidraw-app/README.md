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

```bash
cd "$HOME/LEO BLOG"
npm --prefix excalidraw-app run build
npx hexo clean
npx hexo generate
npx hexo deploy
```

如果部署平台从源码构建（例如 Cloudflare Pages），把构建命令设置为：

```bash
npm --prefix excalidraw-app ci && npm --prefix excalidraw-app run build && npx hexo generate
```

输出目录仍为 `public`。

## .gitignore 建议

如果不想把约 20 MB 的构建产物提交到 Git，在博客根目录 `.gitignore` 增加：

```gitignore
source/draw/
excalidraw-app/node_modules/
```

如果希望仓库克隆后直接 `hexo generate` 就能用，则不要忽略
`source/draw/`（但会提交较大的字体和 JS 文件）。
