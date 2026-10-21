---
title: 图
date: 2026-10-21 20:56:39
description: 图的遍历、最短路、最小生成树、拓扑排序、连通分量、网络流等图论模板
layout: post
math: true
---

> 本页收录 **图** 模块的全部模板代码，共 10 个文件 / 22 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `图` 目录。

## 使用前必读

本页所有代码均默认以下**全局定义**已存在，直接复制单个函数会编译失败。请先把它粘贴到你的代码最上方：

在使用本页任何代码之前，请先在代码最顶部加入以下**全局定义**。本仓库所有模板均默认这些定义已存在，缺少会导致编译报错。

```cpp
#include <bits/stdc++.h>
using namespace std;
using gg = long long;
constexpr gg MAX = 1e6 + 5;
constexpr gg mod = 1e9 + 7;
constexpr gg INF = 2e18;
constexpr double thre = 1e-7;  //用以判断两个浮点数是否相等的阈值
gg ti, ni, mi, ki, di, pi, xi, yi;
```

各定义的用途：

- `gg`：`long long` 的类型别名，本仓库所有整型数据统一用 `long long` 存储，避免 `int` 溢出。
- `MAX`：数据规模上限，代码中全局数组的长度。请按题目实际数据范围自行调整（如 `1e5 + 5`）。
- `mod`：常用取模常量 `1e9 + 7`，如题目要求别的模数请自行替换。
- `INF`：正无穷大，负无穷用 `-INF` 表示。
- `thre`：浮点数相等判断的阈值。
- `ti, ni, mi, ki, di, pi, xi, yi`：输入规模类变量。后缀 `i` 是 `input` 的缩写，表示该值由输入指定，以此与普通 `n`、`m` 区分。换行符分隔的多个定义等价于逐个 `gg` 声明。

> 注意：上方 `MAX` 与 `INF` 的取值只是示例默认值，请按题目数据范围调整后再提交。

## 目录

1. `图/网络流问题/最大流问题/使用BFS的Edmonds-Karp算法.cpp`
2. `图/网络流问题/最小费用最大流问题/使用Bellman-Ford的Edmonds-Karp算法.cpp`
3. `图/图的遍历.md`
4. `图/拓扑排序.md`
5. `图/无向图的割点和割边.md`
6. `图/最小生成树.md`
7. `图/最短路径问题.md`
8. `图/有向图的强连通分量问题.md`
9. `图/树上问题.md`
10. `图/欧拉图.md`

---

## 图/网络流问题/最大流问题/使用BFS的Edmonds-Karp算法.cpp

```cpp
void insertEdge(gg from, gg to, gg cap) {  //插入边
    graph[from].push_back(edges.size());
    edges.push_back(Edge(from, to, cap, 0));
    graph[to].push_back(edges.size());
    edges.push_back(Edge(to, from, 0, 0));
}
gg a[MAX], p[MAX];  // a数组表示源点到结点a[i]的残量,p数组表示最短路树上到达结点p[i]的边在edges数组中的序号
gg MaxFlow(gg s, gg t) {  //最大流算法,s为源点,t为汇点
    gg flow = 0;          //最大流量
    while (true) {
        memset(a, 0, sizeof(a));  //将源点到达每个结点的残量初始化为0
        //广度优先遍历查找从源点到达汇点的增广路
        queue<gg> q;
        q.push(s);
        a[s] = LONG_LONG_MAX;  //起点的残量置为无穷大
        while (!q.empty()) {
            gg x = q.front();
            q.pop();
            for (gg i : graph[x]) {  //遍历以x为起点的边
                Edge& e = edges[i];
                if (a[e.to] == 0 && e.cap > e.flow) {     //当前边的终点的残量为0且容量大于流量
                    p[e.to] = i;                          //更新到达该终点的边的编号
                    a[e.to] = min(a[x], e.cap - e.flow);  //更新源点到该终点的残量
                    q.push(e.to);                         //压入队列
                }
            }
            if (a[t] != 0)  //终点的残量不为零，跳出循环
                break;
        }
        if (a[t] == 0)  //终点的残量为零，表示不存在增广路了，跳出外层死循环
            break;
        for (gg u = t; u != s; u = edges[p[u]].from) {  //从汇点向前遍历增广路经，更新每条增广路的流量
            edges[p[u]].flow += a[t];
            edges[p[u] ^ 1].flow -= a[t];
        }
        flow += a[t];  //增加最大流量
    }
    return flow;
}
```

