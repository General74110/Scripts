/**
 * Surge 专用网络环境策略切换
 * 适用于有境外流量卡的情况
 * Author: General℡
 * GitHub: https://github.com/General74110/Scripts
 */

const url = "https://app.netart.cn/network-panel/ip.ajax";
const maxRetry = 3;        // 最大重试次数
const retryInterval = 2000; // 重试间隔 2 秒

// 策略组及节点配置
const groups = {
    "TikTok": { proxy: "TikTok线路", direct: "DIRECT" },
    "Open AI": { proxy: "Open AI线路", direct: "DIRECT" },
    "国外社交": { proxy: "国外社交线路", direct: "DIRECT" },
    "国内媒体": { proxy: "国内媒体线路", direct: "DIRECT" },
    "国外媒体": { proxy: "国外媒体线路", direct: "DIRECT" },
    "游戏平台": { proxy: "游戏平台线路", direct: "DIRECT" },
    "谷歌 FCM": { proxy: "谷歌 FCM线路", direct: "DIRECT" },
    "漏网之鱼": { proxy: "自动选择", direct: "DIRECT" }
};

// 四大运营商关键字
const operatorProxyList = ["移动", "联通", "电信"];

/**
 * 发起请求
 * @param {number} retry 当前重试次数
 */
function fetchData(retry = 0) {
    $httpClient.get({
        url: url,
        headers: {
            ":authority": "app.netart.cn",
            "sec-fetch-dest": "empty",
            "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
            "accept": "*/*",
            "sec-fetch-site": "same-site",
            "origin": "https://net.netart.cn",
            "sec-fetch-mode": "cors",
            "accept-language": "zh-CN,zh-Hans;q=0.9",
            "priority": "u=3, i",
            "accept-encoding": "gzip, deflate, br"
        }
    }, (error, response, data) => {
        if (error) {
            console.log(`请求失败 (尝试 ${retry + 1}):`, error);
            if (retry < maxRetry - 1) {
                setTimeout(() => fetchData(retry + 1), retryInterval);
            } else {
                $notification.post("Surge 策略切换失败", "API 请求失败", String(error));
                $done();
            }
            return;
        }

        const body = response?.body || data || "";
        if (!body) {
            console.log(`返回数据为空 (尝试 ${retry + 1})`);
            if (retry < maxRetry - 1) {
                setTimeout(() => fetchData(retry + 1), retryInterval);
            } else {
                $notification.post("Surge 策略切换失败", "返回数据为空", "");
                $done();
            }
            return;
        }

        try {
            const obj = JSON.parse(body);
            const countryName = obj?.data?.country?.name || "未知";
            const asInfo = obj?.data?.as?.info || "";

            // 拼接运营商显示 country.name + as.info
            const operatorDisplay = (countryName + asInfo).trim() || "未知";

            const countryCode = obj?.data?.country?.code || "未知";

            // 判断是否走代理
            let useProxy = false;
            if (countryCode === "CN" && operatorProxyList.some(op => asInfo.includes(op))) {
                useProxy = true;
            }

            console.log(`运营商: ${operatorDisplay}, 国家代码: ${countryCode}, 使用代理: ${useProxy}`);

            // 批量切换策略组
            for (let group in groups) {
                let target = useProxy ? groups[group].proxy : groups[group].direct;
                console.log(`切换策略组: ${group} → ${target}`);
                $surge.setSelectGroupPolicy(group, target);
            }

            $notification.post(
                "Surge 策略切换成功",
                `运营商: ${operatorDisplay} | 国家: ${countryCode}`,
                `已切换为: ${useProxy ? "代理" : "直连"}`
            );

        } catch (e) {
            console.log("JSON解析异常:", e);
            $notification.post("Surge 策略切换失败", "JSON解析异常", String(e));
        }

        $done();
    });
}

// 执行请求
fetchData();