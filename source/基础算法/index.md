---
title: 基础算法
date: 2026-10-21 20:56:39
description: 二分、排序、前缀和、划分算法、树等基础算法模板
layout: post
math: true
---

> 本页收录 **基础算法** 模块的全部模板代码，共 10 个文件 / 41 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `基础算法` 目录。

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

1. `基础算法/快读.cpp`
2. `基础算法/日期处理.cpp`
3. `基础算法/二分查找.md`
4. `基础算法/二维前缀和与二维差分.md`
5. `基础算法/划分算法.md`
6. `基础算法/子集生成和全排列.md`
7. `基础算法/排序算法.md`
8. `基础算法/整数取整.md`
9. `基础算法/树/二叉树.md`
10. `基础算法/树/多叉树.md`

---

## 基础算法/快读.cpp

```cpp
inline gg read() {
    gg x = 0, f = 1;
    char ch = cin.get();
    while (!isdigit(ch)) {
        if (ch == '-')
            f = -1;
        ch = cin.get();
    }
    while (isdigit(ch)) {
        x = x * 10 + ch - 48;
        ch = cin.get();
    }
    return x * f;
}
```

## 基础算法/日期处理.cpp

> 周日用数字0表示

```cpp
//周日用数字0表示
gg monthdays[13] = {0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};  //平年时每个月有多少天
gg daysOfMonth(gg y, gg m) {                                             //判断y年m月有几天
    if ((y % 400 == 0 || y % 4 == 0 && y % 100 != 0) && m == 2)          // y年是闰年且查询2月有几天
        return 29;                                                       //闰年2月有29天
    return monthdays[m];                                                 //直接返回monthdays的相应位置的天数
}
gg determineWeek(gg y, gg m, gg d, gg week = 2) {  //根据1850年1月1日是周二，返回y年m月d日是周几
    for (gg i = 1850; i < y; ++i) {                //检查1850年到y年经历的年份
        gg temp = (i % 400 == 0 || i % 4 == 0 && i % 100 != 0) ? 366 : 365;  //平年有365天，闰年有366天
        week = (week + temp) % 7;                                            //更新week
    }
    for (gg i = 1; i < m; ++i)                  //检查1月到m月的月份
        week = (week + daysOfMonth(y, i)) % 7;  //求出该月有几天，并更新week
    return (week + d - 1) % 7;                  //返回周几，注意周日用0表示
}
gg determineDayOfNumberWeek(gg y, gg m, gg b, gg c) {  //判断y年m月第b个星期c是几号
    gg week = determineWeek(y, m, 1);                  //确定y年m月1日是周几
    return 1 + (c + 7 - week) % 7 + 7 * (b - 1);
}
```

## 基础算法/二分查找.md

## 二分查找

二分查找算法的时间复杂度为 $O(\log n)$

## 在升序序列中二分查找某数 x 的位置

```cpp
//在升序序列中二分查找某数 x 的位置，二分区间为 [left,right]，如果不存在，返回-1
gg v[MAX];
gg binarySearch(gg left, gg right, gg x) {
    while (left <= right) {
        gg mid = (left + right) / 2;
        if (v[mid] == x)
            return mid;
        else if (v[mid] < x)
            left = mid + 1;
        else
            right = mid - 1;
    }
    return -1;
}
```

## 在非降序序列中二分查找第一个大于等于 x 的位置

```cpp
//在非降序序列中二分查找第一个大于等于x的位置，二分区间为[left, right]
//如果不存在这样的元素，返回-1
gg v[MAX];
gg lowerBound(gg left, gg right, gg x) {
    while (left < right) {
        gg mid = (left + right) / 2;
        if (v[mid] >= x)
            right = mid;
        else
            left = mid + 1;
    }
    return left > right or v[left] >= x ? -1: left;
}
```

## 基础算法/二维前缀和与二维差分.md

# 二维前缀和

## 问题描述

给出一个 $m\times n$ 的矩阵 a 以及四个整数 $r_1,c_1,r_2,c_2(1\le r_1 \le r_2 \lt =m,1\le c_1 \le c_2 \le n)$ ，求 $\sum_{i=r_1}^{r_2}\sum_{j=c_1}^{c_2} a[i][j]$ 的值。注意，这里的下标都从 1 开始。

## 简析

