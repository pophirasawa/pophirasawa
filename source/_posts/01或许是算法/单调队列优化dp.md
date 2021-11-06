---
title: 单调队列优化多重背包
date: 2021-11-05 11:13:57
tags: DP
category: 
- 算法
- DP

---



> 补题补到了个树上背包，然后发现孩子不会。这次就打算把一些该学的背包都学一手？大概。
- 我们知道，对于多重背包，有一个二进制拆分优化，可以在$O(vlog(\sum{n[i]}))$级别的复杂度解决问题
- 然后单调队列优化可以跑到$O(nv)$



<!-- more -->

# 思路

- 首先我们考虑一下朴素的多重背包写法：

> 对于当前物品i，枚举选的个数n[i]，用于更新dp数组

然后我们能够发现这样一个神必规律：

dp[i]用于维护代价为i的最大价值，且当前考虑选的物品代价为v

则dp[i]只能够从dp[j]，当且仅当j mod v == i mod v 且选的个数不超过要求的点转移过来

也就是

- 当前在选第i个物品时


$$
dp[j+nv]=max(dp[j+(n-1)v+w,dp[j+(n-2)v+2w,....)
$$

- 改变一下形式

$$
dp[j+nv]=max(dp[j],dp[j+v]-w,dp[j+2v]-2w,...)+nw
$$



当然，因为有个数的限制，他选定的是一定区间里边的最大值，这个就给我们跑单调区间留下了伏笔捏

# CODE

```c++
#include<iostream>
#include<stdio.h>
#include<cstring>
#include<vector>
#include<math.h>
#include<algorithm>
#include <stdio.h>
#include <queue>
#include<bitset>
#include<map>
using namespace std;
typedef long long ll;
typedef unsigned long long ull;
ll N, V;
ll f[20000 + 5];
ll g[20000 + 5];
ll q[20000 + 5];
int main() {
	cin >> N >> V;
	for (int i = 0; i < N; i++) {
		ll v, w, s;
		cin >> v >> w >> s;
		memcpy(g, f, sizeof(f));
		for (int j = 0; j < v; j++) {
			ll l = 0, r = -1;
			for (int k = j; k <= V; k += v) {
				while (r >= l && (k - q[l]) > s * v)l++;// 判断区间长度是否超过
				while (r >= l && (g[q[r]] - (q[r] - j) / v * w) < (g[k] - (k - j) / v * w))r--;
				q[++r] = k;
				f[k] = max(g[k], g[q[l]] + (k - q[l]) / v * w);
			}
		}
	}
	ll ans = 0;
	for (int i = 0; i <= V; i++)ans = max(f[i], ans);
	cout << ans;
}
```

