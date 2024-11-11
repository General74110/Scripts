/*
【App】贴心说明
【下载地址】：https://apps.apple.com/us/app/%E8%B4%B4%E5%BF%83%E8%AF%B4%E6%98%8E/id6736427101?l=zh-Hans-CN
【脚本功能】：解锁会员播放
【说明】：app需添加代理
[rule]
HOST, api.9169kkxstzsjkdd222.app, 自动选择


[rewrite_local]

^https:\/\/api\.9169kkxstzsjkdd222\.app\/bibidd\/Mediaonenine\/panduan_huiyuan url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Quantumult%20X/Script/UnlockVip/9169.js, requires-body=true, timeout=60, tag=9169


[MITM]
hostname = api.9169kkxstzsjkdd222.app
*/

var body = $response.body;
var url = $request.url;
var obj = JSON.parse(body);

const vip = '/Mediaonenine/panduan_huiyuan';


if (url.indexOf(vip) != -1) {
    obj["status"] = 1;
    obj ["message"] = "is_vip";
    obj["coins"] = "is_coins";
    body = JSON.stringify(obj);
}

$done({body});