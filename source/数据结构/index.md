---
title: 数据结构
date: 2026-10-21 20:56:39
description: 并查集、堆、平衡树、ST 表、树状数组、线段树等数据结构模板
layout: post
math: true
---

> 本页收录 **数据结构** 模块的全部模板代码，共 6 个文件 / 14 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `数据结构` 目录。

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

1. `数据结构/平衡树/AVL树.cpp`
2. `数据结构/并查集.md`
3. `数据结构/区间信息维护/ST表.md`
4. `数据结构/区间信息维护/树状数组.md`
5. `数据结构/区间信息维护/线段树.md`
6. `数据结构/堆/配对堆.md`

---

## 数据结构/平衡树/AVL树.cpp

> 与根结点数据域相等时，一律插入到右子树

```cpp
//与根结点数据域相等时，一律插入到右子树
struct AVLTreeNode {
    gg data, height, num;  //关键字、高度
    AVLTreeNode *left, *right;
    AVLTreeNode(gg v, AVLTreeNode* l = nullptr, AVLTreeNode* r = nullptr,
                gg h = 0) :
        data(v),
        height(h), left(l), right(r) {}
};
gg getHeight(AVLTreeNode* r) { return r ? r->height : 0; }
AVLTreeNode* findAVL(AVLTreeNode* root, gg data) {
    if (not root or root->data == data) {
        return root;
    } else if (data < root->data) {
        return findAVL(root->left, data);
    } else {
        return findAVL(root->right, data);
    }
}
// LL：左左对应的情况(左单旋转),返回旋转后的根节点
AVLTreeNode* leftLeftRotation(AVLTreeNode* k2) {
    AVLTreeNode* k1 = k2->left;
    k2->left = k1->right;
    k1->right = k2;
    k2->height = max(getHeight(k2->left), getHeight(k2->right)) + 1;
    k1->height = max(getHeight(k1->left), k2->height) + 1;
    return k1;
}
// RR：右右对应的情况(右单旋转),返回旋转后的根节点
AVLTreeNode* rightRightRotation(AVLTreeNode* k1) {
    AVLTreeNode* k2 = k1->right;
    k1->right = k2->left;
    k2->left = k1;
    k1->height = max(getHeight(k1->left), getHeight(k1->right)) + 1;
    k2->height = max(getHeight(k2->right), k1->height) + 1;
    return k2;
}
// LR：左右对应的情况(左双旋转),返回旋转后的根节点
AVLTreeNode* leftRightRotation(AVLTreeNode* k3) {
    k3->left = rightRightRotation(k3->left);
    return leftLeftRotation(k3);
}
// RL：右左对应的情况(右双旋转),返回旋转后的根节点
AVLTreeNode* rightLeftRotation(AVLTreeNode* k1) {
    k1->right = leftLeftRotation(k1->right);
    return rightRightRotation(k1);
}
//将结点插入到AVL树中，并返回根节点
AVLTreeNode* insertNode(AVLTreeNode*& root, gg data) {
    if (not root) {
        root = new AVLTreeNode(data);
    } else if (data < root->data) {
        root->left = insertNode(root->left, data);
        // 插入节点后，若AVL树失去平衡，则进行相应的调节。
        if (getHeight(root->left) - getHeight(root->right) == 2) {
            if (data < root->left->data) {
                root = leftLeftRotation(root);
            } else {
                root = leftRightRotation(root);
            }
        }
    } else {  // 应该将data插入到"root的右子树"的情况
        root->right = insertNode(root->right, data);
        // 插入节点后，若AVL树失去平衡，则进行相应的调节。
        if (getHeight(root->right) - getHeight(root->left) == 2) {
            if (data > root->right->data) {
                root = rightRightRotation(root);
            } else {
                root = rightLeftRotation(root);
            }
        }
    }
    root->height = max(getHeight(root->left), getHeight(root->right)) + 1;
    return root;
}
//查找最大结点：返回root为根结点的AVL树的最大结点。
AVLTreeNode* maximum(AVLTreeNode* root) {
    while (root and root->right) {
        root = root->right;
    }
    return root;
}
//查找最小结点：返回tree为根结点的AVL树的最小结点。
AVLTreeNode* minimum(AVLTreeNode* root) {
    while (root and root->left)
        root = root->left;
    return root;
}
//删除结点(z)，返回根节点
AVLTreeNode* remove(AVLTreeNode*& root, AVLTreeNode* z) {
    // 根为空或者没有要删除的节点，直接返回nullptr。
    if (not root or not z) {
        return nullptr;
    }
    if (z->data < root->data) {  // 待删除的节点在"root的左子树"中
        root->left = remove(root->left, z);
        // 删除节点后，若AVL树失去平衡，则进行相应的调节。
        if (getHeight(root->right) - getHeight(root->left) == 2) {
            AVLTreeNode* r = root->right;
            if (getHeight(r->left) > getHeight(r->right)) {
                root = rightLeftRotation(root);
            } else {
                root = rightRightRotation(root);
            }
        }
    } else if (z->data > root->data) {  // 待删除的节点在"root的右子树"中
        root->right = remove(root->right, z);
        // 删除节点后，若AVL树失去平衡，则进行相应的调节。
        if (getHeight(root->left) - getHeight(root->right) == 2) {
            AVLTreeNode* l = root->left;
            if (getHeight(l->right) > getHeight(l->right)) {
                root = leftRightRotation(root);
            } else {
                root = leftLeftRotation(root);
            }
        }
    } else {  // root是对应要删除的节点。
        if (root->left and root->right) {
            if (getHeight(root->left) > getHeight(root->right)) {
                // 如果root的左子树比右子树高；
                // 则(01)找出root的左子树中的最大节点
                //   (02)将该最大节点的值赋值给root。
                //   (03)删除该最大节点。
                // 这类似于用"root的左子树中最大节点"做"root"的替身；
                // 采用这种方式的好处是：删除"root的左子树中最大节点"之后，AVL树仍然是平衡的。
                AVLTreeNode* Max = maximum(root->left);
                root->data = Max->data;
                root->left = remove(root->left, Max);
            } else {
                // 如果root的左子树不比右子树高(即它们相等，或右子树比左子树高1)
                // 则(01)找出root的右子树中的最小节点
                //   (02)将该最小节点的值赋值给root。
                //   (03)删除该最小节点。
                // 这类似于用"root的右子树中最小节点"做"root"的替身；
                // 采用这种方式的好处是：删除"root的右子树中最小节点"之后，AVL树仍然是平衡的。
                AVLTreeNode* Min = minimum(root->right);
                root->data = Min->data;
                root->right = remove(root->right, Min);
            }
        } else {
            AVLTreeNode* tmp = root;
            root = root->left ? root->left : root->right;
            delete tmp;
        }
    }
    return root;
}
void remove(AVLTreeNode*& root, gg data) {
    AVLTreeNode* z;
    if ((z = findAVL(root, data))) {
        root = remove(root, z);
    }
}
```

