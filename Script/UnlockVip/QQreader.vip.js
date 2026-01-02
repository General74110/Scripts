/*
【App】
#> QQ阅读VIP
【作者】
#> 搬运自【伟人佬（https://t.me/GieGie444）】
【下载地址】


【脚本功能】
#> 解锁会员
【说明】
#> 付费无解

#> 如失效请在TG反馈！


[rewrite_local]

^https?:\/\/(detailadr|commontgw|iostgw)\.reader\.qq\.com\/((book\/queryDetailPage|.+nativepage\/personal|.+vip\/viptxt)|account\/getUserPrefer|h5\/dress\/usingDress|v7_6_6\/(userinfo|nativepage\/getAcctInfo|uservipstatus|sign\/welfare\/bookShelf|listDispatch|helper\/staticResource))(?:\?.*)?$ url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Script/UnlockVip/QQreader.vip.js

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
   没抓到
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
        headers.version = headers.version || "qqreader_8.3.50.0690_iphone";
        headers.jailbreak = "0";                              // 非越狱（重要，别乱写）

        /**
         * User-Agent
         * - 没有就补
         * - 有就尊重系统
         */
        headers["User-Agent"] =
            headers["User-Agent"] ||
            "QQReaderUI/52047 CFNetwork/1568.300.101 Darwin/24.2.0";

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
            //personal.monthUser.paidVipStatus = 2; // 已开通
            personal.monthUser.paidVipStatus = 1;
            personal.monthUser.monthStatus = 1;
           // personal.monthUser.smsVip = 1;
            personal.monthUser.smsVip = 0;
            //personal.monthUser.mVipType = 1;
            personal.monthUser.mVipType = 2;
            personal.monthUser.title = "体验会员";
            personal.monthUser.label = "付费会员享任务奖励翻倍";
            personal.monthUser.endTime = "2099-01-11到期";
            //personal.monthUser.buttonName = "续费";
            personal.monthUser.buttonName = "2.99元升付费会员";

        }

        /* 账户资产 */
        if (personal.accountInfo) {
            personal.accountInfo.balance = 88888888;
            personal.accountInfo.bookTicket = 88888888;
        }

        /* 用户信息 */
        if (personal.userInfo) {
            personal.userInfo.vipStatus = 1;
            personal.userInfo.vipLevel = 1;
            personal.userInfo.recStatus = -1;
            personal.userInfo.sex = 0;
            personal.userInfo.background = "https:\/\/raw.githubusercontent.com\/General74110\/Scripts\/master\/images\/pg.jpg";//主页背景
            personal.userInfo.staticBackground = "https:\/\/raw.githubusercontent.com\/General74110\/Scripts\/master\/images\/pg.jpg";//主页背景


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
   没抓到
================================================== */

if (isResponse && url.includes("/book/queryDetailPage")) {
    try {
        const obj = JSON.parse($response.body);

        obj.vipStatus = 1; // 强制 VIP

        if (obj.introinfo?.detailmsg) {

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
   没抓到
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

/*==================================================
    五、VIP 文案接口
    https://commontgw.reader.qq.com/v7_6_6/listDispatch?
    刚加的
==================================================*/
if (isResponse && url.includes("/listDispatch")) {
    try {
        const obj = JSON.parse($response.body);
        obj.freeStatus = 2;
        obj.codeX = 0;
        obj.channel = 1000;
        obj.isVip = 0;

        done({ body: JSON.stringify(obj) });
    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/*==================================================
    五、VIP 文案接口
    /helper/staticResource
    刚加的
==================================================*/
if (isResponse && url.includes("/helper/staticResource")) {
    try {
        const obj = JSON.parse($response.body);
        obj.isVip = "true";
        obj.isPay = 0;
        obj.channel = 1000;
        obj.feedback_submit = "feedback\/submit?message=quick:&topId=7&secondId=157&tplName=littleHelper";
        obj.awakenMaxTotal = 3;
        obj.codeX = 0;
        obj.closeCount = 5;
        done({body: JSON.stringify(obj)});
    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();

}
/*==================================================
    六、书架页面VIP
    https://commontgw.reader.qq.com/v7_6_6/sign/welfare/bookShelf
    刚加的
==================================================*/
 if (isResponse && url.includes("/sign/welfare/bookShelf")) {
     try {
         const obj = JSON.parse($response.body);
         obj.vip = "true";
         obj.channel = 1000;
         obj.isVip = "true";
         done({body: JSON.stringify(obj)});

     }   catch (e) {
         console.log("viptxt error:", e);
         done({});
     }
     done();
 }



 /*==================================================
    七、VIP user接口
    https://commontgw.reader.qq.com/v7_6_6/uservipstatus
    刚加的
====================================================*/
if (isResponse && url.includes("/uservipstatus")) {
    try {
        const obj = JSON.parse($response.body);
        obj.isVip = "true";
        obj.vipPrepayEndTime = 0;
        obj.isSmsVip = "false";
        obj.vipType = 1;
        obj.monthUser = 1;
        obj.costMonthUser = 1;
        done({body: JSON.stringify(obj)});

    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/*==================================================
    八
 https://commontgw.reader.qq.com/v7_6_6/nativepage/getAcctInfo?
    刚加的
==================================================*/
 if (isResponse && url.includes("/nativepage/getAcctInfo")) {
     try {
         const obj = JSON.parse($response.body);
         obj.prefer = 1;
         obj.vipComment = "2099-01-11到期";
         obj.vipLevel = 5;
         obj.isMVip = "true";
         obj.channel = 1000;
         obj.vipEndTime = "2099-01-11";
         obj.isVip = "true";
         obj.vipButton = 1;
         obj.vipStatus = 1;
         obj.balance= 88888888;
         done({body: JSON.stringify(obj)});

     }   catch (e) {
         console.log("viptxt error:", e);
         done({});
     }
     done();
 }

 /*==================================================
    十
    https://iostgw.reader.qq.com/v7_6_6/userinfo?randNum=2
    刚加的
 ===================================================*/
if (isResponse && url.includes("/userinfo")) {
    try {
        const obj = JSON.parse($response.body);
        obj.endTime = "4071772800";
        obj.prefer = 1;
        obj.codeX = 0;
        obj.vipType = 2;
        obj.is_week = 0;
        obj.is_vip = 1;
        obj.vipStatus = 1;
        obj.uin = 601949805184636;
        done({body: JSON.stringify(obj)});

    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/*==================================================
    十一
    https://commontgw.reader.qq.com/h5/dress/usingDress?
        刚加的
==================================================*/
if (isResponse && url.includes("/h5/dress/usingDress")) {
    try {
        const obj = JSON.parse($response.body);
        obj.vipEndTime = "2099-01-11";
        obj.isVip = "true";
        obj.vipEndTimeStamp = 4071772800000;
        obj.isMonthVip = "false";
        obj.isPayVip = 1;
        obj.vipType = 1;

        done({body: JSON.stringify(obj)});

    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}


/*==================================================
    十二
    https://commontgw.reader.qq.com/account/getUserPrefer
    刚加的
====================================================*/
if (isResponse && url.includes("/account/getUserPrefer")) {
    try {
        const obj = JSON.parse($response.body);
        obj.data.prefer = 1;

        done({body: JSON.stringify(obj)});

    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/* ==================================================
   兜底
================================================== */

done({});