---
title: 专题
date: 2026-10-21 20:56:39
description: 位运算、格雷码、区间问题、整数拆分等专题模板
layout: post
math: true
---

> 本页收录 **专题** 模块的全部模板代码，共 5 个文件 / 9 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `专题` 目录。

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

1. `专题/位运算找出数组中唯一的元素.md`
2. `专题/区间问题.md`
3. `专题/格雷码与二进制码.md`
4. `专题/正整数拆分.md`
5. `专题/求[a,b]区间中 0~9 出现的次数.md`

---

## 专题/位运算找出数组中唯一的元素.md

# 找出数组中唯一的元素

## 问题描述

给定一个整数数组，一个元素出现`p`次，其余元素出现`k`次。找到出现`p`次的元素（ $k\gt 1,p\ge 1,p\ mod\ k\not ={0}$ ）。

## 思路

设需要`m`个计数器 $x_m,x_{m-1},\cdots,x_2,x_1$ ，`m`满足 $m\ge \log_2 k$ 。如果 $2^m\gt k$ ，则说明需要一个`mask`变量，`mask`的计算由`k`的二进制位决定，假设`k=0b101`，则`mask=~(x3&~x2&x1)`；假设`k=0b1100`，则`mask=~(x4&x3&~x2&~x1)`。最后的结果由`p`的二进制位决定，假设`p=0b01`，则结果是`x1`；假设`p=0b10`，则结果是`x2`；假设`p=0b110`，则结果是`x3`或者`x2`。

## C++代码

```cpp
gg nums[MAX];
gg findNumber() {
    gg xm = 0, ..., x2 = 0, x1 = 0, mask = 0;
    for (gg i : nums) {
        xm ^= x_{m-1}... & x1 & i;
        ...
        x2 ^= x1 & i;
        x1 ^= i;
        mask = ~(xm & ... & x2 & x1);  //按要求计算mask
        xm &= mask;
        ...
        x2 &= mask;
        x1 &= mask;
    }
    return xi;  //按要求返回一个x变量
}
```

## 专题/区间问题.md

# 区间覆盖问题

这里用`array<gg,2>`类型存储一个区间，区间起点存储在下标为 0 的位置，区间终点存储在下标为 1 的位置。

## 区间完全覆盖问题

### 问题描述

给定一个区间 $[0,m]$ ，再给出 $n$ 条区间 $[a_i,b_i]$ ，求最少使用多少条区间可以将整个区间完全覆盖。

### 贪心策略

1. 将每一个区间按照左端点升序排序，如果左端点相同，按右端点升序排序；
2. 设置一个变量`right`表示已经覆盖的区域的右端点，在左端点小于等于`right`的区间中，每次选择右端点最大且大于`right`的区间。

算法的时间复杂度为 $O(n\log n)$ ，需要先排序。

### C++代码

```cpp
//只覆盖区间内的所有整点
gg inter[MAX][2];
gg rangeFullCoverage(gg m) {
    sort(begin(inter), end(inter));
    gg right = -1, ans = 0, i = 0;
    while (right < m) {
        gg maxr = 0;
        for (; i < inter.size() and inter[i][0] <= right + 1; ++i) {
            maxr = max(maxr, inter[i][1]);
        }
        if (right == maxr) {  //如果给出的区间不能完全覆盖[0,m]，返回-1
            return -1;
        }
        right = maxr;
        ++ans;
    }
    return ans;
}
```

```cpp
//覆盖整个区间
gg inter[MAX][2];
gg rangeFullCoverage(gg m) {
    sort(begin(inter), end(inter));
    gg right = 0, ans = 0, i = 0;
    while (right < m) {
        gg maxr = 0;
        for (; i < inter.size() and inter[i][0] <= right; ++i) {
            maxr = max(maxr, inter[i][1]);
        }
        if (right == maxr) {  //如果给出的区间不能完全覆盖[0,m]，返回-1
            return -1;
        }
        right = maxr;
        ++ans;
    }
    return ans;
}
```

## 最大不相交问题

### 问题描述

给出 $n$ 条区间 $[a_i,b_i]$ ，从中选取尽量多的区间，使得这些区间两两没有公共点。

### 贪心策略

1. 将每一个区间按照右端点升序排序，如果右端点相同，按左端点升序排序；
2. 设置一个变量`right`表示已经覆盖的区域的右端点，如果当前区间左端点小于`right`，就选取该区间；否则用同样的方式尝试选取其它区间。

算法的时间复杂度为 $O(n\log n)$ ，需要先排序。

### C++代码

```cpp
//覆盖整个区间
gg inter[MAX][2];
gg rangeDisjoint() {
    sort(begin(inter), end(inter),
         [](const array<gg, 2>& a, const array<gg, 2>& b) {
             return a[1] != b[1] ? a[1] < b[1] : a[0] < b[0];
         });
    gg ans = 0, right = -1;
    for (gg i = 0; i < inter.size(); ++i) {
        if (right < inter[i][0]) {
            ++ans;
            right = inter[i][1];
        }
    }
    return ans;
}
```

## 区间选点问题

### 问题描述

给出 $n$ 条区间 $[a_i,b_i]$ ，要求选取尽量少的点，使得每个区间内都至少有一个点（不同区间内含的点可以是同一个）。

### 贪心策略

1. 将每一个区间按照左端点升序排序，左端点相同的按右端点升序排序；
2. 从第一个区间右端点开始往后找，如果下一个区间的左端点大于当前已选区间的右端点，说明要新开一个点，计数器加 1，同时更新右区间能覆盖的最远距离；如果下一个区间右端点小于当前已选区间的右端点，说明共享的区间范围缩短了，那么就更新区间右端点为下一个区间右端点，重复以上操作，直至筛选完所有区间。

