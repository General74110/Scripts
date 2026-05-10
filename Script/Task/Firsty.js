/**
 * @name Firsty 流量获取脚本
 * @author General℡
 * @version 1.0.0
 * @description 模拟 Firsty App 看广告领取免费流量。
 *
 * -------------------------------------------
 * 1. 环境准备 (Node.js):
 *    - 依赖安装: npm install axios jsdom dotenv --save
 *    - 配置文件: 在同级目录创建 .env 文件，填入抓取的参数。
 *
 * 2. 环境变量配置 (.env / 脚本管理器持久化数据):
 *    - iccid: 流量卡 ID，多账号用 & 分隔
 *    - refreshToken: Google 刷新令牌，用于自动续期 Authorization
 *    - appcheck: Firebase AppCheck 令牌 (有时效性)
 *    - sessionid: App 运行时的会话 ID
 *    - devicedid: 设备 ID
 *    - googleapisKey: Google API 的 Web Key
 *
 * 3. 自动抓取配置 (Quantumult X):
 *    ## 抓取 Google Token & 看广告参数 & 设备信息
 *  [rewrite_local]
 *
 * # 1. 打开app获取设备信息
 * ^https:\/\/35\.186\.203\.117\/api\/mobile\/users\/v2\/.*\/info url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/Firsty.js
 *
 * # 2. 点击免费30分钟看广告获取 Token
 * ^https:\/\/(securetoken\.googleapis\.com\/v1\/token|35\.186\.203\.117\/api\/mobile\/bundles\/v3\/.*\/free) url script-request-header https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/Firsty.js
 * [mitm]
 * hostname = securetoken.googleapis.com, 35.186.203.117
 *
 *
 * 4. 特别说明:
 *    - 本脚本基于 chavyleung 的 Env.js 构建，支持跨平台运行。
 *    - 在 Node.js 环境下，脚本会自动忽略 HTTPS 证书校验以适配直接访问 IP。
 *    - 每次运行可获取30分钟的256kbps免费流量，每次运行最多10次，每隔3小时50分钟运行一次,cron时间请自行查询谷歌
 * -------------------------------------------

*/


// ====================
// 0. 环境判定与配置加载
// ====================
const isNode = typeof process !== 'undefined' && !!process.versions && !!process.versions.node;

