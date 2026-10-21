---
title: 数学
date: 2026-10-21 20:56:39
description: 素数、快速幂、欧几里得、欧拉函数、组合数、高精度等数学模板
layout: post
math: true
---

> 本页收录 **数学** 模块的全部模板代码，共 10 个文件 / 24 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `数学` 目录。

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

1. `数学/乘法逆元.md`
2. `数学/位运算.md`
3. `数学/分数.md`
4. `数学/快速幂.md`
5. `数学/欧几里得算法.md`
6. `数学/欧拉函数.md`
7. `数学/素数.md`
8. `数学/组合数.md`
9. `数学/进制转换.md`
10. `数学/高精度整数运算.md`

---

## 数学/乘法逆元.md

# 乘法逆元

如果一个线性同余方程 $ax\equiv 1(mod\ n)$ ，则 $x$ 称为 $a\ mod\ n$ 的逆元，记作 $a^{-1}$ 。

## 扩展欧几里得算法求逆元

若 $gcd(a,n)\not ={1}$ ，则方程无解。所以如果方程有解的话，就可以通过[扩展欧几里得算法](./欧几里得算法.md)求逆元。

## 快速幂法求逆元

根据费马小定理，若 $n$ 为素数，且 $gcd(a,n)=1$ ， $a\ mod\ n$ 的逆元可以计算为 $a^{n-2}$ ，可通过[快速幂](./快速幂.md)求解。

## 求 $1,2,\cdots,n$ 中每个数关于 $p$ 的逆元

算法时间复杂度为 $O(n)$ 。

```cpp
gg inv[MAX];
void invEle(gg n, gg p) {
    inv[1] = 1;
    for (gg i = 2; i <= n; ++i) {
        inv[i] = (p - p / i) * inv[p % i] % p;
    }
}
```

## 求任意 $n$ 个数关于 $p$ 的逆元

首先计算 n 个数的前缀积，记为 $s_i$ ，然后利用快速幂或扩展欧几里得算法计算 $s_n$ 的逆元，记作 $sv_n$ 。因为 $sv_n$ 是 n 个数的积的逆元，所以当我们把它乘上 $a_n$ 时，就会和 $a_n$ 的逆元抵消，于是就得到了 $a_1$ 到 $a_n$ 的积逆元，记为 $sv_{n-1}$ 。可以依次计算出所有的 $sv_i$ ，于是 $a_i^{-1}$ 就可以用 $s_{i-1}\cdot sv_i$ 求得。算法时间复杂度为 $O(n+\log\ p)$

```cpp
gg inv[MAX], s[MAX], a[MAX], sv[MAX];
void invEle(gg n, gg p) {
    s[0] = 1;
    for (gg i = 1; i <= n; ++i) {
        s[i] = s[i - 1] * a[i] % p;
    }
    //也可以用扩展欧几里得来求逆元,视个人喜好而定.
    sv[n] = powMod(s[n], p - 2, p);
    for (gg i = n; i >= 1; --i) {
        sv[i - 1] = sv[i] * a[i] % p;
    }
    for (gg i = 1; i <= n; ++i) {
        inv[i] = sv[i] * s[i - 1] % p;
    }
}
```

## 数学/位运算.md

# 位运算

## 基础的位运算

经常会将一个状态压缩成一个整数，这时掌握如何更改这个整数的二进制位是非常有必要的。

```cpp
num |= 1 << n;  //将num的第n位二进制位变为1
num &= ~(1 << n);  //将num的第n位二进制位变为0
num ^= 1 << n;  //将num的第n位二进制位翻转
```

可以这样枚举一个二进制数 n 的所有为 1 的二进制位的组合：

```cpp
for (gg t = n; t != 0; t = (t - 1) & n){
    //对状态t进行操作
}
```

## 使用异或、位与运算做加法