## 图/网络流问题/最小费用最大流问题/使用Bellman-Ford的Edmonds-Karp算法.cpp

```cpp
void insertEdge(gg from, gg to, gg cap, gg cost) {  //插入边
    graph[from].push_back(edges.size());
    edges.push_back(Edge(from, to, cap, 0, cost));
    graph[to].push_back(edges.size());
    edges.push_back(Edge(to, from, 0, 0, -cost));
}
bool BellmanFord(gg s, gg t, gg& flow, long long& cost) {  //最大流算法,s为源点,t为汇点
    gg a[MAXV] = {0}, p[MAXV] = {0},
       dis[MAXV] = {0};  // a数组表示源点到结点a[i]的残量,p数组表示最短路树上到达结点p[i]的边在edges数组中的序号
    fill(dis, dis + MAXV, INF);
    bool inQueue[MAXV] = {false};
    dis[s] = 0;
    inQueue[s] = true;
    a[s] = INF;  //起点的残量置为无穷大
    queue<gg> q;
    q.push(s);
    while (!q.empty()) {  //广度优先遍历查找从源点到达汇点的增广路
        gg u = q.front();
        q.pop();
        inQueue[u] = false;
        for (gg i : graph[u]) {  //遍历以x为起点的边
            Edge& e = edges[i];
            if (e.cap > e.flow && dis[e.to] > dis[u] + e.cost) {  //当前边的终点的残量为0且容量大于流量
                dis[e.to] = dis[u] + e.cost;
                p[e.to] = i;                          //更新到达该终点的边的编号
                a[e.to] = min(a[u], e.cap - e.flow);  //更新源点到该终点的残量
                if (!inQueue[e.to]) {
                    inQueue[e.to] = true;
                    q.push(e.to);  //压入队列
                }
            }
        }
    }
    if (dis[t] == INF)
        return false;
    flow += a[t];
    cost += dis[t] * 1ll * a[t];
    for (gg u = t; u != s; u = edges[p[u]].from) {  //从汇点向前遍历增广路经，更新每条增广路的流量
        edges[p[u]].flow += a[t];
        edges[p[u] ^ 1].flow -= a[t];
    }
    return true;
}
//需要保证初始网络中没有负权环
pair<gg, long long> MinCostMaxFlow(gg s, gg t) {
    gg flow = 0;
    long long cost = 0;
    while (BellmanFord(s, t, flow, cost))
        ;
    return {flow, cost};
}
```

## 图/图的遍历.md

# 图的遍历

算法的时间复杂度为 $O(n+m)$ ，其中 $n$ 为点的个数， $m$ 为边的个数。

```cpp
vector<gg> graph[MAX];
bool visit[MAX];
//图的深度优先遍历
void dfs(gg v) {
    visit[v] = true;
    cout << v << ' ';  //访问v
    for (gg i : graph[v]) {
        if (not visit[i]) {
            dfs(i);
        }
    }
}
//图的广度优先遍历
bool inQueue[MAX];
void bfs(gg v) {
    queue<gg> q;
    q.push(v);
    inQueue[v] = true;
    while (not q.empty()) {
        v = q.front();
        q.pop();
        cout << v << ' ';  //访问顶点v
        for (gg i : graph[v]) {
            if (not inQueue[i]) {
                q.push(i);
                inQueue[i] = true;
            }
        }
    }
}
```

## 图/拓扑排序.md

# 拓扑排序

## Kahn 算法

算法的时间复杂度为 $O(n+m)$