## 数据结构/并查集.md

```cpp
class UFS {
  public:
    //初始化并查集
    UFS(gg n) : ufs(n + 5) { iota(begin(ufs), end(ufs), 0); }
    //查找结点所在树的根结点并进行路径压缩
    gg findRoot(gg x) { return ufs[x] == x ? x : ufs[x] = findRoot(ufs[x]); }
    //合并两个结点所在集合，如果已在同一集合，返回false
    bool unionSets(gg a, gg b) {
        a = findRoot(a), b = findRoot(b);
        if (a == b) {
            return false;
        }
        ufs[a] = b;
        return true;
    }

  private:
    vector<gg> ufs;
};
```

## 数据结构/区间信息维护/ST表.md

# ST 表

## 概述

ST 表全称为`Sparse-Table`，是用于解决`可重复贡献问题`的数据结构。`可重复贡献问题`是指对于运算 $opt$ ，满足 $x\ opt\ x=x$ ，则对应的区间询问就是一个可重复贡献问题。例如，最大值有 $max(x,x)=x$ ，gcd 有 $gcd(x,x)=x$ ，所以 RMQ（RMQ 是英文 `Range Maximum/Minimum Query`的缩写，表示区间最大/最小值。） 和区间 GCD 就是一个`可重复贡献问题`。像区间和就不具有这个性质，如果求区间和的时候采用的预处理区间重叠了，则会导致重叠部分被计算两次。另外， $opt$ 还必须满足结合律才能使用 ST 表求解。

## 模板题

题目大意：给定 n 个数，有 m 个询问，对于每个询问，你需要回答区间 $[l,r]$ 中的最大值。

## 分析

ST 表基于 `倍增` 思想，可以做到 $\Theta (n\log n)$ 预处理， $O(1)$ 回答每个询问。但是不支持修改操作。注意，查询的下标需从 1 开始。

1. 预处理：令 $f(i,j)$ 表示区间 $[i,i+2^j-1]$ 的最大值，则 $f(i,0)=a_i$ 。根据定义式，第二维就相当于倍增的时候“跳了 $2^j-1$ 步”，依据倍增的思路，写出状态转移方程： $f(i,j)=max(f(i,j-1),f(i+2^{j-1},j-1))$ 。
2. 查询：假设每个查询 $[l,r]$ ，则 $f(l,r)=max(f(l,s),f(r-2^s+1,s))$ ，其中 $s=\lfloor \log_2 (r-l+1) \rfloor$ 。

