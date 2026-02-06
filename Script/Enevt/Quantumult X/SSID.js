/**
 * Quantumult X 自动检测公网 IP
 * 适用于在大陆使用带非大陆运营商
 * 本脚本不适用于软路由
 * 根据地区切换 运行模式
 *
 * 规则：
 * - 地址包含「中国」 → 规则分流
 * - 其他地区 → 全局直连
 *
 * IP显示
 * 地理位置显示
 * 运营商显示
 *
 * 作者：General℡
 */

// ======================
// 🔧 配置区
// ======================
const NOTIFY_SWITCH = true;   // 是否通知模式切换
const QUERY_DELAY   = 2000;   // 延迟查询公网信息（毫秒）

const STORE_KEY = "QXIP_LastMode";
const CIP_URL = "https://www.cip.cc/";

// running_mode 中文映射
const modeNameMap = {
    filter: "规则模式",
    all_direct: "直连模式",
    all_proxy: "全局代理模式"
};

(async () => {
    try {
        // ------------------------
        // 1️⃣ 延迟查询公网信息（等待网络稳定）
        await new Promise(r => setTimeout(r, QUERY_DELAY));

        const resp = await $task.fetch({ url: CIP_URL });
        const { ip, region, isp } = parseCipInfo(resp.body);

        console.log(`[INFO] IP: ${ip}`);
        console.log(`[INFO] 地区: ${region}`);
        console.log(`[INFO] 运营商: ${isp}`);

        // ------------------------
        // 2️⃣ 根据地区判断 running_mode
        const runningMode = /中国/.test(region) ? "filter" : "all_direct";

        // ------------------------
        // 3️⃣ 防止重复切换
        const lastMode = $prefs.valueForKey(STORE_KEY);
        if (lastMode === runningMode) {
            console.log("[INFO] 网络未变化，跳过切换");
            $done();
            return;
        }

        // ------------------------
        // 4️⃣ 切换 running_mode
        await $configuration.sendMessage({
            action: "set_running_mode",
            content: { running_mode: runningMode }
        });

        $prefs.setValueForKey(runningMode, STORE_KEY);

        console.log(`[INFO] 切换到 ${modeNameMap[runningMode]} 模式`);

        if (NOTIFY_SWITCH) {
            $notify(
                "自动切换完成 🟢",
                `运行模式：${modeNameMap[runningMode]}\nIP：${ip}\n地区：${region}\n运营商：${isp}`
            );
        }

    } catch (e) {
        console.log(`[ERROR] ${e}`);
        $notify("网络检测失败 🔴", String(e), "");
    } finally {
        $done();
    }
})();

// ======================
// 解析 cip.cc HTML
// ======================
function parseCipInfo(html) {
    const preMatch = html.match(/<pre>([\s\S]*?)<\/pre>/);
    if (!preMatch) {
        return { ip: "未知", region: "未知", isp: "未知" };
    }

    const text = preMatch[1];

    const ip =
        text.match(/IP\s*:\s*([0-9.]+)/)?.[1] || "未知";

    const region =
        text.match(/地址\s*:\s*([^\n]+)/)?.[1]?.trim() || "未知";

    let isp =
        text.match(/运营商\s*:\s*([^\n]+)/)?.[1]?.trim() || "";

    if (!isp) {
        const data3 = text.match(/数据三\s*:\s*([^\n]+)/)?.[1];
        if (data3 && data3.includes("|")) {
            isp = data3.split("|").pop().trim();
        }
    }

    if (!isp) isp = "未知";

    return { ip, region, isp };
}