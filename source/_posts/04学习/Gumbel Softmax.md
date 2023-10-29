---
title: 重参数化与Gumbel-Softmax
date: 2023-10-29 23:06:58
tags: RL
categories:
- DRL
---

> 研究SAC的时候没搞太懂，花了好几天研究这个问题，记录一下

参考：

[漫谈重参数：从正态分布到Gumbel Softmax - 科学空间|Scientific Spaces (kexue.fm)](https://kexue.fm/archives/6705)

[VAE中的重参数化技巧-reparameterization trick - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/344938643)

<!-- more -->

# 引入

考虑形如下形式的损失函数：
$$
\mathbb{E} _{p(z)}[f_\theta (z)]
$$
在连续问题或z的取值空间很大的离散问题中，我们很难或者不可能遍历所有的z，因此需要采样(Monte Carlo)。



若z的分布与我们需要求梯度的参数$\theta$无关，则：
$$
\nabla_\theta \mathbb{E}_{p(z)}[f_\theta (z)]=\nabla_\theta[\int _zp(z)f_\theta(z)dz]\\
= \int_zp(z)[\nabla_\theta f_\theta(z)]dz\\=\mathbb{E}_{p(z)}[\nabla_\theta f_\theta(z)]
$$


然而，若问题变为：
$$
\mathbb E_{p_\theta (z)}[f_\theta(z)]
$$
计算梯度：
$$
\nabla _\theta \mathbb{E} _{p_\theta(z)}[f_\theta (z)] = \nabla _\theta[\int _zp_\theta(z)f_\theta(z)dz]\\ =\int_z\nabla_\theta[p_\theta(z)f_\theta(z)]dz\\
= \int_zf_\theta(z)\nabla_\theta p_\theta(z)dz+\int_zp_\theta(z)\nabla_\theta f_\theta (z) dz
$$
由于我们需要计算分布p的梯度，第一项无法变成期望的形式，因此也无法进行采样。



为了解决这个问题，可以使用**重参数化技巧与Gumbel-Softmax**



# Reparameterization

## 原理

考虑连续情况：
$$
L_\theta=\int _zp_\theta(z)f(z)dz
$$
我们需要在进行采样的同时保留$\theta$的梯度，为此，我们考虑先从无参分布q中进行采样，然后通过某种变换生成z：
$$
\epsilon \sim q(\epsilon)\\
z=g_\theta(\epsilon)
$$
此时式子变为：
$$
L_\theta=\mathbb E_{\epsilon\sim q(\epsilon)}[f(g_\theta(\epsilon))]
$$
此时我们把随机采样和梯度传播解耦了，可以直接反向传播loss



## 实现

以SAC为例，原本需要从$ \mathcal{N} (\mu_\theta, \sigma^2_\theta) $中进行抽样。我们进行重参数化：
$$
\epsilon\sim\mathcal N(0,1)\\
z=\epsilon\times\sigma_\theta+\mu_\theta\\
\Rightarrow L_\theta=\mathbb E_{\epsilon\sim\mathcal N(0,1)}[f(\epsilon\times\sigma_\theta+\mu_\theta)]
$$
然后就可以直接进行反向传播更新网络参数



# Gumbel-Softmax

## 原理

现在我们考虑离散情况：
$$
L_\theta=\sum_yp_\theta(y)f(y)
$$
显然我们是可以通过这个求和操作直接计算出Loss的，

然而若取值空间非常巨大，我们依旧需要通过采样来估算这个期望。



和上文一样，我们考虑如何分离随机采样：

**引入Gumbel-Max：**
$$
\mathop{\arg\max}_i(\log p_i-\log(-\log\epsilon_i))_{i=1}^k,\ \epsilon_i\sim U[0,1]
$$
现在已经通过这个一样重参数过程将随机性转移到了均匀分布上，但是由于我们使用了不可导的argmax，还是会丢失梯度信息。

**因此，我们引入其光光滑似版本，Gumbel-Softmax：**
$$
\mathop{softmax}_i((\log p_i-\log(-\log\epsilon_i)/\tau)_{i=1}^k,\ \epsilon_i\sim U[0,1]
$$
tau为退火参数，越小则输出越接近One-Hot输出，然而此时会导致梯度消失。因此训练时可以从1开始，慢慢衰减。



## 证明

要证明Gumbel-Max抽样和原始分布一样，需要证明输出i的概率为pi，此处证明输出1的概率为p1，即：
$$
\log p_1 -\log(-\log \epsilon_1)>\log p_i-\log (-\log \epsilon_i)\ ,\forall i\neq1
$$
化简得：
$$
\epsilon_i<\epsilon_1^{p_i/p_1}\leq1
$$
成立概率为：
$$
\epsilon _1^{(p_2+p_3+\cdots+p_k)/p_1}=\epsilon^{(1/p_1)-1}
\\
\int_0^1\epsilon_1^{(1/p_1)-1}d\epsilon_1=p_1
$$

证毕。



## 实现

>  pytorch自带Gumbel-Softmax函数，看看代码

```python
gumbels = (
        -torch.empty_like(logits, memory_format=torch.legacy_contiguous_format).exponential_().log()
    )  # ~Gumbel(0,1)
    gumbels = (logits + gumbels) / tau  # ~Gumbel(logits,tau)
    y_soft = gumbels.softmax(dim)

    if hard:
        # Straight through.
        index = y_soft.max(dim, keepdim=True)[1]
        y_hard = torch.zeros_like(logits, memory_format=torch.legacy_contiguous_format).scatter_(dim, index, 1.0)
        ret = y_hard - y_soft.detach() + y_soft
    else:
        # Reparametrization trick.
        ret = y_soft
    return ret
```

我们看到，pytorch除了输出类似One-Hot版本，还支持一个hard模式，这步` ret = y_hard - y_soft.detach() + y_soft`通过分离计算图的方式让前向传播和反向传播不同，反向传播时仍然计算的是`y_soft`的梯度。