定义一个矩阵 preSum 存储 a 的二维前缀和，即令 $preSum[i][j]$ 表示 $\sum_{r=1}^i\sum_{c=1}^j mat[i][j]$ 的值，其中， $1<=i<=m,0\lt =j\le n$ 。可以用递推公式 $preSum[i][j] = preSum[i - 1][j] + preSum[i][j - 1] - preSum[i - 1][j - 1] + a[i][j]$ 对 $preSum[i][j]$ 进行计算。建立二维前缀和数组的时间复杂度为 $O(mn)$ 。

那么，题目要求的解为 $preSum[r2][c2] - preSum[r1 - 1][c2] - preSum[r2][c1 - 1] + preSum[r1 - 1][c1 - 1]$ ，建立好二维前缀和数组后，每次查询的时间复杂度为 $O(1)$ 。

## C++代码

```cpp
gg a[MAX][MAX], preSum[MAX][MAX];
//计算前缀和
void getPrefixSum(gg m, gg n) {
    for (gg i = 1; i <= m; ++i) {
        for (gg j = 1; j <= n; ++j) {
            preSum[i][j] = preSum[i - 1][j] + preSum[i][j - 1] - preSum[i - 1][j - 1] + a[i][j];
        }
    }
}
//计算将左上角为(r1,c1)，右下角为(r2,c2)的矩阵的和
gg getSum(gg r1, gg c1, gg r2, gg c2) {
    return preSum[r2][c2] - preSum[r1 - 1][c2] - preSum[r2][c1 - 1] + preSum[r1 - 1][c1 - 1];
}
```

# 二维差分

## 问题描述

给出一个 $m\times n$ 的零矩阵 a 以及多个修改操作，每个修改操作将以左上角坐标 $(r_1,c_1)$ ，右下角坐标 $(r_2,c_2)$ 的矩阵中所有的值都增加 $v$ ， $(1\le r_1 \le r_2 \lt =m, 1\le c_1 \le c_2 \le n)$ ，求所有修改操作结束后矩阵 a 的值。注意，这里的下标都从 1 开始。

## 简析

利用差分的思想进行修改操作，然后利用前缀和的思想查询。能够保证每次修改操作的时间复杂度为 $O(1)$ ，查询操作的时间复杂度为 $O(mn)$ 。

## C++代码

```cpp
gg a[MAX][MAX], preSum[MAX][MAX];
//计算差分，将左上角为(r1,c1)，右下角为(r2,c2)的矩阵的值都加上v
void update(gg r1, gg c1, gg r2, gg c2, gg v) {
    preSum[r1][c1] += v;
    preSum[r1][c2 + 1] -= v;
    preSum[r2 + 1][c1] -= v;
    preSum[r2 + 1][c2 + 1] += v;
}
//计算矩阵
void getResult(gg m, gg n) {
    for (gg i = 1; i <= m; ++i) {
        for (gg j = 1; j <= n; ++j) {
            a[i][j] = preSum[i][j] + a[i][j - 1] + a[i - 1][j] - a[i - 1][j - 1];
        }
    }
}
```

## 基础算法/划分算法.md

# 划分算法

假设划分元为$pivot$，这里提供的划分算法，会将数组 nums 分成 $\lt pivot$ 、 $== pivot$ 、 $\gt pivot$ 三部分，返回一个 array，表示 $== pivot$ 的部分的首元素索引、尾元素的下一个元素的索引。时间复杂度为 $O(n)$ 。

```cpp
gg nums[MAX];
array<gg, 2> partition(gg pivot) {
    gg i = 0, j = 0, k = nums.size() - 1;
    while (i <= k)
        if (nums[i] > pivot)
            swap(nums[i], nums[k--]);
        else if (nums[i] < pivot)
            swap(nums[i++], nums[j++]);
        else
            ++i;
    return {j, i};
}
```

## 基础算法/子集生成和全排列.md

# 子集生成和全排列

## 子集生成

使用`vector<vector<gg>>`类型的`ans`变量存储最终产生的所有子集。

### 无重复元素

#### 递归构造法

```cpp
vector<vector<gg>> ans;
vector<gg> temp;
void sub(vector<gg>& nums, gg p) {
    ans.push_back(temp);
    for (gg i = p; i < nums.size(); ++i) {
        temp.push_back(nums[i]);
        sub(nums, i + 1);
        temp.pop_back();
    }
}
vector<vector<gg>> subsets(vector<gg>& nums) {
    sub(nums, 0);
    return ans;
}
```

#### 位向量法

