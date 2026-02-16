---
title: 【指南】XBox重试更新：0x800错误
published: 2026-01-30
description: '打开Xbox提示0x800错误，需要重试更新怎么办？'
image: 'https://raw.githubusercontent.com/Zionyas-Van/TuChuang/main/imgs/2026-02-16/53sBB3KW1fHZgnCk.png'
tags: ["Windows", "指南", "Xbox"]
category: 'Windows'
draft: false
lang: ''
---

>此方法来自B站Up主@纸折纸鸾。

![输入图片说明](https://raw.githubusercontent.com/Zionyas-Van/TuChuang/main/imgs/2026-02-16/53sBB3KW1fHZgnCk.png)

> 问题描述：打开 Xbox 后提示“重试更新”，错误代码为0x800.
---
1.右键单击主屏幕左下角的“**开始**”按钮 ，然后打开“Windows PowerShell (**管理员**)”；

![输入图片说明](https://raw.githubusercontent.com/Zionyas-Van/TuChuang/main/imgs/2026-02-16/vJzaoCNDyxw2mV50.png)

---
2.在“管理员:Windows PowerShell”屏幕中，键入以下命令
`get-appxpackage Microsoft.GamingServices | remove-AppxPackage -allusers`
并按 Enter 回车等待命令执行；
![输入图片说明](https://raw.githubusercontent.com/Zionyas-Van/TuChuang/main/imgs/2026-02-16/UtfimX6vf780LjtX.png)

---
3.还是在该窗口中，键入以下命令
`start ms-windows-store://pdp/?productid=9MWPM2CQNLHN`
并按 Enter，等待命令执行;

---
4.重启XBox.