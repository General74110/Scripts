/*
[rewrite_local]

^https:\/\/tsp-operation\.txzing\.com\/api(\/p/operation/common/allowFreeVip|\/p/operation/vipCoupon/popUpCouponInfo|\/p/operation/activity/situation|\/w/wx/module/findCar/findCarVipInfo/isVip|\/w/wx/module/trace/userVip|\/w/wx/module/traceMp/traceUserVipOpenId/vipInfo|\/w\/wx\/module\/smallProgram\/userInfo|\/wx\/module\/smallProgram\/userInfo\/banner|\/w\/wx\/module\/smallProgram\/premiumVip\/premiumVipInfo\/vipInfo) url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Quantumult%20X/Script/UnlockVip/cgj.js, requires-body=true, timeout=60, tag=车管家




MITM

hostname = *.txzing.com
*/

var body = $response.body;
var url = $request.url;
var obj = JSON.parse(body);


const dish = '/vipCoupon/popUpCouponInfo';
const sb = '/activity/situation';
const bd = '/findCarVipInfo/isVip';
const gj = '/trace/userVip';
const gg = '/traceUserVipOpenId/vipInfo';
const us = '/smallProgram/userInfo';
const ban = '/userInfo/banner';
const vip = 'premiumVipInfo/vipInfo';


if (url.indexOf(bd) != -1) {
    obj["data"]["vip"] = "true";
    body = JSON.stringify(obj);
}

if (url.indexOf(dish) != -1) {
    obj["data"]["show_cou_pon"] = "1";
    body = JSON.stringify(obj);
}

if (url.indexOf(sb) != -1) {
    obj["data"]["is_can_participate"] = "true";
    body = JSON.stringify(obj);
}

if (url.indexOf(bd) != -1) {
    obj["data"]["pop_up"] = "1";
    obj["data"]["vip"] = "true"
    body = JSON.stringify(obj);
}

if (url.indexOf(gj) != -1) {
    obj["data"]["is_vip"] = "true"
    body = JSON.stringify(obj);
}

if (url.indexOf(gg) != -1) {
    obj["data"]["vip"] = "true";
    obj["data"]["day"] = 738639;
    obj["data"]["can_use_free_vip"] = "false";
    body = JSON.stringify(obj);
}

if (url.indexOf(us) != -1) {
    obj["data"]["online"] = "true";
    body = JSON.stringify(obj);
}

if (url.indexOf(ban) != -1) {
    obj ['data'][0].id = 4;
    body = JSON.stringify(obj);
}

if (url.indexOf(vip) != -1) {
    obj["data"]["vip"] = "true";
    obj["data"]["can_use_free_vip"] = "false";
    obj["data"]["day"] = 738639;
    body = JSON.stringify(obj);
}

$done({body});