```cpp
gg plusANDXOR(gg a, gg b) {
    while (b != 0) {
        gg c = (unsigned gg)(a & b) << 1;
        a ^= b;
        b = c;
    }
    return a;
}
```

## 数学/分数.md

# 分数

我们用假分数的形式表示一个分数，这种形式下，一个分数只包含分子和分母两个整数，而且它还可以表示大于 1 的分数。可以使用`array<gg, 2>`来表示这样一个假分数。由于`array<gg, 2>`类型名过长，我们可以使用为它取一个类型别名，即`using F=array<gg, 2>`（F 是分数的英文 fraction 的首字母）。为了表述和编码方便，如果我们有这样一个分数对象 f，我们针对这样一种表示方法约定以下规则：

1. 分数对象 f 应该是 F 类型，其中 f[0] 表示分子，f[1] 表示分母；
2. 分母 f[1] 永远都是正整数，如果 f 的值为负，那么让分子 f[0] 为负；
3. 分子 f[1] 和分母 f[1] 应该一直是互质的，即两者除了 1 以外没有其他公约数；
4. 如果 f 的值为 0，则令 f[0]=0，f[1]=1。

本模板给出的读入程序针对的是按 a/b 的格式给出分数形式，其中分子和分母全是整型范围内的整数，分母不为 0。

本模板输出的分数形式满足以下要求：

1. 如果分数的值是一个整数，只输出整数部分；
2. 如果分数的值大于 1，按带分数`k a/b`形式输出，k 为整数部分，a/b 为约分后的分数部分，如果有负号，只出现在整数部分；
3. 如果分数的值小于 1，按带分数`a/b`形式输出，a/b 为约分后的分数部分，如果有负号，只出现在分子前；
4. 如果分数的值为负，则会在分数前后输出圆括号`()`。

注意，进行分数除法时，你应该保证传入这个函数的除数不为 0。

```cpp
using F = array<gg, 2>;
//分数的输入，针对的是按 a/b 的格式给出分数形式，分母不为 0
F input() {
    F f;
    char c;  //吸收'/'符号
    cin >> f[0] >> c >> f[1];
    return f;
}
//分数的化简
void simplify(F& f) {
    if (f[0] == 0) {  //如果分子 f[0] 为 0，则令 f[1]=1
        f[1] = 1;
        return;
    }
    if (f[1] < 0) {  //如果分母 f[1] 为负，将分子 f[0] 和分母 f[1] 都取相反数
        f[1] = -f[1];
        f[0] = -f[0];
    }
    gg d = gcd(abs(f[0]), abs(f[1]));  //求出分子 f[0] 和分母 f[1] 绝对值的最大公约数
    f[0] /= d;
    f[1] /= d;
}
//分数的加法
F Plus(const F& f1, const F& f2) {
    F f;
    f[0] = f1[0] * f2[1] + f2[0] * f1[1];
    f[1] = f1[1] * f2[1];
    simplify(f);
    return f;
}
//分数的减法
F Sub(const F& f1, const F& f2) {
    F f;
    f[0] = f1[0] * f2[1] - f2[0] * f1[1];
    f[1] = f1[1] * f2[1];
    simplify(f);
    return f;
}
//分数的乘法
F Multiply(const F& f1, const F& f2) {
    F f;
    f[0] = f1[0] * f2[0];
    f[1] = f1[1] * f2[1];
    simplify(f);
    return f;
}
//分数的除法
F Div(const F& f1, const F& f2) {
    F f;
    f[0] = f1[0] * f2[1];
    f[1] = f1[1] * f2[0];
    simplify(f);
    return f;
}
//分数输出
void output(const F& f) {
    if (f[0] < 0)
        cout << '(';
    if (f[1] == 1) {
        cout << f[0];
    } else if (abs(f[0]) < f[1]) {
        cout << f[0] << "/" << f[1];
    } else
        cout << f[0] / f[1] << " " << abs(f[0]) % f[1] << "/" << f[1];
    if (f[0] < 0)
        cout << ')';
}
```

