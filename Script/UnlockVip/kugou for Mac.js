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

// 保险处理：避免 JSON.parse 报错
try {
    obj = JSON.parse($response.body || "{}");
} catch (e) {
    obj = {};
}

try {
    otj = JSON.parse($request.body || "{}");
} catch (e) {
    otj = {};
}

// =======================
//   1. v5/url —— 解锁试听限制
// =======================
if (url.includes("/v5/url")) {
    if (obj?.hash_offset) {
        obj.hash_offset.end_ms = 9999999;
        obj.hash_offset.end_byte = 999999999;
        obj.hash_offset.file_type = 1;
    }

    obj.volume = 1;
    obj.volume_peak = 999999999;
    obj.volume_gain = 1;

    // =======================
    //   2. 资源权限 —— VIP 音质
    // =======================
} else if (url.includes("/get_res_privilege/lite")) {

    // 强制请求体声明 vip=1
    otj.vip = 1;
    otj.relate = 1;

    if (obj?.data?.[0]) {
        obj.data[0].quality = "viper_atmos";  // 最顶音质
        obj.data[0].end_time = "2099-01-31";  // 永久授权
    }

// =======================
//   3. 伴奏资源增强
// =======================
} else if (url.includes("/v1/sing/accompany")) {
    if (obj?.data) {
        obj.data.duration = 9999999;
        obj.data.song_type = 1;
    }

// =======================
//   4. 用户信息 —— 修改会员类型
// =======================
} else if (url.includes("/v3/get_my_info")) {
    if (obj?.data) {
        obj.data.vip_type = 3;     // 3 = 年度 SVIP（你说的会员类型）
        // 可选增强：直接把过期时间改到 2099
        obj.data.vip_endtime = 4073472000000; // 时间戳，可选

        obj.data.svip_score = 999;
        obj.data.star_status = 1;
        obj.data.su_vip_begin_time = "2021-01-31";
        obj.data.user_type = 3;
        obj.data.svip_level = 6;
        obj.data.singer_status = 1;
        obj.data.su_vip_y_endtime = 4073472000000;
        obj.data.fans = 1;
        obj.data.user_y_type = 3;
        obj.data.m_type = 3;
        obj.data.singvip_valid = 1;
        obj.data.su_vip_clearday = 1;
        obj.data.hvisitors = 1;
        obj.data.su_vip_end_time = 4073472000000;
        obj.data.is_star = 1;


    }
} else if (url.includes("/get_bind")) {
    if (obj?.data) {
        obj.data.vip_end_time = "2099-01-31";
        obj.data.m_type = 3;
        obj.data.roam_type = 1;
        obj.data.vip_type = 3;
        obj.data.m_is_old = 1;
        obj.data.roam_end_time = "2099-01-31";
        obj.data.m_end_time = "2099-01-31";
        obj.data.y_type = 3;
        obj.data.roam_begin_time = "2021-01-31";
    }
} else if (url.includes("/v2/everyday_song_recommend")) {
    otj.vip_type = 3;
    otj.m_type = 3;
}

// 输出结果
const response = {
    body: JSON.stringify(obj)
};

$done(response);