## C++代码

```cpp
template <typename T>
struct Union_Op {
    //将下面的函数替换成你需要的逻辑（这里假设取最大值），默认将这个类传递给ST类作Union_Operation类型参数
    T operator()(const T& a, const T& b) const { return max(a, b); }
};
template <typename T, typename Union_Operation = Union_Op<T>, gg n2 = 20>
class ST {
  public:
    ST(gg len, T* A, const T& default_value) :
        n(len), st(len + 5, vector<T>(n2, default_value)), union_op(Union_Operation()) {
        STinit(A);
    }
    //求[l,r]区间执行union_op后的值
    gg STquery(gg l, gg r) {
        gg s = log2(r - l + 1);
        return union_op(st[l][s], st[r - (1 << s) + 1][s]);
    }

  private:
    gg n;  //记录输入序列的长度
    vector<vector<T>> st;
    Union_Operation union_op;
    void STinit(T* A) {
        for (gg i = 1; i <= n; ++i) {
            st[i][0] = A[i];
        }
        for (gg j = 1; j <= n2; ++j) {
            for (gg i = 1; i + (1 << j) - 1 <= n; ++i) {
                st[i][j] = union_op(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
            }
        }
    }
};
```

## 数据结构/区间信息维护/树状数组.md

# 树状数组

## 概述

树状数组又称二叉索引树，简称 BIT，是算法竞赛中常用的用来维护区间信息的数据结构。树状数组中，下标均从 1 开始。getSum 和 update 操作时间复杂度均为 $O(\log n)$ 。

## lowbit

在计算机中，一个补码表示的整数 x 变成其相反数-x 的过程相当于把 x 的二进制的每一位都取反， 然后末位加 1，而这等价于**直接把 x 的二进制最右边的 1 左边的每一位都取反**。因此`lowbits(x)=x&(-x)`表示就是把 x 的二进制最右边的 1 左边的每一位都置为 0 得到的结果，它的值是能整除 x 的最大 2 的幂次数。

## 一维树状数组

### 单点修改，区间查询

```cpp
class BIT {
  public:
    BIT(gg len) : c(len + 5) {}
    //实现将A[x] + v的功能
    void update(gg x, gg v) {
        for (gg i = x; i < c.size(); i += lowbit(i)) {
            c[i] += v;
        }
    }
    //求A[1]~A[x]之和
    gg getSum(gg x) {
        gg sum = 0;
        for (gg i = x; i > 0; i -= lowbit(i)) {
            sum += c[i];
        }
        return sum;
    }

  private:
    vector<gg> c;
    inline gg lowbit(gg x) { return x & (-x); };
};
```

### 区间修改，单点查询

update 和 getSum 函数与`单点修改，区间查询`完全一致，但是需要使用差分建树和查询，下面的代码在`单点修改，区间查询`的基础上进行了进一步的封装。

```cpp
class BIT {
  public:
    BIT(gg len) : c(len + 5) {}
    //利用差分建树
    BIT(vector<gg>& v) : c(v.size() + 5) {
        for (gg i = 1; i < v.size(); ++i) {
            update(i, v[i] - v[i - 1]);
        }
    }
    //将区间[l,r]都加上v
    void realUpdate(gg l, gg r, gg v) {
        update(l, v);
        update(r + 1, -v);
    }
    //求A[x]
    gg getSum(gg x) {
        gg sum = 0;
        for (gg i = x; i > 0; i -= lowbit(i)) {
            sum += c[i];
        }
        return sum;
    }

  private:
    vector<gg> c;
    inline gg lowbit(gg x) { return x & (-x); };
    void update(gg x, gg v) {
        for (gg i = x; i < c.size(); i += lowbit(i)) {
            c[i] += v;
        }
    }
};
```

### 区间修改，区间查询

```cpp
class BIT {
  public:
    BIT(gg len) : sum1(len + 5), sum2(len + 5) {}
    //利用差分建树(如果序列有初始值)
    BIT(vector<gg>& v) : sum1(v.size() + 5), sum2(v.size() + 5) {
        for (gg i = 1; i < v.size(); ++i) {
            update(i, v[i] - v[i - 1]);
        }
    }
    //将区间[l,r]都加上v
    void realUpdate(gg l, gg r, gg v) {
        update(l, v);
        update(r + 1, -v);
    }
    //求区间[l,r]的和
    gg getRealSum(gg l, gg r) { return getSum(r) - getSum(l - 1); }

  private:
    vector<gg> sum1, sum2;
    inline gg lowbit(gg x) { return x & (-x); };
    void update(gg x, gg v) {
        for (gg i = x; i < sum1.size(); i += lowbit(i)) {
            sum1[i] += v;
            sum2[i] += v * (x - 1);
        }
    }
    //求前缀和
    gg getSum(gg x) {
        gg ans = 0;
        for (gg i = x; i > 0; i -= lowbit(i)) {
            ans += x * sum1[i] - sum2[i];
        }
        return ans;
    }
};
```