## 数学/快速幂.md

# 快速幂

## 快速幂

算法的时间复杂度为 $O(\log n)$ ，其中 $n$ 为幂数。

```cpp
gg binpow(gg a, gg b) {
    gg ans = 1;
    while (b > 0) {
        if (b & 1)
            ans = ans * a;
        a = a * a;
        b >>= 1;
    }
    return ans;
}
```

## 快速幂取模

算法的时间复杂度为 $O(\log n)$ ，其中 $n$ 为幂数。

```cpp
//返回a^b%m
gg powMod(gg a, gg b, gg m) {
    if (m == 1) {
        return 0;
    }
    a %= m;
    gg ans = 1;
    while (b > 0) {
        if (b & 1)
            ans = ans * a % m;
        a = a * a % m;
        b >>= 1;
    }
    return ans;
}
```

## 高精度快速幂

```cpp
//返回a^b%mod，b是高精度整数
gg superPow(gg a, string& b, gg mod) {
    a %= mod;
    if (b.empty())
        return 1;
    gg k = b.back();
    b.pop_back();
    return powMod(superPow(a, b, mod), 10, mod) * powMod(a, k, mod) % mod;
}
```

## 数学/欧几里得算法.md

# 欧几里得算法

1. 欧几里得算法可以求解 a,b 两数的最大公约数，时间复杂度为 $O(\log(max(a,b)))$ ，递归实现一般不会栈溢出。用欧几里得算法去求斐波那契数列相邻两项的最大公约数，该算法会达到最坏复杂度。
2. 如果要求多个数的最大公约数（最小公倍数），当我们算出两个数的最大公约数（最小公倍数）之后，将它放入序列中对后面的数继续求解即可。
3. a,b,c 为任意整数，扩展欧几里得算法可以求解方程 $ax+by=gcd(a,b)$ 的一组整数解。
   1. 调用扩展欧几里得算法时，需保证 a,b 为正整数。
   2. 若方程 $ax+by=c$ 的一组整数解为 $(x_0,y_0)$ ，，则它的任意整数解都可以写成 $(x_0+kb', y_0-ka')$ ，其中 $a'=a/gcd(a,b)$ ， $b'=b/gcd(a,b)$ ，k 取任意整数。
   3. 若 $g=gcd(a,b)$ ，方程 $ax+by=g$ 的一组解是 $(x_0,y_0)$ ，则当 c 是 g 的倍数时， $ax+by=c$ 的一组解是 $(cx_0/g, cy_0/g)$ ；当 c 不是 g 的倍数时无整数解。

## 通过欧几里得算法计算两个正整数的最大公约数

```cpp
gg gcd(gg a, gg b) { return b == 0 ? a : gcd(b, a % b); }
```

## 扩展欧几里得算法求解方程 ax+by=gcd(a,b)的一组整数解，并返回 gcd(a,b)的值

```cpp
//返回{gcd(a,b),x,y}，x,y是方程ax+by=gcd(a,b)的一组解
array<gg, 3> extendGcd(gg a, gg b) {
    if (b == 0) {
        return {a, 1, 0};
    }
    auto d = extendGcd(b, a % b);
    return {d[0], d[2], d[1] - (a / b) * d[2]};
}
//返回方程ax+by=c的解中x的最小非负整数值
gg getMinX(gg a, gg b, gg c) {
    auto d = extendGcd(a, b);
    return (c / d[0] * d[1] % (b / d[0]) + b / d[0]) % (b / d[0]);
}
```

## 数学/欧拉函数.md

# 欧拉函数

欧拉函数 $\varphi (n)$ 的值是小于等于 n 且与 n 互质的正整数个数。注意，1 与任何正整数都互质，所以 $\varphi (1)=1$ 。

## 欧拉函数的性质

