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

let body = $response.body;
let obj = JSON.parse(body);
const url = $request.url;

// 🧩 1️⃣ 用户信息接口
if (url.includes("usercenter.kugou.com/v3/get_my_info")) {
    if (obj?.data) {
        obj.data.vip_type = 1; // 普通VIP
        obj.data.svip_level = 3; // SVIP等级
        obj.data.su_vip_begin_time = "2025-01-01";
        obj.data.su_vip_end_time = "2099-12-31";
        obj.data.su_vip_y_endtime = "2099-12-31";
        obj.data.su_vip_clearday = "9999";
        obj.data.bookvip_valid = 1;
        obj.data.singvip_valid = 1;
        obj.data.user_type = 1;
        obj.data.vip_text = "SVIP 永久会员";
    }
    console.log("✅ 修改用户VIP信息成功");
}

// 🧩 2️⃣ 绑定信息接口
else if (url.includes("userinfo.user.kugou.com/get_bind")) {
    if (obj?.data) {
        obj.data.vip_type = 2; // 2 = SVIP
        obj.data.m_type = 2;
        obj.data.y_type = 1;
        obj.data.vip_end_time = "2099-12-31 23:59:59";
        obj.data.m_end_time = "2099-12-31 23:59:59";
        obj.data.roam_type = 1;
        obj.data.m_is_old = 1;
    }
    console.log("✅ 修改绑定信息成功");
}

// 🧩 3️⃣ 音质资源权限接口
else if (url.includes("gateway.kugou.com/media.store/v1/get_res_privilege/lite")) {
    if (obj?.data?.length > 0) {
        obj.data.forEach(song => {
            song.privilege = 0;              // 解锁权限
            song.price = 0;                  // 去除价格
            song.fail_process = 0;           // 去除失败限制
            song.expire = 1;                 // 标记为有效
            song.buy_count_vip = 1;          // 标记VIP购买
            song.end_time = "2099-12-31";    // 有效期修改
            if (song.trans_param) {
                song.trans_param.musicpack_advance = 0;
                if (song.trans_param.hash_offset) {
                    song.trans_param.hash_offset.end_ms = 999999999; // 🔓 移除试听限制
                }
            }

            // 所有关联音质版本
            if (song.relate_goods?.length) {
                song.relate_goods.forEach(r => {
                    r.privilege = 0;
                    r.price = 0;
                    r.fail_process = 0;
                    r.expire = 1;
                    r.buy_count_vip = 1;
                    r.end_time = "2099-12-31";
                    if (r.trans_param) {
                        r.trans_param.musicpack_advance = 0;
                        if (r.trans_param.hash_offset) {
                            r.trans_param.hash_offset.end_ms = 999999999; // 🔓 移除试听限制
                        }
                    }
                });
            }
        });
        obj.vip_user_type = 1; // SVIP
    }
    console.log("✅ 解锁音质与试听限制成功");
}

$done({ body: JSON.stringify(obj) });