```cpp
//拓扑排序，返回值表示图中是否有圈
//拓扑排序结束后，top中存放拓扑序列，degree存储各节点的入度
vector<gg> graph[MAX];
gg degree[MAX];
vector<gg> top;
bool topSort() {
    queue<gg> q;  //储存入度为0的顶点
    for (gg i = 1; i <= ni; ++i) {  //将入度为零的顶点放入队列中
        if (degree[i] == 0) {
            q.push(i);
        }
    }
    while (not q.empty()) {
        gg p = q.front();
        q.pop();
        top.push_back(p);
        for (gg i : graph[p]) {  //遍历该结点的邻接顶点
            if (--degree[i] == 0) {  //减少邻接顶点的入度，如果入度为零
                q.push(i);  //压入队列
            }
        }
    }
    return top.size() == ni;
}
```

## dfs 算法

算法的时间复杂度为 $O(n+m)$

```cpp
vector<gg> graph[MAX];
gg visit[MAX];
vector<gg> top;
bool dfs(gg v) {
    visit[v] = -1;
    for (gg i : graph[v]) {
        if (visit[i] < 0 or (visit[i] == 0 and not dfs(i))) {
            return false;
        }
    }
    visit[v] = 1;
    top.push_back(v);
    return true;
}
bool topSort() {
    for (gg i = 1; i <= ni; ++i) {
        if (visit[i] == 0 and not dfs(i)) {
            return false;
        }
    }
    reverse(begin(top), end(top));
    return true;
}
```

## 图/无向图的割点和割边.md

# 无向图的割点和割边

对于一个无向图，如果把一个点删除后这个图的极大连通分量数增加了，那么这个点就是这个图的割点（又称割顶）。

对于一个无向图，如果删掉一条边后图中的极大连通分量数增加了，则称这条边为割边或者桥。

## Tarjan 算法求割点

算法的时间复杂度为 $O(n+m)$ ，其中 $n$ 为点的个数， $m$ 为边的个数。

```cpp
vector<gg> graph[MAX];
// dfn表示每个结点的搜索次序
gg dfn[MAX], low[MAX];
bool visit[MAX], ans[MAX];  // ans标记该结点是否为割点
gg cnt = 0;  // cnt表示搜索次序
void dfs(gg v, gg fa) {
    visit[v] = true;
    low[v] = dfn[v] = ++cnt;
    gg child = 0;
    for (gg i : graph[v]) {
        if (not visit[i]) {
            ++child;
            dfs(i, v);
            low[v] = min(low[v], low[i]);
            if (fa != v and low[i] >= dfn[v] and not ans[v]) {
                ans[v] = true;
            }
        } else if (i != fa) {
            low[v] = min(low[v], dfn[i]);
        }
    }
    if (fa == v and child >= 2 and not ans[v]) {
        ans[v] = true;
    }
}
void tarjan() {
    for (gg i = 1; i <= ni; ++i) {
        if (not visit[i]) {
            cnt = 0;
            dfs(i, i);
        }
    }
}
```

## Tarjan 算法求桥

算法的时间复杂度为 $O(n+m)$ ，其中 $n$ 为点的个数， $m$ 为边的个数。

```cpp
vector<gg> graph[MAX];
// dfn表示每个结点的搜索次序
gg dfn[MAX], low[MAX], father[MAX], sz[MAX];
bool ans[MAX];  // 如果ans[i]为true，则表示(father[x],x)为割边
gg cnt = 0;  // cnt表示搜索次序
gg cnt_bridge = 0;  // cnt_bridge表示割边数
void dfs(gg v, gg fa) {
    father[v] = fa;
    low[v] = dfn[v] = ++cnt;
    sz[v] = 1;
    for (gg i : graph[v]) {
        if (dfn[i] == 0) {
            dfs(i, v);
            low[v] = min(low[v], low[i]);
            sz[v] += sz[i];
            if (low[i] > dfn[v]) {
                ans[i] = true;
                // sz[i]表示目前还未添加{v,i}这条边时i所在连通块的结点数，可以在这里添加一些计算连通块结点数的逻辑
                ++cnt_bridge;
            }
        } else if (dfn[i] < dfn[v] and i != fa) {
            low[v] = min(low[v], dfn[i]);
        }
    }
}
void tarjan() {
    for (gg i = 1; i <= ni; ++i) {
        if (dfn[i] == 0) {
            cnt = 0;
            dfs(i, i);
        }
    }
}
```

