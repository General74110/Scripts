/**
 * Surge 专用网络环境策略切换
 * Author: General℡
 * GitHub: https://github.com/General74110/Scripts
 */

const url = "https://app.netart.cn/network-panel/ip.ajax";
const maxRetry = 3;
const retryInterval = 5000;
const operatorProxyList = ["移动", "联通", "电信", "广电"];
const lastModeKey = "lastNetworkMode";
const enableNotification = true;

// 获取策略组配置
function getGroups() {
    const raw = $persistentStore.read("networkGroups", "boxjs") || "";
    if (raw) {
        const groups = {};
        raw.split("&").forEach(item => {
            const [key, proxy] = item.split("=").map(s => s.trim());
            if (key && proxy) groups[key] = { proxy, direct: "DIRECT" };
        });
        return groups;
    } else {
        console.log("未读取到 BoxJS 自定义策略组，使用默认策略组");
        return {
            "TikTok": { proxy: "TikTok线路", direct: "DIRECT" },
            "Open AI": { proxy: "Open AI线路", direct: "DIRECT" },
            "国外社交": { proxy: "国外社交线路", direct: "DIRECT" },
            "国内媒体": { proxy: "国内媒体线路", direct: "DIRECT" },
            "国外媒体": { proxy: "国外媒体线路", direct: "DIRECT" },
            "游戏平台": { proxy: "游戏平台线路", direct: "DIRECT" },
            "谷歌 FCM": { proxy: "谷歌 FCM线路", direct: "DIRECT" },
            "漏网之鱼": { proxy: "自动选择", direct: "DIRECT" }
        };
    }
}

// 通知函数
function notify(title, subtitle, message) {
    if (enableNotification) $notification.post(title, subtitle, message);
}

// 批量切换策略组
function switchGroups(groups, useProxy) {
    const results = [];
    for (let group in groups) {
        const target = useProxy ? groups[group].proxy : groups[group].direct;
        try {
            $surge.setSelectGroupPolicy(group, target);
            console.log(`切换策略组: ${group} → ${target} 🟢`);
            results.push(`${group} → ${target} 🟢`);
        } catch (e) {
            console.log(`切换策略组失败: ${group} → ${target} 🔴`, e);
            results.push(`${group} → ${target} 🔴`);
        }
    }
    return results.join("\n");
}

// 发起请求
function fetchData(retry = 0) {
    const groups = getGroups();
    if (!groups || Object.keys(groups).length === 0) {
        console.log("没有可用的策略组，脚本结束 🔴");
        notify("Surge 策略切换失败 🔴", "无策略组", "");
        return $done();
    }

    $httpClient.get({ url }, (error, response, data) => {
        if (error || !data) {
            console.log(`请求失败 (尝试 ${retry + 1}) 🔴`, error || "");
            if (retry < maxRetry - 1) setTimeout(() => fetchData(retry + 1), retryInterval);
            else notify("Surge 策略切换失败 🔴", "请求失败/返回为空", String(error || "无数据"));
            return $done();
        }

        try {
            const obj = JSON.parse(data);
            const countryName = obj?.data?.country?.name || "未知";
            const asInfo = obj?.data?.as?.info || "";
            const operatorDisplay = (countryName + asInfo).trim() || "未知";
            const countryCode = obj?.data?.country?.code || "未知";

            const useProxy = operatorProxyList.some(op => asInfo.includes(op));
            const newMode = useProxy ? "proxy" : "direct";
            const lastMode = $persistentStore.read(lastModeKey) || "";

            console.log(`运营商: ${operatorDisplay}, 国家代码: ${countryCode}, 本次模式: ${newMode}, 上次模式: ${lastMode}`);

            if (newMode === lastMode) {
                console.log("网络环境未变化 🟡");
                notify("Surge 策略未切换 🟡", `运营商: ${operatorDisplay}`, `继续使用：${newMode === "proxy" ? "代理" : "直连"}`);
                return $done();
            }

            const resultLog = switchGroups(groups, useProxy);
            $persistentStore.write(newMode, lastModeKey);

            notify(
                "Surge 策略切换成功 🟢",
                `运营商: ${operatorDisplay} | 国家代码: ${countryCode}`,
                `已切换为：${useProxy ? "代理" : "直连"}\n${resultLog}`
            );

        } catch (e) {
            console.log("JSON解析异常 🔴", e);
            notify("Surge 策略切换失败 🔴", "JSON解析异常", String(e));
        }

        $done();
    });
}

// 执行脚本
fetchData();