## 二维树状数组

### 单点修改，区间查询

```cpp
class BIT {
  public:
    BIT(gg len1, gg len2) : sum(len1 + 5, vector<gg>(len2 + 5)) {}
    //将A[x][y]的值增加v
    void update(gg x, gg y, gg v) {
        for (gg i = x; i < sum.size(); i += lowbit(i)) {
            for (gg j = y; j < sum[i].size(); j += lowbit(j)) {
                sum[i][j] += v;
            }
        }
    }
    // 求左上角为(a,b)，右下角为(c,d)的矩阵的和
    gg getRealSum(gg a, gg b, gg c, gg d) {
        return getSum(c, d) - getSum(c, b - 1) - getSum(a - 1, d) +
               getSum(a - 1, b - 1);
    }

  private:
    vector<vector<gg>> sum;
    inline gg lowbit(gg x) { return x & (-x); };
    // 求维护左上角为(1,1)，右下角为(x,y)的矩阵的和
    gg getSum(gg x, gg y) {
        gg ans = 0;
        for (gg i = x; i > 0; i -= lowbit(i)) {
            for (gg j = y; j > 0; j -= lowbit(j)) {
                ans += sum[i][j];
            }
        }
        return ans;
    }
};
```

### 区间修改，单点查询

```cpp
class BIT {
  public:
    BIT(gg len1, gg len2) : sum(len1 + 5, vector<gg>(len2 + 5)) {}
    //利用差分建树(如果序列有初始值)
    BIT(vector<vector<gg>>& v) : sum(v.size() + 5, vector<gg>(v[0].size() + 5)) {
        for (gg i = 1; i < v.size(); ++i) {
            for (gg j = 1; j < v[0].size(); ++j) {
                update(i, j,
                       v[i][j] - v[i][j - 1] - v[i - 1][j] + v[i - 1][j - 1]);
            }
        }
    }
    //将左上角为(a,b)，右下角为(c,d)的矩阵的值都加上v
    void realUpdate(gg a, gg b, gg c, gg d, gg v) {
        update(a, b, v);
        update(a, d + 1, -v);
        update(c + 1, b, -v);
        update(c + 1, d + 1, v);
    }
    // 求A[x][y]
    gg getSum(gg x, gg y) {
        gg ans = 0;
        for (gg i = x; i > 0; i -= lowbit(i)) {
            for (gg j = y; j > 0; j -= lowbit(j)) {
                ans += sum[i][j];
            }
        }
        return ans;
    }

  private:
    vector<vector<gg>> sum;
    inline gg lowbit(gg x) { return x & (-x); };
    void update(gg x, gg y, gg v) {
        for (gg i = x; i < sum.size(); i += lowbit(i)) {
            for (gg j = y; j < sum[0].size(); j += lowbit(j)) {
                sum[i][j] += v;
            }
        }
    }
};
```

### 区间修改，区间查询

```cpp
class BIT {
  public:
    BIT(gg len1, gg len2) :
        sum1(len1 + 5, vector<gg>(len2 + 5)), sum2(len1 + 5, vector<gg>(len2 + 5)),
        sum3(len1 + 5, vector<gg>(len2 + 5)), sum4(len1 + 5, vector<gg>(len2 + 5)) {}
    //左上角为(a,b)右下角为(c,d)的矩阵全部加上x
    void realUpdate(gg a, gg b, gg c, gg d, gg x) {
        update(a, b, x);
        update(a, d + 1, -x);
        update(c + 1, b, -x);
        update(c + 1, d + 1, x);
    }
    //查询左上角为(a,b)右下角为(c,d)的矩阵和
    gg getRealSum(gg a, gg b, gg c, gg d) {
        return getSum(c, d) - getSum(a - 1, d) - getSum(c, b - 1) +
               getSum(a - 1, b - 1);
    }
  private:
    vector<vector<gg>> sum1, sum2, sum3, sum4;
    inline gg lowbit(gg x) { return x & (-x); };
    void update(gg x, gg y, gg val) {
        for (gg i = x; i < sum1.size(); i += lowbit(i)) {
            for (gg j = y; j < sum1[0].size(); j += lowbit(j)) {
                sum1[i][j] += val;
                sum2[i][j] += val * x;
                sum3[i][j] += val * y;
                sum4[i][j] += val * x * y;
            }
        }
    }
    //查询左上角为(1,1)右下角为(x,y)的矩阵和
    gg getSum(gg x, gg y) {
        gg ret = 0;
        for (gg i = x; i > 0; i -= lowbit(i)) {
            for (gg j = y; j > 0; j -= lowbit(j)) {
                ret += (x + 1) * (y + 1) * sum1[i][j];
                ret -= (y + 1) * sum2[i][j] + (x + 1) * sum3[i][j];
                ret += sum4[i][j];
            }
        }
        return ret;
    }
};
```

