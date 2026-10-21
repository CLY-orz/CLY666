---
title: 计算几何
date: 2026-10-21 20:56:39
description: 距离公式等计算几何基础
layout: post
math: true
---

> 本页收录 **计算几何** 模块的全部模板代码，共 1 个文件 / 0 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `计算几何` 目录。

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

1. `计算几何/距离.md`

---

## 计算几何/距离.md

# 距离

## 欧氏距离

欧氏距离，一般也称作欧几里得距离。在平面直角坐标系中，设点 A,B 的坐标分别为 $A(x_1,y_1),B(x_2,y_2)$ ，则两点间的欧氏距离为：

$$|AB|=\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}$$

$n$ 维空间中，对于 $\vec{A}(x_{11},x_{12},\cdots,x_{1n}), \vec{B}(x_{21},x_{22},\cdots,x_{2n})$ ，欧氏距离的距离公式：

$$|AB|=\sqrt{\sum_{i=1}^n(x_{1i}-x_{2i})^2}$$

## 曼哈顿距离

在平面直角坐标系中，设点 A,B 的坐标分别为 $A(x_1,y_1),B(x_2,y_2)$ ，则两点间的曼哈顿距离为：

$$d(A,B)=|x_1-x_2|+|y_1-y_2|$$

$n$ 维空间中，对于 $\vec{A}(x_{11},x_{12},\cdots,x_{1n}), \vec{B}(x_{21},x_{22},\cdots,x_{2n})$ ，曼哈顿距离的距离公式：

$$d(A,B)=\sum_{i=1}^n |x_{1i}-x_{2i}|$$

## 切比雪夫距离

在平面直角坐标系中，设点 A,B 的坐标分别为 $A(x_1,y_1),B(x_2,y_2)$ ，则两点间的曼哈顿距离为：

$$d(A,B) = \max(|x_1 - x_2|, |y_1 - y_2|)$$

$n$ 维空间中，对于 $\vec{A}(x_{11},x_{12},\cdots,x_{1n}), \vec{B}(x_{21},x_{22},\cdots,x_{2n})$ ，曼哈顿距离的距离公式：

$$d(A,B)=\max(|x_{1i}-x_{2i}|) (i\in [1,n])$$

## 曼哈顿距离与切比雪夫距离的相互转化

在平面直角坐标系中，设点 A,B 的坐标分别为 $A(x_1,y_1),B(x_2,y_2)$ ，将两点间的曼哈顿距离的绝对值拆开，可以得到四个值，

$$
\begin{aligned}
d(A,B)&=|x_1 - x_2| + |y_1 - y_2|\\
&=\max\begin{Bmatrix} x_1 - x_2 + y_1 - y_2, x_1 - x_2 + y_2 - y_1,x_2 - x_1 + y_1 - y_2, x_2 - x_1 + y_2 - y_1\end{Bmatrix}\\
&= \max(|(x_1 + y_1) - (x_2 + y_2)|, |(x_1 - y_1) - (x_2 - y_2)|)
\end{aligned}
$$

这就是 $(x_1 + y_1,x_1 - y_1), (x_2 + y_2,x_2 - y_2)$ 两点之间的切比雪夫距离。

同理， $A,B$ 两点的切比雪夫距离为：

$$
\begin{aligned}
d(A,B)&=\max\begin{Bmatrix} |x_1 - x_2|,|y_1 - y_2|\end{Bmatrix}\\
&=\max\begin{Bmatrix} \left|\dfrac{x_1 + y_1}{2}-\dfrac{x_2 + y_2}{2}\right|+\left|\dfrac{x_1 - y_1}{2}-\dfrac{x_2 - y_2}{2}\right|\end{Bmatrix}
\end{aligned}
$$

而这就是 $(\dfrac{x_1 + y_1}{2},\dfrac{x_1 - y_1}{2}), (\dfrac{x_2 + y_2}{2},\dfrac{x_2 - y_2}{2})$ 两点之间的曼哈顿距离。

### 结论

- 曼哈顿坐标系是通过切比雪夫坐标系旋转 $45^\circ$ 后，再缩小到原来的一半得到的。
- 将一个点 $(x,y)$ 的坐标变为 $(x + y, x - y)$ 后，原坐标系中的曼哈顿距离等于新坐标系中的切比雪夫距离。
- 将一个点 $(x,y)$ 的坐标变为 $(\dfrac{x + y}{2},\dfrac{x - y}{2})$ 后，原坐标系中的切比雪夫距离等于新坐标系中的曼哈顿距离。

碰到求切比雪夫距离或曼哈顿距离的题目时，我们往往可以相互转化来求解。两种距离在不同的题目中有不同的优缺点，应该灵活运用。

## 闵可夫斯基距离

我们定义 $n$ 维空间中两点 $X(x_1, x_2, \dots, x_n), Y(y_1, y_2, \dots, y_n)$ 之间的闵可夫斯基距离为：

$$
D(X, Y) = \left(\sum_{i=1}^n \left\vert x_i - y_i \right\vert ^p\right)^{\frac{1}{p}}.
$$

特别的：

1.  当 $p=1$ 时， $D(X, Y) = \sum_{i=1}^n \left\vert x_i - y_i \right\vert$ 即为曼哈顿距离；
2.  当 $p=2$ 时， $D(X, Y) = \left(\sum_{i=1}^n (x_i - y_i)^2\right)^{1/2}$ 即为欧几里得距离；
3.  当 $p \to \infty$ 时， $D(X, Y) = \lim_{p \to \infty}\left(\sum_{i=1}^n \left\vert x_i - y_i \right\vert ^p\right) ^{1/p} = \max\limits_{i=1}^n \left\vert x_i - y_i \right\vert$ 即为切比雪夫距离。

注意：当 $p \ge 1$ 时，闵可夫斯基距离才是度量，具体证明参见 [Minkowski distance - Wikipedia](https://en.wikipedia.org/wiki/Minkowski_distance)。

## 汉明距离

汉明距离是两个字符串之间的距离，它表示两个长度相同的字符串对应位字符不同的数量。

我们可以简单的认为对两个串进行异或运算，结果为 1 的数量就是两个串的汉明距离。

## 模板题

1. [P5098 [USACO04OPEN] Cave Cows 3 - 洛谷](https://www.luogu.com.cn/problem/P5098)
2. [P3964 [TJOI2013] 松鼠聚会 - 洛谷](https://www.luogu.com.cn/problem/P3964)

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