if (isNode) {
    require('dotenv').config();

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const $ = new Env('Firsty');

// ====================
// 1. 变量提取
// ====================
function getRuntimeArgument(name) {
    if (isNode) return process.env[name] || '';
    if (typeof $argument === 'string' && $argument) {
        const match = $argument.match(new RegExp(`${name}="?([^",]+)"?`));
        return match ? match[1] : '';
    }
    return '';
}

const getVal = (key) => (isNode ? process.env[key] : $.getdata(key)) || '';
const isDebug = String(getRuntimeArgument('QDREADER_DEBUG')).toLowerCase() === 'true';

const iccidStr = getVal('iccid');
const rTokenStr = getVal('refreshToken');
const appcheckStr = getVal('appcheck');
const sessionidStr = getVal('sessionid');
const devicedidStr = getVal('devicedid');
const gKeyStr = getVal('googleapisKey');

// 转为数组处理多账号
const iccids = iccidStr.split('&').filter(x => !!x);
const refreshTokens = rTokenStr.split('&').filter(x => !!x);
const appchecks = appcheckStr.split('&').filter(x => !!x);
const sessionids = sessionidStr.split('&').filter(x => !!x);
const devicedids = devicedidStr.split('&').filter(x => !!x);
const gKeys = gKeyStr.split('&').filter(x => !!x);

function formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours}小时${minutes}分钟`;
    if (hours > 0) return `${hours}小时`;
    return `${minutes}分钟`;
}

function maskValue(value, keepStart = 4, keepEnd = 4) {
    if (!value) return '(empty)';
    const str = String(value);
    if (str.length <= keepStart + keepEnd) return str;
    return `${str.slice(0, keepStart)}***${str.slice(-keepEnd)}`;
}

function debugLog(title, data) {
    if (!isDebug) return;
    const content = typeof data === 'string' ? data : $.toStr(data, '');
    $.log(`\n[DEBUG] ${title}\n${content}`);
}


!(async () => {
    // 抓取逻辑判定
    if (typeof $request !== 'undefined') {
        GetCookie();
        return;
    }

    $.log(`\n==== Firsty 任务开始 [${isNode ? 'Node.js' : 'App'}] ====\n`);
    debugLog('调试模式', {
        enabled: isDebug,
        runtimeArgument: getRuntimeArgument('QDREADER_DEBUG') || '(empty)'
    });
    debugLog('环境变量', {
        iccid: iccids.map(x => maskValue(x)),
        refreshToken: refreshTokens.map(x => maskValue(x)),
        appcheck: appchecks.map(x => maskValue(x)),
        sessionid: sessionids.map(x => maskValue(x)),
        devicedid: devicedids.map(x => maskValue(x)),
        googleapisKey: gKeys.map(x => maskValue(x))
    });
    const accountSummaries = [];

    for (let i = 0; i < iccids.length; i++) {
        const config = {
            iccid: iccids[i],
            rToken: refreshTokens[i] || refreshTokens[0],
            appcheck: appchecks[i] || appchecks[0],
            sessionid: sessionids[i] || sessionids[0],
            devicedid: devicedids[i] || devicedids[0],
            gKey: gKeys[i] || gKeys[0]
        };
        debugLog(`账号 ${i + 1} 配置`, {
            iccid: maskValue(config.iccid),
            rToken: maskValue(config.rToken),
            appcheck: maskValue(config.appcheck),
            sessionid: maskValue(config.sessionid),
            devicedid: maskValue(config.devicedid),
            gKey: maskValue(config.gKey)
        });

        $.log(`\n【账号 ${i + 1}】${config.iccid.slice(-4)} 正在初始化...`);

        // --- 在循环外刷新一次 Token ---
        const newAuth = await fetchNewAuth(config.rToken, config.gKey);

        if (newAuth) {
            const authHeader = `Bearer ${newAuth}`;
            $.log(`✅ Token 刷新成功，开始执行 10 次流量领取任务...`);
            const result = {
                account: i + 1,
                iccid: config.iccid,
                success: 0,
                fail: 0,
                totalMinutes: 0
            };

            // --- 进入循环执行看广告 ---
            for (let c = 0; c < 10; c++) {
                $.index = c + 1;
                $.log(`\n[进度 ${$.index}/10] 正在请求流量...`);

                // 使用同一个 authHeader 执行任务
                const ok = await Ad(config, authHeader);
                if (ok) {
                    result.success += 1;
                    result.totalMinutes += 30;
                } else {
                    result.fail += 1;
                }

                // 随机延迟 4-8 秒（最后一次不等待）
                if (c < 9) {
                    const randomWait = Math.floor(Math.random() * (8000 - 4000 + 1) + 4000);
                    $.log(`⏳ 随机等待 ${randomWait / 1000} 秒...`);
                    await $.wait(randomWait);
                }
            }

            accountSummaries.push(result);
            $.msg(
                `${$.name} 账号 ${result.account}`,
                `成功 ${result.success}/10 次，累计 ${formatDuration(result.totalMinutes)}`,
                `ICCID 后四位 ${result.iccid.slice(-4)}｜失败 ${result.fail} 次`
            );
        } else {
            $.log(`❌ 刷新 Token 失败，跳过该账号`);
            accountSummaries.push({
                account: i + 1,
                iccid: config.iccid,
                success: 0,
                fail: 10,
                totalMinutes: 0,
                tokenFailed: true
            });
            $.msg(
                `${$.name} 账号 ${i + 1}`,
                `Token 刷新失败`,
                `ICCID 后四位 ${config.iccid.slice(-4)}｜本次未领取流量`
            );
        }

        await $.wait(2000); // 账号间切换的固定延迟
    }

    if (accountSummaries.length > 1) {
        const totalSuccess = accountSummaries.reduce((sum, item) => sum + item.success, 0);
        const totalFail = accountSummaries.reduce((sum, item) => sum + item.fail, 0);
        const totalMinutes = accountSummaries.reduce((sum, item) => sum + item.totalMinutes, 0);
        $.msg(
            `${$.name} 汇总`,
            `成功 ${totalSuccess} 次，累计 ${formatDuration(totalMinutes)}`,
            `失败 ${totalFail} 次｜共 ${accountSummaries.length} 个账号`
        );
    }
})().catch(e => $.logErr(e)).finally(() => $.done());

// ====================
// 2. 核心函数: 获取 Cookie (重写逻辑)
// ====================
function GetCookie() {
    const url = $request.url;
    debugLog('抓取请求', {
        url,
        method: $request.method,
        headers: $request.headers,
        body: $request.body || ''
    });

    // A. 抓取 Google Token 参数
    if (url.includes("securetoken.googleapis.com/v1/token")) {
        // 1. 提取 URL 中的 googleapisKey
        const keyMatch = url.match(/key=([^&]+)/);
        if (keyMatch) $.setdata(keyMatch[1], "googleapisKey");

        // 2. 提取 Body 中的 refreshToken
        try {
            const body = JSON.parse($request.body);
            if (body.refreshToken) $.setdata(body.refreshToken, "refreshToken");
            debugLog('Google Token 抓取请求体', body);
        } catch (e) {}
        $.msg($.name, "Google参数", "googleapisKey & refreshToken 获取成功");
    }

    // B. 抓取 看广告 核心参数
    if (url.includes("/free")) {
        // 1. 提取 URL 中的 iccid
        const iccidMatch = url.match(/iccid\/([^/]+)/);
        if (iccidMatch) $.setdata(iccidMatch[1], "iccid");

        // 2. 提取 Headers 中的 session-id 和 appcheck
        const sid = $request.headers["session-id"] || $request.headers["Session-Id"];
        const ack = $request.headers["x-firebase-appcheck"] || $request.headers["X-Firebase-Appcheck"];
        if (sid) $.setdata(sid, "sessionid");
        if (ack) $.setdata(ack, "appcheck");

        $.msg($.name, "核心参数", "iccid & session & appcheck 获取成功");
    }

    // C. 抓取 Info 响应中的 deviceId (需 response 模式)
    if (url.includes("/info") && typeof $response !== "undefined") {
        try {
            const res = JSON.parse($response.body);
            if (res.deviceId) $.setdata(res.deviceId, "devicedid");
            debugLog('Info 响应数据', res);
            $.msg($.name, "设备参数", "deviceId 获取成功");
        } catch (e) {}
    }
}

// ====================
// 3. 核心函数: 刷新 Token
// ====================
function fetchNewAuth(refreshToken, gKey) {
    return new Promise((resolve) => {
        const options = {
            url: `https://securetoken.googleapis.com/v1/token?key=${gKey}`,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'FirebaseAuth.iOS/12.6.0 com.firsty.app/1.7.35',
                'X-Ios-Bundle-Identifier': 'com.firsty.app'
            },
            body: JSON.stringify({
                grantType: "refresh_token",
                refreshToken: refreshToken
            })
        };

        $.post(options, (err, resp, data) => {
            try {
                if (err) throw new Error(err);
                debugLog('刷新 Token 响应', {
                    status: resp && resp.status,
                    headers: resp && resp.headers,
                    body: data
                });
                const res = JSON.parse(data);
                resolve(res.id_token || null);
            } catch (e) {
                $.log(`刷新 Auth 报错: ${e.message}`);
                debugLog('刷新 Token 异常', {
                    error: e.message,
                    response: data || ''
                });
                resolve(null);
            }
        });
    });
}

