/**
 * Quantumult X 自动检测公网 IP（最终增强版）将樱花佬的打断网络请求加了进来（https://raw.githubusercontent.com/Sliverkiss/QuantumultX/refs/heads/main/Script/switchMode.js）
 * 适用于：大陆使用 + 非大陆运营商
 * ❌ 不适用于软路由环境
 *
 * 规则：
 * - 大陆（不含港澳台） → 规则模式
 * - 其他地区           → 全局直连
 *
 * 显示：
 * - IP
 * - 地理位置
 * - 运营商
 *
 * 作者：General℡
 */

const ENABLE_NOTIFY = true;

const MODE_NAME = {
    filter: "规则模式",
    all_direct: "直连模式"
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function setMode(mode) {
    return $configuration.sendMessage({
        action: "set_running_mode",
        content: { running_mode: mode }
    });
}

// 👉 国家判断只用「地址」
function isChina(address) {
    if (!address.startsWith("中国")) return false;
    return !/中国香港|中国澳门|中国台湾/.test(address);
}

// 👉 解析 cip.cc
function parseCip(body) {
    const pre = body.match(/<pre>([\s\S]*?)<\/pre>/)?.[1] || body;

    const ip =
        pre.match(/IP\s*:\s*([^\n]+)/)?.[1]?.trim() || "未知";

    const address =
        pre.match(/地址\s*:\s*([^\n]+)/)?.[1]?.trim() || "未知";

    const data3 =
        pre.match(/数据三\s*:\s*([^\n]+)/)?.[1]?.trim() || "";

    let isp = "未知";
    if (data3.includes("|") || data3.includes("｜")) {
        isp = data3.split(/[|｜]/).pop().trim();
    }

    return { ip, address, isp };
}

(async () => {
    try {
        /** 1️⃣ 打断请求，强制规则模式 **/
        await setMode("filter");
        const fromMode = "filter";
        const fromName = MODE_NAME[fromMode];

        console.log("打断请求完成，当前模式：规则模式");

        /** 2️⃣ 延迟 3 秒 **/
        await sleep(3000);

        /** 3️⃣ 使用 $task.fetch 请求 cip.cc **/
        const resp = await $task.fetch({
            url: "https://cip.cc",
            method: "GET"
        });

        const { ip, address, isp } = parseCip(resp.body);

        console.log(`IP: ${ip}`);
        console.log(`地址: ${address}`);
        console.log(`运营商: ${isp}`);

        /** 4️⃣ 判断目标模式 **/
        const toMode = isChina(address) ? "filter" : "all_direct";
        const toName = MODE_NAME[toMode];

        if (toMode === fromMode) {
            console.log(`🟠当前模式【${MODE_NAME[fromMode]}】放弃切换`);

            $done();
            return;
        }

        /** 5️⃣ 切换模式 **/
        await setMode(toMode);
        console.log(`🟢运行模式 → ${toName}`);

        if (ENABLE_NOTIFY) {
            $notify(
                "🔘规则变化",
                `${MODE_NAME[fromMode]} → ${toName}`,
                `IP：${ip}\n地址：${address}\n运营商：${isp}`
            );
        }

    } catch (e) {
        console.log(`🔴异常：${String(e)}`);

        if (ENABLE_NOTIFY) {
            $notify("🔘规则变化", "🔴异常", String(e));
        }
    } finally {
        $done();
    }
})();