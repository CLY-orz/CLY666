---
title: C++ 朴素快读
date: 2026-10-17T16:16:00.000+08:00
tags:
  - 快速读入
  - 技巧
categories:
  - 算法
---
# C++ 朴素快读

## 快读(int)

```cpp
inline int read()
{
    int x=0,f=1;
    char ch=getchar();
    while(!isdigit(ch)){
        if(ch=='-') f=-1;
        ch=getchar();
    }
    while(isdigit(ch)){
        x=x*10+(ch-'0');
        ch=getchar();
    }
    return x*f;
}
```

用法:`int n = read();`

---

## 要点

- `isdigit` → `#include <cctype>`
- `x=x*10+(ch-'0')` 字符转数字累加
- `f` 记负号,最后 `x*f`
- 别和 `cin` 混用,否则读乱
- `inline` 写不写都行,习惯问题
- 浮点读不了,用 `scanf("%lf")`