## 数据结构/区间信息维护/线段树.md

# 线段树

线段树是算法竞赛中常用的用来维护区间信息的数据结构。线段树可以在 $O(\log n)$ 的时间复杂度内实现单点修改、区间修改、区间查询（区间求和，求区间最大值，求区间最小值）等操作。线段树维护的信息，需要满足可加性，即能以可以接受的速度合并信息和修改信息，包括在使用懒惰标记时，标记也要满足可加性（例如取模就不满足可加性，两个取模操作就不能合并在一起做）。注意，线段树和输入序列下标均需从 1 开始。

## 单点修改，区间查询

```cpp
template <typename T>
struct Update_Op {
    //将下面的函数替换成你需要的逻辑（这里假设取和），默认将这个类传递给SegmentTree类作Update_Operation类型参数
    T operator()(const T& a, const T& b) const { return a + b; }
};
template <typename T>
struct Union_Op {
    //将下面的函数替换成你需要的逻辑（这里假设取和），默认将这个类传递给SegmentTree类作Union_Operation类型参数
    T operator()(const T& a, const T& b) const { return a + b; }
};
template <typename T, typename Update_Operation = Update_Op<T>, typename Union_Operation = Union_Op<T>>
class SegmentTree {
  public:
    struct TreeNode {
        T val;
        TreeNode *left, *right;
        TreeNode(const T& _val, TreeNode* _left = nullptr, TreeNode* _right = nullptr) :
            val(_val), left(_left), right(_right) {}
    };
    // A表示原始的输入序列，如果没有这样的原始序列，用default_value对线段树中的值进行初始化
    SegmentTree(gg len, const T& _default_value, T* A = nullptr) :
        n(len), default_value(_default_value), update_op(Update_Operation()), union_op(Union_Operation()) {
        root = init(1, n, A);
    }
    // update_op(A[p],v)
    void realUpdate(gg p, const T& v) { update(root, 1, n, p, v); }
    //查询A的[left,right]区间执行union_op后的值
    T realGetResult(gg left, gg right) { return getResult(root, 1, n, left, right); }

  private:
    TreeNode* root;  //根结点
    gg n;  //记录输入序列的长度
    T default_value;
    Update_Operation update_op;
    Union_Operation union_op;
    TreeNode* init(gg left, gg right, T* A) {
        if (left == right) {
            return A ? new TreeNode(A[left]) : new TreeNode(default_value);
        }
        TreeNode* root = new TreeNode(default_value);
        gg mid = (left + right) / 2;
        root->left = init(left, mid, A);
        root->right = init(mid + 1, right, A);
        root->val = union_op(root->left->val, root->right->val);
        return root;
    }
    // update_op(A[p],v)，[l,r]表示当前root结点包含的区间
    void update(TreeNode* root, gg l, gg r, gg p, const T& v) {
        if (l == r) {
            root->val = update_op(root->val, v);
            return;
        }
        gg m = (l + r) / 2;
        if (p <= m) {
            update(root->left, l, m, p, v);
        } else {
            update(root->right, m + 1, r, p, v);
        }
        root->val = union_op(root->left->val, root->right->val);
    }
    //查询A的[left,right]区间执行union_op后的值，[l,r]表示当前root结点包含的区间
    T getResult(TreeNode* root, gg l, gg r, gg left, gg right) {
        if (left <= l and r <= right) {
            return root->val;
        }
        gg m = (l + r) / 2;
        T ans;
        bool flag = false;  //标记ans是否被赋过值
        if (left <= m) {
            ans = getResult(root->left, l, m, left, min(m, right));
            flag = true;
        }
        if (right > m) {
            auto res = getResult(root->right, m + 1, r, max(left, m + 1), right);
            if (flag) {
                ans = union_op(ans, res);
            } else {
                ans = res;
            }
        }
        return ans;
    }
};
```

## 区间修改（只有加法），区间查询

