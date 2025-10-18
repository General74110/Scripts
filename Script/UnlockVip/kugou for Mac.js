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
 */

let obj = JSON.parse($response.body);
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

    }
    console.log("userinfo.user.kugou.com/get_bind响应体修改成功");

} else if (url.includes("/v5/url") && obj?.hash_offset) {
    if (obj?.hash_offset) {
        obj.hash_offset.end_ms = 9999999;
        obj.hash_offset.end_byte = 999999999;

        obj.volume = 0;
        obj.volume_peak = 9999999;

        obj.trans_param.display = 1;
    }
    console.log('解除60秒试听限制成功！')
}

$done({ body: JSON.stringify(obj) });