---
title: Floyd 算法笔记
date: 2026-09-28T21:03:00.000+08:00
tags:
  - 图论
  - 最短路
  - 算法模版
categories:
  - 算法
---
## 核心思想

动态规划，求多源最短路径。

对每个中间点 k，尝试用 k 中转更新 i→j 的距离：

```
dis[i][j] = min(dis[i][j], dis[i][k] + dis[k][j])
```

---

## 模板

```cpp
const int INF = 0x3f3f3f3f;

// 初始化
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= n; j++)
        dis[i][j] = (i == j ? 0 : INF);

// 读边
dis[u][v] = min(dis[u][v], w);

// Floyd
for (int k = 1; k <= n; k++)
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            dis[i][j] = min(dis[i][j], dis[i][k] + dis[k][j]);
```

---

## 关键点

- **k 必须在最外层**（DP 阶段，不能换顺序）
- INF 用 `0x3f3f3f3f`，避免加法溢出
- `dis[i][i] = 0`
- 重边取 min

---

## 复杂度

时间 O(n³)，空间 O(n²)，适合稠密图、n ≤ 500。

---

## 扩展

- **传递闭包**：边权视为 1，用 `||` 和 `&&` 代替 min 和 +
- **最小环**：处理 k 时，`dis[i][j] + w[i][k] + w[k][j]`（i,j < k）
- **负环**：跑完后若 `dis[i][i] < 0` 则有负环

---

## 对比

| | Floyd | Dijkstra |
|---|---|---|
| 类型 | 多源 | 单源 |
| 复杂度 | O(n³) | O((n+m)log n) |
| 负权 | 支持 | 不支持 |
| 适用 | 稠密图 | 稀疏图 |
