
/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP显示与音质解锁
 * @Version: 1.2.1
 * @Description: 修改酷狗用户信息与资源权限接口，让账号显示为SVIP并解锁全部音质与试听（仅前端效果）
 * @UpdateTime: 2025-12-08
 */

var url = $request.url;
var body = $response.body;
var obj = JSON.parse(body);

// 登录接口
if (url.includes('v5/login_by_token?')) {
    if (obj.data) {
        Object.assign(obj.data, {
            is_vip: 1,
            vip_type: 3,
            vip_begin_time: "2025-01-01 00:00:00",
            vip_end_time: "2099-12-31 23:59:59",
            su_vip_begin_time: "2025-01-01 00:00:00",
            su_vip_end_time: "2099-12-31 23:59:59",
            listen_type: 1,
            user_type: 3
        });
    }
}

// VIP信息接口
if (url.includes('vipinfoV2')) {
    if (obj.data) {
        Object.assign(obj.data, {
            is_vip: 1,
            vip_type: 3,
            svip_level: 7,
            vip_begin_time: "2025-01-01 00:00:00",
            vip_end_time: "2099-12-31 23:59:59",
            su_vip_begin_time: "2025-01-01 00:00:00",
            su_vip_end_time: "2099-12-31 23:59:59",
            listen_type: 1,
            user_type: 3,
            m_type: 1,
            y_type: 1,
            h_type: 1
        });
    }
}

// 心跳校验接口
if (url.includes('v/ck?')) {
    obj.data = {
        is_vip: 1,
        vip_type: 3,
        listen_type: 1,
        m_type: 1,
        y_type: 1,
        h_type: 1,
        vip_end_time: "2099-12-31 23:59:59"
    };
}

// 绑定信息接口
if (url.includes('get_bind')) {
    if (obj.data) {
        Object.assign(obj.data, {
            vip_type: 3,
            m_type: 1,
            y_type: 1,
            vip_end_time: "2099-12-31 23:59:59"
        });
    }
}

// 等级信息接口
if (url.includes('get_grade_info')) {
    if (obj.data) {
        Object.assign(obj.data, {
            p_grade: 7,
            p_current_point: 99999,
            p_next_grade_point: 99999,
            finish_percent: 100
        });
    }
}

// 用户中心信息接口
if (url.includes('get_my_info')) {
    if (obj.data) {
        Object.assign(obj.data, {
            vip_type: 3,
            m_type: 1,
            y_type: 1,
            user_type: 3,
            svip_level: 7,
            su_vip_begin_time: "2025-01-01 00:00:00",
            su_vip_end_time: "2099-12-31 23:59:59",
            listen_visible: 1,
            album_visible: 1,
            mv_visible: 1,
            live_visible: 1
        });
    }
}

// 登录扩展信息
if (url.includes('get_login_extend_info')) {
    if (obj.data && obj.data.vipinfo) {
        Object.assign(obj.data.vipinfo, {
            vip_type: 3,
            m_type: 1,
            y_type: 1,
            user_type: 3,
            svip_level: 7,
            su_vip_begin_time: "2025-01-01 00:00:00",
            su_vip_end_time: "2099-12-31 23:59:59"
        });
    }
}

// 隐私信息接口
if (url.includes('privacy/info')) {
    obj.data = {
        info: {
            vip_status: 1,
            svip_level: 7,
            expire_time: "2099-12-31 23:59:59"
        }
    };
}

// 用户秀场状态接口
if (url.includes('switchState')) {
    if (obj.data) {
        Object.assign(obj.data, {
            status: 1,
            is_vip: 1,
            vip_type: 3,
            vip_end_time: "2099-12-31 23:59:59",
            listen_type: 1,
            m_type: 1,
            y_type: 1
        });
    }
}

// 歌曲权限 lite 接口
if (url.includes('get_res_privilege/lite')) {
    function unlock(item) {
        if (!item) return;
        Object.assign(item, {
            privilege: 0,
            fail_process: 0,
            pay_type: 0,
            price: 0,
            pkg_price: 0,
            is_preview: 1,
            publish: 1,
            is_publish: 1,
            status: 1,
            is_vip: 1,
            vip_type: 3,
            vip_end_time: "2099-12-31 23:59:59",
            listen_type: 1,
            m_type: 1,
            y_type: 1
        });

        if (item.relate_goods && Array.isArray(item.relate_goods)) {
            item.relate_goods.forEach(g => {
                Object.assign(g, {
                    privilege: 0,
                    fail_process: 0,
                    pay_type: 0,
                    price: 0,
                    pkg_price: 0,
                    is_preview: 1,
                    publish: 1,
                    is_publish: 1
                });
            });
        }
    }

    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(unlock);
    }
}

// trackercdngz 解锁试听 + 音质
if (url.includes('trackercdngz.kugou.com/v5/url')) {
    if (obj.hash_offset) {
        delete obj.hash_offset;
    }
    obj.priv_status = 1;
    obj.status = 1;
    obj.fail_process = [];
    obj.tracker_through = Object.assign(obj.tracker_through || {}, {
        all_quality_free: 1
    });
}

// 有声书资源权限接口
if (url.includes('/v1/get_business_res_privilege')) {
    obj.vip_user_type = 3;
    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(song => {
            Object.assign(song, {
                privilege: 0,
                fail_process: 0,
                pay_type: 0,
                price: 0,
                pkg_price: 0,
                status: 1
            });

            if (song.trans_param) {
                song.trans_param.hash_offset = null;
                song.trans_param.pay_block_tpl = 0;
            }
        });
    }
}

// 添加标记字段
obj._modified_by = "General Script v1.2.1";

body = JSON.stringify(obj);
$done({ body });