1. 欧拉函数是积性函数，即如果有 $gcd(a,b)=1$ ，则 $\varphi (ab)=\varphi (a)\cdot \varphi (b)$ 。
2. $n=\sum_{d|n} \varphi (d)$
3. 由唯一分解定理，若 $n=\prod_{i=1}^s p_i ^{k_i}$ ，其中 $p_i$ 是质数，则 $\varphi (n)=n \cdot \prod _{i=1}^s \frac {p_i-1} {p_i}$ 。特别地， $\varphi (p^k)=p^k-p^{k-1}$ 。

## 求 n 的欧拉函数值

算法的时间复杂度为 $O(\sqrt n)$ 。

```cpp
gg euler_phi(gg n) {
    gg m = (gg)sqrt(n + 0.5), ans = n;
    for (gg i = 2; i <= m; i++)
        if (n % i == 0) {
            ans = ans / i * (i - 1);
            while (n % i == 0)
                n /= i;
        }
    if (n > 1)
        ans = ans / n * (n - 1);
    return ans;
}
```

## 求 1~n 的欧拉函数值

算法的时间复杂度为 $O(n \log \log n)$ 。

```cpp
gg phi[MAX];
void phi_table(gg n) {
    for (gg i = 2; i <= ni; i++) {
        phi[i] = 0;
    }
    phi[1] = 1;
    for (gg i = 2; i <= ni; i++) {
        if (phi[i] == 0) {
            for (gg j = i; j <= ni; j += i) {
                if (phi[j] == 0)
                    phi[j] = j;
                phi[j] = phi[j] / i * (i - 1);
            }
        }
    }
}
```

## 数学/素数.md

# 素数

## 用暴力方法判断 n 是否为素数

算法的时间复杂度为 $O(\sqrt n)$

```cpp
bool isPrime(gg n) {
    if (n < 2) {
        return false;
    }
    for (gg i = 2; i * i <= n; ++i) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}
```

## 利用埃氏筛法求解 [2,n) 以内的所有数字的一个质因子

算法的时间复杂度为 $O(n\log \log n)$

```cpp
// prime[i]表示i的一个质因子，若prime[i]==0，表示i是一个素数
gg prime[MAX];
void getPrime(gg n) {
    for (gg i = 2; i * i <= n; ++i) {
        if (prime[i] == 0) {
            for (gg j = i + i; j < n; j += i) {
                prime[j] = i;
            }
        }
    }
}
```

## 数学/组合数.md

# 组合数

## 求 $C_n^k$

```cpp
gg C[MAX];
void Cvalue(gg n){
    C[0] = 1;
    for (gg i = 1; i <= n; ++i){
        C[i] = C[i - 1] * (n - i + 1) % mod * powMod(i, mod - 2, mod) % mod;
    }
}
```

## 求 1~n 内所有的 $C_n^k$ 的值

```cpp
gg C[MAX][MAX];
void Cvalue(gg n){
    for (gg i = 0; i <= n; ++i) {
        C[i][0] = 1;
        for (gg j = 1; j <= i; ++j){
            C[i][j] = (C[i - 1][j - 1] + C[i - 1][j]) % mod;
        }
    }
}
```

## 小球放盒子问题

放球问题是指把 n 个球放到 m 个盒子里的方案数，可分成 16 个子问题。不同情况总结见下表[^1]。

![放球问题 16 个子问题总结](../media/BallPlacementProblem.jpg)

[^1]: https://baike.baidu.com/item/%E6%94%BE%E7%90%83%E9%97%AE%E9%A2%98/12740706

## 数学/进制转换.md

# 进制转换

## 用除基取余法将十进制数转换成 R 进制数

算法的时间复杂度为 $O(\log_{R}n)$

