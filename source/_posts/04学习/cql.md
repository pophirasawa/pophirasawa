---
title: CQL-保守Q学习
date: 2023-07-25 08:44:45
tags: RL
categories:
- DRL
---
> 记录一下读论文的情况喵
# 引入

**[参数]** $(\mathcal{S,A},T,r,\gamma)$

动作、状态空间，$T(\mathbf{s'|s,a})$转移，$r(\mathbf{s,a})$回报，$\pi_\beta(\mathbf{a|s})$数据集行为策略，$\mathcal{D}$数据集，$d^{\pi_\beta}(\mathbf{s})$折扣边缘状态分布

$\mathcal{D}$从$d^{\pi_\beta}(\mathbf{s})\pi_\beta(\mathbf{a|s})$中抽样

一个基本的迭代方式如下


$$
\hat{Q}^{k+1} \leftarrow \arg \min _{Q} \mathbb{E}_{\mathbf{s}, \mathbf{a},\mathbf{s'} \sim \mathcal{D}}\left[\left(r(\mathbf{s}, \mathbf{a})+\gamma{\mathbb{E}}_{\mathbf{a}'\sim\hat\pi^k(\mathbf{a'|s'})} [\hat{Q}^{k}(\mathbf{s'}, \mathbf{a'})]-Q(\mathbf{s,a}))\right)^2 \right]\\
$$

$$
\hat \pi^{k+1}\leftarrow \arg \max _{\pi} \mathbb{E}_{\mathbf{s}\sim \mathcal{D},\mathbf{a}\sim\pi^k(\mathbf(a|s))}[\hat Q^{k+1}(\mathbf{s,a})]
$$

**[问题]** 对状态-动作对采样不充分导致sample error

<!-- more -->

# Bellman算子

我们知道，状态空间与动作空间均为集合，假设状态空间$\mathcal{S}$为$\{s_1,s_2,\cdots,s_n,\cdots\}$,动作空间$\mathcal{A}$为$\{a_1,a_2,\cdots,a_m,\cdots \}$，同时二者可以表示为一系列向量



**\[定义]** 值函数$\mathbf v_\pi:\mathcal S \rightarrow \mathbb R$，策略$\pi$下，从状态s开始到结束的回报期望

- 最优值函数$\mathbf v_*:\mathcal S \rightarrow \mathbb R$，$\mathbf v_*(s)=\max_\pi\mathbf v_\pi(s)$