## 图/最小生成树.md

# 最小生成树

## Kruskal 算法

时间复杂度为 $O(m\log m)$ 。

```cpp
struct Edge {  //边的类，存储两个端点u,v和边的权值cost
    gg u, v, cost;
    Edge(gg up, gg vp, gg cp) : u(up), v(vp), cost(cp) {}
};
vector<Edge> edges;  //存储所有的边
gg ufs[MAX];  //并查集
gg findRoot(gg x) { return ufs[x] == x ? x : ufs[x] = findRoot(ufs[x]); }
//返回的first成员表示最小生成树的权值之和，second成员表示图是否连通
pair<gg, bool> Kruskal() {
    iota(begin(ufs), end(ufs), 0);  //初始化并查集
    gg ans = 0, num = 0;
    sort(begin(edges), end(edges),
         [](const Edge& e1, const Edge& e2) { return e1.cost < e2.cost; });
    for (auto& e : edges) {
        gg ua = findRoot(e.u), ub = findRoot(e.v);
        if (ua != ub) {
            ans += e.cost;
            ufs[ua] = ub;
        }
    }
    for (gg i = 1; i <= ni; ++i) {
        if (ufs[i] == i) {
            ++num;
        }
    }
    return {ans, num == 1};
}
```

## Prim 算法

如果使用二叉堆等不支持 $O(1)$ 的 decrease-key 的堆，堆优化的 Prim 算法复杂度就不优于 Kruskal 算法，常数也比 Kruskal 大，时间复杂度为 $O((n+m)\log n)$ 。

```cpp
struct Edge {
    gg to, cost;
    Edge(gg t, gg c) : to(t), cost(c) {}
};
using agg2 = array<gg, 2>;
vector<Edge> graph[MAX];
bool visit[MAX];
//返回的first成员表示最小生成树的权值之和，second成员表示图是否连通
pair<gg, bool> Prim(gg s) {
    gg num = 0, ans = 0;
    priority_queue<agg2, vector<agg2>, greater<agg2>> pq;
    pq.push({0, s});
    while (num < ni and not pq.empty()) {
        auto p = pq.top();
        pq.pop();
        if (not visit[p[1]]) {
            ans += p[0];
            visit[p[1]] = true;
            ++num;
            for (auto& e : graph[p[1]]) {
                if (not visit[e.to]) {
                    pq.push({e.cost, e.to});
                }
            }
        }
    }
    return {ans, num == ni};
}
```

## 图/最短路径问题.md

# 最短路径问题

## 问题类型和解决算法一览

| 算法         | 解决的问题           | 图的特点                          | 时间复杂度                              |
| ------------ | -------------------- | --------------------------------- | --------------------------------------- |
| BFS          | 单源最短路           | 无权图                            | $O(n+m)$                                |
| 双端队列 BFS | 单源最短路           | 0-1 图（图中边的权值只有 0 和 1） | $O(n+m)$                                |
| Dijkstra     | 单源最短路           | 非负权图                          | $O(m\log m)$ （以 priority_queue 实现） |
| Bellman-Ford | 单源最短路           | 任意图（可以判断负环是否存在）    | $O(nm)$                                 |
| Floyd        | 每对结点之间的最短路 | 无负环图                          | $O(n^3)$                                |
| Johnson      | 每对结点之间的最短路 | 无负环图                          | $O(nm\log m)$                           |

## 针对无权图单源最短路的 BFS 算法