```cpp
vector<vector<gg>> ans;
void sub(vector<gg>& nums, vector<bool>& f, gg p) {
    if (p == nums.size()) {
        ans.push_back({});
        for (gg i = 0; i < f.size(); ++i) {
            if (f[i]) {
                ans.back().push_back(nums[i]);
            }
        }
        return;
    }
    f[p] = true;
    sub(nums, f, p + 1);
    f[p] = false;
    sub(nums, f, p + 1);
}
vector<vector<gg>> subsets(vector<gg>& nums) {
    vector<bool> f(nums.size());
    sub(nums, f, 0);
    return ans;
}
```

#### 迭代构造法

```cpp
vector<vector<gg>> subsets(vector<gg>& nums) {
    vector<vector<gg>> ans{{}};
    for (gg i = 0; i < nums.size(); ++i) {
        gg s = ans.size();
        for (gg j = 0; j < s; ++j) {
            ans.push_back(ans[j]);
            ans.back().push_back(nums[i]);
        }
    }
    return ans;
}
```

#### 二进制法

```cpp
vector<vector<gg>> subsets(vector<gg>& nums) {
    gg n = nums.size();
    vector<vector<gg>> ans(1 << n);
    for (gg i = 0; i < (1 << n); ++i) {
        for (gg j = 0; j < n; ++j) {
            if ((i >> j) & 1) {
                ans[i].push_back(nums[j]);
            }
        }
    }
    return ans;
}
```

### 有重复元素

#### 递归构造法

```cpp
vector<vector<gg>> ans;
vector<gg> temp;
void sub(vector<gg>& nums, gg p) {
    ans.push_back(temp);
    for (gg i = p; i < nums.size(); ++i) {
        if (i > p and nums[i] == nums[i - 1]) {
            continue;
        }
        temp.push_back(nums[i]);
        sub(nums, i + 1);
        temp.pop_back();
    }
}
vector<vector<gg>> subsetsWithDup(vector<gg>& nums) {
    sort(begin(nums), end(nums));
    sub(nums, 0);
    return ans;
}
```

#### 位向量法

```cpp
vector<vector<gg>> ans;
void sub(vector<gg>& nums, vector<bool>& f, gg p) {
    if (p == nums.size()) {
        ans.push_back({});
        for (gg i = 0; i < f.size(); ++i) {
            if (f[i]) {
                ans.back().push_back(nums[i]);
            }
        }
        return;
    }
    gg j = find_if(begin(nums) + p, end(nums),
                    [&nums, p](gg a) { return a != nums[p]; }) -
            begin(nums);
    for (gg i = p; i < j; ++i) {
        f[i] = true;
        sub(nums, f, j);
    }
    for (gg i = p; i < j; ++i) {
        f[i] = false;
    }
    sub(nums, f, j);
}
vector<vector<gg>> subsetsWithDup(vector<gg>& nums) {
    vector<bool> f(nums.size());
    sort(begin(nums), end(nums));
    sub(nums, f, 0);
    return ans;
}
```

#### 迭代构造法

```cpp
vector<vector<gg>> subsetsWithDup(vector<gg>& nums) {
    vector<vector<gg>> ans{{}};
    sort(begin(nums), end(nums));
    gg s = 1;
    for (gg i = 0; i < nums.size(); ++i) {
        gg k = ans.size();
        if (i == 0 or nums[i] != nums[i - 1]) {
            s = k;
        }
        for (gg j = k - s; j < k; ++j) {
            ans.push_back(ans[j]);
            ans.back().push_back(nums[i]);
        }
    }
    return ans;
}
```

## 全排列

使用`vector<vector<gg>>`类型的`ans`变量存储最终产生的所有排列。

### 无重复元素

```cpp
//如果要求字典序输出全排列，调用之前请先对nums排序
vector<vector<gg>> ans;
void per(vector<gg>& nums, gg p) {
    if (p == nums.size()) {
        ans.push_back(nums);
        return;
    }
    for (gg i = p; i < nums.size(); ++i) {
        swap(nums[i], nums[p]);
        per(nums, p + 1);
        swap(nums[i], nums[p]);
    }
}
vector<vector<gg>> permute(vector<gg>& nums) {
    per(nums, 0);
    return ans;
}
```

### 有重复元素

