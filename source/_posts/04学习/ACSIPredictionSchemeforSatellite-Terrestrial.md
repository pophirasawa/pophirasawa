---
title: 论文阅读笔记2024.4.12
date: 2024-04-12 23:14:12
tags: 信道预测
categories:
- 论文阅读
---
# A CSI Prediction Scheme for Satellite-Terrestrial Networks

**本文分析了CSI随仰角改变的变化趋势。使用GRU进行时序预测，GRU性能与LSTM类似，且计算性能开销低于LSTM**

## 问题：无附加信息的情况下预测CSI

物联网设备CSI预测问题:

- 在无附加信息(地面设备位置和低地轨道星历表等)的情况下预测CSI

- 对计算复杂度存在限制

- 低地轨道的上升方和下降方的仰角和相对位置具有不同的时间相关性。低地轨道上升侧和下降侧的CSI具有不同的时间相关性



Relatedworks:

- 基于参数的方法：
  - 参数模型[^1]，至少1999年就有。15年有适用于MIMO[^2]。将预测问题简化为参数估计问题。然而在卫星场景参数失效快
  - 统计方法，自回归模型
- 无参数方法：
  - LSTM，工作[^3]将**CSI差值**作为输入进行预测
  - ESN[^4]，开销相较于RNN更低。该工作考虑莱斯信道，不适用于NLoS

<!-- more -->

## GRU信道预测

建模：考虑了自由空间衰落、阴影衰落、小尺度衰落

- 阴影衰落和小尺度衰落都与**仰角**相关
- LoS概率基于3GPP，38.811

**分析了CSI值随仰角和UE运动的一系列变化趋势**

CSI实部虚部符号对有（+，+）、（+，-）、（-，+）和（-，-）四种状态

结论：对于移动 UE，CSI 符号对、CSI 绝对值的长期趋势及其移动方向有助于预测低地轨道仰角的时间相关性。

网络：输入过去一段时间的CSI序列，**直接预测之后第P个slot的CSI**

- 有四个GRU网络，对应不同的CSI符号对，根据输入CSI的均值符号对确定使用的GRU网络
- 使用DropOut，每个GRU都用所有的历史CSI序列作为输入
- **跟使用了轨道仰角作为额外输入的网络进行对比，性能相似**
  - 做了CSI测量误差对模型性能影响的分析
- Baseline[^3]



# 3GPP New Radio Precoding in NGSO Satellites: Channel Prediction and Dynamic Resource Allocation

**用卡尔曼滤波器做信道预测，然后分别研究了有无码本的联合带宽分配的预编码方法**

## 问题：数字透明载荷下的CSI预测+预编码设计

flexible multi-beam satellites

- 可完全控制点波束覆盖、频率分配和发射功率
- 预编码设计联合带宽和功率分配
- CSI预测必要

Relatedworks:

- 基于digital transparent payload灵活性能的一些研究。之前读过的深度学习的预测+混合波束成形[^5],

- 利用satellite-based terrestrial multiconnectivity(MC)的干扰管理[^6]和频谱共享方法[^7]
- 基于码本的预编码方法，用于减少信令开销[^8][^9]

## 卡尔曼滤波器+ZF/启发式搜索

建模：

- 对当前波束服务的K个用户分为G=K/N组，组内空间复用，组间应用不同正交频段
- N不大于4(3GPP基于码本预编码的建议)
- 给定**带宽和功率**约束最大化和速率

CSI预测：Kalman滤波器

- 对比：信道估计、移动平均

联合预编码：码本/无码本对应不同信令开销

- 无码本：TM8和TM9，zeroforcing改变问题为功率和带宽分配，问题为凸函数直接进行优化
- 有码本：TM5和TM8，启发式搜索对应码本组合

仿真部分有性能随信道相关性的变化

[^1]:J. B. Andersen, J. Jensen, S. H. Jensen, and F. Frederiksen, “Prediction of future fading based on past measurements,” in Proc. Gateway 21st Century Commun. Village, vol. 1, 1999, pp. 151–155.
[^2]:R. O. Adeogun, P. D. Teal, and P. A. Dmochowski, “Extrapolation of MIMO mobile-to-mobile wireless channels using parametric-modelbased prediction,” IEEE Trans. Veh. Technol., vol. 64, no. 10, pp. 4487–4498, Oct. 2015.
[^3]:Y. Zhu, X. Dong, and T. Lu, “An adaptive and parameter-free recurrent neural structure for wireless channel prediction,” IEEE Trans. Commun., vol. 67, no. 11, pp. 8086–8096, Nov. 2019.
[^4]:Y. Zhao, H. Gao, N. C. Beaulieu, Z. Chen, and H. Ji, “Echo state network for fast channel prediction in Ricean fading scenarios,” IEEE Commun. Lett., vol. 21, no. 3, pp. 672–675, Mar. 2017.
[^5]: Y. Zhang, A. Liu, P. Li, and S. Jiang, “Deep Learning (DL)-Based Channel Prediction and Hybrid Beamforming for LEO Satellite Massive MIMO System,” in IEEE Internet of Things Journal, vol. 9, no. 23, pp. 23705-23715, Dec. 2022
[^6]:N. Cassiau et al., “5G-ALLSTAR: Beyond 5G Satellite-Terrestrial MultiConnectivity,” in Proc. Joint European Conference on Networks andCommunications, 2022, pp. 148–153.
[^7]: N. Cassiau et al., “Satellite and Terrestrial Multi-Connectivity for 5G: Making Spectrum Sharing Possible,” in Proc. IEEE Wireless Commun.Netw. Conf., 2020, pp. 1-6
[^8]: M. Meng et al., “BeamRaster: A Practical Fast Massive MU-MIMO System With Pre-Computed Precoders,” in IEEE Transactions on Mobile Computing, vol. 18, no. 5, pp. 1014-1027, May 2019

[^9]: E. Sourour, “Codebook-based precoding for generalized spatial modulation with diversity,” in EURASIP J Wireless Com Network, 2019, 229(2019).
