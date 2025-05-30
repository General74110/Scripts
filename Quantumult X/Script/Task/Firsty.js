const $ = new Env('Firsty');
const logs = 0;
const notify = $.isNode() ? require('./sendNotify') : '';
let notifyMsg = [];

const API_KEY = 'AIzaSyAw4dSOEuZNgBWLAiwSAqPJ9qArvSOaZDM';

!(async () => {
    console.log(`\n=== Firsty 脚本执行 - 北京时间：${new Date(Date.now() + 8 * 3600000).toLocaleString()} ===`);
    console.log(`开始【Firsty】`);

    const challengeData = await Challenge();
    const artifactData = await Artifact();
    const assertionData = await Assertion();

    if (!challengeData || !artifactData || !assertionData) {
        const failedStep = !challengeData
            ? "challenge"
            : !artifactData
                ? "artifact"
                : "assertion";
        $.msg(`❌ 获取 ${failedStep} 失败`, "脚本终止", "请检查网络或接口变更");
        return;
    }

    const appCheckData = await Appcheck(
        challengeData.challenge,
        artifactData.artifact,
        assertionData.assertion
    );
    if (!appCheckData) {
        $.msg("❌ 获取 appcheck_token 失败", "脚本终止", "请检查 challenge 有效性");
        return;
    }

    const authData = await GetAuth();
    if (!authData) {
        $.msg("❌ 获取 access_token 失败", "脚本终止", "请检查 refreshToken 是否正确");
        return;
    }

    await AdVideo(appCheckData.token, authData.access_token, authData.token_type);
    $.msg("✅ Firsty 执行完毕", "", "已成功调用续期接口");

})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());

function Challenge(timeout = 0) {
    const headers = {
        'Accept': '*/*',
        'X-Goog-Api-Key': API_KEY,
        'User-Agent': 'Firsty/7191 CFNetwork/3826.500.111.2.2 Darwin/24.4.0',
        'X-Ios-Bundle-Identifier': 'com.firsty.app'
    };
    const url = 'https://firebaseappcheck.googleapis.com/v1/projects/firsty-prod/apps/1:962364472393:ios:fede98035afd07718c1398:generateAppAttestChallenge';

    return new Promise((resolve) => {
        $.post({ url, headers }, (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data?.challenge) {
                    console.log("🟢 获取 challenge 成功:", data.challenge);
                    resolve({ challenge: data.challenge });
                } else {
                    console.log("🔴 获取 challenge 失败:", data);
                    resolve(null);
                }
            } catch (e) {
                console.log("❌ 解析 challenge 失败:", e);
                resolve(null);
            }
        }, timeout);
    });
}

function Artifact(timeout = 0) {
    const headers = {
        'Accept': '*/*',
        'X-Goog-Api-Key': API_KEY,
        'User-Agent': 'Firsty/7191 CFNetwork/3826.500.111.2.2 Darwin/24.4.0',
        'X-Ios-Bundle-Identifier': 'com.firsty.app'
    };
    const url = 'https://firebaseappcheck.googleapis.com/v1/projects/firsty-prod/apps/1:962364472393:ios:fede98035afd07718c1398:generateAppAttestArtifact';

    return new Promise((resolve) => {
        $.post({ url, headers }, (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data?.artifact) {
                    console.log("🟢 获取 artifact 成功:", data.artifact);
                    resolve({ artifact: data.artifact });
                } else {
                    console.log("🔴 获取 artifact 失败:", data);
                    resolve(null);
                }
            } catch (e) {
                console.log("❌ 解析 artifact 失败:", e);
                resolve(null);
            }
        }, timeout);
    });
}

function Assertion(timeout = 0) {
    const headers = {
        'Accept': '*/*',
        'X-Goog-Api-Key': API_KEY,
        'User-Agent': 'Firsty/7191 CFNetwork/3826.500.111.2.2 Darwin/24.4.0',
        'X-Ios-Bundle-Identifier': 'com.firsty.app'
    };
    const url = 'https://firebaseappcheck.googleapis.com/v1/projects/firsty-prod/apps/1:962364472393:ios:fede98035afd07718c1398:generateAppAttestAssertion';

    return new Promise((resolve) => {
        $.post({ url, headers }, (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data?.assertion) {
                    console.log("🟢 获取 assertion 成功:", data.assertion);
                    resolve({ assertion: data.assertion });
                } else {
                    console.log("🔴 获取 assertion 失败:", data);
                    resolve(null);
                }
            } catch (e) {
                console.log("❌ 解析 assertion 失败:", e);
                resolve(null);
            }
        }, timeout);
    });
}

