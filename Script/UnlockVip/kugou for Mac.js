
/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP显示与音质解锁（伪装已购买）
 * @Version: 1.2.3
 * @Description: 显示SVIP + 解锁试听 + 音质 + 伪装买过曲目，尝试获取整曲资源（仅前端效果）
 * @UpdateTime: 2025-12-08
 */

var url = $request.url;
var body = $response.body;


var obj = JSON.parse(body);


// 通用伪装字段合并器
function applyVipFields(target) {
    Object.assign(target, {
        is_vip: 1,
        vip_type: 3,
        user_type: 3,
        listen_type: 1,
        m_type: 1,
        y_type: 1,
        h_type: 1,
        svip_level: 7,
        vip_begin_time: "2025-01-01 00:00:00",
        vip_end_time: "2099-12-31 23:59:59",
        su_vip_begin_time: "2025-01-01 00:00:00",
        su_vip_end_time: "2099-12-31 23:59:59"
    });
}

// 登录接口
if (url.includes('v5/login_by_token?')) {
    if (obj.data) applyVipFields(obj.data);
}

// VIP信息接口
if (url.includes('vipinfoV2')) {
    if (obj.data) applyVipFields(obj.data);
}

// 用户信息接口
if (url.includes('get_my_info')) {
    if (obj.data) {
        applyVipFields(obj.data);
        Object.assign(obj.data, {
            listen_visible: 1,
            album_visible: 1,
            mv_visible: 1,
            live_visible: 1
        });
    }
}

// 绑定接口
if (url.includes('get_bind')) {
    if (obj.data) applyVipFields(obj.data);
}

// 登录扩展信息
if (url.includes('get_login_extend_info')) {
    if (obj.data && obj.data.vipinfo) applyVipFields(obj.data.vipinfo);
}

// 等级信息
if (url.includes('get_grade_info')) {
    if (obj.data) {
        obj.data.p_grade = 7;
        obj.data.p_current_point = 99999;
        obj.data.p_next_grade_point = 99999;
        obj.data.finish_percent = 100;
    }
}

// 秀场状态
if (url.includes('switchState')) {
    if (obj.data) applyVipFields(obj.data);
}

// 心跳接口
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

// 隐私信息
if (url.includes('privacy/info')) {
    obj.data = {
        info: {
            vip_status: 1,
            svip_level: 7,
            expire_time: "2099-12-31 23:59:59"
        }
    };
}

// get_res_privilege/lite 解锁 + 伪装已买
if (url.includes('get_res_privilege/lite')) {
    function unlock(item) {
        if (!item) return;
        applyVipFields(item);
        Object.assign(item, {
            privilege: 0,
            fail_process: 0,
            pay_type: 0,
            price: 0,
            pkg_price: 0,
            is_preview: 0,
            is_publish: 1,
            publish: 1,
            status: 1,
            buy_count: 1,
            buy_count_vip: 1,
            buy_count_kubi: 1,
            buy_count_audios: 1
        });

        if (item.relate_goods && Array.isArray(item.relate_goods)) {
            item.relate_goods.forEach(g => {
                Object.assign(g, {
                    privilege: 0,
                    fail_process: 0,
                    pay_type: 0,
                    price: 0,
                    pkg_price: 0,
                    is_preview: 0,
                    publish: 1,
                    is_publish: 1,
                    buy_count: 1
                });
            });
        }
    }

    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(unlock);
    }
}

// trackercdngz 接口 - 保留hash_offset结构，改试听为完整
if (url.includes('trackercdngz.kugou.com/v5/url')) {
    if (obj.hash_offset) {
        obj.hash_offset.start_ms = 0;
        obj.hash_offset.end_ms = 999999;  // 试听最大值
        obj.hash_offset.end_byte = obj.hash_offset.end_byte || 9999999;
    }
    obj.status = 1;
    obj.priv_status = 1;
    obj.fail_process = [];
    obj.tracker_through = Object.assign(obj.tracker_through || {}, {
        all_quality_free: 1
    });
}

// audiobookstore 接口 - 伪装已购买
if (url.includes('/v1/get_business_res_privilege')) {
    obj.vip_user_type = 3;
    if (obj.data && Array.isArray(obj.data)) {
        obj.data.forEach(song => {
            applyVipFields(song);
            Object.assign(song, {
                privilege: 0,
                fail_process: 0,
                pay_type: 0,
                price: 0,
                pkg_price: 0,
                status: 1,
                buy_count: 1,
                is_preview: 0
            });

            if (song.trans_param && song.trans_param.hash_offset) {
                song.trans_param.hash_offset.start_ms = 0;
                song.trans_param.hash_offset.end_ms = 999999;
                song.trans_param.hash_offset.end_byte = song.trans_param.hash_offset.end_byte || 9999999;
            }

            if (song.trans_param) {
                song.trans_param.pay_block_tpl = 0;
            }
        });
    }
}

obj._modified_by = "General Script v1.2.3 (已购买伪装)";
body = JSON.stringify(obj);
$done({ body });
