/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP显示与音质解锁
 * @Version: 1.2.0
 * @Description: 修改酷狗用户信息与资源权限接口，让账号显示为SVIP并解锁全部音质与试听（仅前端效果）
 * @UpdateTime: 2025-10-16
 *
 * http://userinfo.user.kugou.com/get_bind
 * http://trackercdngz.kugou.com/v5/url?
 *
 * "qualities" : [
    "128",
    "320",
    "flac",
    "high",
    "viper_atmos"
  ],
 *
 * 1.^https:\/\/gateway\.kugou\.com\/media\.store\/v1\/get_res_privilege\/lite\?.*
 * 2.http://trackercdngz.kugou.com/v5/url?
 * 3.http://musiclib.service.kugou.com/v1/sing/accompany
 * 4.https://usercenter.kugou.com/v3/get_my_info?
 * 5.http://userinfo.user.kugou.com/get_bind
 * 6.http://everydayrec.service.kugou.com/v2/everyday_song_recommend?
 */

let obj = {};
let otj = {};
const url = $request.url;

// ---------- 解析响应体 ----------
try { obj = JSON.parse($response.body || "{}"); } catch (e) { obj = {}; }

// ---------- 解析请求体（你说了：只在 otj 出现的接口它就是 POST） ----------
try { otj = JSON.parse($request.body || "{}"); } catch (e) { otj = {}; }


// =======================
// 1. v5/url —— 解锁试听限制（只改响应体）
// =======================
if (url.includes("/v5/url")) {

    if (obj?.hash_offset) {
        obj.hash_offset.end_ms = 99999999;
        obj.hash_offset.end_byte = 999999999;
    }

    obj.volume = 1;
    obj.volume_peak = 999999999;
    obj.volume_gain = 1;

    return $done({ body: JSON.stringify(obj) });
}


// =======================
// 2. get_res_privilege/lite —— 这里你写了 otj（说明它是 POST）
// =======================
if (url.includes("/get_res_privilege/lite")) {

    // 修改响应体（VIP 权限、音质）
    if (obj?.data?.[0]) {
        let item = obj.data[0];
        item.privilege = 10;
        item.expire = 1;
        item.buy_count_vip = 1;
        item.level = 6; // hi-res
    }

    // 修改请求体（你说：只要写 otj 的就是 POST）
    otj.vip = 1;
    otj.relate = 1;

    return $done({ body: JSON.stringify(otj) });
}


// =======================
// 3. v1/sing/accompany —— 你没写 otj → 只改响应体
// =======================
if (url.includes("/v1/sing/accompany")) {
    if (obj?.data) {
        obj.data.duration = 9999999;
        obj.data.song_type = 1;
    }
    return $done({ body: JSON.stringify(obj) });
}


// =======================
// 4. get_my_info —— 只改响应体
// =======================
if (url.includes("/v3/get_my_info")) {
    if (obj?.data) {
        obj.data.vip_type = 3;
        obj.data.svip_level = 6;
        obj.data.su_vip_end_time = "2099-01-31";
    }
    return $done({ body: JSON.stringify(obj) });
}


// =======================
// 5. get_bind —— 只改响应体
// =======================
if (url.includes("/get_bind")) {
    if (obj?.data) {
        obj.data.vip_end_time = "2099-01-31";
        obj.data.vip_type = 3;
        obj.data.m_type = 3;
    }
    return $done({ body: JSON.stringify(obj) });
}


// =======================
// 6. everyday_song_recommend —— 你写了 otj → 当 POST 处理
// =======================
if (url.includes("/v2/everyday_song_recommend")) {

    otj.vip_type = 3;
    otj.m_type = 3;

    return $done({ body: JSON.stringify(otj) });
}


// =======================
// 默认输出响应体
// =======================
$done({ body: JSON.stringify(obj) });

