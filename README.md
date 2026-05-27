<img src="https://raw.githubusercontent.com/General74110/Scripts/master/images/profile.png" alt="logo" width="160" height="160" align="right">

<h1 align="center">General℡ Scripts</h1>

<p align="center">
  <img src="https://img.shields.io/github/stars/General74110/Scripts?style=flat-square" alt="stars">
  <img src="https://img.shields.io/github/forks/General74110/Scripts?style=flat-square" alt="forks">
  <img src="https://img.shields.io/github/last-commit/General74110/Scripts?style=flat-square" alt="last commit">
  <img src="https://img.shields.io/badge/Loon-支持-brightgreen?style=flat-square" alt="Loon">
  <img src="https://img.shields.io/badge/Quantumult%20X-支持-brightgreen?style=flat-square" alt="Quantumult X">
  <img src="https://img.shields.io/badge/Surge-支持-brightgreen?style=flat-square" alt="Surge">
</p>

---

自己用的脚本合集，包括定时任务、VIP解锁、广告过滤等。  
支持 **Loon** · **Quantumult X** · **Surge** 三大代理客户端。

---

## 📂 目录结构

| 目录 | 说明 |
|------|------|
| `Script/Task` | 定时任务脚本 |
| `Script/UnlockVip` | 应用解锁VIP脚本 |
| `Script/Adblock` | 广告过滤脚本 |
| `Script/Enevt` | 各平台事件配置 |
| `index/` | 通用脚本模板 |

---

## 📜 脚本列表

> **状态说明：** 🟢 有效　🔴 失效　🟡 待修复　— 未测试

### ⏰ Task（定时任务）

| 脚本 | 说明 | 状态 | 平台 |
|------|------|:----:|------|
| [QQreader.js](Script/Task/QQreader.js) | QQ阅读签到、阅读/听书奖励、宝箱视频、等级福利、周/月抽奖 | 🟡 | Loon / QX / Surge / Node |
| [kuwo.js](Script/Task/kuwo.js) | 酷我音乐签到、听歌、收藏、抽奖、宝箱等（原大圣，改） | 🟢 | Loon / QX / Surge / Node |
| [Kuwomusic.js](Script/Task/Kuwomusic.js) | 酷我音乐看广告获取免费听歌时长 | 🟢 | Loon / QX / Surge / Node |
| [kuwo_Cookies.js](Script/Task/kuwo_Cookies.js) | 酷我音乐 Cookie 获取 | 🟢 | Loon / QX / Surge |
| [xmly.js](Script/Task/xmly.js) | 喜马拉雅签到、点赞、收藏、评论等（原 MartinsKing） | 🟡 | Loon / QX / Surge / Node |
| [Firsty.js](Script/Task/Firsty.js) | Firsty 看广告获取免费流量 | 🟢 | Node.js |
| [sendNotify.js](Script/Task/sendNotify.js) | Node.js 环境通知发送（依赖） | 🟢 | Node.js |

### 🔓 UnlockVip（VIP解锁）

| 脚本 | 说明 | 状态 |
|------|------|:----:|
| [QQreader.vip.js](Script/UnlockVip/QQreader.vip.js) | QQ阅读 VIP 解锁 | 🟡 |
| [kuwo.svip.js](Script/UnlockVip/kuwo.svip.js) | 酷我音乐 SVIP 解锁 | 🟢 |
| [Kuwo_NobyDa.js](Script/UnlockVip/Kuwo_NobyDa.js) | 酷我音乐 VIP（NobyDa 版） | 🟢 |
| [kugou.svip.js](Script/UnlockVip/kugou.svip.js) | 酷狗音乐 VIP 解锁 | 🟢 |
| [kugou.song.svip.js](Script/UnlockVip/kugou.song.svip.js) | 酷狗音乐歌曲 VIP | 🟢 |
| [xunlei.js](Script/UnlockVip/xunlei.js) | 迅雷 VIP 解锁 | — |
| [xl.js](Script/UnlockVip/xl.js) | 迅雷相关 | — |
| [9169.js](Script/UnlockVip/9169.js) | 9169 解锁 | — |

### 🚫 Adblock（广告过滤）

| 脚本 | 说明 | 状态 |
|------|------|:----:|
| [AnxinjiAd.js](Script/Adblock/AnxinjiAd.js) | 安心记广告过滤 | 🟢 |
| [SqxsAd.js](Script/Adblock/SqxsAd.js) | 什么小说广告过滤 | 🟢 |

---

## 🚀 使用方式

以 **QQ阅读** 为例：

### 1. 添加配置

**Loon：**
```
[Script]
http-request ^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\? script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, timeout=10, enabled=true, tag=QQ阅读获取Cookies
cron "30 6 * * *" script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, timeout=3600, tag=QQ阅读
```

**Quantumult X：**
```
[task_local]
30 6 * * * https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, tag=QQ阅读, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/QQ.png, enabled=true

[http_backend]
^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\? url script-request-header https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, tag=QQ阅读获取Cookies, enabled=true
```

**Surge：**
```
[Script]
http-request ^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\? script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js
cron "30 6 * * *" script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js
```

### 2. 获取 Cookie

在 APP 中点击 **「我的」** → 脚本自动抓取 Cookie 并保存。  
获取完建议关掉重写，避免不必要的 MITM。

### 3. MITM

```
hostname = *.reader.qq.com
```

> 其他脚本的使用方法，参照各脚本头部的注释说明。

---

## 🧩 BoxJS 订阅

```text
https://raw.githubusercontent.com/General74110/Quantumult-X/master/Boxjs/General74110.json
```

---

## ⚠️ 免责声明

发布的本仓库中的脚本仅用于资源共享和学习研究，我不能保证其合法性，准确性，完整性和有效性，请根据情况自行判断。

间接使用脚本的任何用户，包括但不限于建立 VPS 或在某些行为违反国家/地区法律或相关法规的情况下进行传播，对于由此引起的任何隐私泄漏或其他后果概不负责。

请勿将本仓库内的任何内容用于商业或非法目的，否则后果自负。

如果任何单位或个人认为该项目的脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明，所有权证明，我将在收到认证文件后删除相关脚本。

对任何本仓库中包含的脚本在使用中可能出现的问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害。

您必须在下载后的 24 小时内从计算机或手机中完全删除以上内容。

任何以任何方式查看此项目的人或直接或间接使用该项目的任何脚本的使用者都应仔细阅读此声明。我保留随时更改或补充此免责声明的权利。一旦使用并复制了任何本仓库相关脚本或其他内容，则视为您已接受此免责声明。

---

<p align="center">
  <a href="https://github.com/General74110/Scripts">GitHub</a>
</p>