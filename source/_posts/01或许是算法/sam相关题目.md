---
title: sam相关
date: 2021-11-25 02:43:31
tags: 
- SAM
category: 
- 算法
- 字符串
---

> 学完了这阴间玩意肯定得知道这玩意怎么用吧

**sam理论上可以**

- 子串endpos大小
- 子串endpod位置
- 在后缀link上跑dp
- 在自动机上跑dp
- 统计有多少个子串经过一个点
- 二分

<!-- more -->

然后就是题目呗

## P3975 [TJOI2015]弦论

> 给定字符串，求找到字典序第k大的子串
> 有两种询问：相同子串就算1个和每个子串都算一个的

首先把endpos大小跑出来

如果相同子串只算1个，那么子串到每个状态的贡献只有1，不然就是endpos大小。endpos大小可以把状态按len排序然后从大到小更新就行。

然后跑一下dfs，统计从点i开始的有多少个字符串

最后按字典序从自动机上跑就行

```c++
#include<iostream>
#include<map>
#include<stdio.h>
#include<cstring>
#include<string>
#include<vector>
#include<algorithm>
using namespace std;
typedef long long ll;
const ll MAXN =6e5 + 500;
string s;
ll k, t;
struct NODE {
	int ch[26] = {};
	ll fa = 0, len = 0;
	//NODE() { memset(ch, 0, sizeof(ch)); fa = 0, len = 0; }
}sam[MAXN << 1];
ll lst = 1, tot = 1;
ll f[MAXN << 1];
bool vis[MAXN << 1];
ll sz[MAXN << 1];
ll A[MAXN << 1];
void add(ll c) {
	ll p = lst;
	ll np = lst = ++tot;
	f[np] = 1;
	sam[np].len = sam[p].len + 1;
	for (; p && !sam[p].ch[c]; p = sam[p].fa)sam[p].ch[c] = np;
	if (!p)sam[np].fa = 1;
	else {
		ll q = sam[p].ch[c];
		if (sam[q].len == sam[p].len + 1)sam[np].fa = q;
		else {
			ll nq = ++tot; sam[nq] = sam[q];
			sam[nq].len = sam[p].len + 1;
			sam[q].fa = sam[np].fa = nq;
			for (; p && sam[p].ch[c] == q; p = sam[p].fa)sam[p].ch[c] = nq;
		}
	}
}
ll dfs(ll p) {
	if (vis[p])return sz[p];
	vis[p] = 1;
	ll tmp = f[p];
	for (int i = 0; i < 26; i++)
		if (sam[p].ch[i])
			tmp += dfs(sam[p].ch[i]);
	return sz[p] = tmp;
}
void solve(ll p) {
	if (k > sz[p]) {
		printf("%d", -1);
		return;
	}
	if (k <= f[p])return;
	k -= f[p];
	for (int i = 0; i < 26; i++) {
		if (!sam[p].ch[i])continue;
		if (sz[sam[p].ch[i]] < k)k -= sz[sam[p].ch[i]];
		else {
			printf("%c", i + 'a');
			solve(sam[p].ch[i]);
			return;
		}
	}

}
bool cmp(ll &a, ll &b) {
	return sam[a].len < sam[b].len;
}
int main() {
	cin >> s;
	for (int i = 0; i < s.length(); i++) {
		add(ll(s[i]) - 'a');
	}
	scanf("%lld %lld", &t, &k);
	if (t == 0)
		for (int i = 2; i <= tot; i++)f[i] = 1;
	else {
		for (int i = 0; i <= tot; i++)A[i] = i;
		sort(A + 1, A + tot + 1, cmp);
		for (int i = tot; i > 0; i--)f[sam[A[i]].fa] += f[A[i]];
	}
	f[1]=f[0] = 0;
	dfs(1);
	solve(1);
}
```



## SPOJ1811

> 求两个字符串里最长公共子串长度

把s建成后缀自动机

然后把t的前缀挨个加进去，其实就是看t的前缀的后缀能在s里最长是多少

假设当前t加入的字符是c，当前状态是v，若v有c的出边，ans直接++

如果没有，就一直找v的后缀link到有c的出边为止，ans=len+1了

如果这玩意到了0状态，就把他设回源点状态，ans=0

```c++
#include<stdio.h>
#include<iostream>
#include<algorithm>
#include<math.h>
#include<string>
using namespace std;
typedef long long ll;
const ll MAXN = 5e5 + 5;
struct NODE{
	int ch[26] = {};
	int len, fa;
}sam[MAXN << 1];
ll lst = 1, tot = 1;
string s1, s2;
void add(ll c) {
	ll p = lst; ll np = lst = ++tot;
	sam[np].len = sam[p].len + 1;
	for (; p && !sam[p].ch[c]; p = sam[p].fa)sam[p].ch[c] = np;
	if (!p)sam[np].fa = 1;
	else {
		ll q = sam[p].ch[c];
		if (sam[q].len == sam[p].len + 1)sam[np].fa = q;
		else {
			ll nq = ++tot; sam[nq] = sam[q];
			sam[nq].len = sam[p].len + 1;
			sam[q].fa = sam[np].fa = nq;
			for (; p && sam[p].ch[c] == q; p = sam[p].fa)sam[p].ch[c] = nq;
		}
	}
}
int main() {
	cin >> s1 >> s2;
	ll ans = 0;
	for (int i = 0; i < s1.length(); i++)add(s1[i] - 'a');
	ll v = 1, l = 0;;
	for (int i = 0; i < s2.length(); i++) {
		ll tmp = s2[i] - 'a';
		if (sam[v].ch[tmp]) {
			v = sam[v].ch[tmp];
			l++;
		}
		else {
			for (; v && !sam[v].ch[tmp]; v = sam[v].fa);
			if (v == 0) {
				l = 0, v = 1;
			}
			else {
				l = sam[v].len + 1;
				v = sam[v].ch[tmp];
			}
		}
		ans = max(ans, l);
	}
	cout << ans;
}
```

