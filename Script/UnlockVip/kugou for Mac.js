/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP
 * @Version: 1.0.0
 * @Description: 修改酷狗接口返回，让账号显示为SVIP状态（仅前端显示，不影响实际权限）
 * @UpdateTime: 2025-10-16
 * [Script]
kugou_vip = type=http-response,pattern=^https?:\/\/(usercenter\.kugou\.com\/v3\/get_my_info|userinfo\.user\.kugou\.com\/get_bind),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/General74110/Scripts/main/kugou_vip.js
* [MITM]
* hostname = *.kugou.com
 */

let body = $response.body;
let obj = JSON.parse(body);

const url = $request.url;

// 🧩 接口1：用户信息
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
}

// 🧩 接口2：绑定信息
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
}

$done({ body: JSON.stringify(obj) });