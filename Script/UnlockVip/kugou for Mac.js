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
 */

let body = $response.body;
let obj = JSON.parse(body);
const url = $request.url;

// 🧩 1️⃣ 用户信息接口
if (url.includes("/get_bind")) {
    if (obj?.data) {
        obj.data.vip_end_time = "2099-12-31";
        obj.data.m_type = 1;
        obj.data.vip_type = 1;
        obj.data.y_type = 1;
        obj.data.roam_type = 1;

        obj.vip_type = 1;
        obj.roam_end_time = "2099-12-31";
        obj.m_end_time = "2099-12-31";
        obj.y_type = 1;


        console.log("userinfo.user.kugou.com/get_bind响应体修改成功");
    }
}

$done({ body: JSON.stringify(obj) });