function Appcheck(challenge, artifact, assertion, timeout = 0) {
    const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Ios-Bundle-Identifier': 'com.firsty.app'
    };
    const body = JSON.stringify({
        limited_use: false,
        assertion: assertion,
        artifact: artifact,
        challenge: challenge
    });
    const url = 'https://firebaseappcheck.googleapis.com/v1/projects/firsty-prod/apps/1:962364472393:ios:fede98035afd07718c1398:exchangeAppAttestAssertion';

    return new Promise((resolve) => {
        $.post({ url, headers, body }, (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data?.token) {
                    console.log("🟢 获取 appcheck_token 成功:", data.token);
                    resolve({ token: data.token });
                } else {
                    console.log("🔴 获取 appcheck_token 失败:", data);
                    resolve(null);
                }
            } catch (e) {
                console.log("❌ 解析 appcheck_token 失败:", e);
                resolve(null);
            }
        }, timeout);
    });
}
//以后可以用这个里面的refreshToken来获取cookie
function GetAuth(timeout = 30) {
    const headers = {
        'Connection' : `keep-alive`,
        'Accept-Encoding' : `gzip, deflate, br`,
        'X-Client-Version' : `iOS/FirebaseSDK/11.10.0/FirebaseCore-iOS`,
        'Content-Type' : `application/json`,
        'X-Firebase-AppCheck' : `eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==`,
        'User-Agent' : `FirebaseAuth.iOS/11.10.0 com.firsty.app/1.6.28 iPhone/18.4.1 hw/iPhone15_3`,
        'X-Ios-Bundle-Identifier' : `com.firsty.app`,
        'X-Firebase-GMPID' : `1:962364472393:ios:fede98035afd07718c1398`,
        'Host' : `securetoken.googleapis.com`,
        'Accept-Language' : `zh`,
        'Accept' : `*/*`
    };
    const body = JSON.stringify({
        grantType: 'refresh_token',
        refreshToken: 'AMf-vBwjnY1xqtuKHQQ8RGUq4b9OPb41L4kEpDVFiuu4KaKS7pr7lJxeJAOmcvlpU84K4tJKyl4kp1uwMknnOC_LkCRYNSbe4BPPaD7R_W7u2nLCtsyvC1PdhVU4uqMR1mZcoo4mBwkmNyqmp9REwo37PHK5z0T5fToDDojOOuMUvznSfJ__4yHbC-cjFzatORGqxq24duq6' // 替换成你自己的
    });
    const url = `https://securetoken.googleapis.com/v1/token?key=${API_KEY}`;

    return new Promise((resolve) => {
        $.post({ url, headers, body }, (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data?.access_token && data?.token_type) {
                    console.log("🟢 获取 Token 成功:", data.access_token);
                    resolve({ access_token: data.access_token, token_type: data.token_type });
                } else {
                    console.log("🔴 获取 Token 失败:", data);
                    resolve(null);
                }
            } catch (e) {
                console.log("❌ 解析 Token 失败:", e);
                resolve(null);
            }
        }, timeout);
    });
}

function AdVideo(appcheck_token, access_token, token_type, timeout = 30) {
    const url = 'https://mobile.firsty.app/api/mobile/subscriptions/v2/3yG9lr7fkNOgxbotOeaRLh7ifPg2/iccid/893107032536622731/free';
    const headers = {
        'Authorization': `${token_type} ${access_token}`,
        'x-firebase-appcheck': appcheck_token,
        'Content-Type': 'application/json',
        'accept-encoding': 'gzip',
        'user-agent': 'Dart/3.7 (dart:io)',
        'app-build': '7298',
        'device-info': 'iPhone15,3 18.4.1',
        'app-version': '1.6.28'
    };
    const body = JSON.stringify({
        planType: 'ADVERTISEMENT',
        deviceId: '0B135DA8-CE12-4B3D-8B26-23E9ED9883B0',
        watchedType: 'partnerAdOffline'
    });

    return new Promise((resolve) => {
        $.post({ url, headers, body }, (err, resp, data) => {
            try {
                data = JSON.parse(data);
                if (data.code === true) {
                    console.log("🟢 续期成功 ID:", data.data.freeSubscriptionTransactionId);
                } else {
                    console.log("🔴 续期失败:", data);
                }
            } catch (e) {
                console.log("❌ 解析续期响应失败:", e);
            } finally {
                resolve();
            }
        }, timeout);
    });
}



//env模块    不要动
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;"POST"===e&&(s=this.post);const i=new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}));return t.timeout?((t,e=1e3)=>Promise.race([t,new Promise(((t,s)=>{setTimeout((()=>{s(new Error("请求超时"))}),e)}))]))(i,t.timeout):i}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},policy:"DIRECT",timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}