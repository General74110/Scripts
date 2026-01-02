/*
【App】
#> QQ阅读VIP
【作者】
#> General℡[General74110_bot]
【下载地址】
#> www.9169.app
【脚本功能】
#> 解锁会员
【说明】
#> 付费无解

#> 如失效请在TG反馈！


[rewrite_local]

^https?:\/\/(detailadr|commontgw).reader.qq.com\/(book\/queryDetailPage|.+nativepage\/personal|.+vip\/viptxt) url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Script/UnlockVip/QQreader.vip.js

^https?:\/\/newminerva-tgw.reader.qq.com\/ChapBatAuthWithPD url script-request-header https://raw.githubusercontent.com/General74110/Scripts/master/Script/UnlockVip/QQreader.vip.js

[mitm]
hostname = *.reader.qq.com,newminerva-tgw.reader.qq.com,detailadr.reader.qq.com,commontgw.reader.qq.com

*/

const isRequest = typeof $request !== "undefined";
const isResponse = typeof $response !== "undefined";
const url = isRequest ? $request.url : $response.url;

function done(obj = {}) {
    if (typeof $done === "function") $done(obj);
}

/* ==================================================
   一、请求阶段（Header 增量修改）
   接口：/ChapBatAuthWithPD
   作用：章节批量授权 / 阅读权限校验
================================================== */

if (isRequest && url.includes("/ChapBatAuthWithPD")) {
    try {
        const headers = $request.headers;

        /**
         * 🧠 最小可用 Header 集说明
         * -------------------------
         * 以下字段是【真实请求里出现 + 实测有校验作用】
         * 未写的字段 = 系统 / App 自动生成，绝对不要碰
         */

        headers.uid = headers.uid || "855124767176";         // 用户唯一标识
        headers.usid = headers.usid || "ywA2nR1SiPp1";        // 会话标识
        //headers.ywtoken = headers.ywtoken || "0477e315bd775d6ae1d8ca41b1c46207";
        headers.loginType = "50";                             // 登录类型（QQ Reader 常量）
        headers.platform = "ioswp";                           // iOS 平台
        headers.version = headers.version || "qqreader_8.3.52.0692_iphone";
        headers.jailbreak = "0";                              // 非越狱（重要，别乱写）

        /**
         * User-Agent
         * - 没有就补
         * - 有就尊重系统
         */
        headers["User-Agent"] =
            headers["User-Agent"] ||
            "QQReaderUI/52060 CFNetwork/1331.0.7 Darwin/21.4.0";

        /**
         * stat_params（弱校验）
         * - 不写也能跑
         * - 写了更像真实客户端
         * - 删减到「不会触发风控」的最小集
         */
        headers.stat_params = JSON.stringify({
            bid: "51179257",
            tabtype: "3",
            islogin: "1",
            freeStatus: "2",
            payStatus: "300",
            scene: "public_rec"
        });

        done({ headers });
    } catch (e) {
        console.log("ChapBatAuthWithPD header error:", e);
        done({});
    }
    done();
}

/* ==================================================
   二、响应阶段（个人中心）
   接口：/nativepage/personal
================================================== */

if (isResponse && url.includes("/nativepage/personal")) {
    try {
        const obj = JSON.parse($response.body);
        const personal = obj.personal || {};

        /* 月会员信息 */
        if (personal.monthUser) {
            personal.monthUser.paidVipStatus = 2; // 已开通
            personal.monthUser.monthStatus = 1;
            personal.monthUser.smsVip = 1;
            personal.monthUser.mVipType = 1;
            personal.monthUser.title = "↓关注频道↓";
            personal.monthUser.label = "Tg频道 https://t.me/iosjs520";
        }

        /* 账户资产 */
        if (personal.accountInfo) {
            personal.accountInfo.balance = 88888888;
            personal.accountInfo.bookTicket = 88888888;
        }

        /* 用户信息 */
        if (personal.userInfo) {
            personal.userInfo.vipLevel = 1;
            personal.userInfo.nick = "ios鸡神";
            personal.userInfo.icon =
                "https://i.imgs.ovh/2025/12/28/CBmPTb.jpeg";
        }

        /* 删除无用配置（防止 UI 限制） */
        delete personal.confList;

        obj.personal = personal;
        done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("personal response error:", e);
        done({});
    }
    done();
}

/* ==================================================
   三、书籍详情页
   接口：/book/queryDetailPage
================================================== */

if (isResponse && url.includes("/book/queryDetailPage")) {
    try {
        const obj = JSON.parse($response.body);

        obj.vipStatus = 1; // 强制 VIP

        if (obj.introinfo?.detailmsg) {
            obj.introinfo.detailmsg.equityTxt = "我的天呀-ios鸡神鐮磋В";
            obj.introinfo.detailmsg.txtStyle = 2;
            obj.introinfo.detailmsg.equityDisplay = true;
        }

        done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("queryDetailPage error:", e);
        done({});
    }
    done();
}

/* ==================================================
   四、VIP 文案接口
   接口：/vip/viptxt
================================================== */

if (isResponse && url.includes("/vip/viptxt")) {
    try {
        const obj = JSON.parse($response.body);
        obj.allowMonthlyPay = 2;
        done({ body: JSON.stringify(obj) });
    } catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/* ==================================================
   五、兜底
================================================== */

done({});