**[定义]** $\mathcal R^a_s$：状态s做动作a得到的奖励的期望，$\mathcal P^a_{s,s'}$状态转移概率

- $\mathbf R_\pi(s)=\sum_{a\in\mathcal A}\pi(a|s)\cdot\mathcal R^a_s$
- $\mathbf P_\pi(s,s')=\sum_{a\in\mathcal A}\pi(a|s)\cdot\mathcal P ^a_{s,s'}$
- 同样可以用向量和矩阵考虑

**[Bellman Policy Operator]** $\mathbf B_\pi,$ $\mathbf B_\pi=\mathbf R_\pi + \gamma\mathbf P_\pi\cdot\mathbf v$

- 为线性算子，存在不动点$\mathbf{v_\pi},s.t.\mathbf{B_\pi v_\pi=v_\pi}$

**[Bellman Optimality Operator]** $\mathbf B_*,$ $\mathbf {B_*v}(s)=\max _a\{\mathcal R^a_s+\gamma\sum_{s'\in\mathcal S}\mathcal P^a_{s,s'}\cdot\mathbf v(s')\}$

- 同样存在不动点

**[贪心策略算子]** $\mathbf G,$ $\mathbf {G}(\mathbf v(s))=\arg\max _a\{\mathcal R^a_s+\gamma\sum_{s'\in\mathcal S}\mathcal P^a_{s,s'}\cdot\mathbf v(s')\}$

**[性质]** $\mathbf B_\pi，\mathbf B_*$均具有唯一不动点(巴拿赫不动点定理)，且最终收敛至不动点

**[值迭代]** $\lim_{n\rightarrow\infty}\mathbf{B^N_\pi} \mathbf{v=v_\pi}$


**[策略迭代]** 迭代过程为$\pi_{k+1}=\mathbf G(\mathbf v_{\pi_k})$

> 原理：由$\mathbf{B_*v_{\pi_k}}=\mathbf B_{\mathbf G(\pi_k)}\mathbf v_{\pi_k}=\mathbf B_{\pi_{k+1}}\mathbf v_{\pi_k}$，有$\mathbf{B_*v_{\pi_k}}\ge \mathbf{B_{\pi_k}v_{\pi_k}}= \mathbf{v_{\pi_k}}$
>
> 所以$\mathbf{B^N_{\pi_{k+1}}v_{\pi_k}}=\mathbf v_{\pi_{k+1}}\ge \mathbf{B_{\pi_k}v_{\pi_k}}= \mathbf{v_{\pi_k}}$，说明这是一个不断优化的过程

由于$\mathbf B_*$有唯一不动点$\mathbf v_*,s.t.\mathbf {B_*v_*=v_*}$，且单增

因此$\lim_{n\rightarrow\infty}\mathbf{B^N_*} \mathbf{v=v_*}$，可以考虑直接迭代



# 保守Q学习-CQL

## Policy Evaluation

为了防止高估价值，在原MSE式子的基础上让他最小化Q值来学习保守的下限的Q函数，相当于添加一个惩罚项来让Q函数没那么大

具体来说，我们考虑一个特定的动作-状态分布$\mu(\mathbf{s,a})$，最小化该分布下的Q函数。由于普通Q函数的训练过程中不会查询未出现过状态下的Q函数值，只查询未出现过动作下的值，令$\mu$匹配数据集，有

$$
\mu{(\mathbf{s,a})}=d^{\pi_\beta}(\mathbf{s})\mu(\mathbf{a|s})
$$

考虑权衡因子$\alpha$,我们得到policy evaluation

$$
\hat{Q}^{k+1} \leftarrow \arg \min _{Q} \alpha \mathbb{E}_{\mathbf{s} \sim \mathcal{D}, \mathbf{a} \sim \mu(\mathbf{a} \mid \mathbf{s})}[Q(\mathbf{s}, \mathbf{a})]+\frac{1}{2} \mathbb{E}_{\mathbf{s}, \mathbf{a} \sim \mathcal{D}}\left[\left(Q(\mathbf{s}, \mathbf{a})-\hat{\mathcal{B}}^{\pi} \hat{Q}^{k}(\mathbf{s}, \mathbf{a})\right)^{2}\right] 
$$

通过再添加一项，我们能大大收紧这个下界：

$$
\hat{Q}^{k+1} \leftarrow \arg \min _{Q} \alpha \cdot(\mathbb{E}_{\mathbf{s} \sim \mathcal{D}, \mathbf{a} \sim \mu(\mathbf{a} \mid \mathbf{s})}[Q(\mathbf{s}, \mathbf{a})]-{\color{red}\mathbb{E}_{\mathbf{s} \sim \mathcal{D}, \mathbf{a} \sim \hat{\pi}_\beta(\mathbf{a} \mid \mathbf{s})}[Q(\mathbf{s}, \mathbf{a})]})\\+\frac{1}{2} \mathbb{E}_{\mathbf{s}, \mathbf{a} \sim \mathcal{D}}\left[\left(Q(\mathbf{s}, \mathbf{a})-\hat{\mathcal{B}}^{\pi} \hat{Q}^{k}(\mathbf{s}, \mathbf{a})\right)^{2}\right] \\
$$

~~原理看不懂，貌似是考虑了采样的集中性质~~

此时在$\mu=\pi$时，该式给出了策略$\pi$下的预期值的限制

**[结论]** 式子给出了一个真实Q函数的下限，而且数据越多，保证下界的$\alpha$值减小

## CQL

考虑优化策略，由于式2要求$\mu=\pi$，我们可以考虑每次迭代$\hat\pi^k$后迭代式2得到Q值，然而这样计算开销过大

因此考虑使用$\mu$近似那个能最大化当前Q函数迭代的策略

因此对式2修正为
$$
\min _{Q} \max_{\mu}\alpha \cdot(\mathbb{E}_{\mathbf{s} \sim \mathcal{D}, \mathbf{a} \sim \mu(\mathbf{a} \mid \mathbf{s})}[Q(\mathbf{s}, \mathbf{a})]-{\color{black}\mathbb{E}_{\mathbf{s} \sim \mathcal{D}, \mathbf{a} \sim\hat{\pi}_\beta(\mathbf{a} \mid \mathbf{s})}[Q(\mathbf{s}, \mathbf{a} ) ] } ) \\+\frac{1}{2} \mathbb{E}_{\mathbf{s}, \mathbf{a} \sim \mathcal{D}}\left[\left(Q(\mathbf{s}, \mathbf{a})-\hat{\mathcal{B} }^{\pi} \hat{Q}^{k}(\mathbf{s}, \mathbf{a})\right)^{2}\right] +\mathcal{R}(\mu)
$$
$$

$$

其中$\mathcal{R}(\mu)$为正则项，防止过拟合

考虑使用KL散度作为正则项，计先验分布$\rho(\mathbf{a|s})$，则有$\mathcal R(\mu)=-D_{KL}(\mu,\rho)$

两个想法是把这个先验分布设置成均匀分布或者$\hat\pi^{k-1}$的分布

**[正则化]** 由于先要找到$\mu$令式子最大，$\mathcal{R}(\mu)$能减少分布的方差，防止过拟合