```cpp
vector<gg> graph[MAX];
gg dis[MAX];
void bfs(gg v) {
    fill(begin(dis), end(dis), INF);
    queue<gg> q;
    q.push(v);
    dis[v] = 0;
    while (not q.empty()) {
        v = q.front();
        q.pop();
        for (gg i : graph[v]) {
            if (dis[i] > dis[v] + 1) {
                q.push(i);
                dis[i] = dis[v] + 1;
            }
        }
    }
}
```

## 针对 0-1 图单源最短路的双端队列 BFS 算法

```cpp
struct Edge {
    gg to, cost;
    Edge(gg t, gg c) : to(t), cost(c) {}
};
vector<Edge> graph[MAX];
bool inQueue[MAX];
gg dis[MAX];
void bfs(gg v) {
    fill(begin(dis), end(dis), INF);
    deque<gg> dq;
    dq.push_back(v);
    inQueue[v] = true;
    dis[0] = 0;
    while (not dq.empty()) {
        v = dq.front();
        dq.pop_front();
        for (auto& e : graph[v]) {
            if (not inQueue[e.to]) {
                e.cost == 0 ? dq.push_front(e.to) : dq.push_back(e.to);
                dis[e.to] = dis[v] + e.cost;
                inQueue[e.to] = true;
            }
        }
    }
}
```

## 针对正权图单源最短路的 Dijkstra 算法

```cpp
using agg2 = array<gg, 2>;
struct Edge {
    gg to, cost;
    Edge(gg t, gg c) : to(t), cost(c) {}
};
vector<Edge> graph[MAX];
gg dis[MAX];
void Dijkstra(gg s) {
    fill(begin(dis), end(dis), INF);
    priority_queue<agg2, vector<agg2>, greater<agg2>> pq;
    dis[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        auto p = pq.top();
        pq.pop();
        if (dis[p[1]] != p[0]) {
            continue;
        }
        for (auto& e : graph[p[1]]) {
            if (dis[e.to] > p[0] + e.cost) {
                dis[e.to] = p[0] + e.cost;
                pq.push({dis[e.to], e.to});
            }
        }
    }
}
```

## 针对含负权图单源最短路的 Bellman-Ford 算法

```cpp
struct Edge {
    gg to, cost;
    Edge(gg t, gg c) : to(t), cost(c) {}
};
vector<Edge> graph[MAX];
gg dis[MAX], num[MAX]; // num[i]表示结点i入队了多少次，用来检测是否有负环
bool inQueue[MAX];
bool bellmanFord(gg s) {  //返回false代表s能够到达一个负环
    fill(begin(dis), end(dis), INF);
    queue<gg> q;
    dis[s] = 0;
    inQueue[s] = true;
    q.push(s);
    while (!q.empty()) {
        gg u = q.front();
        q.pop();
        inQueue[u] = false;
        for (auto& e : graph[u]) {
            if (dis[u] < INF and dis[e.to] > dis[u] + e.cost) {
                dis[e.to] = dis[u] + e.cost;
                if (not inQueue[e.to]) {
                    q.push(e.to);
                    inQueue[e.to] = true;
                    if (++num[e.to] > ni) {  //入队次数超过图的结点数，代表到达了一个负环
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
```

## 针对任意图所有结点对之间最短路的 Floyd 算法

```cpp
/*图用邻接矩阵存储，dis存储到达所有结点对之间的最短路径长度，初始状态下，dis的值应为：
若为有权图，dis[i][i]=0,有权的即为权值，其余均为无穷大；
若为无权图，若i和j之间有边，dis[i][j]=1；其余均为0*/
gg dis[MAX][MAX];
void floyd() {
    for (gg k = 1; k <= ni; ++k) {
        for (gg i = 1; i <= ni; ++i) {
            for (gg j = 1; j <= ni; ++j) {
                dis[i][j] = min(dis[i][j], dis[i][k] + dis[k][j]);  //有权图用这条语句
                dis[i][j] = dis[i][j] or (dis[i][k] and dis[k][j]);  //无权图用这条语句
            }
        }
    }
}
```

