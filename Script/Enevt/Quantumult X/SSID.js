/**
 * Quantumult X 自动检测公网 IP（最终增强版）
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

// ======================
// 🔧 配置区
// ======================
const NOTIFY_SWITCH = true;   // 是否通知
const QUERY_DELAY   = 2000;   // 启动延迟（毫秒）
const CONFIRM_TIMES = 1;      // 连续一致次数才切换（防抖）

const STORE_MODE   = "QXIP_LastMode";
const STORE_REGION = "QXIP_LastRegion";
const STORE_COUNT  = "QXIP_ConfirmCount";

// 多 IP 源（按顺序 fallback）
const IP_SOURCES = [
    { name: "cip.cc", url: "https://www.cip.cc/", parser: parseCip },
   // { name: "ip.sb",  url: "https://ip.sb/",     parser: parseIpSb },
    //{ name: "ifconfig", url: "https://ifconfig.me/all", parser: parseIfconfig }
];

// running_mode 映射
const modeNameMap = {
    filter: "规则模式",
    all_direct: "直连模式",
    all_proxy: "全局代理模式"
};

(async () => {
    try {
        await sleep(QUERY_DELAY);

        // ------------------------
        // 1️⃣ 获取公网信息（多源 fallback）
        const info = await queryPublicIP();
        const { ip, region, isp, source } = info;

        console.log(`[INFO] 来源: ${source}`);
        console.log(`[INFO] IP: ${ip}`);
        console.log(`[INFO] 地区: ${region}`);
        console.log(`[INFO] 运营商: ${isp}`);

        // ------------------------
        // 2️⃣ 判断是否大陆（不含港澳台）
        const isMainlandChina =
            /中国/.test(region) &&
            !/中国香港|中国澳门|中国台湾/.test(region);

        const runningMode = isMainlandChina ? "filter" : "all_direct";

        // ------------------------
        // 3️⃣ 防抖：连续一致才切换
        const lastRegion = $prefs.valueForKey(STORE_REGION);
        let confirmCount = Number($prefs.valueForKey(STORE_COUNT) || 0);

        if (region === lastRegion) {
            confirmCount++;
        } else {
            confirmCount = 1;
            $prefs.setValueForKey(region, STORE_REGION);
        }
        $prefs.setValueForKey(String(confirmCount), STORE_COUNT);

        if (confirmCount < CONFIRM_TIMES) {
            console.log(`[INFO] 地区确认中 (${confirmCount}/${CONFIRM_TIMES})，暂不切换`);
            $done();
            return;
        }

        // ------------------------
        // 4️⃣ 防止重复切换
        const lastMode = $prefs.valueForKey(STORE_MODE);
        if (lastMode === runningMode) {
            console.log("[INFO] 运行模式未变化，跳过切换");
            $done();
            return;
        }

        // ------------------------
        // 5️⃣ 切换 running_mode（带兜底）
        const result = await $configuration.sendMessage({
            action: "set_running_mode",
            content: { running_mode: runningMode }
        });

        if (!result) {
            throw new Error("running_mode 切换失败");
        }

        $prefs.setValueForKey(runningMode, STORE_MODE);

        console.log(`[INFO] 已切换至 ${modeNameMap[runningMode]}`);

        if (NOTIFY_SWITCH) {
            $notify(
                "网络环境已变化 🟢",
                `${modeNameMap[lastMode] || "未知"} → ${modeNameMap[runningMode]}`,
                `IP：${ip}\n地区：${region}\n运营商：${isp}`
            );
        }

    } catch (e) {
        console.log(`[ERROR] ${e}`);
        $notify("公网 IP 检测失败 🔴", String(e), "");
    } finally {
        $done();
    }
})();

// ======================
// 🧠 公共方法
// ======================
async function queryPublicIP() {
    for (const src of IP_SOURCES) {
        try {
            const resp = await $task.fetch({ url: src.url });
            const info = src.parser(resp.body);
            if (info && info.ip && info.ip !== "未知") {
                info.source = src.name;
                return info;
            }
        } catch (_) {}
    }
    throw new Error("所有 IP 源均解析失败");
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ======================
// 📦 解析器
// ======================
function parseCip(html) {
    const pre = html.match(/<pre>([\s\S]*?)<\/pre>/)?.[1] || html;

    const ip =
        pre.match(/IP\s*:\s*([0-9.]+)/)?.[1] ||
        pre.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/)?.[0] ||
        "未知";

    const region =
        pre.match(/地址\s*:\s*([^\n]+)/)?.[1]?.trim() || "未知";

    let isp =
        pre.match(/运营商\s*:\s*([^\n]+)/)?.[1]?.trim() || "";

    if (!isp) {
        const data3 = pre.match(/数据三\s*:\s*([^\n]+)/)?.[1];
        if (data3?.includes("|")) {
            isp = data3.split("|").pop().trim();
        }
    }

    return { ip, region, isp: isp || "未知" };
}

function parseIpSb(text) {
    const ip = text.trim();
    return {
        ip,
        region: "未知",
        isp: "未知"
    };
}

function parseIfconfig(text) {
    const ip = text.match(/ip_addr:\s*([0-9.]+)/)?.[1] || "未知";
    return {
        ip,
        region: "未知",
        isp: "未知"
    };
}