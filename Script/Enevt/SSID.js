/**
 * Surge 自动检测公网 IP + 智能切换模式（精简增强版）
 *
 * 规则：
 * - 中国大陆 → 规则模式
 * - 非大陆   → 直接连接
 *
 * 作者：General℡
 */

// ======================
// 🔧 配置区
// ======================
const NOTIFY = true;
const DELAY = 5000;
const CONFIRM = 1;

const API = "http://127.0.0.1:3932/v1/outbound";
const KEY = "password";

const STORE_REGION = "Surge_LastRegion";
const STORE_COUNT  = "Surge_ConfirmCount";

// ======================
// 🚀 主流程
// ======================
(async () => {
    try {
        await sleep(DELAY);

        // 1️⃣ 获取公网信息（仅 cip.cc）
        const info = await getIP();
        const { ip, region, isp } = info;

        console.log(`IP: ${ip}`);
        console.log(`地区: ${region}`);
        console.log(`运营商: ${isp}`);

        // ❗ 地区未知 → 不切换
        if (region === "未知") {
            console.log("地区未知，跳过切换");
            done();
            return;
        }

        // 2️⃣ 判断是否大陆（排除港澳台）
        const isCN =
            /中国/.test(region) &&
            !/香港|澳门|台湾/.test(region);

        const targetMode = isCN ? "rule" : "direct";

        // 中文模式名（用于通知）
        const modeText = {
            rule: "规则模式",
            direct: "直接连接"
        };

        // 3️⃣ 防抖
        const lastRegion = $persistentStore.read(STORE_REGION);
        let count = Number($persistentStore.read(STORE_COUNT) || 0);

        if (region === lastRegion) {
            count++;
        } else {
            count = 1;
            $persistentStore.write(region, STORE_REGION);
        }
        $persistentStore.write(String(count), STORE_COUNT);

        if (count < CONFIRM) {
            console.log(`确认中 ${count}/${CONFIRM}`);
            done();
            return;
        }

        // 4️⃣ 获取当前模式
        const current = await getMode();

        if (current === targetMode) {
            console.log("模式未变化");
            done();
            return;
        }

        // 5️⃣ 切换模式
        await setMode(targetMode);

        // 6️⃣ 校验
        const newMode = await getMode();
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
// 🌐 获取 cip.cc
// ======================
function getIP() {
    return new Promise((resolve, reject) => {
        $httpClient.get({
            url: "https://www.cip.cc/",
            timeout: 5000
        }, (err, resp, data) => {
            if (err) return reject(err);
            const info = parseCIP(data);
            if (!info.ip || info.ip === "未知") {
                return reject("解析失败");
            }
            resolve(info);
        });
    });
}

// ======================
// 📦 cip.cc 解析
// ======================
function parseCIP(html) {
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
        const d = pre.match(/数据三\s*:\s*([^\n]+)/)?.[1];
        if (d?.includes("|")) isp = d.split("|").pop().trim();
    }

    return { ip, region, isp: isp || "未知" };
}

// ======================
// 🌍 Surge API
// ======================
function getMode() {
    return new Promise((resolve, reject) => {
        $httpClient.get({
            url: API,
            headers: { "X-Key": KEY }
        }, (e, r, d) => {
            if (e) return reject(e);
            try {
                resolve(JSON.parse(d).mode);
            } catch (err) {
                reject(err);
            }
        });
    });
}

function setMode(mode) {
    return new Promise((resolve, reject) => {
        $httpClient.post({
            url: API,
            headers: {
                "X-Key": KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mode })
        }, (e) => {
            e ? reject(e) : resolve();
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
    $done();
}