```cpp
// n 为要转换的十进制数，R 为要转换的进制
//返回用 vector<gg>存储的转换成的 R 进制数
vector<gg> decToR(gg n, gg R) {
    vector<gg> ans;  //存储 R 进制数
    do {
        ans.push_back(n % R);  //取余
        n /= R;  //除基
    } while (n != 0);  // n==0 时跳出循环
    reverse(begin(ans), end(ans));  //翻转整个数组
    return ans;
}
```

## 将 R 进制数转换成十进制数

算法的时间复杂度为 $O(n)$

```cpp
// R 为转换的进制，r 为要存储在 vector<gg>中的转换的 R 进制数，n为r的元素个数
//返回对应的十进制数
gg rToDec(const vector<gg>& r, gg R) {
    gg d = 0;
    for (gg i : r)
        d = d * R + i;
    return d;
}
```

## 数学/高精度整数运算.md

# 高精度整数四则运算

一般情况下，如果要用到高精度运算，最好使用 python 语言编写程序，因为 python 语言本身的整数类型就自带高精度运算。

## 高精度与高精度的加法

```cpp
//默认输入的a和b均为非负整数
string Plus(const string& a, const string& b) {
    string ans;
    gg carry = 0;  //进位
    for (gg i = a.size() - 1, j = b.size() - 1; i >= 0 || j >= 0 || carry != 0; --i, --j) {
        gg p1 = i >= 0 ? a[i] - '0' : 0, p2 = j >= 0 ? b[j] - '0' : 0;
        gg k = p1 + p2 + carry;
        ans.push_back(k % 10 + '0');
        carry = k / 10;
    }
    reverse(begin(ans), end(ans));  //要进行翻转
    return ans;
}
```

## 高精度与高精度的减法

```cpp
//默认输入的a和b均为非负整数，且a>=b
string Sub(string a, const string& b) {
    string ans;
    for (gg i = a.size() - 1, j = b.size() - 1; i >= 0 || j >= 0; --i, --j) {
        gg p1 = i >= 0 ? a[i] - '0' : 0, p2 = j >= 0 ? b[j] - '0' : 0;
        if (p1 < p2) {  //不够减，要借位
            a[i - 1]--;
            p1 += 10;
        }
        gg k = p1 - p2;
        ans.push_back(k % 10 + '0');
    }
    ans.erase(ans.find_last_not_of('0') + 1, ans.size());
    reverse(begin(ans), end(ans));  //要进行翻转
    return ans.empty() ? "0" : ans;
}
```

## 高精度与高精度的乘法

```cpp
//默认a和b均为非负整数
string Multiply(const string& a, const string& b) {
    gg m = a.size(), n = b.size();
    string ans(n + m, '0');  //最终乘积最多有n+m位
    for (gg i = m - 1; i >= 0; --i) {
        for (gg j = n - 1; j >= 0; --j) {
            gg k = (a[i] - '0') * (b[j] - '0');
            gg t = k + (ans[i + j + 1] - '0');
            ans[i + j] += t / 10;  //向乘积的i+j位进位
            ans[i + j + 1] = t % 10 + '0';  //填充乘积的i+j+1位
        }
    }
    ans.erase(0, ans.find_first_not_of("0"));  //删除前导0
    return ans.empty() ? "0" : ans;
}
```

## 高精度与低精度的除法

```cpp
//默认a为非负整数，b为正整数
pair<string, gg> DivMod(const string& a, gg b) {
    string ans;  //商
    gg mod = 0;  //余数
    for (char c : a) {
        mod = c - '0' + mod * 10;
        ans.push_back(mod / b + '0');
        mod %= b;
    }
    ans.erase(0, ans.find_first_not_of('0'));  //删除多余的前导0
    return {ans.empty() ? "0" : ans, mod};
}
```

## 高精度与低精度的取模运算

```cpp
//默认a为非负整数，b为正整数，返回a%b
gg Mod(const string& a, gg b) {
    gg ans = 0;
    for (char c: a){
        ans = ((ans * 10 + c - '0') % m);
    }
    return ans;
}
```

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