## 针对任意图所有结点对之间最短路的 Johnson 算法

```cpp
using agg2 = array<gg, 2>;
struct Edge {
    gg to, cost;
    Edge(gg t, gg c) : to(t), cost(c) {}
};
vector<Edge> graph[MAX];
gg dis[MAX], num[MAX], ans[MAX][MAX];
bool inQueue[MAX];
bool bellmanFord(gg s) {  //返回false代表s能够到达一个负环
    fill(begin(dis), end(dis), INF);
    queue<gg> q;
    dis[s] = 0;
    inQueue[s] = true;
    q.push(s);
    while (!q.empty()) {
        gg u = q.front();
        q.pop();
        inQueue[u] = false;
        for (auto& e : graph[u]) {
            if (dis[u] < INF and dis[e.to] > dis[u] + e.cost) {
                dis[e.to] = dis[u] + e.cost;
                if (not inQueue[e.to]) {
                    q.push(e.to);
                    inQueue[e.to] = true;
                    if (++num[e.to] > ni) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}
void Dijkstra(gg s, gg* d) {
    priority_queue<agg2, vector<agg2>, greater<agg2>> pq;
    d[s] = 0;
    pq.push({0, s});
    while (!pq.empty()) {
        auto p = pq.top();
        pq.pop();
        if (d[p[1]] != p[0]) {
            continue;
        }
        for (auto& e : graph[p[1]]) {
            if (d[e.to] > p[0] + e.cost + dis[p[1]] - dis[e.to]) {
                d[e.to] = p[0] + e.cost + dis[p[1]] - dis[e.to];
                pq.push({d[e.to], e.to});
            }
        }
    }
}
bool johnson() {  //返回false代表图中存在负环
    for (gg i = 1; i <= ni; ++i) {
        for (gg j = 1; j <= ni; ++j) {
            ans[i][j] = INF;
        }
    }
    //新建一个虚拟节点0，从这个点向其他所有点连一条边权为0的边。
    for (gg i = 1; i <= ni; ++i) {
        graph[0].push_back({i, 0});
    }
    if (not bellmanFord(0)) {
        return false;
    }
    for (gg i = 1; i <= ni; ++i) {
        Dijkstra(i, ans[i]);
    }
    for (gg i = 1; i <= ni; ++i) {
        for (gg j = 1; j <= ni; ++j) {
            ans[i][j] -= dis[i] - dis[j];
        }
    }
    return true;
}
```

## 图/有向图的强连通分量问题.md

# 有向图的强连通分量问题

## Tarjan 算法

算法的时间复杂度为 $O(n+m)$ ，其中 $n$ 为点的个数， $m$ 为边的个数。

```cpp
vector<gg> graph[MAX];
// dfn表示每个结点的搜索次序，scc表示每个结点所属的强连通分量编号，sz表示每个强连通分量所含结点个数
gg dfn[MAX], low[MAX], scc[MAX], sz[MAX];
bool visit[MAX], inStack[MAX];
gg cnt = 0, sccCnt = 0;  // cnt表示搜索次序，scc表示强连通分量编号
stack<gg> st;
void dfs(gg v) {
    visit[v] = true;
    low[v] = dfn[v] = ++cnt;
    st.push(v);
    inStack[v] = true;
    for (gg i : graph[v]) {
        if (not visit[i]) {
            dfs(i);
            low[v] = min(low[v], low[i]);
        } else if (inStack[i]) {
            low[v] = min(low[v], dfn[i]);
        }
    }
    if (dfn[v] == low[v]) {
        ++sccCnt;
        while (true) {
            gg u = st.top();
            scc[u] = sccCnt;
            sz[sccCnt]++;
            st.pop();
            inStack[u] = false;
            if (u == v) {
                break;
            }
        }
    }
}
void tarjan() {
    for (gg i = 1; i <= ni; ++i) {
        if (not visit[i]) {
            dfs(i);
        }
    }
}
```

## Kosaraju 算法

