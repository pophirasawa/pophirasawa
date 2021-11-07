---
title: hexo博客搭建教程(?
date: 2021-11-07 16:01:02
tags: hexo
category: 杂项
---

> 有咩有一种可能,这玩意是写来总结一下当时搭博客是有多么折磨的一件事的捏

介绍一下怎么用hexo搭建博客并部署

<!-- more -->

# 首先是作为准备工作的首先

## 下载安装

- 我们需要
    1. 装一个git工具
    2. 装一个node.js
    3. 装一个hexo

git工具和node.js直接去官网上下就行了捏

[DownloadGit](https://gitforwindows.org/)

[Node.js](https://nodejs.org/en/download/)

下好了之后我们就可以用Git带的gitbush工具开始整活了  

首先到你想作为blog的文件夹里右键打开gitbush，或者直接`cd`,输入

```bash
npm install -g hexo
```

之后可以用

```bash
hexo -v
```

来查版本号，看看是不是真的装好了，喜闻乐见了属于是  



## Github方面的工作

**新建仓库**

这个部分有2种

- 想使用Github pages功能来部署博客的，域名是 GitHub用户名+github.io
- 想使用cloudflare pages来部署的，域名是 自定+pages.dev

不过其实都行，反正最后可以自定义域名（

第一种：在github上新建一个仓库，仓库名字是 `你的Github用户名.github.io`，然后选public

第二种对仓库名没有要求。  



**SSH key**

>  这个部分是让每次push不用输账号密码了，省去了很多折磨的部分捏



首先在Gitbush里输入

```bash
git config --global user.name "yourname" 	// 你的Github用户名
git config --global user.email "youremail"	// 你的Github邮箱
```

然后创建SSH

```bash
ssh-keygen -t rsa -C "youremail"
```

然后他就会生成一个`.ssh`的文件夹，打开这个文件夹

找到`id_rsa.pub`，把里边的内容复制一哈

最后打开你的Github，找到setting里边有一个SSH keys，直接Add SSH key，把你复制的内容粘进去

用这个看看你有没有成功

```bash
ssh -T git@github.com
```

他应该会说

```bash
Hi XXX! You've successfully authenticated, but GitHub does not provide shell access.
```

---

# 其次是开始部署的其次

> 这里也有两种选择捏，顺带一提俺是部署到Cloudflare pages上边了

## 在本地使用hexo

> 不管怎么说，部署之前我们首先得在本地能跑吧

在你选定的文件夹里

```bash
hexo init myblog	//myblog叫啥都行
```

然后你会发现多了一个叫myblog的文件夹，这个就是你以后写博客，整活的根目录了

`cd`进这个文件夹

```bash
hexo g			//生成页面
hexo s			//在本地开启服务器预览
```

这时候你就可以在`localhost:4000`里看到自己的博客了，他有个预制

一般来说ctrl+c可以关掉服务，不行的话上cmd把占用了4000端口的进程kill掉也行

```bash
hexo s -p 5000	//可以把端口设定到5000，4000端口冲突了也能这样
```

----

然后就是激动人心的部署到网站上了捏，可以

- 部署到Github Pages
- 部署到Cloudflare Pages

## 部署到Github Pages

打开你hexo init新建的文件夹，找到`_config.yml`

在里边找到deploy，改一改

```yaml
deploy:
  type: git
  repo: https://github.com/YourgithubName/YourgithubName.github.io.git
  branch: master
  // repo里边把YourgithubName替换成你自己的
  // branch里边把master换成你那个仓库主分支的名字
```

然后还要装一个

```bash
npm install hexo-deployer-git --save	// 有时候装了新主题报错的话，把这个重新装一下就行了捏
```

最后就迎来了我们激动人心的时刻

```bash
hexo clean	// 清除原来生成在public里的文件
hexo g	// 生成
hexo d	// 部署
```

就可以了

---

## 部署到Cloudflare Pages

首先，在本地使用hexo的那部分都要搞，

**不用改deploy里边的东西**

然后，我们要注册一个[Cloudflare](https://dash.cloudflare.com/)的账号，点开`网页`选项，创建项目

按照提示绑上你的GitHub账号，选择你作为存博客的那个仓库，

然后自己定一个你要的项目名字，他会部署到 名字.pages.dev上边

构建选项这样写就完事儿了

![ee](/img/post/hexo.jpg)

**以后你每次就把整个文件夹push到你的Github上，他会自动构建，一个月有500次，完全够用了捏**

---

# 最后是个性化以及使用方法的最后

> 我们已经搞的差不多了，现在是不是该写自己的第一篇博客了？

输入

```bash
hexo n 博客名
```

你会发现在`source/_post`文件夹内出现了一篇markdown，就可以在里边写了捏

这时，好奇的你也许会发现他开头有个类似于

```markdown
---
title: xxx
date: 
tag: 
category: 
---
```

之类的东西，这个是标定一些你文章的属性的东西，具体来说其实还是要看你用的主题是如何规定的，自己查人主题文档去捏。

tag和category可以写多级,不过tag好像没有上下级的层次，category则是从上到下

```markdown
category:
- a
- b
```

这样就把你文章放在了a大类下的b小分类下

---

然后是各种个性化

换主题啊，自定义域名啊啥的，我懒得写了，自己上网查得了

找主题上https://hexo.io/themes/就行