// ====================
// 4. 核心函数: 看广告任务
// ====================
function Ad(acc, authHeader) {
    return new Promise((resolve) => {
        const options = {
            url: `https://35.186.203.117/api/mobile/bundles/v3/uM5mib3MUGgBbkNUeDMgnsD18lC2/iccid/${acc.iccid}/free`,
            headers: {
                'content-type': 'application/json',
                'authorization': authHeader,
                'app-version': '1.7.35',
                'app-build': '8267',
                'device-info': 'unknown',
                'x-firebase-appcheck': acc.appcheck,
                'session-id': acc.sessionid,
                'user-agent': 'Dart/3.11 (dart:io)',
                'platform': 'iOS',
                'accept-encoding': 'gzip',
                'host': '35.186.203.117'
            },
            body: JSON.stringify({
                "deviceId": acc.devicedid,
                "watchedType": "partnerAdOffline",
                "planType": "ADVERTISEMENT"
            }),
            node_options: { rejectUnauthorized: false }
        };

        $.post(options, (err, resp, data) => {
            if (err) {
                $.log(`❌ 接口连接异常: ${JSON.stringify(err)}`);
                debugLog('流量接口异常', err);
                resolve(false);
            } else {
                debugLog(`流量接口响应 [${acc.iccid.slice(-4)}]`, {
                    status: resp && resp.status,
                    headers: resp && resp.headers,
                    body: data
                });
                try {
                    const json = JSON.parse(data);
                    if (json.code === true || (json.data && json.data.freeSubscriptionTransactionId)) {
                        $.log(`🎯 流量领取成功! ID: ${json.data.freeSubscriptionTransactionId}`);
                        resolve(true);
                    } else {
                        $.log(`⚠️ 任务反馈: ${data}`);
                        resolve(false);
                    }
                } catch (e) {
                    if (data.includes("freeSubscriptionTransactionId")) {
                        $.log(`🎯 流量领取成功(字符串匹配)`);
                        resolve(true);
                    } else {
                        $.log(`❌ 响应解析失败: ${data}`);
                        resolve(false);
                    }
                }
            }
        });
    });
}

//*************************************Env*************************************//

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;"POST"===e&&(s=this.post);const i=new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}));return t.timeout?((t,e=1e3)=>Promise.race([t,new Promise(((t,s)=>{setTimeout((()=>{s(new Error("请求超时"))}),e)}))]))(i,t.timeout):i}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},policy:"DIRECT",timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
