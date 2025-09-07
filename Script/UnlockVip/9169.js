/*
【App】
#> 9169
【作者】
#> General℡
【下载地址】
#> www.9169.app
【脚本功能】
#> 解锁会员和金币播放
【说明】
#> 部分下载可能需要先开启脚本
#> 如app刷新不了，给域名添加代理
#> hostname可能会变更，注意网络活动地址

#> 如失效请在TG反馈！



[rewrite_local]

^https:\/\/api\.9169av1\.app\/bibidd\/(Mediaonenine\/(panduan_huiyuan|jinbi_zhuanqu_list|watch_goldvideo_yn|dingtunjieshe_list_show|user_gold_coins_amount)|Advert\/get_index_Advert) url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Quantumult%20X/Script/UnlockVip/9169.js, requires-body=true, timeout=60, tag=9169

[MITM]
hostname = api.9169av1.app
*/

var body = $response.body;
var url = $request.url;
var obj = JSON.parse(body);

const vip = '/Mediaonenine/panduan_huiyuan';
const jb = '/Mediaonenine/jinbi_zhuanqu_list';
const js = '/Mediaonenine/dingtunjieshe_list_show';
const us = '/Mediaonenine/user_gold_coins_amount';
const gg = '/Mediaonenine/watch_goldvideo_yn';
const ad = 'bibidd/Advert/get_index_Advert';


if (url.indexOf(vip) != -1) {
    obj["status"] = 1;
    obj ["message"] = "is_vip";
    obj["coins"] = "is_coins";
    body = JSON.stringify(obj);
}

if (url.indexOf(jb) != -1) {
    const originalId = obj.data[0].id;   // 获取原始的 id
    const originalUid = obj.data[0].uid; // 获取原始的 uid
    // 针对 `jb` 的响应体处理逻辑
    obj.data = [
        {
            "fancha": "1",
            "av": "1",
            "dingtun": "1",
            "sm": "1",
            "yuepao": "1",
            "luoli": "1",
            "zhanjie_nv": "1",
            "cgx": "1",
            "ysxs": "1",
            "se_liao": "1",
            "xazs": "1",
            "hei_liao": "1",
            "xiaoshuo": "1",
            "chaodi": "1",
            "mh": "1",
            "wangbao": "1",
            "quanziu_zhibo": "1",
            "wanou": "1",
            "cesuo": "1",
            "id": originalId,
            "jipin_setu": "1",
            "uid": originalUid,
            "jinp_zhibo": "1",
            "su_yan": "1",
            "age_18": "1",
            "nvzi_spa": "1",
            "wuma_av": "1",
            "kou_jiao": "1",
            "gangtai_sanji": "1",
            "jin_3p": "1",
            "lieqi": "1"
        }
    ];

    body = JSON.stringify(obj);
}

if (url.indexOf(js) != -1) {
    // 针对 `js` 的响应体处理逻辑
    obj.data.forEach(item => {
        // 将 isUnlock 从 false 改为 true
        if (item.isUnlock === false) {
            item.isUnlock = true;
        }
        // 将 type 从 null 改为 1
        if (item.coins === '3') {
            item.coins = '0';
        }
        if (item.biaoqian_yn === '0') {
            item.biaoqian_yn = '1';
        }

        if (item.yure === '0') {
            item.yure = '1';
        }



    });

    body = JSON.stringify(obj);
}

if (url.indexOf(us) != -1) {
    obj.status = 1;
    obj.data = 9999999;

    body = JSON.stringify(obj);

}


if (url.indexOf(gg) != -1) {
    obj.message = 'ok';

    body = JSON.stringify(obj);

}

// 判断是否为匹配项
if (url.indexOf(ad) != -1) {
    //判断是否存在数据

    if (obj.hasOwnProperty("data"))  {
        delete obj.data;


        console.log(obj);

    }

}

$done({body});