```cpp
vector<vector<gg>> ans;
void per(vector<gg> nums, gg p) {
    if (p == nums.size()) {
        ans.push_back(nums);
        return;
    }
    for (gg i = p; i < nums.size(); ++i) {
        if (i == p or nums[i] != nums[p]) {
            swap(nums[i], nums[p]);
            per(nums, p + 1);
        }
    }
}
vector<vector<gg>> permuteUnique(vector<gg>& nums) {
    sort(begin(nums), end(nums));
    per(nums, 0);
    return ans;
}
```

## 基础算法/排序算法.md

# 内部排序算法

可以使用[洛谷题目 P1177 【模板】快速排序](https://www.luogu.com.cn/problem/P1177)验证自己编写的算法是否正确（时间复杂度过高的排序算法会 TLE）。

## 算法分类

排序算法可以分为以下 5 类：

1. 插入类排序：直接插入排序、希尔排序
2. 选择类排序：简单选择排序、堆排序
3. 交换类排序：冒泡排序、快速排序
4. 归并类排序：归并排序
5. 基数类排序：基数排序

**注：本博客编写的算法均是针对`vector<gg>`类型数据进行从小到大排序**

## 八大内部排序算法的 C++代码

### 直接插入排序

```cpp
void InsertSort(vector<gg>& v) {
    for (gg i = 0; i < v.size(); ++i) {
        gg t = v[i], j;
        for (j = i; j >= 1 and v[j - 1] > t; --j) {
            v[j] = v[j - 1];
        }
        v[j] = t;
    }
}
```

### 希尔排序

直接插入排序就是增量为 1 时的希尔排序，二者的代码非常相似，可类比记忆。
以下代码采取希尔提出的选取增量的方法，即每次增量分别为：
$$\lfloor n/2 \rfloor、\lfloor n/4 \rfloor、··· ···、\lfloor n/2^k \rfloor、··· ···、2、1$$

```cpp
void ShellSort(vector<gg>& v) {
    for (gg inc = v.size() / 2; inc >= 1; inc /= 2) {
        for (gg i = inc; i < v.size(); ++i) {
            gg t = v[i], j;
            for (j = i; j >= inc and v[j - inc] > t; j -= inc) {
                v[j] = v[j - inc];
            }
            v[j] = t;
        }
    }
}
```

### 简单选择排序

```cpp
void SelectSort(vector<gg>& v) {
    for (gg i = 0; i < v.size(); ++i) {
        gg k = i;
        for (gg j = i + 1; j < v.size(); ++j) {
            if (v[j] < v[k]) {
                k = j;
            }
        }
        gg t = v[k];
        v[k] = v[i];
        v[i] = t;
    }
}
```

### 堆排序

以下代码建立的是大根堆

```cpp
void Down(vector<gg>& v, gg n, gg p) {
    gg t = v[p];
    while (2 * p + 1 < n) {
        gg child = 2 * p + 1;
        if (child + 1 < n and v[child] < v[child + 1]) {
            ++child;
        }
        if (t < v[child]) {
            v[p] = v[child];
            p = child;
        } else {
            break;
        }
    }
    v[p] = t;
}
void HeapSort(vector<gg>& v) {
    for (gg i = v.size() / 2; i >= 0; --i) {
        Down(v, v.size(), i);
    }
    for (gg i = v.size() - 1; i > 0; --i) {
        gg t = v[i];
        v[i] = v[0];
        v[0] = t;
        Down(v, i, 0);
    }
}
```

### 冒泡排序

以下代码以**一趟排序过程中如果没有发生关键字交换**作为冒泡排序结束的标志。

```cpp
void BubbleSort(vector<gg>& v) {
    for (gg i = 0; i < v.size(); ++i) {
        bool flag = true;  //标记是否有关键字交换
        for (gg j = 1; j < v.size() - i; ++j) {
            if (v[j] < v[j - 1]) {
                flag = false;
                gg t = v[j];
                v[j] = v[j - 1];
                v[j - 1] = t;
            }
        }
        if (flag) {
            break;
        }
    }
}
```

### 快速排序

以下代码选择每个序列的第一个数字作为划分元素

```cpp
void QSort(vector<gg>& v, gg left, gg right) {
    if (left >= right)
        return;
    gg pivot = v[left], i = left, j = right;
    while (i < j) {
        while (i < j and v[j] >= pivot) {
            --j;
        }
        if (i < j) {
            v[i++] = v[j];
        }
        while (i < j and v[i] <= pivot) {
            ++i;
        }
        if (i < j) {
            v[j--] = v[i];
        }
    }
    v[i] = pivot;
    QSort(v, left, i - 1);
    QSort(v, i + 1, right);
}
void QuickSort(vector<gg>& v) { QSort(v, 0, v.size() - 1); }
```

### 归并排序

```cpp
void Merge(vector<gg>& v, vector<gg>& a, gg left, gg mid, gg right) {
    for (gg i = left, j = mid + 1, k = left; k <= right; ++k) {
        if (i > mid) {
            a[k] = v[j++];
        } else if (j > right) {
            a[k] = v[i++];
        } else if (v[i] < v[j]) {
            a[k] = v[i++];
        } else {
            a[k] = v[j++];
        }
    }
    for (gg i = left; i <= right; ++i) {  //将合并后的有序序列拷贝回原数组
        v[i] = a[i];
    }
}
void MSort(vector<gg>& v, vector<gg>& a, gg left, gg right) {
    if (left >= right) {  //待排序序列中只有0或1个关键字，不必排序，直接返回
        return;
    }
    gg mid = (left + right) / 2;  //中间位置
    MSort(v, a, left, mid);  //递归排序左半部分
    MSort(v, a, mid + 1, right);  //递归排序右半部分
    Merge(v, a, left, mid, right);  //合并两个有序序列
}
void MergeSort(vector<gg>& v) {
    vector<gg> a(v.size());  //合并两个有序序列时的输出序列
    MSort(v, a, 0, v.size() - 1);
}
```

### 基数排序

以下代码假设待排序序列以 10 为基数，且使用了 stl 中的队列 queue 作为桶

```cpp
//返回数组中最大值的位数，即基数排序的趟数
gg getNum(vector<gg>& v, gg radix = 10) {
    gg t = v[0];
    for (gg i = 1; i < v.size(); ++i) {
        if (v[i] > t) {
            t = v[i];
        }
    }
    gg i = 0;
    for (i = 0; t != 0; t /= radix) {
        ++i;
    }
    return i;
}
void RadixSort(vector<gg>& v, gg radix = 10) {
    gg num = getNum(v);
    queue<gg> q[radix];
    for (gg i = 0, factor = 1; i < num; ++i, factor *= radix) {
        for (gg j = 0; j < v.size(); ++j) {
            q[v[j] / factor % radix].push(v[j]);
        }
        for (gg j = 0, k = 0; j < radix; ++j)
            while (!q[j].empty()) {
                v[k++] = q[j].front();
                q[j].pop();
            }
    }
}
```

## 基础算法/整数取整.md

# 整数取整

这里提供的整数取整方法可以对负数进行取整。

## 求 $\lceil \frac{n}{m} \rceil$

```cpp
gg up(gg n, gg m) { return n >= 0 ? (n + m - 1) / m : n / m; }
```

## 求 $\lfloor \frac{n}{m} \rfloor$

```cpp
gg down(gg n, gg m) { return n >= 0 ? n / m : (n - m + 1) / m; }
```

## 基础算法/树/二叉树.md

# 二叉树

## 结点类定义

```cpp
struct BTNode {
    gg val;
    BTNode *left, *right;
    BTNode(gg v, BTNode* l = nullptr, BTNode* r = nullptr) : val(v) {}
};
```

## 深度优先遍历（DFS）的递归写法

算法的时间复杂度为 $O(n)$

```cpp
//二叉树的先根遍历
void preOrder(BTNode* root) {
    if (not root)  //是空树直接返回
        return;
    cout << root->val << ' ';  //访问根结点
    preOrder(root->left);  //递归遍历左子树
    preOrder(root->right);  //递归遍历右子树
}
//二叉树的中根遍历
void inOrder(BTNode* root) {
    if (not root)  //是空树直接返回
        return;
    inOrder(root->left);  //递归遍历左子树
    cout << root->val << ' ';  //访问根结点
    inOrder(root->right);  //递归遍历右子树
}
//二叉树的先根遍历
void postOrder(BTNode* root) {
    if (not root)  //是空树直接返回
        return;
    postOrder(root->left);  //递归遍历左子树
    postOrder(root->right);  //递归遍历右子树
    cout << root->val << ' ';  //访问根结点
}
```

## 深度优先遍历（DFS）的非递归写法

算法的时间复杂度为 $O(n)$

```cpp
//二叉树的先根遍历
void preOrder(BTNode* root) {
    stack<BTNode*> st;
    while (root or not st.empty()) {
        while (root) {
            cout << root->val << " ";
            st.push(root);
            root = root->left;
        }
        root = st.top();
        st.pop();
        root = root->right;
    }
}
//二叉树的中根遍历
//注意中根遍历和先根遍历代码的差别仅仅在于ans.push_back(root->val);的位置
void inOrder(BTNode* root) {
    stack<BTNode*> st;
    while (root or not st.empty()) {
        while (root) {
            st.push(root);
            root = root->left;
        }
        root = st.top();
        st.pop();
        cout << root->val << " ";
        root = root->right;
    }
}
//二叉树的后根遍历
//注意后根遍历和先根遍历代码的差别在于先将右子树入栈，再将左子树入栈，最后进行一次翻转
void postOrder(BTNode* root) {
    vector<gg> ans;
    stack<BTNode*> st;
    while (root or not st.empty()) {
        while (root) {
            ans.push_back(root->val);
            st.push(root);
            root = root->right;
        }
        root = st.top();
        st.pop();
        root = root->left;
    }
    reverse(begin(ans), end(ans));
    for(gg i: ans){
        cout << i << " ";
    }
}
```

## 广度优先遍历（BFS）

算法的时间复杂度为 $O(n)$

```cpp
//二叉树的层次遍历
void levelOrder(BTNode* root) {
    queue<BTNode*> q;
    q.push(root);
    while (not q.empty()) {
        gg s = q.size();
        while (s--) {
            auto t = q.front();
            q.pop();
            cout << t->val << (s == 0 ? '\n' : ' ');
            if (t->left)
                q.push(t->left);
            if (t->right)
                q.push(t->right);
        }
    }
}
```

## 判断二叉树是否为完全二叉树

算法的时间复杂度为 $O(n)$

```cpp
bool isCompleteTree(BTNode* root) {
    queue<pair<BTNode*, gg>> q;  // pair的second成员存储结点编号
    q.push({root, 1});
    for (gg i = 1; !q.empty(); ++i) {
        auto t = q.front();
        q.pop();
        if (i != t.second)
            return false;
        if (t.first->left != nullptr)
            q.push({t.first->left, t.second * 2});
        if (t.first->right != nullptr)
            q.push({t.first->right, t.second * 2 + 1});
    }
    return true;
}
```

## 二叉查找树的相关操作

插入、查找操作时间复杂度均为 $O(h)$ ，其中 h 为树的高

```cpp
//向二叉查找树中插入元素x
void insertElement(BTNode*& root, gg x) {
    if (not root) {  //根结点为空，新建一个结点
        root = new BTNode(x);
    } else if (x <= root->val) {  //向左子树中插入
        insertElement(root->left, x);
    } else {  //向右子树中插入
        insertElement(root->right, x);
    }
}
//在二叉查找树中查找元素x的位置，查找失败则返回空指针
BTNode* findElement(BTNode* root, gg x) {
    if (not root or root->val == x) {  //查找失败或查找成功
        return root;
    } else if (x <= root->val) {  //向左子树中查找
        return findElement(root->left, x);
    } else {  //向右子树中查找
        return findElement(root->right, x);
    }
}
```

## 根据遍历序列创建二叉树问题

注意，**这里的代码模板针对的二叉树，结点数据域的值都是唯一的，不会出现重复**

### 由中根序列和先根序列创建二叉树

算法的时间复杂度为 $O(n)$

```cpp
// pre为先根序列，in为中根序列，r为根结点在pre中的下标
//[left, right]为当前创建的树的中根序列区间
BTNode* buildTree(vector<gg>& pre, vector<gg>& in, gg r, gg left, gg right) {
    if (left > right)  //序列为空，返回空指针
        return nullptr;
    //查找根结点在中根序列中的位置
    gg i = find(begin(in), end(in), pre[r]) - begin(in);
    auto root = new BTNode(pre[r]);  //创建根结点
    root->left = buildTree(pre, in, r + 1, left, i - 1);  //创建左子树
    root->right = buildTree(pre, in, r + 1 + i - left, i + 1, right);  //创建右子树
    return root;  //返回根结点
}
```

### 由中根序列和先根序列得到后根序列

算法的时间复杂度为 $O(n)$

```cpp
// pre为先根序列，in为中根序列，r为根结点在pre中的下标
//[left, right]为当前创建的树的中根序列区间
void getPostFromPreIn(vector<gg>& pre, vector<gg>& in, gg r, gg left, gg right) {
    if (left > right)  //序列为空，直接返回
        return;
    //查找根结点在中根序列中的位置
    gg i = find(begin(in), end(in), pre[r]) - begin(in);
    getPostFromPreIn(pre, in, r + 1, left, i - 1);  //递归遍历左子树
    getPostFromPreIn(pre, in, r + 1 + i - left, i + 1, right);  //递归遍历右子树
    cout << pre[r] << ' ';  //输出后根序列
}
```

### 由先根序列创建二叉查找树

算法的时间复杂度为 $O(n)$

```cpp
// pre为先根序列，[left, right]为当前创建的树的先根序列区间
BTNode* buildBST(vector<gg>& pre, gg left, gg right) {
    if (left > right)  //序列为空，返回空指针
        return nullptr;
    //查找右子树根结点在先根序列中的位置
    gg i = find_if(begin(pre) + left, begin(pre) + right + 1,
                   [&pre, left](gg a) { return a > pre[left]; }) - begin(pre);
    auto root = new BTNode(pre[left]);  //创建根结点
    root->left = buildBST(pre, left + 1, i - 1);  //创建左子树
    root->right = buildBST(pre, i, right);  //创建右子树
    return root;  //返回根结点
}
```

### 由二叉查找树的先根序列得到后根序列

算法的时间复杂度为 $O(n)$

```cpp
// pre为先根序列，[left, right]为当前创建的树的先根序列区间
void getPostFromBSTPre(vector<gg>& pre, gg left, gg right) {
    if (left > right)  //序列为空，直接返回
        return;
    //查找右子树根结点在先根序列中的位置
    gg i = find_if(begin(pre) + left, begin(pre) + right + 1,
                   [&pre, left](gg a) { return a > pre[left]; }) - begin(pre);
    getPostFromBSTPre(pre, left + 1, i - 1);  //递归遍历左子树
    getPostFromBSTPre(pre, i, right);  //递归遍历右子树
    cout << pre[left] << ' ';
}
```

## 最近公共祖先（LCA）问题

这里的代码模板针对的二叉树和要查找的指针 p、q，满足以下约定：

1. 二叉树中结点数据域的值都是唯一的，不会出现重复；
2. p 指针和 q 指针指向的结点一定在树中；
3. 非空结点与空结点的最近公共祖先为该非空结点。

### 普通二叉树

```cpp
//在普通二叉树中查找p和q的最近公共祖先
BTNode* LCA(BTNode* root, BTNode* p, BTNode* q) {
    if (not root or root == p or root == q)
        return root;
    BTNode *left = LCA(root->left, p, q), *right = LCA(root->right, p, q);
    return not left ? right : not right ? left : root;
}
```

### 二叉查找树

```cpp
//在二叉查找树中查找p和q的最近公共祖先
BTNode* LCA(BTNode* root, BTNode* p, BTNode* q) {
    return (root->val - p->val) * (root->val - q->val) <= 0 ?
               root : LCA(p->val < root->val ? root->left : root->right, p, q);
}
```

## 基础算法/树/多叉树.md

# 多叉树

## 结点类定义

```cpp
struct TreeNode {
    gg val;
    vector<TreeNode*> child;
    TreeNode(gg v) : val(v) {}
};
```

## 深度优先遍历（DFS）

算法的时间复杂度为 $O(n)$

```cpp
//树的先根遍历
void preOrder(TreeNode* root) {
    if (not root)  //是空树直接返回
        return;
    cout << root->val << ' ';  //访问根结点
    for (auto i : root->child)  //递归遍历所有子树
        preOrder(i);
}
//树的后根遍历
void postOrder(TreeNode* root) {
    if (not root)  //是空树直接返回
        return;
    for (auto i : root->child)  //递归遍历所有子树
        postOrder(i);
    cout << root->val << ' ';  //访问根结点
}
```

## 广度优先遍历（BFS）

算法的时间复杂度为 $O(n)$

```cpp
//树的层次遍历
void levelOrder(TreeNode* root) {
    queue<TreeNode*> q;
    q.push(root);
    while (not q.empty()) {
        gg s = q.size();
        while (s--) {
            auto t = q.front();
            q.pop();
            cout << t->val << (s == 0 ? '\n' : ' ');
            for (auto i : t->child)
                q.push(i);
        }
    }
}
```

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
