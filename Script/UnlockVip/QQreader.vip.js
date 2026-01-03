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

^https?:\/\/(detailadr|commontgw|iostgw|select)\.reader\.qq\.com\/((book\/queryDetailPage|.+nativepage\/personal|.+vip\/viptxt)|account\/(getUserPrefer|remind\/vipRenewalReminderPop)|common\/monthpage|h5\/(dress\/usingDress|account)|v7_6_6\/(userinfo|nativepage\/getAcctInfo|uservipstatus|sign\/welfare\/bookShelf|listDispatch|helper\/staticResource|chapterOver)|v_7_8_2\/bookCity\/index)(?:\?.*)?$ url script-response-body https://raw.githubusercontent.com/General74110/Scripts/master/Script/UnlockVip/QQreader.vip.js

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

if (url.includes("/ChapBatAuthWithPD")) {
    try {
        const headers = { ...$request.headers };

        Object.assign(headers, {
            uid: "855124767176",
            qrtm: "1767369782",
            trustedid: "9a29ef0f8ec32235bd4814a5b7348e611",
            ua: "iPhone 16 Pro Max-iOS18.2",
            qrem: "0",
            net_type: "1",
            platform: "ioswp",
            rcmd: "1",
            youngerMode: "0",
            mldt: "e6adcbb59b681e6dfe2ad944f3a26860",
            sid: "",
            usid: "ywA2nR1SiPp1",
            text_type: "1",
           // csigs: "$2a$04$AdAXtFrrs0s8Dvsf1mpte.O9/Tg6NojRCkY9oLbLw0UsH0MFUz7Z6",
            loginType: "50",
            //ywtoken: "0477e315bd775d6ae1d8ca41b1c46207",
            version: "qqreader_8.3.52.0692_iphone",
            QVisible: "0",
            qrsy: "cb377a265ff9a96957ab8c317df0f6cb",
            //ttime: "1766862156907",
            safkey: "3828820a16622f3f7b7a22c434354317",
            ssign: "7b30f02f46dcf2c96713cb28358e65d4",
            osvn: "97295bfa6b1cdfc4",
            auditStatus: "1",
            Host: "newminerva-tgw.reader.qq.com",
            jailbreak: "0",
            Connection: "keep-alive"
        });

        headers["Accept-Encoding"] = "gzip";
        headers["Accept-Language"] = "zh-CN,zh-Hans;q=0.9";
        headers["User-Agent"] =
            "QQReaderUI/52047 CFNetwork/1568.300.101 Darwin/24.2.0";
        headers.Range = "bytes=0-";

        headers.stat_params = JSON.stringify({
            bid: "51179257",
            tabtype: "3",
            islogin: "1",
            freeStatus: "2",
            payStatus: "300",
            scene: "public_rec"
        });

        $done({ headers });
    } catch (e) {
        console.log("ChapBatAuthWithPD header error:", e);
        $done({});
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
        obj.vipTag = "会员";
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
         obj.vipTag = "会员";
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
        obj.vipTag = "会员";
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


/*==================================================
    十三
    https://select.reader.qq.com/v_7_8_2/bookCity/index
    刚加的
==================================================*/
if (isResponse && url.includes("/bookCity/index")) {
    try {
        const obj = JSON.parse($response.body);
        obj.userLabel.VIP_FREE_REC = 1;
        obj.userLabel.rcmd = 1;
        obj.userLabel.freeStatus = 2;
        obj.userLabel.userPrefer = 1;
        obj.userLabel.channel = 1000;
        obj.userLabel.payStatus = "200,307";
        obj.userLabel.platform = 1;
        obj.userLabel.firstInterest = 1;
        obj.userLabel.userLable = 4;
        obj.userLabel.qaType = 1;
        obj.userLabel.VipPointSortUser = 0;


        // 更清晰的构建方式
        obj.userLabel.vipAdInfo = JSON.stringify({
            openButtonAd: {},
            bannerAd: {
                dataList: [],
                cid: 204684
            }
        });

        obj.userLabel.vipInfo = JSON.stringify({
            monthStatus: 1,
            isFirst: 0,
            endtimeYearVip: 1,
            getGiftStatus: 1,
            paidVipStatus: 1,
            showText: "2099-01-11到期",
            endtimeFree: 4071772800000,
            endtimePrepay: 4071772800000,
            vipType: 2,
            endTime: 4071772800000
        });


        obj.isVip = "true";
        obj.guideNegativeFeedback.pageCount = 4;
        obj.guideNegativeFeedback.enableGuide = 0;
        obj.prefer = 1;

        obj.dataList[0].data.button = "2.99元升付费会员";
        obj.dataList[0].data.vipTag = "会员";
        obj.dataList[0].data.qurl = "uniteqqreader:\\/\\/nativepage\\/vip\\/open?paysource=by009";
        obj.dataList[0].data.paidType = 1;
        obj.dataList[0].data.content = "2099-01-11体验会员到期";
        obj.dataList[0].data.status = 1;

        done({body: JSON.stringify(obj)});

    }    catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/*==================================================
    十四
    https://commontgw.reader.qq.com/h5/account
    刚加的
====================================================*/
    if (isResponse && url.includes("/h5/account")) {
        try {
            const obj = JSON.parse($response.body);
            obj.vip_type = 2;
            obj.vipEndTime = "2099-01-11";
            obj.vipStatus = 1;
            obj.balance = 88888888;
            obj.bookTicket = 88888888;
            obj.vipButton = 1;
            obj.vipComment = "2099-01-11到期";

            done({body: JSON.stringify(obj)});
    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
        }

/*==================================================
    十五
    https://commontgw.reader.qq.com/account/remind/vipRenewalReminderPop
    刚加的
==================================================*/
if (isResponse && url.includes("/account/remind/vipRenewalReminderPop")) {
    try {
        const obj = JSON.parse($response.body);
        obj.data.vipStatus = "ture";
        obj.data.title = "你的会员还剩73年到期";
        obj.data.buttonTxt = "续费";
        obj.data.vipCountDown = 2302992000;
        obj.data.showStatus = "false";
        obj.data.showTab = "false";

        done({body: JSON.stringify(obj)});

    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/*==================================================
    十六
    https://commontgw.reader.qq.com/common/monthpage?focus=&pf=by009
    刚加的
==================================================*/
if (isResponse && url.includes("/common/monthpage")) {
    try {
        const obj = JSON.parse($response.body);
        obj.prefer = 1;
        obj.banExpiredTime = 0;
        obj.ydMouthSwitch = 1;
        obj.pf = "by009";
        obj.bal = 88888888;
        obj.jailbreak = 0;
        obj.paidMonthStatus = 1;
        obj.gearWelcomePop.gearIndex = 0;
        obj.gearWelcomePop.interval = 3;


        obj.userMonthInfo.endtimePrepay = 4071772800000;
        obj.userMonthInfo.endtime = 4071772800000;
        obj.userMonthInfo.endtimeYearVip = 4071772800000;
        obj.userMonthInfo.endtimeFree = 4071772800000;
        obj.userMonthInfo.cardNo = "NO.";
        obj.userMonthInfo.gfrom = 101;
        obj.userMonthInfo.status = 1;


        obj.vipOpenCard.openCard = "null";
        obj.vipOpenCard.showType = 3;
        obj.vipOpenCard.freeVipCard.title = "体验会员，已帮你节省19999999999.81元";
        obj.vipOpenCard.freeVipCard.endTimeTxt = "2099-01-11到期，体验会员为平台赠送福利，管理续费";
        obj.vipOpenCard.paidVipCard = "null";


        done({body: JSON.stringify(obj)});

    }   catch (e) {
        console.log("viptxt error:", e);
        done({});
    }
    done();
}

/*==================================================
    十七
    https://iostgw.reader.qq.com/v7_6_6/chapterOver?bid=465030&cid=2&chapterUuid=-1
    刚加的
==================================================*/
if (isResponse && url.includes("/chapterOver")) {
    try {
        const obj = JSON.parse($response.body);
        obj.isVip = 1;

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