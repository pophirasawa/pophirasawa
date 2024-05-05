---
title: Git大学习
date: 2024-05-05 16:30:11
tags: Git
---
> 玩了玩这个: [https://learngitbranching.js.org](https://learngitbranching.js.org/)


分支：

- `git branch <branchname>`创建新分支
- `git checkout <branchname>`切换到新分支
- `git checkout -b <branchname>`创建并切换
- `git branch -f <branchname1> <提交>`让分支名1强制指向提交

合并

- `git merge <branchname>`把分支合并到当前分支

- `git rebase <branchname>`把当前分支分叉的地方复制到目标分支上，建议别用

树上移动：

- `git checkout <提交的哈希值>`让HEAD指向某个具体的提交

- `git checkout <提交>^`相对引用，引用到提交的上个节点
- `<提交>~<num>`引用到上num个节点
- `HEAD`，指向某个提交后，用HEAD作为当前节点名的引用
<!-- more -->
撤销提交

- `git reset HEAD~1`回退提交，向上移动分支，只在本地有效
- `git revert <提交>`撤销该次提交的变更，然后建立一个新提交作为这次撤销的结果

杂项

- `git cherry-pick <提交>`把提交抓到当前分支下
- `git commit --amend`在不进行新的提交的情况下更改当前提交

- `git tag <tag> <提交>`创建一个指向该提交的tag