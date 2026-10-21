---
title: 动态规划
date: 2026-10-21 20:56:39
description: 线性 DP、区间 DP、背包问题等动态规划模板
layout: post
math: true
---

> 本页收录 **动态规划** 模块的全部模板代码，共 3 个文件 / 13 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `动态规划` 目录。

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

1. `动态规划/区间动态规划.md`
2. `动态规划/线性动态规划.md`
3. `动态规划/背包问题.md`

---

## 动态规划/区间动态规划.md

# 区间动态规划

## 合并石子问题

### 问题描述

n 堆石子排成一排，每次只能选相邻的 2 堆合并成新的一堆，并将新的一堆的石子数，记为该次合并的得分。求将 n 堆石子合并成 1 堆的最大得分。

### 思路

1. 状态含义：设 $dp[left][right]$ 表示将 $[left,right]$ 之间的石子合并成一堆的最大得分。
2. 边界条件： $dp[i][i]=0$
3. 状态转移方程： $dp[left][right]=max(dp[left][right],dp[left][i]+dp[i+1][right]+\sum_{j=left}^{right} a_j$ ，其中 $left\le i\lt right$ ， $\sum_{j=left}^{right} a_j$ 可用前缀和以 $O(1)$ 时间复杂度求解。
4. 算法的时间复杂度为 $O(n^3)$
5. C++代码：

```cpp
gg intervalDP(){
    for (gg len = 2; len <= ni; ++len) {  //枚举区间长度
        for (gg left = 1; left <= ni - len + 1; ++left) {  //枚举左端点
            gg right = left + len - 1;  //右端点
            for (gg i = left; i < right; ++i) {
                dp[left][right] = max(dp[left][right], dp[left][i] + dp[i + 1][right] + sum[right] - sum[left - 1]);
            }
        }
    }
    return dp[1][ni];
}
```

## 动态规划/线性动态规划.md

# 线性动态规划

本文数组下标均从 1 开始。

## 最长上升/不下降子序列（LIS）问题

1. 状态含义：设 $dp[i]$ 表示以长度为`i`的上升/不下降子序列中末尾元素的最小值。
2. 边界条件： $dp[i]=\infty$
3. 算法的时间复杂度为 $O(n\log n)$
4. C++代码：

```cpp
//最长上升子序列
gg dp[MAX];
gg LIS(vector<gg>& nums) {
    fill(begin(dp) + 1, begin(dp) + ni + 1, INF);
    for (gg i : nums) {
        *lower_bound(begin(dp) + 1, begin(dp) + ni + 1, i) = i;
    }
    return lower_bound(begin(dp) + 1, begin(dp) + ni + 1, INF) - begin(dp) - 1;
}
```

```cpp
//最长不下降子序列
gg dp[MAX];
gg LIS(vector<gg>& nums) {
    fill(begin(dp) + 1, begin(dp) + ni + 1, INF);
    for (gg i : nums) {
        *upper_bound(begin(dp) + 1, begin(dp) + ni + 1, i) = i;
    }
    return lower_bound(begin(dp) + 1, begin(dp) + ni + 1, INF) - begin(dp) - 1;
}
```

## 最长公共子序列（LCS）问题

1. 思路：记录下 a 中所有数字的下标，将 b 中数字转换成对应在 a 中的下标，求转换后 b 数组的最长上升子序列。
2. 算法的时间复杂度为 $O(n\log m)$
3. C++代码：

```cpp
gg dp[MAX];
gg longestCommonSubsequence(vector<gg>& a, vector<gg>& b) {
    map<gg, vector<gg>> m;
    fill(begin(dp) + 1, begin(dp) + ni + 1, INF);
    for (gg i = 1; i <= ni; ++i) {
        m[a[i]].push_back(i);
    }
    for (gg i = 1; i <= mi; ++i) {
        if (m.count(b[i])) {
            for (auto j = m[b[i]].rbegin(); j != m[b[i]].rend(); ++j) {
                *lower_bound(begin(dp) + 1, begin(dp) + ni + 1, *j) = *j;
            }
        }
    }
    return lower_bound(begin(dp) + 1, begin(dp) + ni + 1, INF) - begin(dp) - 1;
}
```

## 数的划分问题

### 将正整数 n 划分成若干个正整数，这些正整数之和恰好等于 n，求划分方法数

划分方法数为 $2^{n-1}$

### 将正整数 n 划分成不超过 m 个正整数，这些正整数之和恰好等于 n，求划分方法数

1. 状态含义： $dp[i][j]$ 表示将 正整数 i 划分成 j 个正整数的划分总数。
2. 边界条件： $dp[i][0]=0，dp[0][0]=1$
3. 状态转移方程：
   1. 如果不考虑顺序，即 1+1+2 和 1+2+1 是相同的划分方法， $dp[i][j]=dp[i-j][j]+dp[i][j-1]$
   2. 如果考虑顺序，即 1+1+2 和 1+2+1 是不同的划分方法， $dp[i][j]=\sum_{k=0}^{i} dp[i-k][j-1]=dp[i-1][j]+dp[i][j-1]$
4. 算法的时间复杂度为 $O(nm)$

### 将正整数 n 划分成恰好 m 个正整数，这些正整数之和恰好等于 n，求划分方法数

1. 状态含义： $dp[i][j]$ 表示将 正整数 i 划分成 恰好 j 个正整数的划分总数。
2. 边界条件： $dp[i][0]=0，dp[0][0]=1$
3. 状态转移方程：
   1. 如果不考虑顺序，即 1+1+2 和 1+2+1 是相同的划分方法， $dp[i][j]=dp[i-j][j]+dp[i-1][j-1]$
   2. 如果考虑顺序，即 1+1+2 和 1+2+1 是不同的划分方法， $dp[i][j]=\sum_{k=1}^{i} dp[i-k][j-1]=dp[i-1][j]+dp[i-1][j-1]$
4. 算法的时间复杂度为 $O(nm)$

## 动态规划/背包问题.md

# 背包问题

## 0-1 背包问题

### 问题描述

有 n 种重量和价值分别为 $w_i,v_i$ 的物品。从这些物品中挑选出总重量不超过 $w$ 的物品，求所有挑选方案中价值总和的最大值（物品下标为 1 到 n）。每种物品最多只能选一件。

### 从后向前递推

1. 状态含义：设 $dp[i][j]$ 表示在第 $i,i+1,\dots,n$ 物品中任选一些总重量不超过为 $j$ 的物品价值总和的最大值。
2. 边界条件： $dp[n+1][j]=0$
3. 状态转移方程：
   1. $j\lt w_i，dp[i][j]=dp[i+1][j]$
   2. $j\ge w_i，dp[i][j]=\max(dp[i+1][j],dp[i+1][j-w_i]+v_i)$
4. 算法时间复杂度均为 $O(nw)$
5. C++代码：

```cpp
gg backpack01(){
    for (gg i = ni; i >= 1; --i) {
        for (gg j = 0; j <= w; ++j) {
            dp[i][j] = dp[i + 1][j];
            if (j >= wi[i]) {
                dp[i][j] = max(dp[i][j], dp[i + 1][j - wi[i]] + vi[i]);
            }
        }
    }
    return dp[1][w];
}
```

### 从前向后递推

1. 状态含义：设 $dp[i][j]$ 表示在第 $1,\dots,i$ 这 $i$ 个物品中任选一些总重量不超过为 $j$ 的物品价值总和的最大值。
2. 边界条件： $dp[0][j]=0$
3. 状态转移方程：
   1. $j\lt w_i，dp[i][j]=dp[i-1][j]$
   2. $j\ge w_i，dp[i][j]=\max(dp[i-1][j],dp[i-1][j-w_i]+v_i)$
4. 算法时间复杂度均为 $O(nw)$
5. C++代码：

```cpp
gg backpack01() {
    for (gg i = 1; i <= ni; ++i) {
        for (gg j = 0; j <= w; ++j) {
            dp[i][j] = dp[i - 1][j];
            if (j >= wi[i])
                dp[i][j] = max(dp[i][j], dp[i - 1][j - wi[i]] + vi[i]);
        }
    }
    return dp[ni][w];
}
```

### 一维滚动数组

算法时间复杂度均为 $O(nw)$

```cpp
gg backpack01() {
    for (gg i = 1; i <= ni; ++i) {
        for (gg j = w; j >= wi[i]; --j) {
                dp[j] = max(dp[j], dp[j - wi[i]] + vi[i]);
        }
    }
    return dp[w];
}
```

### 当总重量 w 过大时，更换 DP 对象

1. 状态含义：设 $dp[i][j]$ 表示在第 $1,\dots,i$ 这 $i+1$ 个物品中价值总和达到 $j$ 时的最小重量。
2. 注意 dp 数组第二维长度要等于物品价值总和+1
3. 边界条件： $dp[0][0]=0，dp[0][j]=\infty$
4. 状态转移方程：
   1. $j\lt v_i，dp[i][j]=dp[i-1][j]$
   2. $j\ge v_i，dp[i][j]=\min(dp[i-1][j],dp[i-1][j-v_i]+w_i)$
5. 算法时间复杂度均为 $O(n\sum_{i=0}^{n}v_i)$
6. C++代码：

```cpp
gg backpack01() {
    gg v = accumulate(vi + 1, vi + n + 1, 0ll);
    fill(begin(dp[0]), begin(dp[0]) + v + 1, INF);
    dp[0][0] = 0;
    for (gg i = 1; i <= ni; ++i) {
        for (gg j = 0; j <= v; ++j) {
            dp[i][j] = dp[i - 1][j];
            if (j >= vi[i]) {
                dp[i][j] = min(dp[i][j], dp[i - 1][j - vi[i]] + wi[i]);
            }
        }
    }
    for (gg j = v; j >= 0; --j)
        if (dp[ni][j] <= w)
            return j;
}
```

## 完全背包问题

### 问题描述

有 n 种重量和价值分别为 $w_i,v_i$ 的物品。从这些物品中挑选出总重量不超过 $w$ 的物品，求所有挑选方案中价值总和的最大值（物品下标为 1 到 n）。每种物品可以挑选任意多件。

### 从后向前递推

1. 状态含义：设 $dp[i][j]$ 表示在第 $i,i+1,\dots,n$ 物品中任选一些总重量不超过为 $j$ 的物品价值总和的最大值。
2. 边界条件： $dp[n+1][j]=0$
3. 状态转移方程： $dp[i][j]=\max(dp[i+1][j-k\times w_i]+k\times v_i|k\ge 0)$
4. 算法的时间复杂度为 $O(nw^2)$
5. C++代码：

```cpp
gg backpackComplete(){
    for (gg i = ni; i >= 1; --i) {
        for (gg j = 0; j <= w; ++j) {
            for (gg k = 0; k * wi[i] <= j; ++k) {
                dp[i][j] = max(dp[i][j], dp[i + 1][j - k * wi[i]] + k * vi[i]);
            }
        }
    }
    return dp[1][w];
}
```

### 从前向后递推

1. 状态含义：设 $dp[i][j]$ 表示在第 $1,\dots,i$ 这 $i$ 个物品中任选一些总重量不超过为 $j$ 的物品价值总和的最大值。
2. 边界条件： $dp[0][j]=0$
3. 状态转移方程： $dp[i][j]=\max(dp[i-1][j-k\times w_i]+k\times v_i|0\le k)$
4. 算法的时间复杂度为 $O(nw^2)$
5. C++代码：

```cpp
gg backpackComplete() {
    for (gg i = 1; i <= ni; ++i) {
        for (gg j = 0; j <= w; ++j) {
            for (gg k = 0; k * wi[i] <= j; ++k) {
                dp[i][j] = max(dp[i][j], dp[i - 1][j - k * wi[i]] + k * vi[i]);
            }
        }
    }
    return dp[ni][w];
}
```

### 一维滚动数组

算法的时间复杂度为 $O(nw)$ ，与 0-1 背包问题的一维滚动数组差别仅在于 j 循环的方向。

```cpp
gg backpackComplete() {
    for (gg i = 1; i <= ni; ++i) {
        for (gg j = wi[i]; j <= w; ++j) {
            dp[j] = max(dp[j], dp[j - wi[i]] + vi[i]);
        }
    }
    return dp[w];
}
```

## 分组背包问题

### 问题描述

有 n 种重量和价值分别为 $w_i,v_i$ 且组号为 $g_i$ 的物品。同一组的物品互相冲突，不能放在一起。从这些物品中挑选出总重量不超过 $w$ 的物品，求所有挑选方案中价值总和的最大值（物品下标为 1 到 n）。每种物品可以挑选任意多件。

### 思路

这是 0-1 背包问题的变形、因为背包 dp 需要背包空间大小循环完一遍才能表示把一个物体放进去了，而在循环背包空间的过程中枚举物品，就相当于只放一种物品，因此我们可以在循环背包空间的过程外部枚举所有组，在循环背包空间的过程内部枚举同一组的所有物品，然后套用 0-1 背包的模板即可。算法的时间复杂度为 $O(nw)$ 。

```cpp
unordered_map<gg, vector<gg>> groups;  //存储组号和对应组的所有物品索引
gg backpackGroup(){
    for (auto& g : groups) {
        for (gg j = w; j >= 0; --j) {
            for (gg i : g.second) {
                if (j >= wi[i]) {
                    dp[j] = max(dp[j], dp[j - wi[i]] + vi[i]);
                }
            }
        }
    }
}
```

## 树状+背包 DP 问题

### 问题描述

模板题：[P2014 [CTSC1997]选课 - 洛谷](https://www.luogu.com.cn/problem/P2014)

现在有 N 门功课，每门课有个学分，每门课有一门或没有直接先修课。一个学生要从这些课程里选择 M 门课程学习，问他能获得的最大学分是多少？

### 思路

我们以 $dp(root,i,j)$ 表示以 $root$ 号点为根的子树中，已经遍历了 $root$ 号点的前 $i$ 棵子树，选了 $j$ 门课程的最大学分。状态转移的过程结合了树形 DP 和背包 DP 的特点，我们枚举 $root$ 点的每个子结点 $v$ ，同时枚举以 $v$ 为根的子树选了几门课程，将子树的结果合并到 $root$ 上。

记点 $x$ 的儿子个数为 $s_x$ ，以 $x$ 为根的子树大小为 $size_x$ ，很容易写出下面的转移方程：

$$dp(root,i,j)=\mathop{max} \limits_{1<=j<=max(m,size_{root}),0\le k\lt max(size_v+1,j)} dp(root,i-1,j-k)+dp(v,s_v,k)$$

$dp$ 的第二维可以很轻松地用滚动数组的方式省略掉，注意这时需要倒序枚举 $j$ 的值。

时间复杂度为 $O(nm)$ 。注意上面转移方程中的几个限制条件，这些限制条件确保了一些无意义的状态不会被访问到。如果没有这些限制条件，时间复杂度会升高到 $O(nm^2)$ 。

```cpp
vector<gg> tree[MAX];
gg dfs(gg root) {
    gg s = 1;
    for (gg i : tree[root]) {
        gg t = dfs(i);
        s += t;
        for (gg j = min(mi, s); j >= 1; --j) {
            for (gg k = 0; k < min(j, t + 1); ++k) {
                dp[root][j] = max(dp[root][j], dp[i][k] + dp[root][j - k]);
            }
        }
    }
    return s;
}
```

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