算法的时间复杂度为 $O(n+m)$ ，其中 $n$ 为点的个数， $m$ 为边的个数。

```cpp
// graph2为反向图
vector<gg> graph[MAX], graph2[MAX];
// dfn表示每个结点的搜索次序，scc表示每个结点所属的强连通分量编号，sz表示每个强连通分量所含结点个数
gg scc[MAX], sz[MAX];
bool visit[MAX];
vector<gg> post;
gg sccCnt = 0;
void dfs1(gg v) {
    visit[v] = true;
    for (gg i : graph[v]) {
        if (not visit[i]) {
            dfs1(i);
        }
    }
    post.push_back(v);
}
void dfs2(gg v) {
    scc[v] = sccCnt;
    ++sz[sccCnt];
    for (gg i : graph2[v]) {
        if (scc[i] == 0) {
            dfs2(i);
        }
    }
}
void kosaraju() {
    for (gg i = 1; i <= ni; ++i) {
        if (not visit[i]) {
            dfs1(i);
        }
    }
    reverse(begin(post), end(post));
    for (gg i : post) {
        if (scc[i] == 0) {
            ++sccCnt;
            dfs2(i);
        }
    }
}
```

## Garbow 算法

算法的时间复杂度为 $O(n+m)$ ，其中 $n$ 为点的个数， $m$ 为边的个数。

```cpp
vector<gg> graph[MAX];
// scc表示每个结点所属的强连通分量编号，sz表示每个强连通分量所含结点个数
gg low[MAX], scc[MAX], sz[MAX];
gg cnt = 0, sccCnt = 0;  // cnt表示搜索次序，scc表示强连通分量编号
stack<gg> st1, st2;
void dfs(gg v) {
    st1.push(v);
    st2.push(v);
    low[v] = ++cnt;
    for (gg i : graph[v]) {
        if (low[i] == 0) {
            dfs(i);
        } else if (scc[i] == 0) {
            while (low[st2.top()] > low[i]) {
                st2.pop();
            }
        }
    }
    if (st2.top() == v) {
        st2.pop();
        sccCnt++;
        while (true) {
            gg p = st1.top();
            ++sz[sccCnt];
            scc[p] == sccCnt;
            st1.pop();
            if (p == v) {
                break;
            }
        }
    }
}
void garbow() {
    for (gg i = 1; i <= ni; ++i) {
        if (low[i] == 0) {
            dfs(i);
        }
    }
}
```

## 图/树上问题.md

# 树上问题

## 树直径

无环连通图中所有最短路径的最大值即为`树直径`，可以用两次 DFS 或者树形 DP 的方法在 $O(n)$ 时间求出树的直径。

```cpp
struct Edge {
    gg to, cost;
    Edge(gg t, gg c) : to(t), cost(c) {}
};
vector<Edge> tree[MAX];
gg dis[MAX];
void dfs(gg v, gg fa) {
    for (auto& e : tree[v]) {
        if (e.to != fa) {
            dis[e.to] = dis[v] + e.cost;
            dfs(e.to, v);
        }
    }
}
void findTreeDiameter() {
    dis[1] = 0;
    dfs(1, 0);
    gg r = max_element(begin(dis) + 1, begin(dis) + ni + 1) - begin(dis);
    dis[r] = 0;
    dfs(r, 0);
}
```

## 最近公共祖先

### 倍增算法

倍增算法的预处理时间复杂度为 $O(n\log n)$ ，单次查询时间复杂度为 $O(\log n)$ 。