```cpp
template <typename T>
struct Update_Op {
    //将下面的函数替换成你需要的逻辑（这里假设取和），默认将这个类传递给SegmentTree类作Update_Operation类型参数
    T operator()(const T& a, const T& b) const { return a + b; }
};
template <typename T>
struct Union_Op {
    //将下面的函数替换成你需要的逻辑（这里假设取和），默认将这个类传递给SegmentTree类作Union_Operation类型参数
    T operator()(const T& a, const T& b) const { return a + b; }
};
template <typename T>
struct Lazy_Op {
    //将下面的函数替换成你需要的逻辑（这里假设取积），默认将这个类传递给SegmentTree类作Lazy_Operation类型参数
    T operator()(const T& a, const T& b) const { return a * b; }
};
struct Lazy_Union_Op {
    //将下面的函数替换成你需要的逻辑（这里假设取和），默认将这个类传递给SegmentTree类作Lazy_Union_Operation类型参数
    T operator()(const T& a, const T& b) const { return a + b; }
};
template <typename T, typename Update_Operation = Update_Op<T>, typename Union_Operation = Union_Op<T>,
          typename Lazy_Operation = Lazy_Op<T>, typename Lazy_Union_Operation = Lazy_Union_Op<T>>
class SegmentTree {
  public:
    struct TreeNode {
        T val, lazy;
        TreeNode *left, *right;
        TreeNode(const T& _val, const T& _lazy, TreeNode* _left = nullptr, TreeNode* _right = nullptr) :
            val(_val), lazy(_lazy), left(_left), right(_right) {}
    };
    // A表示原始的输入序列，如果没有这样的原始序列，用default_value对线段树中的值进行初始化
    SegmentTree(gg len, const T& _sequence_default_value, const T& _lazy_default_value, T* A = nullptr) :
        n(len), sequence_default_value(_sequence_default_value), lazy_default_value(_lazy_default_value),
        update_op(Update_Operation()), union_op(Union_Operation()), lazy_op(Lazy_Operation()),
        lazy_union_op(Lazy_Union_Operation()) {
        root = init(1, n, A);
    }
    //将A的[left,right]区间的值都进行update_op操作
    void realUpdate(gg left, gg right, gg v) { update(root, 1, n, left, right, v); }
    //查询A的[left,right]区间执行union_op后的值
    T realGetResult(gg left, gg right) { return getResult(root, 1, n, left, right); }

  private:
    TreeNode* root;  //根结点
    gg n;  //记录输入序列的长度
    T sequence_default_value, lazy_default_value;
    Update_Operation update_op;
    Union_Operation union_op;
    Lazy_Operation lazy_op;
    Lazy_Union_Operation lazy_union_op;
    TreeNode* init(gg left, gg right, T* A) {
        if (left == right) {
            return A ? new TreeNode(A[left], lazy_default_value) :
                       new TreeNode(sequence_default_value, lazy_default_value);
        }
        TreeNode* root = new TreeNode(sequence_default_value, lazy_default_value);
        gg mid = (left + right) / 2;
        root->left = init(left, mid, A);
        root->right = init(mid + 1, right, A);
        root->val = union_op(root->left->val, root->right->val);
        return root;
    }
    //下传懒惰标记
    void pushdown(TreeNode* root, gg l, gg r) {
        gg m = (l + r) / 2;
        if (root->lazy != lazy_default_value and l != r) {
            root->left->val = update_op(root->left->val, lazy_op(m - l + 1, root->lazy));
            root->left->lazy = lazy_union_op(root->left->lazy, root->lazy);
            root->right->val = update_op(root->right->val, lazy_op(r - m, root->lazy));
            root->right->lazy = lazy_union_op(root->right->lazy, root->lazy);
            root->lazy = lazy_default_value;
        }
    }
    // 将A的[left,right]区间的值都进行update_op操作，[l,r]表示当前root结点包含的区间
    void update(TreeNode* root, gg l, gg r, gg left, gg right, const T& v) {
        if (left <= l and r <= right) {
            root->val = update_op(root->val, lazy_op(r - l + 1, v));
            root->lazy = lazy_union_op(root->lazy, v);
            return;
        }
        pushdown(root, l, r);
        gg m = (l + r) / 2;
        if (left <= m) {
            update(root->left, l, m, left, min(m, right), v);
        }
        if (right > m) {
            update(root->right, m + 1, r, max(left, m + 1), right, v);
        }
        root->val = union_op(root->left->val, root->right->val);
    }
    //查询A的[left,right]区间执行union_op后的值，[l,r]表示当前root结点包含的区间
    T getResult(TreeNode* root, gg l, gg r, gg left, gg right) {
        if (left <= l and r <= right) {
            return root->val;
        }
        pushdown(root, l, r);
        gg m = (l + r) / 2;
        T ans;
        bool flag = false;  //标记ans是否被赋过值
        if (left <= m) {
            ans = getResult(root->left, l, m, left, min(m, right));
            flag = true;
        }
        if (right > m) {
            auto res = getResult(root->right, m + 1, r, max(left, m + 1), right);
            if (flag) {
                ans = union_op(ans, res);
            } else {
                ans = res;
            }
        }
        return ans;
    }
};
```

