---
title: Dijkstra 算法模板与思路
date: 2026-09-26 11:45:14
tags:
  - 图论
  - 最短路
  - 算法模板
categories:
  - 算法
---

## 一、适用场景

Dijkstra 用于求**单源最短路**，也就是从一个起点出发，到其他所有点的最短距离。

使用前提：**所有边权非负**。只要有负权边，Dijkstra 就可能出错，需要换 SPFA 或 Bellman-Ford。

## 二、核心思路

Dijkstra 的本质是贪心。

维护一个数组 `dist[]`，`dist[i]` 表示从起点到点 `i` 的当前最短距离。初始时起点为 0，其余为无穷大。

每一轮做两件事：

1. 从未确定的点中，取出 `dist` 最小的那个点 `u`，此时 `dist[u]` 就是起点到 `u` 的最终最短路。
2. 用 `u` 去松弛它的所有邻居：如果 `dist[v] > dist[u] + w(u,v)`，就更新 `dist[v]`。

为什么取出的点可以直接确定？因为边权非负，后面再绕路不可能比现在更短。

## 三、复杂度

- 朴素实现：每轮 O(n) 找最小点，总共 O(n²)，适合稠密图。
- 优先队列优化：每轮 O(log n) 取最小点，总共 O(m log n)，适合稀疏图。其中 n 是点数，m 是边数。

## 四、优先队列优化模板

```cpp
#include<bits/stdc++.h>
using namespace std;
int n,m,st;
const int N=1e5+10;
const long long INF=1e18;
#define ll long long
vector<ll> dist(N,INF);

vector<pair<ll,int>> G[N];

void dijk()
{
    priority_queue<pair<ll,int>,
        vector<pair<ll,int>>,
            greater<pair<ll,int>>> pq;

    dist[st]=0;
    pq.push({0,st});
    
    while(!pq.empty())
    {
        auto [d,u]=pq.top();
        pq.pop();

        if(d>dist[u]) continue;

        for(const auto& [w,v] : G[u])
        {
            if(dist[v] > dist[u]+w)
            {
                dist[v]=dist[u]+w;
                pq.push({dist[v],v});
            }
        }
    }
}


int main()
{
    cin>>n>>m>>st;
    
    for(int i=1;i<=m;i++)
    {
        int u,v,w;
        cin>>u>>v>>w;
        G[u].push_back({w,v});
    }

    dijk();

    for(int i=1;i<=n;i++)
        cout<<dist[i]<<" ";
    return 0;
}

```

## 五、关键细节说明

**为什么用 `d > dist[u]` 跳过？**

同一个点可能被多次压入堆中。每次 `dist` 被更新，就会把新的 `{dist, v}` 压进去，堆里会存在同一个点的多条旧记录。取出时如果发现当前取出的距离 `d` 已经大于 `dist[u]`，说明这是一条过期记录，直接跳过。也可vis数组记录。

**如何输出路径？**

额外维护一个 `pre[]` 数组，松弛成功时记录 `pre[v] = u`。最后从终点不断跳 `pre` 回溯到起点，再反转就是路径。
