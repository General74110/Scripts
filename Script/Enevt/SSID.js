/**
 * Surge 外网检测脚本（Event）
 * 根据地区自动切换出站模式
 *
 * 规则：
 * - 地址包含「中国」 → 规则模式
 * - 其他地区 → 直接连接
 *
 * IP显示
 * 地理位置显示
 * 运营商显示
 *
 * 作者：General℡
 * 支持：Surge iOS 4+ / Surge Mac 3.3+
 */


// ======================
// 🔧 配置区
// ======================
const SURGE_LOG_ENABLE = false;     // 是否输出日志
const SURGE_NOTIFY_ENABLE = true;  // 是否发送通知
const CIP_URL = 'https://www.cip.cc/';
const STORE_KEY = 'SurgeIP_Last';

// Surge 内部出站模式值（⚠️不可改为中文）
const MODE_CHINA = 'rule';
const MODE_OTHER = 'direct';

// 出站模式中文显示
const MODE_NAME_MAP = {
    rule: '规则模式',
    direct: '直接连接'
};

(async function main() {
    try {
        const netType = $network
            ? ($network.cellular ? '蜂窝' : 'Wi-Fi')
            : '未知';

        log(`网络类型：${netType}`);

        $httpClient.get(CIP_URL, (err, resp, body) => {
            if (err) {
                log(`外网检测失败: ${err}`);
                notify('Surge 外网检测失败', String(err));
                $done();
                return;
            }

            const { ip, region, isp } = parseCipInfo(body);

            log(`IP：${ip}`);
            log(`地区：${region}`);
            log(`运营商：${isp}`);

            // ------------------------
            // 根据地区判断出站模式
            const outboundMode = /中国/.test(region)
                ? MODE_CHINA
                : MODE_OTHER;

            // ------------------------
            // 读取上一次状态
            let lastData = {};
            try {
                lastData = JSON.parse(
                    $persistentStore.read(STORE_KEY) || '{}'
                );
            } catch (_) {}

            // 无变化则退出
            if (
                lastData.ip === ip &&
                lastData.region === region &&
                lastData.mode === outboundMode
            ) {
                log('网络环境未变化，跳过切换 🟡');
                $done();
                return;
            }

            // ------------------------
            // 切换出站模式
            const success = $surge.setOutboundMode(outboundMode);
            if (success) {
                const modeName = MODE_NAME_MAP[outboundMode];

                log(`切换到 ${modeName}`);

                notify(
                    'Surge 出站模式已切换 🟢',
                    `模式：${modeName}\n网络：${netType}\nIP：${ip}\n地区：${region}\n运营商：${isp}`
                );

                // 保存状态
                $persistentStore.write(
                    JSON.stringify({ ip, region, mode: outboundMode }),
                    STORE_KEY
                );
            } else {
                log('出站模式切换失败');
                notify(
                    'Surge 策略切换失败 🔴',
                    `尝试模式：${MODE_NAME_MAP[outboundMode]}`
                );
            }

            $done();
        });

    } catch (e) {
        log(`脚本异常: ${e}`);
        $done();
    }
})();

// ======================
// 解析 cip.cc HTML
// ======================
function parseCipInfo(html) {
    const preMatch = html.match(/<pre>([\s\S]*?)<\/pre>/);
    if (!preMatch) {
        return { ip: '未知', region: '未知', isp: '未知' };
    }

    const text = preMatch[1];

    const ip =
        text.match(/IP\s*:\s*([0-9.]+)/)?.[1] || '未知';

    const region =
        text.match(/地址\s*:\s*([^\n\r]+)/)?.[1]?.trim() || '未知';

    let isp =
        text.match(/运营商\s*:\s*([^\n\r]+)/)?.[1]?.trim() || '';

    // 无“运营商”字段 → 从 数据三 提取
    if (!isp) {
        const data3 =
            text.match(/数据三\s*:\s*([^\n\r]+)/)?.[1];
        if (data3 && data3.includes('|')) {
            isp = data3.split('|').pop().trim();
        }
    }

    if (!isp) isp = '未知';

    return { ip, region, isp };
}

// ======================
function log(msg) {
    if (SURGE_LOG_ENABLE) {
        console.log(`[SurgeIP] ${msg}`);
    }
}

function notify(title, subtitle) {
    if (SURGE_NOTIFY_ENABLE) {
        $notification.post(title, subtitle, '');
    }
}