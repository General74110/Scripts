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

自己用的脚本合集，包括定时任务、解锁VIP、广告过滤等。  
支持 **Loon** · **Quantumult X** · **Surge** 三大代理客户端。

---

## 📂 目录结构

| 目录 | 说明 |
|------|------|
| `Script/Task` | 定时任务脚本，如 QQ阅读签到/任务/抽奖 |
| `Script/Adblock` | 广告过滤规则 |
| `Script/Enevt` | 事件相关脚本 |
| `Script/UnlockVip` | 解锁VIP功能脚本 |
| `index/` | 通用脚本模板 |
| `images/` | 资源图片 |

---

## 📜 脚本列表

### Task（定时任务）

| 脚本 | 说明 | 平台 |
|------|------|------|
| [QQreader.js](Script/Task/QQreader.js) | QQ阅读每日签到、阅读/听书奖励、宝箱视频、等级福利、周/月抽奖 | Loon / QX / Surge / Node.js |

### UnlockVip（解锁VIP）

> 待补充

### Adblock（广告过滤）

> 待补充

---

## 🚀 快速开始

### 1. 获取脚本

**Loon** — 在配置文件中添加：

```
[Script]
http-request ^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\? script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, timeout=10, enabled=true, tag=QQ阅读获取Cookies

cron "30 6 * * *" script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, timeout=3600, tag=QQ阅读
```

**Quantumult X** — 在配置文件中添加：

```
[task_local]
30 6 * * * https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, tag=QQ阅读, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/QQ.png, enabled=true

[http_backend]
^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\? url script-request-header https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, tag=QQ阅读获取Cookies, enabled=true
```

**Surge** — 在配置文件中添加：

```
[Script]
http-request ^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\? script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js

cron "30 6 * * *" script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js
```

### 2. 获取 Cookie

在 APP 中点击 **「我的」** → 脚本会自动抓取 Cookie 并保存。

### 3. 需要 MITM

```
hostname = *.reader.qq.com
```

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