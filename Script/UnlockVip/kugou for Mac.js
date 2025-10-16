/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP
 * @Version: 1.0.0
 * @Description: 修改酷狗接口返回，让账号显示为SVIP状态（仅前端显示，不影响实际权限）
 * @UpdateTime: 2025-10-16
 * [Script]
kugou_vip = type=http-response,pattern=^https:\/\/(usercenter\.kugou\.com\/v3\/get_my_info|userinfo\.user\.kugou\.com\/get_bind|gateway\.kugou\.com\/media\.store\/v1\/get_res_privilege\/lite),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/UnlockVip/kugou for Mac.js
* [MITM]
* hostname = *.kugou.com
 */

const DEBUG = false; // 开 true 查看日志
const LONG_MS = 999999999; // 用于替换 end_ms
const LONG_BYTE = 999999999; // 用于替换 end_byte

try {
    const url = $request.url || "";
    let body = $response && $response.body ? $response.body : "{}";
    let obj = JSON.parse(body);

    // 只处理资源权限 lite 接口
    if (url.includes("/media.store/v1/get_res_privilege/lite") && Array.isArray(obj.data)) {
        obj.data.forEach(item => {
            // --- 1) 修改播放判定字段 ---
            if (typeof item.privilege !== "undefined") item.privilege = 0;
            if (typeof item.expire !== "undefined") item.expire = 1;
            if (typeof item.buy_count_vip !== "undefined") item.buy_count_vip = 1;

            // --- 2) 修改 trans_param.hash_offset（如果存在） ---
            if (item.trans_param && item.trans_param.hash_offset) {
                const ho = item.trans_param.hash_offset;
                if (typeof ho.end_ms !== "undefined") ho.end_ms = LONG_MS;
                if (typeof ho.end_byte !== "undefined") ho.end_byte = LONG_BYTE;

                // 可选：确保 start_ms/start_byte 非负
                if (typeof ho.start_ms === "undefined") ho.start_ms = 0;
                if (typeof ho.start_byte === "undefined") ho.start_byte = 0;
            }

            // --- 3) 关联音质也处理 ---
            if (Array.isArray(item.relate_goods)) {
                item.relate_goods.forEach(r => {
                    if (typeof r.privilege !== "undefined") r.privilege = 0;
                    if (typeof r.expire !== "undefined") r.expire = 1;
                    if (typeof r.buy_count_vip !== "undefined") r.buy_count_vip = 1;

                    if (r.trans_param && r.trans_param.hash_offset) {
                        const rho = r.trans_param.hash_offset;
                        if (typeof rho.end_ms !== "undefined") rho.end_ms = LONG_MS;
                        if (typeof rho.end_byte !== "undefined") rho.end_byte = LONG_BYTE;
                        if (typeof rho.start_ms === "undefined") rho.start_ms = 0;
                        if (typeof rho.start_byte === "undefined") rho.start_byte = 0;
                    }
                });
            }
        });

        // 可选：标记客户端参考的VIP类型（不必要，可注释）
        // obj.vip_user_type = 2;

        if (DEBUG) {
            console.log("kugou_minimal_unlock: 已修改 data 项数 =", obj.data.length);
            console.log(JSON.stringify(obj.data.map(d => ({
                hash_offset: d.trans_param && d.trans_param.hash_offset ? {
                    end_ms: d.trans_param.hash_offset.end_ms,
                    end_byte: d.trans_param.hash_offset.end_byte
                } : null,
                privilege: d.privilege,
                expire: d.expire,
                buy_count_vip: d.buy_count_vip
            })), null, 2));
        }
    }

    $done({ body: JSON.stringify(obj) });
} catch (e) {
    if (DEBUG) console.log("kugou_minimal_unlock error:", e);
    $done({});
}