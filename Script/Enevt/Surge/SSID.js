/**
 * Surge 自动检测公网 IP + 智能切换模式（精简增强版 + DEBUG）
 * 适用于带eSIM国际漫游的境外网络环境
 * 规则：
 * - 中国大陆（不含港澳台地区） → 规则模式
 * - 非大陆   → 直接连接
 *
 * 作者：General℡
 */

// ======================
// 🔧 配置区
// ======================
const NOTIFY = true;      //通知
const DEBUG = false;   // 调试开关
const DELAY = 3000;     //延时运行
const CONFIRM = 1;      //防止地区判断抖动
const IP_RETRY = 3;     //IP 获取重试次数
const IP_RETRY_DELAY = 3000; //IP 获取重试间隔

const API = "http://127.0.0.1:52993/v1/outbound";
const KEY = "5A0B2BDB-8C6D-46F0-9A2F-2A9709C6FA40-3668-00000982F59D629D"; //你的面板密码

const STORE_REGION = "Surge_LastRegion";
const STORE_COUNT  = "Surge_ConfirmCount";

// ======================
// 🧪 调试函数
// ======================
function debug(...args) {
    if (DEBUG) console.log("[DEBUG]", ...args);
}

// ======================
// 🚀 主流程
// ======================
(async () => {
    try {
        debug("脚本启动，延迟:", DELAY);
        await sleep(DELAY);

        // 1️⃣ 获取公网信息
        const info = await getIPWithRetry();
        const { ip, region, isp } = info;

        console.log(`IP: ${ip}`);
        console.log(`地区: ${region}`);
        console.log(`运营商: ${isp}`);

        debug("解析结果:", info);

        if (region === "未知") {
            console.log("地区未知，跳过切换");
            done();
            return;
        }

        // 2️⃣ 判断是否大陆
        const isCN =
            /中国/.test(region) &&
            !/香港|澳门|台湾/.test(region);

        const targetMode = isCN ? "rule" : "direct";

        debug("是否大陆:", isCN);
        debug("目标模式:", targetMode);

        const modeText = {
            rule: "规则模式",
            direct: "直接连接"
        };

        // 3️⃣ 防抖
        const lastRegion = $persistentStore.read(STORE_REGION);
        let count = Number($persistentStore.read(STORE_COUNT) || 0);

        debug("上次地区:", lastRegion);
        debug("当前计数:", count);

        if (region === lastRegion) {
            count++;
        } else {
            count = 1;
            $persistentStore.write(region, STORE_REGION);
        }

        $persistentStore.write(String(count), STORE_COUNT);

        debug("更新后计数:", count);

        if (count < CONFIRM) {
            console.log(`确认中 ${count}/${CONFIRM}`);
            done();
            return;
        }

        // 4️⃣ 获取当前模式
        const current = await getMode();
        debug("当前模式:", current);

        if (current === targetMode) {
            console.log("模式未变化");
            done();
            return;
        }

        // 5️⃣ 切换模式
        debug("开始切换模式:", targetMode);
        await setMode(targetMode);

        // 6️⃣ 校验
        const newMode = await getMode();
        debug("切换后模式:", newMode);

        if (newMode !== targetMode) {
            throw new Error("切换失败");
        }

        console.log(`已切换 ${current} → ${newMode}`);

        // 7️⃣ 通知
        if (NOTIFY) {
            $notification.post(
                "网络环境变化 🟢",
                `${modeText[current] || "未知"} → ${modeText[newMode]}`,
                `IP: ${ip}\n地区: ${region}\n运营商: ${isp}`
            );
        }

    } catch (e) {
        console.log("错误:", e);
        if (NOTIFY) {
            $notification.post("IP 检测失败 🔴", String(e), "保持当前模式");
        }
    } finally {
        done();
    }
})();

// ======================
// 🌐 获取 IP
// ======================
function getIP() {
    return new Promise((resolve, reject) => {
        debug("请求 myip.ipip.net/json");

        $httpClient.get({
            url: "https://myip.ipip.net/json",
            timeout: 60000
        }, (err, resp, data) => {
            if (err) {
                debug("请求失败:", err);
                return reject(err);
            }

            debug("原始返回长度:", data?.length);

            const info = parseIPIP(data);

            if (!info.ip || info.ip === "未知") {
                debug("解析失败:", data);
                return reject("解析失败");
            }

            resolve(info);
        });
    });
}

async function getIPWithRetry() {
    let lastError = null;

    for (let i = 1; i <= IP_RETRY; i++) {
        try {
            debug(`第 ${i}/${IP_RETRY} 次获取 IP`);
            return await getIP();
        } catch (e) {
            lastError = e;
            debug(`第 ${i} 次获取 IP 失败:`, e);

            if (i < IP_RETRY) {
                console.log(`网络未恢复，${IP_RETRY_DELAY}ms 后重试 (${i}/${IP_RETRY})`);
                await sleep(IP_RETRY_DELAY);
            }
        }
    }

    throw lastError || new Error("获取 IP 失败");
}

// ======================
// 📦 解析
// ======================
function parseIPIP(raw) {
    debug("开始解析 JSON");

    let json;
    try {
        json = JSON.parse(raw);
    } catch (e) {
        debug("JSON 解析失败:", raw);
        return { ip: "未知", region: "未知", isp: "未知" };
    }

    debug("JSON 对象:", json);

    if (json?.ret !== "ok" || !json?.data) {
        debug("返回状态异常:", json);
        return { ip: "未知", region: "未知", isp: "未知" };
    }

    const ip = json.data.ip || "未知";
    const location = Array.isArray(json.data.location) ? json.data.location : [];

    const regionParts = location
        .slice(0, 4)
        .filter(part => typeof part === "string" && part.trim());

    const region = regionParts.length ? regionParts.join(" ") : "未知";
    const isp = location[4]?.trim() || "未知";

    const result = { ip, region, isp };

    debug("解析结果:", result);

    return result;
}

// ======================
// 🌍 Surge API
// ======================
function getMode() {
    return new Promise((resolve, reject) => {
        debug("获取当前模式");

        $httpClient.get({
            url: API,
            headers: { "X-Key": KEY,
							"Accept": "*/*",
							"Accept-Encoding": "gzip, deflate, br",
"Connection": "Keep-Alive",

"Host": "127.0.0.1:52993",
"User-Agent": "CFNetwork/3860.500.112 Darwin/25.4.0"
						}
        }, (e, r, d) => {
            if (e) {
                debug("获取模式失败:", e);
                return reject(e);
            }

            try {
                const mode = JSON.parse(d).mode;
                debug("当前模式返回:", mode);
                resolve(mode);
            } catch (err) {
                debug("解析模式失败:", d);
                reject(err);
            }
        });
    });
}

function setMode(mode) {
    return new Promise((resolve, reject) => {
        debug("发送切换请求:", mode);

        $httpClient.post({
            url: API,
            headers: {
                "X-Key": KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mode })
        }, (e, r, d) => {
            if (e) {
                debug("切换失败:", e);
                return reject(e);
            }

            debug("切换返回:", d);
            resolve();
        });
    });
}

// ======================
// 🧩 工具
// ======================
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function done() {
    debug("脚本结束");
    $done();
}
