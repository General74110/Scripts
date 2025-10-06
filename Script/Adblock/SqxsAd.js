//获取相应数据
let obj = JSON.parse($response.body);
// 获取请求地址
let requestUrl = $request.url;
// 判断是否为匹配项
if (/^https:\/\/(ssp-sdk-config\.uc\.cn\/mediations|ocean\.shuqireader\.com\/api\/ad\/adserver\/v1\/api\/getAdInfo\??)/.test(requestUrl)) {
    //判断是否存在数据

    if (obj.hasOwnProperty("data")) {
        delete obj.data;

    }

    } else if (/^https:\/\/ocean\.shuqireader\.com\/sqios\/render\/render\/page\/bookstore/.test(requestUrl)) {

    if (json.data && json.data.moduleInfos && Array.isArray(json.data.moduleInfos) && json.data.moduleInfos.length > 1) {
        delete json.data.moduleInfos[1];// 章末推荐书籍
    }
    if (json.data && json.data.props && json.data.props["x-preProcessor"] && Array.isArray(json.data.props["x-preProcessor"])) {
        delete json.data.props["x-preProcessor"][0]; // 书城横幅
    }
}




//重写数据
$done ({body: JSON.stringify(obj)});