算法的时间复杂度为 $O(n\log n)$ ，需要先排序。

### C++代码

```cpp
//区间选点
gg inter[MAX][2];
gg rangeSelectPoint() {
    sort(begin(inter), end(inter));
    gg ans = 0, right = -1;
    for (gg i = 0; i < inter.size(); ++i) {
        if (right < inter[i][0]) {
            ++ans;
        }
        right = min(inter[i][1], right);
    }
    return ans;
}
```

## 专题/格雷码与二进制码.md

# 格雷码与二进制码

在一组数的编码中，若任意两个相邻的代码只有一位二进制数不同，则称这种编码为格雷码（Gray Code）。3 位格雷码如下：

| 十进制 | 二进制 | 格雷码 |
| ------ | ------ | ------ |
| 0      | 000    | 000    |
| 1      | 001    | 001    |
| 2      | 010    | 011    |
| 3      | 011    | 010    |
| 4      | 100    | 110    |
| 5      | 101    | 111    |
| 6      | 110    | 101    |
| 7      | 111    | 100    |

设 $G$ 、 $B$ 为对应的格雷码与二进制码表示，从低位向高位由 0 开始编号，就像下面这样：
| | 2 | 1 | 0 |
| --- | --- | --- | --- |
| $G$ | 0 | 1 | 1 |
| $B$ | 0 | 1 | 0 |

## 递归生成格雷码

1. 1 位格雷码为 0；
2. $n+1$ 位格雷码的集合 = $n$ 位格雷码集合（顺序）加前缀 0 + $n$ 位格雷码集合（逆序）加前缀 1。

## n 位二进制码转 n 位格雷码

### 公式

$$G=(B>\gt 1)\ xor\ B$$
$$G_{n-1}=B_{n-1},G_i=B_i\oplus B_{i+1}(0\le i\lt n-1)$$

### C++代码

```cpp
gg getGrayFromBinary(gg n) { return n >> 1 ^ n; }
```

## n 位格雷码转 n 位二进制码

### 公式

$$B=(G>>0)\oplus (G>>1) \oplus \cdots \oplus (G>\gt n)$$
$$B_{n-1}=G_{n-1},B_i=G_i ㊀ B_{i+1}(0\le i\lt n-1)$$

### C++代码

```cpp
gg getBinaryFromGray(gg n) {
    gg ans = 0;
    while (n != 0) {
        ans ^= n;
        n /= 2;
    }
    return ans;
}
```

## 专题/正整数拆分.md

# 正整数拆分

## 问题描述

模板题：[343. 整数拆分 - 力扣](https://leetcode.cn/problems/integer-break/description/)

给定一个正整数 n，将其拆分为至少多个正整数的和，并使这些整数的乘积最大化，返回你可以获得的最大乘积。

## C++ 代码

算法的时间复杂度为 $O(1)$

```cpp
//如果最少分解成2个正整数
gg integerBreak2(gg n, gg mod) {
    if (n <= 3) {
        return n - 1;
    }
    gg a = n / 3, b = n % 3;
    if (b == 0) {
        return powMod(3, a, mod);
    } else if (b == 1) {
        return (powMod(3, a - 1, mod) * 4) % mod;
    } else {
        return (powMod(3, a, mod) * 2) % mod;
    }
}
//如果最少可以分解成1个正整数
gg integerBreak1(gg n, gg mod) {
    if (n == 1) {
        return 1;
    }
    gg a = n / 3, b = n % 3;
    if (b == 0) {
        return powMod(3, a, mod);
    } else if (b == 1) {
        return (powMod(3, a - 1, mod) * 4) % mod;
    } else {
        return (powMod(3, a, mod) * 2) % mod;
    }
}
```

## 专题/求[a,b]区间中 0~9 出现的次数.md

# 求[a,b]区间中 0~9 出现的次数

## 问题描述

模板题：[P2602 [ZJOI2010] 数字计数 - 洛谷](https://www.luogu.com.cn/problem/P2602)

给定两个正整数 a 和 b，求在 $[a,b]$ 中的所有整数中，0~9 每个数码各出现了多少次。

## 思路

先计算 $[1,n]$ 区间中 0~9 每个数码出现的次数 $C_n$ ，借鉴前缀和的思想，利用 $C_b-C_{a-1}$ 求出 $[a,b]$ 中 0~9 每个数码出现的总次数。

算法的时间复杂度为 $O(10m)$ ，其中 $m$ 为 $n$ 的位数。

## C++ 代码

```cpp
//计算[1,n]区间内0~9各个数字出现的次数
vector<gg> countDigitsUpTo(gg n) {
    vector<gg> ans(10);
    if (n <= 0) {
        return ans;
    }
    gg left = n / 10, cur = n % 10, right = 0, p = 1;
    while (left > 0 || cur > 0) {
        for (gg digit = 0; digit < 10; ++digit) {
            ans[digit] += (left - 1) * p;
            if (cur > digit) {
                ans[digit] += p;
            } else if (cur == digit) {
                ans[digit] += (p == 1) ? 1 : (right + 1);
            }
            if (digit > 0) {
                ans[digit] += p;
            }
        }
        right += cur * p;
        cur = left % 10;
        left /= 10;
        p *= 10;
    }
    return ans;
}
vector<gg> countDigitsInRange(gg a, gg b) {
    if (a < b) {
        swap(a, b);
    }
    auto ans1 = countDigitsUpTo(a), ans2 = countDigitsUpTo(b - 1);
    for (gg i = 0; i < ans1.size(); i++) {
        ans1[i] -= ans2[i];
    }
    return ans1;
}
```

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
