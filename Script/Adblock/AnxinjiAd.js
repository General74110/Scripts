/*
作者: General℡
APP: 安心记加班
应用: 
1️⃣去除开屏广告


更新时间: 2024.12.1

⚠️脚本仅作为学习，请勿拿去牟利⚠️

[rewrite_local]
^https?:\/\/jjbapi\.julanling\.com\/(advertConfig\/queryCutOverScreenConfig|splash_screen\/jjb_splash_screen_v3|switch_my\/vip_banner_info|invite_share_v2\/switch_my|switch\/init_config_v2)\?/ url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Quantumult%20X/Script/Adblock/AnxinjiAd.js

^https:\/\/jjbapi\.julanling\.com\/market\/home_config url reject-200

[MITM]
hostname = *.julanling.com

*/


//获取相应数据
let obj = JSON.parse($response.body);
// 获取请求地址
let requestUrl = $request.url;
// 判断是否为匹配项
if (/^https?:\/\/jjbapi\.julanling\.com\/advertConfig\/queryCutOverScreenConfig\?/.test(requestUrl)) {
    //判断是否存在数据
    
     if (obj.hasOwnProperty("results"))  {
        delete obj.results.onePicConfigResp;//删掉onePicConfigResp
         delete obj.results.cutOverScreenConfigRespList;


console.log(obj);

    }
    
} else if (/^https?:\/\/jjbapi\.julanling\.com\/splash_screen\/jjb_splash_screen_v3\?/.test(requestUrl)) {
    if (obj.hasOwnProperty("results")) {
    
        delete obj.results['list'][0].statistics;//删掉statistics
        
        delete obj.results['list'][0].id;//删掉id
        
        delete obj.results['list'][0].target_type;//删掉target_type
        
        delete obj.results['list'][0].position_id;//删掉position_id
        
        delete obj.results['list'][0].request_timeout;//删掉request_timeout
        
        delete obj.results['list'][0].splash_group_id;//删掉splash_group_id
    
        

console.log(obj);
    }
} else if (/^https:\/\/jjbapi\.julanling\.com\/switch_my\/vip_banner_info\?/.test(requestUrl)) {
    if (obj.hasOwnProperty("results")) {
        delete  obj.results;//“我的”页面会员开通开关

        console.log(obj);
    }
} else if (/^https:\/\/jjbapi\.julanling\.com\/invite_share_v2\/switch_my\?/.test(requestUrl)) {
    if (obj.hasOwnProperty("results")) {
        delete obj.results;//“我的”页面精简(拍工资条,推荐工友使用,新手教程)

        console.log(obj);
    }
} else if (/^https:\/\/jjbapi\.julanling\.com\/switch\/init_config_v2\?/.test(requestUrl)) {
    if (typeof obj === "object" && obj !== null && obj.results && obj.results.switch_list) {
        delete obj.results.switch_list;//引流广告
        delete obj.results.zgz_wage;//引流广告

        console.log(obj);

    }
}


//重写数据
$done ({body: JSON.stringify(obj)});