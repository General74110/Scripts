/**
 * Surge 外网 & 运营商检测脚本（Event 类型）
 * 自动切换出站模式
 * 作者：General℡
 * 支持：Surge iOS 4+ / Surge Mac 3.3+
 */

const SURGE_LOG_ENABLE = false;       // 是否输出日志
const SURGE_NOTIFY_ENABLE = false;    // 是否发送通知
const CIP_URL = 'https://www.cip.cc/';

// 运营商对应出站模式
const ISP_MODE = {
    '移动': 'rule',
    '联通': 'rule',
    '电信': 'rule',
    '广电': 'rule'
};
const DEFAULT_MODE = 'direct'; // 其它运营商默认 DIRECT

(async function main() {
    try {
        const netType = $network ? ($network['cellular'] ? '蜂窝' : 'Wi-Fi') : '未知';
        log(`网络类型检测：${netType}`);

        // 获取 cip.cc 外网信息
        $httpClient.get(CIP_URL, async (err, resp, body) => {
            if (err) {
                log(`外网检测失败: ${err}`);
                notify('Surge 外网检测失败', err);
                $done();
                return;
            }

            const { ip, location, isp } = parseCip(body);
            log(`检测到外网 IP：${ip}`);
            log(`归属地信息：${location}`);
            log(`运营商：${isp}`);

            // 根据运营商选择出站模式
            let outboundMode = DEFAULT_MODE;
            for (const key in ISP_MODE) {
                if (isp.includes(key)) {
                    outboundMode = ISP_MODE[key];
                    break;
                }
            }


            // 获取上一次保存的模式
            const lastDataStr = $persistentStore.read('SurgeIP_Last') || '';
            let lastData = {};
            try { lastData = JSON.parse(lastDataStr); } catch(e){}

            // 检查是否变化
            if (lastData.ip === ip && lastData.isp === isp && lastData.mode === outboundMode) {
                log('Surge 网络环境未变化 🟡');
                $done();
                return;
            }

            // 切换出站模式
            const success = $surge.setOutboundMode(outboundMode);
            if (success) {
                log(`出站模式已切换为：${outboundMode}`);
                notify('Surge 网络切换成功 🟢',
                    `已切换出站模式：${outboundMode}\n网络：${netType}\nIP：${ip}\n归属地：${location}\n运营商：${isp}`);
                // 保存当前状态
                $persistentStore.write(JSON.stringify({ip, isp, mode: outboundMode}), 'SurgeIP_Last');
            } else {
                log(`出站模式切换失败`);
                notify('Surge 策略切换失败 🔴', `尝试模式：${outboundMode}`);
            }

            $done();
        });

    } catch (e) {
        log(`脚本异常: ${e}`);
        $done();
    }
})();

// ------------------------
// 解析 cip.cc 返回内容
function parseCip(html) {
    const preMatch = html.match(/<pre>([\s\S]*?)<\/pre>/);
    if (!preMatch) return { ip: '未知', location: '未知', isp: '未知' };
    const text = preMatch[1];

    const ip = text.match(/IP\s*:\s*([0-9.]+)/)?.[1] || '未知';
    const location = text.match(/地址\s*:\s*([^\n\r]+)/)?.[1]?.trim() || '未知';
    const isp = text.match(/运营商\s*:\s*([^\n\r]+)/)?.[1]?.trim() || '未知';

    return { ip, location, isp };
}

// ------------------------
function log(msg) {
    if (SURGE_LOG_ENABLE) console.log(`[SurgeIP] ${msg}`);
}

function notify(title, subtitle) {
    if (SURGE_NOTIFY_ENABLE) $notification.post(title, subtitle, '');
}