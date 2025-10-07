//获取相应数据
let obj = JSON.parse($response.body);
// 获取请求地址
let requestUrl = $request.url;
// 判断是否为匹配项
 if (/^https:\/\/ocean\.shuqireader\.com\/sqios\/render\/render\/page\/bookstore/.test(requestUrl)) {

    if (obj.data && obj.data.moduleInfos && Array.isArray(obj.data.moduleInfos) && obj.data.moduleInfos.length > 1) {
        delete obj.data.moduleInfos[1];// 章末推荐书籍
    }
    if (obj.data && obj.data.props && obj.data.props["x-preProcessor"] && Array.isArray(obj.data.props["x-preProcessor"])) {
        delete obj.data.props["x-preProcessor"][0]; // 书城横幅
    }
} else if (/^https:\/\/ocean\.shuqireader\.com\/sqios\/render\/render\/native\/page\/scene/.test(requestUrl)) {
    if (obj.data) {
        obj.data = {};
    }

} else if (/^https:\/\/ocean\.shuqireader\.com\/api\/route\/iosReadPage\/adV2\?/.test(requestUrl)) {
     if (obj.data) {
         obj.data = {};
     }
 } else if (/^https:\/\/ocean\.shuqireader\.com\/api\/route\/iosReadPage\/adTurnChapter\?/.test(requestUrl)) {
     if (obj.data) {
         obj.data = {};
     }
 } else if (/^https:\/\/ocean\.shuqireader\.com\/api\/route\/ios\/readPage/.test(requestUrl)) {
     if (obj.data) {
         obj.data = {};
     }
 } else if (/^https:\/\/partner\.uc\.cn\/realtime_config/.test(requestUrl)) {
     if (obj.data) {
         obj.data = {};
     }
 } else if (/^https:\/\/huichuan\.sm\.cn\/nativead/.test(requestUrl)) {
     if (obj.data) {
         obj.data = {};
     }
 }


//重写数据
$done ({body: JSON.stringify(obj)});