## 区间修改（加法和乘法），区间查询

```cpp
template <typename T>
struct MulAdd {
    T operator()(const T& a, const T& b, const T& c) const { return (a * b % mod + c) % mod; }
};
template <typename T>
struct Mul {
    T operator()(const T& a, const T& b) const { return a * b % mod; }
};
template <typename T>
struct Add {
    T operator()(const T& a, const T& b) const { return (a + b) % mod; }
};
template <typename T, typename Update_Operation = MulAdd<T>, typename Union_Operation = Add<T>,
          typename Lazy_Add = Mul<T>, typename Lazy_Union_Add = MulAdd<T>, typename Lazy_Union_Mul = Mul<T>>
class SegmentTree {
  public:
    struct TreeNode {
        T val, lazy_add, lazy_mul;
        TreeNode *left, *right;
        TreeNode(const T& _val, const T& _lazy_mul, const T& _lazy_add, TreeNode* _left = nullptr,
                 TreeNode* _right = nullptr) :
            val(_val),
            lazy_add(_lazy_add), lazy_mul(_lazy_mul), left(_left), right(_right) {}
    };
    // A表示原始的输入序列，如果没有这样的原始序列，用default_value对线段树中的值进行初始化
    SegmentTree(gg len, const T& _sequence_default_value, const T& _lazy_mul_value, const T& _lazy_add_value,
                T* A = nullptr) :
        n(len),
        sequence_default_value(_sequence_default_value), lazy_add_value(_lazy_add_value),
        lazy_mul_value(_lazy_mul_value), update_op(Update_Operation()), union_op(Union_Operation()),
        lazy_add(Lazy_Add()), lazy_union_add(Lazy_Union_Add()), lazy_union_mul(Lazy_Union_Mul()) {
        root = init(1, n, A);
    }
    //将A的[left,right]区间的值都加上v
    void realAdd(gg left, gg right, const T& v) { update(root, 1, n, left, right, lazy_mul_value, v); }
    //将A的[left,right]区间的值都乘上v
    void realMul(gg left, gg right, const T& v) { update(root, 1, n, left, right, v, lazy_add_value); }
    //查询A的[left,right]区间执行union_op后的值
    T realGetResult(gg left, gg right) { return getResult(root, 1, n, left, right); }

  private:
    TreeNode* root;  //根结点
    gg n;  //记录输入序列的长度
    T sequence_default_value, lazy_add_value, lazy_mul_value;
    Update_Operation update_op;
    Union_Operation union_op;
    Lazy_Add lazy_add;
    Lazy_Union_Add lazy_union_add;
    Lazy_Union_Mul lazy_union_mul;
    TreeNode* init(gg left, gg right, T* A) {
        if (left == right) {
            return A ? new TreeNode(A[left], lazy_mul_value, lazy_add_value) :
                       new TreeNode(sequence_default_value, lazy_mul_value, lazy_add_value);
        }
        TreeNode* root = new TreeNode(sequence_default_value, lazy_mul_value, lazy_add_value);
        gg mid = (left + right) / 2;
        root->left = init(left, mid, A);
        root->right = init(mid + 1, right, A);
        root->val = union_op(root->left->val, root->right->val);
        return root;
    }
    //下传懒惰标记
    void pushdown(TreeNode* root, gg l, gg r) {
        gg m = (l + r) / 2;
        if ((root->lazy_add != lazy_add_value or root->lazy_mul != lazy_mul_value) and l != r) {
            root->left->val = update_op(root->left->val, root->lazy_mul, lazy_add(m - l + 1, root->lazy_add));
            root->left->lazy_add = lazy_union_add(root->left->lazy_add, root->lazy_mul, root->lazy_add);
            root->left->lazy_mul = lazy_union_mul(root->left->lazy_mul, root->lazy_mul);
            root->right->val = update_op(root->right->val, root->lazy_mul, lazy_add(r - m, root->lazy_add));
            root->right->lazy_add = lazy_union_add(root->right->lazy_add, root->lazy_mul, root->lazy_add);
            root->right->lazy_mul = lazy_union_mul(root->right->lazy_mul, root->lazy_mul);
            root->lazy_add = lazy_add_value;
            root->lazy_mul = lazy_mul_value;
        }
    }
    // 将A的[left,right]区间的值都进行update_op操作，[l,r]表示当前root结点包含的区间
    void update(TreeNode* root, gg l, gg r, gg left, gg right, const T& mul, const T& add) {
        if (left <= l and r <= right) {
            root->val = update_op(root->val, mul, lazy_add(r - l + 1, add));
            root->lazy_add = lazy_union_add(root->lazy_add, mul, add);
            root->lazy_mul = lazy_union_mul(root->lazy_mul, mul);
            return;
        }
        pushdown(root, l, r);
        gg m = (l + r) / 2;
        if (left <= m) {
            update(root->left, l, m, left, min(m, right), mul, add);
        }
        if (right > m) {
            update(root->right, m + 1, r, max(left, m + 1), right, mul, add);
        }
        root->val = union_op(root->left->val, root->right->val);
    }
    //查询A的[left,right]区间执行union_op后的值，[l,r]表示当前root结点包含的区间
    T getResult(TreeNode* root, gg l, gg r, gg left, gg right) {
        if (left <= l and r <= right) {
            return root->val;
        }
        pushdown(root, l, r);
        gg m = (l + r) / 2;
        T ans;
        bool flag = false;  //标记ans是否被赋过值
        if (left <= m) {
            ans = getResult(root->left, l, m, left, min(m, right));
            flag = true;
        }
        if (right > m) {
            auto res = getResult(root->right, m + 1, r, max(left, m + 1), right);
            if (flag) {
                ans = union_op(ans, res);
            } else {
                ans = res;
            }
        }
        return ans;
    }
};
```

