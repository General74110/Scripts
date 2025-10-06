//获取相应数据
let obj = JSON.parse($response.body);
// 获取请求地址
let requestUrl = $request.url;
// 判断是否为匹配项
if (/^https:\/\/ocean\.shuqireader\.com\/api\/ad\/adserver\/v1\/api\/getAdInfo?\?/.test(requestUrl)) {
    //判断是否存在数据

    if (obj.hasOwnProperty("data")) {
        delete obj.data;

        console.log(obj);

    }
}



//重写数据
$done ({body: JSON.stringify(obj)});