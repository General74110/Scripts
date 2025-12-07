/*
 * @Author: General℡
 * @Github: https://github.com/General74110/Scripts
 * @AppName: 酷狗音乐
 * @ScriptName: 酷狗VIP显示与音质解锁
 * @Version: 1.2.0
 * @Description: 修改酷狗用户信息与资源权限接口，让账号显示为SVIP并解锁全部音质与试听（仅前端效果）
 * @UpdateTime: 2025-12-07
 *
 * https://loginservice.kugou.com/v5/login_by_token?
 * 响应体JSON：
 {
  "data": {
    "is_vip": 0,
    "servertime": "2025-12-07 17:22:10",
    "roam_type": 0,
    "t1": "74b197c8a843b394ffc6ad932af0145777ea11038fe8efcc29c70a99358ee60d6913bd9dd1823c7848e3f13c83e46f93206d373760b36173b406f59c34a565b02c077e24c029da2f6a21cf99207ef6a0",
    "reg_time": "2025-09-25 15:20:44",
    "vip_type": 0,
    "birthday_mmdd": "",
    "userid": 2408712914,
    "listen_end_time": "",
    "su_vip_end_time": "",
    "su_vip_y_endtime": "",
    "user_type": 0,
    "username": "2408712914",
    "qq": 0,
    "exp": 0,
    "m_end_time": "",
    "score": 0,
    "bookvip_valid": 0,
    "bookvip_end_time": "",
    "arttoy_avatar": "",
    "totp_server_timestamp": 1765099331,
    "roam_end_time": "",
    "secu_params": "ae0161c3e69b8a76b0f6a7fd5070ab5c5b6e265a8fbb3e8741164aac5315bab6e434f7bf5e261d7f52104d0e01a26b9dbfac9ca1bcb1668d56d19086bb7bec8159b9f7a33ec52b0e25460403aecce6f9",
    "su_vip_begin_time": "",
    "roam_begin_time": "",
    "vip_end_time": "",
    "sex": 1,
    "listen_type": 0,
    "vip_token": "",
    "nickname": "General",
    "mobile": 1,
    "y_type": 0,
    "m_type": 0,
    "listen_begin_time": "",
    "bc_code": "",
    "su_vip_clearday": "",
    "roam_list": {},
    "user_y_type": 0,
    "pic": "http://imge.kugou.com/kugouicon/165/20250925/20250925152046595698.jpg",
    "m_begin_time": "",
    "t_expire_time": 1767691331,
    "vip_begin_time": "",
    "birthday": "",
    "m_is_old": 0,
    "wechat": 1
  },
  "status": 1,
  "error_code": 0
}
 *https://vip.kugou.com/mobile/vipinfoV2

 响应体JSON：
 {
  "status": 1,
  "errno": 0,
  "error_code": 0,
  "data": {
    "is_vip": 0,
    "servertime": "2025-12-07 17:22:11",
    "h_list": [],
    "m_reset_time": "",
    "m_y_endtime": "",
    "vip_type": 0,
    "vip_begin_time": "",
    "userid": 2408712914,
    "vip_y_endtime": "",
    "svip_level": 0,
    "listen_end_time": "",
    "su_vip_end_time": "",
    "su_vip_y_endtime": "",
    "user_type": 0,
    "m_list": [],
    "annual_fee_begin_time": "",
    "m_end_time": "",
    "su_vip_clearday": "",
    "roam_end_time": "",
    "su_vip_begin_time": "",
    "roam_begin_time": "",
    "y_type": 0,
    "svip_score": 0,
    "h_begin_time": "",
    "m_clearday": "",
    "m_is_old": 0,
    "h_type": 0,
    "dual_su_vip_end_time": "",
    "dual_su_vip_begin_time": "",
    "vip_clearday": "",
    "listen_begin_time": "",
    "vip_end_time": "",
    "vip_list": [],
    "roam_list": [],
    "user_y_type": 0,
    "h_signed": "",
    "m_begin_time": "",
    "listen_type": 0,
    "h_end_time": "",
    "roam_type": 0,
    "annual_fee_end_time": "",
    "m_type": 0,
    "autotype": 0,
    "autoChargeType": 0,
    "autoChargeTime": "",
    "producttype": 0,
    "phone": 0,
    "autostatus": 0,
    "auto_list": [],
    "auto_sub_list": [],
    "autoVipType": 0,
    "lottery_status": 0,
    "first_svip": 1,
    "signed_svip_before": 0,
    "promise": {
      "sign_type": 0,
      "biz_sign": "",
      "sign_valid": 0,
      "sign_status": 0,
      "withhold_count": 0,
      "total_count": 0,
      "first_price": 0,
      "next_price": 0,
      "start_time": "",
      "end_time": "",
      "last_withhold_time": "",
      "next_withhold_time": ""
    },
    "ios_products_sub_tag": 0,
    "promotion_offer_tag": 0,
    "su_vip_upgrade_days": 0,
    "super_vip_upgrade_month": 0,
    "promotion_list": {
      "val1": 0,
      "val2": 0,
      "val3": 0,
      "val4": 0
    },
    "promotion_tag": 0,
    "question_id": 1
  },
  "error": {
    "is_vip": 0,
    "servertime": "2025-12-07 17:22:11",
    "h_list": [],
    "m_reset_time": "",
    "m_y_endtime": "",
    "vip_type": 0,
    "vip_begin_time": "",
    "userid": 2408712914,
    "vip_y_endtime": "",
    "svip_level": 0,
    "listen_end_time": "",
    "su_vip_end_time": "",
    "su_vip_y_endtime": "",
    "user_type": 0,
    "m_list": [],
    "annual_fee_begin_time": "",
    "m_end_time": "",
    "su_vip_clearday": "",
    "roam_end_time": "",
    "su_vip_begin_time": "",
    "roam_begin_time": "",
    "y_type": 0,
    "svip_score": 0,
    "h_begin_time": "",
    "m_clearday": "",
    "m_is_old": 0,
    "h_type": 0,
    "dual_su_vip_end_time": "",
    "dual_su_vip_begin_time": "",
    "vip_clearday": "",
    "listen_begin_time": "",
    "vip_end_time": "",
    "vip_list": [],
    "roam_list": [],
    "user_y_type": 0,
    "h_signed": "",
    "m_begin_time": "",
    "listen_type": 0,
    "h_end_time": "",
    "roam_type": 0,
    "annual_fee_end_time": "",
    "m_type": 0,
    "autotype": 0,
    "autoChargeType": 0,
    "autoChargeTime": "",
    "producttype": 0,
    "phone": 0,
    "autostatus": 0,
    "auto_list": [],
    "auto_sub_list": [],
    "autoVipType": 0,
    "lottery_status": 0,
    "first_svip": 1,
    "signed_svip_before": 0,
    "promise": {
      "sign_type": 0,
      "biz_sign": "",
      "sign_valid": 0,
      "sign_status": 0,
      "withhold_count": 0,
      "total_count": 0,
      "first_price": 0,
      "next_price": 0,
      "start_time": "",
      "end_time": "",
      "last_withhold_time": "",
      "next_withhold_time": ""
    },
    "ios_products_sub_tag": 0,
    "promotion_offer_tag": 0,
    "su_vip_upgrade_days": 0,
    "super_vip_upgrade_month": 0,
    "promotion_list": {
      "val1": 0,
      "val2": 0,
      "val3": 0,
      "val4": 0
    },
    "promotion_tag": 0,
    "question_id": 1
  }
}
 * http://u.mobile.kugou.com/v/ck?

 响应体JSON:
 {
  "data": null,
  "errcode": 0,
  "status": 1,
  "error": ""
}
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

body = JSON.stringify(obj);
$done({body});