## 数据结构/堆/配对堆.md

# 配对堆

以下给出的代码实现了小根配对堆，如果需要 decreaseKey 操作，配对堆结点类还需添加 prev 域，代码实现也会复杂一些。因此下面给出没实现和实现了 decreaseKey 操作的两份代码。

## 未实现 decreaseKey 操作的代码

```cpp
struct Node {
    gg val;
    Node *child = nullptr, *sibling = nullptr;
    Node(gg v) : val(v) {}
};
Node* findMin(Node* x) { return x; }
Node* mergeTwoHeaps(Node* a, Node* b) {
    if (not a) {
        return b;
    }
    if (not b) {
        return a;
    }
    if (a->val > b->val) {  //如果要实现大根配对堆，只需将这里的>改成<
        swap(a, b);
    }
    b->sibling = a->child;
    a->child = b;
    return a;
}
Node* mergeSiblings(Node* x) {
    if (not x or not x->sibling) {
        return x;
    }
    Node *a = x->sibling, *b = a->sibling;
    x->sibling = a->sibling = nullptr;
    return mergeTwoHeaps(mergeTwoHeaps(x, a), mergeSiblings(b));
}
//如果先使用findMin，再使用deleteMin，务必不要将前面得到的findMin的返回值再合并到堆中，应该重建一个结点
Node* deleteMin(Node* x) { return mergeSiblings(x->child); }
```

## 实现了 decreaseKey 操作的代码

```cpp
struct Node {
    gg val;
    Node *child = nullptr, *sibling = nullptr, *prev = nullptr;
    Node(gg v) : val(v) {}
};
Node* findMin(Node* x) { return x; }
Node* mergeTwoHeaps(Node* a, Node* b) {
    if (not a) {
        return b;
    }
    if (not b) {
        return a;
    }
    if (a->val < b->val) {  //如果要实现大根配对堆，只需将这里的<改成>
        swap(a, b);
    }
    a->prev = nullptr;
    b->prev = a;
    b->sibling = a->child;
    if (a->child) {
        a->child->prev = b;
    }
    a->child = b;
    return a;
}
Node* mergeSiblings(Node* x) {
    if (not x) {
        return x;
    }
    x->prev = nullptr;
    if (not x->sibling) {
        return x;
    }
    Node *a = x->sibling, *b = a->sibling;
    x->sibling = a->sibling = nullptr;
    a->prev = nullptr;
    return mergeTwoHeaps(mergeTwoHeaps(x, a), mergeSiblings(b));
}
//如果先使用findMin，再使用deleteMin，务必不要将前面得到的findMin的返回值再合并到堆中，应该重建一个结点
Node* deleteMin(Node* x) { return mergeSiblings(x->child); }
// root为堆的根，x为要操作的节点，v为新的权值，调用时需保证x->val>=v
Node* decreaseKey(Node* root, Node* x, gg v) {
    x->val = v;
    if (not x->prev)
        return x;
    if (x->prev->child == x) {
        x->prev->child = x->sibling;
    } else {
        x->prev->sibling = x->sibling;
    }
    x->sibling->prev = x->prev;
    x->sibling = nullptr;
    x->prev = nullptr;
    return mergeTwoHeaps(root, x);
}
```

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
