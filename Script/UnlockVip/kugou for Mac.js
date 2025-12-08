/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP显示与音质解锁
 * @Version: 1.2.0
 * @Description: 修改酷狗用户信息与资源权限接口，让账号显示为SVIP并解锁全部音质与试听（仅前端效果）
 * @UpdateTime: 2025-12-07
 *

 */


var url = $request.url;
var body = $response.body;

var obj = JSON.parse(body);

// 修改登录接口的VIP信息
if (url.includes('v5/login_by_token?')) {
    if (obj.data) {
        obj.data.is_vip = 1;
        obj.data.vip_type = 3;  // SVIP
        obj.data.vip_begin_time = "2025-01-01 00:00:00";
        obj.data.vip_end_time = "2099-12-31 23:59:59";
        obj.data.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.su_vip_end_time = "2099-12-31 23:59:59";
        obj.data.listen_type = 1;  // 解锁试听
        obj.data.user_type = 3;    // 高级用户
    }
}

// 修改VIP信息接口
if (url.includes('vipinfoV2')) {
    if (obj.data) {
        obj.data.is_vip = 1;
        obj.data.vip_type = 3;
        obj.data.svip_level = 7;  // 最高SVIP等级
        obj.data.vip_begin_time = "2025-01-01 00:00:00";
        obj.data.vip_end_time = "2099-12-31 23:59:59";
        obj.data.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.su_vip_end_time = "2099-12-31 23:59:59";
        obj.data.listen_type = 1;
        obj.data.user_type = 3;
        obj.data.m_type = 1;      // 解锁无损音质
        obj.data.y_type = 1;      // 解锁高品音质
        obj.data.h_type = 1;      // 解锁HiFi音质
    }
}

// 修改音质检查接口
if (url.includes('v/ck?')) {
    obj.data = {
        "is_vip": 1,
        "vip_type": 3,
        "listen_type": 1,
        "m_type": 1,
        "y_type": 1,
        "h_type": 1,
        "vip_end_time": "2099-12-31 23:59:59"
    };
}

// 修改用户信息接口
if (url.includes('user.kugou.com/get_bind')) {
    if (obj.data) {
        obj.data.vip_type = 3;
        obj.data.m_type = 1;
        obj.data.y_type = 1;
        obj.data.vip_end_time = "2099-12-31 23:59:59";
    }
}

// 修改用户等级信息接口
if (url.includes('get_grade_info')) {
    if (obj.data) {
        obj.data.p_grade = 7;  // 最高等级
        obj.data.p_current_point = 99999;
        obj.data.p_next_grade_point = 99999;
    }
}

// 修改用户中心信息接口
if (url.includes('get_my_info')) {
    if (obj.data) {
        obj.data.vip_type = 3;
        obj.data.m_type = 1;
        obj.data.y_type = 1;
        obj.data.user_type = 3;
        obj.data.svip_level = 7;
        obj.data.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.su_vip_end_time = "2099-12-31 23:59:59";
    }
}

// 修改登录扩展信息接口
if (url.includes('get_login_extend_info')) {
    if (obj.data && obj.data.vipinfo) {
        obj.data.vipinfo.vip_type = 3;
        obj.data.vipinfo.m_type = 1;
        obj.data.vipinfo.y_type = 1;
        obj.data.vipinfo.user_type = 3;
        obj.data.vipinfo.svip_level = 7;
        obj.data.vipinfo.su_vip_begin_time = "2025-01-01 00:00:00";
        obj.data.vipinfo.su_vip_end_time = "2099-12-31 23:59:59";
    }
}

// 修改隐私信息接口
if (url.includes('privacy/info')) {
    obj.data = {
        "info": {
            "vip_status": 1,
            "svip_level": 7,
            "expire_time": "2099-12-31 23:59:59"
        }
    };
}

// 修改用户状态接口
if (url.includes('switchState')) {
    if (obj.data) {
        obj.data.status = 1;  // 开启所有特权
        // 新增VIP相关字段
        obj.data.is_vip = 1;
        obj.data.vip_type = 3;  // SVIP
        obj.data.vip_end_time = "2099-12-31 23:59:59";
        obj.data.listen_type = 1;  // 解锁试听
        obj.data.m_type = 1;      // 解锁无损音质
        obj.data.y_type = 1;      // 解锁高品音质
    }
}

if (url.includes('get_res_privilege/lite')) {

    function unlock(item) {
        if (!item) return;

        // 解锁主音质信息
        item.privilege = 0;     // 核心：不需要会员/付费
        item.fail_process = 0;  // 不触发失败流程
        item.pay_type = 0;      // 不需要付费
        item.price = 0;
        item.pkg_price = 0;

        // 强制发布
        item.publish = 1;
        item.is_publish = 1;

        // 解锁所有音质（relate_goods）
        if (item.relate_goods && Array.isArray(item.relate_goods)) {
            item.relate_goods.forEach(goods => {
                goods.privilege = 0;
                goods.fail_process = 0;
                goods.pay_type = 0;
                goods.price = 0;
                goods.pkg_price = 0;

                goods.publish = 1;
                goods.is_publish = 1;
            });
        }

        // === 新增你这种“VIP 全开启”模式 ===
        item.status = 1;
        item.is_vip = 1;
        item.vip_type = 3;  // SVIP
        item.vip_end_time = "2099-12-31 23:59:59";
        item.listen_type = 1; // 解锁试听
        item.m_type = 1;      // 解锁无损
        item.y_type = 1;      // 解锁高品
    }

    // 遍历 data（每首歌）
    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(song => unlock(song));
    }
}


body = JSON.stringify(obj);
$done({body});
