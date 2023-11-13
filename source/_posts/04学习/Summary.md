---
title: 近期总结-离散情况下的SAC
date: 2023-11-14 00:25:45
tags: RL
categories:
- DRL
---

之前花了点时间研究离散动作空间下的SAC算法，把学到的一些东西总结一下。。


<!-- more -->
# 离散SAC

## 朴素离散SAC

[Soft Actor-Critic For Discrete Action Settings](https://arxiv.org/pdf/1910.07207.pdf)

基于连续SAC算法提出了离散版本SAC，具体改动如下：

- Actor网络由输出分布的std和mean改为输出每个动作的概率
- Critic网络映射由$Q:S\times A\rightarrow \mathbb R$改为$Q:S\rightarrow\mathbb R^{|A|}$，即输出选择每个动作的预估Reward
- 不再使用重参数化采样预估Loss期望，而是通过遍历每个动作的概率直接计算期望



## 大动作空间

> 若动作为离散空间，然而其动作维度较高或者动作空间较大，该如何解决

### 转为连续问题

[Deep Reinforcement Learning in Large Discrete Action Spaces]([arxiv.org/pdf/1512.07679.pdf](https://arxiv.org/pdf/1512.07679.pdf))

离散动作空间较大或高维时，难以对每个动作的价值进行评估。该论文提出一种方法，用于解决这个问题：

- 首先Actor生成一个原始动作$S \rightarrow \mathbb R^n$，该原始动作可能是不包含在有效动作空间内的
- 计算原始动作到动作空间的k-近邻，找到k个离原始动作最近的有效动作，可以在对数复杂度内解决
- 评估该k个动作的价值，选最好的作为输出动作

k也可以直接设置为1，直接映射动作输出



### Gumbel-Softmax

使用另外一种重参数化技巧，与连续SAC问题一样操作，具体内容在[这里](https://pophirasawa.top/2023/10/29/04学习/Gumbel%20Softmax/)



# 离散SAC优化

## 映射连续值

[Soft Actor-Critic With Integer Actions](https://arxiv.org/pdf/2109.08512.pdf)

Gumbel-Softmax输出的动作为soft-one-hot编码，该论文将离散动作映射为一个低维连续值，简化输出：
$$
a= \left< [0,1,\cdots,n-1],\vec a\right>
$$
这样可以降低维度，而且不影响性能



## Revisiting Discrete Soft Actor-Critic

[Revisiting Discrete Soft Actor-Critic](http://export.arxiv.org/pdf/2209.10081v2)

该文章认为离散SAC效果不好的原因为：

- 动作离散导致Policy变化剧烈，Q学习不稳定，进而恶化Policy学习
- Q网络低估真实价值导致悲观探索，令其陷入局部最优

为了解决这些问题，其提出以下优化

### Entropy-Penalty

为了减少Policy的变化程度，其在损失函数上增加了一项旧策略熵与新策略熵的MSE
$$
J_\pi(\phi)=\mathbb E_{s_t\sim D}\mathbb [E_{a_t\sim\pi_\phi}[\alpha \log(\pi_\phi(a_t|s_t))-Q_\theta(s_t,a_t)]]+\beta\cdot\frac{1}{2}(\mathbb H_{\pi_{old}}-\mathbb H_\pi)^2
$$
该惩罚项增加了离散SAC的稳定性



### Average Q-learning and Q-clip

- SAC通常使用双Q网络，将两个Q网络输出值取min。为了减轻悲观探索，将min改为average，拉高Q网络对动作的评估

- Q-clip以PPO为启发，限制每次Q网络更新的幅度，令其更加稳定