```cpp
constexpr gg Max2 = 20;
vector<gg> tree[MAX];
gg depth[MAX], father[MAX][Max2];
void dfs(gg v, gg fa) {
    father[v][0] = fa;
    depth[v] = depth[fa] + 1;
    for (gg i = 1; i < Max2; ++i) {
        father[v][i] = father[father[v][i - 1]][i - 1];
    }
    for (gg i : tree[v]) {
        if (i != fa) {
            dfs(i, v);
        }
    }
}
gg LCA(gg x, gg y) {
    if (depth[x] > depth[y]) {
        swap(x, y);
    }
    gg d = depth[y] - depth[x];
    for (gg i = 0; d > 0; ++i, d >>= 1) {
        if (d & 1) {
            y = father[y][i];
        }
    }
    if (x == y) {
        return x;
    }
    for (gg i = Max2 - 1; i >= 0 and x != y; --i) {
        if (father[x][i] != father[y][i]) {
            x = father[x][i];
            y = father[y][i];
        }
    }
    return father[x][0];
}
```

### Tarjan 算法

Tarjan 算法是一种离线算法，需要使用并查集记录某个结点的祖先结点。预处理时间复杂度为 $O(n)$ ，处理`m`次查询的时间复杂度为 $O(n+m)$ 。

```cpp
struct UFS {
    gg ufs[MAX];
    //初始化并查集
    UFS() {
        iota(begin(ufs), end(ufs), 0);
    }
    //查找结点所在树的根结点并进行路径压缩
    gg findRoot(gg x) { return ufs[x] == x ? x : ufs[x] = findRoot(ufs[x]); }
    //合并两个结点所在集合
    void unionSets(gg a, gg b) { ufs[findRoot(a)] = findRoot(b); }
};
UFS ufs;
vector<gg> tree[MAX], queryEdge[MAX];
bool visit[MAX];
map<array<gg, 2>, gg> ans;
vector<array<gg, 2>> query;
void tarjan(gg v, gg fa) {
    visit[v] = true;
    for (gg i : tree[v]) {
        if (i != fa) {
            tarjan(i, v);
            ufs.unionSets(i, v);
        }
    }
    for (gg i : queryEdge[v]) {
        if (visit[i]) {
            ans[{i, v}] = ufs.findRoot(i);
            ans[{v, i}] = ufs.findRoot(i);
        }
    }
}
```

## 图/欧拉图.md

# 欧拉图

## 定义

1. 通过图中所有边恰好一次且行遍所有顶点的通路称为欧拉通路。
2. 通过图中所有边恰好一次且行遍所有顶点的回路称为欧拉回路。
3. 具有欧拉回路的无向图或有向图称为欧拉图。
4. 具有欧拉通路但不具有欧拉回路的无向图或有向图称为半欧拉图。

## 判别法

1. 一个无向图是欧拉图，当且仅当图是连通的且没有奇度顶点。一个无向图是半欧拉图当且仅当图是连通的且图中恰有 0 个或 2 个奇度顶点，且必须从其中一个奇度顶点出发，另一个奇度顶点终止。
2. 一个无向图是欧拉图当且仅当图的所有顶点属于同一个强连通分量且每个顶点的入度和出度相同。一个有向图是半欧拉图当且仅当
   1. 如果将图中的所有有向边退化为无向边时，那么图的所有顶点属于同一个连通分量。
   2. 最多只有一个顶点的入度比出度小 1，最多只有一个顶点的出度比入度小 1，且必须入度比出度小 1 的结点出发，入度比出度大 1 的结点终止。
   3. 所有其他顶点的入度和出度相同。

## DFS 求欧拉回路或欧拉路

算法的时间复杂度为 $O(n+m)$ ，其中 $n$ 为点的个数， $m$ 为边的个数。

```cpp
struct Edge {
    gg from, to;
    bool visit;
    Edge(gg f, gg t, bool v = false) : from(f), to(t), visit(v) {}
};
vector<Edge> edges;
vector<gg> graph[MAX];  //注意graph中存储的是边在edges中的下标
vector<gg> ans;  //存储欧拉序列
//注意dfs之后，ans数组必须进行一次翻转才是正确的欧拉序列
void dfs(gg v) {
    for (gg i : graph[v]) {
        if (not edges[i].visit) {
            edges[i].visit = true;
            dfs(v == edges[i].from ? edges[i].to : edges[i].from);
        }
    }
    ans.push_back(v);
}
```

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
