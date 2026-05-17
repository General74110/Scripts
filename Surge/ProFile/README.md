<div align="center">
 <img src="https://raw.githubusercontent.com/General74110/Scripts/master/Surge/ProFile/Conf.png" width="200">
</div>

## 📦 配置示例

```python
[General]
loglevel = notify
udp-priority = true
exclude-simple-hostnames = true
show-error-page-for-reject = true
udp-policy-not-supported-behaviour = REJECT
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, localhost, *.local, iosapps.itunes.apple.com, seed-sequoia.siri.apple.com, sequoia.apple.com
ipv6 = true
ipv6-vif = auto
internet-test-url = http://223.5.5.5
proxy-test-url = http://1.1.1.1
test-timeout = 3
dns-server = 223.6.6.6
encrypted-dns-server = quic://223.6.6.6:853
doh-skip-cert-verification = true
geoip-maxmind-url = https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb
compatibility-mode = 1

[Proxy Group]
Apple = fallback, "Open AI线路", DIRECT, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/apple.png, no-alert=1, hidden=1, include-all-proxies=0, evaluate-before-use=1

国内媒体 = load-balance, 国内媒体线路, DIRECT, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/bilibili(1).png, no-alert=1, hidden=1, include-all-proxies=0, persistent=0, evaluate-before-use=1

漏网之鱼 = load-balance, 自动选择, DIRECT, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/Surge(11).png, no-alert=1, hidden=1, include-all-proxies=0, persistent=1, evaluate-before-use=1

自动选择 = url-test, no-alert=1, hidden=1, include-all-proxies=1, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/quanqiu(1).png, include-other-group=🚀 我的订阅, evaluate-before-use=1

国内媒体线路 = url-test, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/bilibili(2).png, no-alert=1, hidden=1, include-all-proxies=0, include-other-group=🇸🇬 新加坡线路, persistent=1

国外媒体线路 = smart, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/youtube.png, no-alert=1, hidden=1, include-all-proxies=0, include-other-group=""🇭🇰 香港线路", "🇺🇲 美国线路", "🇯🇵 日本线路", "🇸🇬 新加坡线路", "🇬🇧 英国线路""

TikTok线路 = fallback, "🇯🇵 日本线路", "🇸🇬 新加坡线路", "🇺🇲 美国线路", no-alert=1, hidden=1, include-all-proxies=0, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/tiktok.png

国外社交线路 = smart, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/telegram(1).png, no-alert=1, hidden=1, include-all-proxies=0, include-other-group=""🇭🇰 香港线路", "🇺🇲 美国线路", "🇯🇵 日本线路", "🇸🇬 新加坡线路""

游戏平台线路 = smart, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/steam(1).png, no-alert=1, hidden=1, include-all-proxies=0, include-other-group=""🇭🇰 香港线路", "🇺🇲 美国线路", "🇯🇵 日本线路", "🇸🇬 新加坡线路""

谷歌 FCM线路 = smart, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/google.png, no-alert=1, hidden=1, include-all-proxies=0, include-other-group=""🇭🇰 香港线路", "🇺🇲 美国线路", "🇯🇵 日本线路", "🇸🇬 新加坡线路"", persistent=0

Open AI线路 = url-test, RN|US|kNcx.love@xray.com, 🇰🇷QUN-Orcale-Snell, 🇸🇬SIN-GreenCloud-Snell, racknerd-美国-洛杉矶, "Oracle SG", DMIT-US, icon-url=https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/chxm1023/ChatGPT5.png, no-alert=1, hidden=1, include-all-proxies=0, include-other-group=""🇺🇲 美国线路", "🇯🇵 日本线路", "🇸🇬 新加坡线路""

🇭🇰 香港线路 = url-test, include-other-group=🚀 我的订阅, update-interval=0, no-alert=1, hidden=1, include-all-proxies=0, policy-regex-filter=(?i)(港|hk|hong\s*kong|🇭🇰), icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/Hongkong.png

🇺🇲 美国线路 = url-test, include-other-group=🚀 我的订阅, update-interval=0, no-alert=1, hidden=1, include-all-proxies=0, policy-regex-filter=(美国|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States), icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/US.png

🇯🇵 日本线路 = url-test, include-other-group=🚀 我的订阅, update-interval=0, no-alert=1, hidden=1, include-all-proxies=0, policy-regex-filter=(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|[^-]日|JP|Japan), icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/zl-icon-jp-flag.png

🇸🇬 新加坡线路 = url-test, include-other-group=🚀 我的订阅, update-interval=0, no-alert=1, hidden=1, include-all-proxies=0, policy-regex-filter=(新加坡|坡|狮城|SG|SIN|Singapore|SEA), icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/singapore(1).png

🇬🇧 英国线路 = url-test, include-other-group=🚀 我的订阅, update-interval=0, no-alert=1, hidden=1, include-all-proxies=0, policy-regex-filter=(英|🇬🇧|英国|United Kingdom|UK), icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/UnitedKingdom(1).png

🚀 我的订阅 = smart, policy-path=👋这里填写订阅链接, timeout=3000, update-interval=0, no-alert=0, hidden=1, include-all-proxies=1, icon-url=https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/Surge(8).png

[Rule]
IP-CIDR,194.221.250.50/32,国外社交线路,no-resolve // Telegram
IP-CIDR,64.118.147.153/32,DIRECT,no-resolve // Added for: http://64.118.147.153:10589/WumpsMpyjPPgJ/b2102bdadfa9ba2e8a2ab3a30538d108
# >控制面板
IP-CIDR,127.0.0.1/32,DIRECT,no-resolve // Added for: http://127.0.0.1:52993/v1/outbound

# GiffGaff WiFi-Calling
RULE-SET,giffgaff.list,DIRECT,extended-matching

# >反诈你懂的
DOMAIN-SUFFIX,gjfzpt.cn,REJECT,pre-matching
# >跳过浏览器监管
DOMAIN-SUFFIX,43.ucweb.com,REJECT,pre-matching
# Safari 防跳转
DOMAIN,app-site-association.cdn-apple.com,REJECT,pre-matching
# >高德地图
DOMAIN,amdc.m.taobao.com,REJECT,pre-matching
# >>破机场
DOMAIN-SUFFIX,qinyues4.cc,DIRECT,extended-matching // 白月光
DOMAIN-SUFFIX,jiumaojiu.net,DIRECT,extended-matching // 小南瓜
DOMAIN-SUFFIX,s2cat.cc,自动选择 // 网速猫
DOMAIN-SUFFIX,bujidao.cc,自动选择 // 布吉岛
DOMAIN,metrics.icloud.com,自动选择 // 网速猫

# >不明原因走了Final
DOMAIN-SUFFIX,kuwo.cn,DIRECT
# >防止应用循环请求
IP-CIDR,0.0.0.0/32,REJECT,pre-matching,no-resolve
# >防止Telegram转圈
IP-CIDR,95.161.76.100/31,REJECT,pre-matching,no-resolve
# >缩小 IP 范围
IP-CIDR,106.11.162.0/24,REJECT,pre-matching,no-resolve
IP-CIDR,47.102.83.0/24,REJECT,pre-matching,no-resolve
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
# > 毒奶去广告计划
RULE-SET,https://raw.githubusercontent.com/limbopro/Adblock4limbo/main/Adblock4limbo_surge.list,REJECT,pre-matching
# # > WeChat
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/WeChat/WeChat_Resolve.list,DIRECT,extended-matching
# > 小红书
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/XiaoHongShu/XiaoHongShu.list,国内媒体
# > 抖音
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/DouYin/DouYin.list,国内媒体
# > BiliBili
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/BiliBili/BiliBili.list,国内媒体
# > 苹果服务
RULE-SET,https://raw.githubusercontent.com/General74110/Scripts/master/Surge/Rule/Ai.list,"Open AI线路"
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Apple/Apple_All_No_Resolve.list,Apple,extended-matching,no-resolve
# > GoogleVoice
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/GoogleVoice/GoogleVoice.list,"谷歌 FCM线路"
# > Notion
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Notion/Notion.list,"谷歌 FCM线路"
# > Instagram
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Instagram/Instagram.list,国外社交线路,no-resolve
# > Threads
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Threads/Threads.list,国外社交线路
# > X
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Twitter/Twitter_Resolve.list,国外社交线路,no-resolve
# > TikTok
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/TikTok/TikTok.list,TikTok线路
# #> Github&Gitlab
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/GitLab/GitLab.list,"谷歌 FCM线路"
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/GitHub/GitHub.list,"谷歌 FCM线路"
# > OpenAI
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/OpenAI/OpenAI.list,"Open AI线路"
# > Facebook
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Facebook/Facebook.list,国外社交线路
# > Telegram
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Telegram/Telegram.list,国外社交线路
# > Epic
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Epic/Epic.list,游戏平台线路
# > Steam
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Steam/Steam.list,游戏平台线路
# # > YouTube
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/YouTube/YouTube_Resolve.list,国外媒体线路
# > Google
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Google/Google.list,"谷歌 FCM线路"
# > Proxy
DOMAIN-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Proxy/Proxy_Domain.list,"谷歌 FCM线路",extended-matching
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/Proxy/Proxy_All_No_Resolve.list,"谷歌 FCM线路"
# > China
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Surge/ChinaMax/ChinaMax_All.list,DIRECT
# >Geoip
GEOIP,CN,DIRECT
# > DNS 查询失败走 Final 规则
FINAL,漏网之鱼,dns-failed
[MITM]
skip-server-cert-verify = true
tcp-connection = true
h2 = true
hostname = -*.apple.com, -*.icloud.com, -*.itunes.com
```

## 🧩 配置建议


☁️ **阿里云DNS** 

```
quic://223.5.5.5:853
```

```
h3://223.5.5.5/dns-query
```

```
https://223.5.5.5/dns-query
```

☁️ **腾讯云DNS** 

```
https://1.12.12.12/dns-query
```
 
```
https://120.53.53.53/dns-query
```

---

🚀 **直连延迟测试** 

```
http://223.5.5.5
```

```
http://wifi.vivo.com.cn/generate_204
```


🚀 **代理延迟测试** 

```
http://1.1.1.1
```

```
http://www.gstatic.com/generate_204
```

```
http://cp.cloudflare.com/generate_204
```

---

🌍 **Geo-IP数据库**

```
https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb
```

```
https://github.com/xream/geoip/releases/latest/download/ipinfo.country.mmdb
```
