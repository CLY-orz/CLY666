---
title: 字符串
date: 2026-10-21 20:56:39
description: KMP、字典树、最长回文子串、字符串分割等字符串模板
layout: post
math: true
---

> 本页收录 **字符串** 模块的全部模板代码，共 4 个文件 / 5 段代码，来源：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) 的 `字符串` 目录。

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

1. `字符串/KMP算法.cpp`
2. `字符串/分割字符串.cpp`
3. `字符串/字典树Trie.md`
4. `字符串/最长回文子串.md`

---

## 字符串/KMP算法.cpp

```cpp
void getNext(string pattern,LL*next){
    LL j=-1;
    next[0]=-1;
    for(LL i=1;i<pattern.size();++i){
        while(j!=-1&&pattern[i]!=pattern[j+1])
            j=next[j];
        if(pattern[i]==pattern[j+1])
            ++j;
        next[i]=j;
    }
}
bool KMP(string text,string pattern){
    LL next[pattern.size()];
    getNextval(pattern,next);
    for(LL i:next)
        prLLf("%d ",i);
    LL j=-1;
    for(LL i=0;i<text.size();++i){
        while(j!=-1&&text[i]!=pattern[j+1])
            j=next[j];
        if(text[i]==pattern[j+1])
            ++j;
        if(j==pattern.size()-1)
            return true;
    }
    return false;
}
void getNextval(string pattern,LL*next){
    LL j=-1;
    next[0]=-1;
    for(LL i=1;i<pattern.size();++i){
        if(j!=-1&&pattern[i]!=pattern[j+1])
            j=next[j];
        if(pattern[i]==pattern[j+1])
            ++j;
        if(j==-1||pattern[i+1]!=pattern[j+1])
            next[i]=j;
        else
            next[i]=next[j];
    }
}
LL KMPcount(string text,string pattern){
    LL next[pattern.size()];
    getNextval(pattern,next);
    for(LL i:next)
        prLLf("%d ",i);
    LL j=-1,result=0;
    for(LL i=0;i<text.size();++i){
        while(j!=-1&&text[i]!=pattern[j+1])
            j=next[j];
        if(text[i]==pattern[j+1])
            ++j;
        if(j==pattern.size()-1){
            ++result;
            j=next[j];
        }
    }
    return result;
}
```

## 字符串/分割字符串.cpp

```cpp
vector<string> split(const string& s, string c = " ") {
    vector<string> ans;
    for (gg i = 0, j = 0; i < s.size(); i = j + 1) {
        j = s.find(c, i);
        if (j == string::npos)
            j = s.size();
        ans.push_back(s.substr(i, j - i));
    }
    return ans;
}
```

## 字符串/字典树Trie.md

# Trie

## 字符串 Trie

```cpp
class Trie {
  public:
    Trie() : root(new TrieNode()) {}
    //插入一个单词
    void insert(const string& word) {
        auto i = root;
        for (char c : word) {
            if (not i->children.count(c)) {
                i->children[c] = new TrieNode();
            }
            i = i->children[c];
        }
        ++i->count;
    }
    //查找一个单词
    bool search(const string& word) {
        auto i = root;
        for (char c : word) {
            if (not i->children.count(c)) {
                return false;
            }
            i = i->children[c];
        }
        return i->count > 0;  //如果是查找前缀把这条语句换成return true;就可以了
    }

  private:
    struct TrieNode {
        gg count = 0;  //该结点代表的单词个数,count>0表示这是一个单词结点
        map<char, TrieNode*> children;
    };
    TrieNode* root;
};
```

## 01-Trie

```cpp
template <gg bits = 32>
class Trie {
  public:
    Trie() : root(new TrieNode()) {}
    //插入一个不超过bits位的非负整数
    void insert(gg n) {
        const bitset<bits>& bin(n);
        auto i = root;
        for (gg j = bits - 1; j >= 0; --j) {
            if (not i->children[bin[j]]) {
                i->children[bin[j]] = new TrieNode();
            }
            i = i->children[bin[j]];
        }
    }
    void remove(gg n) {
        const bitset<bits>& bin(n);
        root = dfs(root, bin, bits - 1);
    }
    //与 n 异或的最大值
    gg search(gg n) {
        const bitset<bits>& bin(n);
        auto i = root;
        gg ans = 0;
        for (gg j = bits - 1; j >= 0; --j) {
            gg k = bin[j] ? 0 : 1;
            if (i->children[k]) {
                ans = ans * 2 + 1;
                i = i->children[k];
            } else {
                ans <<= 1;
                i = i->children[k ^ 1];
            }
        }
        return ans;
    }

  private:
    struct TrieNode {
        TrieNode* children[2]{};
    };
    TrieNode* root;
    TrieNode* dfs(TrieNode* r, const bitset<bits>& bin, int p) {
        if (p < 0) {
            return nullptr;
        }
        r->children[bin[p]] = dfs(r->children[bin[p]], bin, p - 1);
        if (not r->children[0] and not r->children[1]) {
            return nullptr;
        } else {
            return r;
        }
    }
};
```

## 字符串/最长回文子串.md

# 最长回文子串

## 问题描述

给你一个字符串 `s`，找到 `s` 中最长的回文子串。如果字符串的反序与原始字符串相同，则该字符串称为回文字符串。

## 思路

可用 Manacher 算法求解，时间复杂度为 $O(n)$ 。

```cpp
string longestPalindrome(string& s) {
    string news = "$#";
    for (gg i = 0; i < s.size(); ++i)
        news = news + s[i] + "#";
    vector<gg> p(news.size(), 1);
    gg x = 0, xr = 0;
    for (gg i = 1; i < news.size(); ++i) {
        if (i < xr)
            p[i] = min(xr - i, p[2 * x - i]);
        while (i + p[i] < news.size() && news[i - p[i]] == news[i + p[i]])
            ++p[i];
        if (xr < i + p[i]) {
            x = i;
            xr = i + p[i];
        }
    }
    gg k = max_element(begin(p) + 1, end(p)) - begin(p);
    return s.substr((k - p[k]) / 2, p[k] - 1);
}
```

---

> **代码来源**：[richenyunqi/code-templates](https://github.com/richenyunqi/code-templates) —— ACM、OI、OJ、PAT、CSP 常用代码模板。本页仅做搬运与格式整理，未改动任何代码逻辑，版权归原作者所有。
