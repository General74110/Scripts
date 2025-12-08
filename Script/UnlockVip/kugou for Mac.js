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
/*
if (url.includes('get_res_privilege/lite')) {
    function unlock(item) {
        if (!item) return;

        // 合并核心解锁逻辑
        item.privilege = 0;     // 不需要会员/付费
        item.fail_process = 0;  // 允许试听/播放
        item.pay_type = 0;      // 不需要付费
        item.price = 0;
        item.pkg_price = 0;
        item.is_preview = 1;    // 新增：明确标记可试听

        // 合并发布相关字段
        item.publish = 1;
        item.is_publish = 1;

        // 合并VIP相关字段
        item.status = 1;
        item.is_vip = 1;
        item.vip_type = 3;      // SVIP
        item.vip_end_time = "2099-12-31 23:59:59";
        item.listen_type = 1;   // 解锁试听
        item.m_type = 1;        // 解锁无损
        item.y_type = 1;        // 解锁高品

        // 合并relate_goods处理（优化后的版本）
        if (item.relate_goods && Array.isArray(item.relate_goods)) {
            item.relate_goods.forEach(g => {
                g.privilege = 0;
                g.fail_process = 0;
                g.pay_type = 0;
                g.price = 0;
                g.pkg_price = 0;
                g.is_preview = 1;  // 新增
                g.publish = 1;     // 保留原字段
                g.is_publish = 1;  // 保留原字段
            });
        }
    }

    // 统一数据处理逻辑
    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(unlock);
    }
}

// 修改后的音质解锁接口处理（方案一）
if (url.includes('trackercdngz.kugou.com/v5/url')) {
    // 删除试听限制字段（客户端将默认播放完整歌曲）
    delete obj.hash_offset;

    // 保留其他必要修改
    obj = {
        "priv_status": 1,
        "auth_through": obj.auth_through || [], // 保留原鉴权信息
        "fail_process": [],  // 清空所有限制项
        "trans_param": obj.trans_param,  // 保留原始音质参数
        "status": 1,  // 强制成功状态
        "tracker_through": {
            ...obj.tracker_through,  // 保留原追踪参数
            "all_quality_free": 1  // 解锁全音质
        }
    };
}

if (url.includes('/v1/get_business_res_privilege')) {
    // 修改全局VIP状态
    obj.vip_user_type = 3;  // SVIP

    // 修改每首歌曲的权限
    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(song => {
            // 基础权限解锁
          //  song.privilege = 0;
          //  song.fail_process = 0;
          //  song.pay_type = 0;
          //  song.price = 0;
         //   song.pkg_price = 0;
        //    song.status = 1;  // 0→1（启用状态）

            // 解除试听限制
            if (song.trans_param) {
                song.trans_param.hash_offset = null;  // 关键！
                song.trans_param.pay_block_tpl = 0;
            }
        });
    }
}*/




body = JSON.stringify(obj);
$done({body});
