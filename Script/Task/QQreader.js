/*
APP：QQ阅读 v8.5.10
作者：General℡

脚本功能：签到 + 阅读奖励 + 听书奖励 + 宝箱视频 + 等级福利 + 周/月抽奖 + 书架福利 + 自定义任务

修复内容：
  - 版本号更新 8.1.62 → 8.5.10.0720（从HAR抓取获取）
  - 修复 listenTime 和 week 抽奖变量冲突（$.awardWeek 被重复覆盖）
  - 修复 GetVideoinit 变量赋值错误（$.videoInit 独立）
  - 新增 getWeekReadTime 每周阅读进度查询
  - 新增 personal 页面信息解析（阅读时长、等级等）
  - 修复 Msg 通知中 listenTime 和 week 抽奖结果混淆的问题
  - 视频奖励增加 scan 前置检查（修复领取失败问题）
  - 新增书架福利查询（bookShelf welfare）
  - 新增每日签到信息查询（component signInInfo）
  - 新增自定义任务列表（custom task list）
  - 新增 adPositionId=50 的广告奖励

Boxjs订阅(https://raw.githubusercontent.com/General74110/Quantumult-X/master/Boxjs/General74110.json)

操作：
Loon:点击 【我的】 获取Cookies！获取完后关掉重写，避免不必要的MITM
青龙：抓取ywguid, ywkey,ywtoken,csigs填入环境变量
QQYD_COOKIE={"ywkey":"your_ywkey","ywguid":"your_ywguid","ywtoken":"your_ywtoken","csigs":"your_csigs"}

注意⚠️：当前脚本只测试Loon，node.js 其他自测！
使用声明：⚠️⚠️⚠️此脚本仅供学习与交流，转载请注明出处 请勿贩卖！⚠️⚠️⚠️

[Script]
http-request ^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\?
 script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, timeout=10,
  enabled=true,
  tag=QQ阅读获取Cookies, images-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/QQ.png

[Task]
cron "30 6 * * *" script-path=https://raw.githubusercontent.com/General74110/Scripts/master/Script/Task/QQreader.js, timeout=3600, tag=QQ阅读, images-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/QQ.png

[MITM]
hostname = *.reader.qq.com
*/
const $ = new Env('QQ阅读');
const zh_name = 'QQ阅读';
const logs = 0;  // 设置0关闭日志, 1开启日志
const notify = $.isNode() ? require('./sendNotify') : '';
const isNode = typeof process !== "undefined" && process.env;
let t = '';
let availableGifts = [];
if (isNode) {
  const dotenv = require('dotenv');
  dotenv.config();
}

let globalCookie = '';
let cookieData = {};
let ckStr = '';

if (isNode) {
  ckStr = process.env.QQYD_COOKIE || '';
} else {
  ckStr = $.getdata('QQYD_COOKIE') || '';
}

if (ckStr) {
  try {
    cookieData = JSON.parse(ckStr);
  } catch (e) {
    console.log('❌ 解析 QQYD_COOKIE 出错:', e);
  }
}

!(async () => {
  if (typeof $request !== "undefined") {
    GetCookies();
  } else {
    console.log(
        `\n\n=============================================== 脚本执行 - 北京时间(UTC+8)：${new Date(
            new Date().getTime() +
            new Date().getTimezoneOffset() * 60 * 1000 +
            8 * 60 * 60 * 1000
        ).toLocaleString()} ===============================================\n`
    );

    if (cookieData.ywguid && cookieData.ywkey && cookieData.ywtoken && cookieData.csigs) {
      globalCookie = buildCookie(cookieData.ywguid, cookieData.ywkey, cookieData.ywtoken, cookieData.csigs);
    }

    if (logs == 1) {
      console.log(`生成全局 Cookie: ${globalCookie}`);
    }

    if (cookieData.ywguid && cookieData.ywkey && cookieData.ywtoken) {
      $.index = 1;
      console.log(`\n\n开始【QQ阅读任务】`);

      // 1. 检测昵称，判断 Cookie 是否有效
      await NickName(globalCookie);
      const content = "⚠️ Cookie 已失效，请更新\n";

      if ($.nickName && $.nickName.msg === "登录鉴权失败") {
        if ($.isNode()) {
          await notify.sendNotify(zh_name, content);
        } else if ($.isLoon() || $.isQuanX() || $.isSurge()) {
          $.msg(zh_name, "", content);
        } else {
          console.log(zh_name, content);
        }
        $.done();
        return;
      }

      // 2. 签到
      await $.wait(1000);
      await CheckinSign(globalCookie);

      // 3. 阅读时间任务
      await $.wait(1000);
      await ReadTime(globalCookie);

      // 4. 每周阅读进度查询
      await $.wait(1000);
      await WeekReadTime(globalCookie);

      // 5. 听书奖励
      await $.wait(1000);
      await GetAwardlistenTime(globalCookie);

      // 6. 每日听书30分钟
      await $.wait(1000);
      await ReceiveListenTime(globalCookie);

      // 7. 宝箱视频任务（扫描+领取）
      await $.wait(1000);
      await BoxVideo(globalCookie);

      // 8. 等级广告视频任务 (adPositionId=18)
      await $.wait(1000);
      await QuerVideo(globalCookie, 18);

      // 9. 等级广告视频任务 (adPositionId=50)
      await $.wait(500);
      await QuerVideo(globalCookie, 50);

      // 15. 抽奖逻辑
      const currentDay = new Date().getDay();
      const currentDate = new Date().getDate();

      if (currentDay === 0) {
        await GetAwardWeek(globalCookie); // 周抽奖
      }

      if (currentDate === 15) {
        await GetAwardMonth(globalCookie); // 月抽奖 签到满10天可抽奖一次
      }

      if (currentDate === 1) {
        await Reward(globalCookie);     // 等级福利-赠币
        await Rewardq(globalCookie);    // 等级福利-听书券
        await RewardVip(globalCookie);  // 等级福利-体验会员
      }

      // 10. 书架福利
      await $.wait(800);
      await BookShelfWelfare(globalCookie);

      // 11. 签到信息
      await $.wait(500);
      await SignInInfo(globalCookie);

      // 12. 自定义任务列表
      await $.wait(500);
      await CustomTaskList(globalCookie);

      // 13. 个人信息/阅读总时长
      await $.wait(500);
      await PersonalInfo(globalCookie);

      // 14. 发送任务总结
      await $.wait(1000);
      await Msg();
    }
  }
})()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());

// ===================== 工具函数 =====================

function buildCookie(ywguid, ywkey, ywtoken, csigs) {
  function trs() {
    return Date.now().toString();
  }
  function ts() {
    return Math.floor(Date.now() / 1000).toString();
  }

  let IFDA = udid();
  let qrsn = udid2();

  // 版本号8.5.10.0720（从新HAR获取，用户APP已更新）
  let Cookie = `IFDA=${IFDA}; c_version=qqreader_8.5.10.0720_iphone; csigs=${csigs}; loginType=1; platform=ioswp; qrsn=${qrsn}; qrsn_new=${qrsn}; qrtm=${ts()}; ttime=${trs()}; ywguid=${ywguid}; ywkey=${ywkey}; ywtoken=${ywtoken}`;

  return Cookie;
}

function udid() {
  var s = [];
  var hexDigits = "0123456789ABCDEF";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = "-";
  return s.join("");
}

function udid2() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decorateUnit(unit, awardType) {
  const emojiMap = {
    1: '💰', 2: '📖', 4: '🎧', 7: '📕',
    10: '📈', 11: '🃏', 13: '🎫'
  };
  return `${emojiMap[awardType] || '🎁'}${unit}`;
}

function extractUnitMap(giftList) {
  const unitMap = {};
  giftList.forEach(gift => {
    if (gift.awardType && gift.giftName) {
      const unitMatch = gift.giftName.match(/(.+?)(?:x\d+)?$/);
      if (unitMatch && unitMatch[1]) {
        const unit = unitMatch[1].trim();
        unitMap[gift.awardType] = decorateUnit(unit, gift.awardType);
      }
    }
  });
  return unitMap;
}

// ===================== Cookie 获取 =====================

function GetCookies() {
  const ywkey = $request.headers['ywkey'];
  const ywguid = $request.headers['ywguid'];
  const ywtoken = $request.headers['ywtoken'];
  const csigs = $request.headers['csigs'];

  const obj = {
    ywkey: ywkey || '',
    ywguid: ywguid || '',
    ywtoken: ywtoken || '',
    csigs: csigs || ''
  };
  $.setdata(JSON.stringify(obj), 'QQYD_COOKIE');
  $.log(`获取到的 QQYD_COOKIE: ${JSON.stringify(obj)}`);
  $.msg($.name, "", `QQ阅读获取 Cookie 成功`);
}

// ===================== 用户信息检测 =====================

async function NickName(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/account/h5/level/mine",
      headers: { "cookie": Cookie }
    };

    $.get(Url, async (err, resp, data) => {
      if (err) {
        console.log(`请求失败: ${err}`);
        resolve();
        return;
      }
      if (logs == 1) console.log(`【昵称】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        if (logs == 1) console.log(`⚠️获取【昵称】数据: ${data.data.nickName}`);
        $.nickName = data;
      } catch (e) {
        console.log(`解析【昵称】 JSON 出错: ${e}`);
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 书架福利查询 =====================

async function BookShelfWelfare(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/v7_6_6/sign/welfare/bookShelf",
      headers: { "cookie": Cookie }
    };

    $.get(Url, async (err, resp, data) => {
      if (err) { console.log('【书架福利】请求失败'); resolve(); return; }
      try {
        data = JSON.parse(data);
        if (data.code === 0 && data.data) {
          $.bookShelf = data.data;
          console.log(`📚 书架福利: 今日阅读${data.data.dayReadTime}分钟 | 可领${data.data.receiveCount || 0}赠币`);
        }
      } catch (e) {
        console.log(`【书架福利】解析出错: ${e}`);
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 每日签到信息 =====================

async function SignInInfo(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/account/component/getSignInInfo",
      headers: { "cookie": Cookie }
    };

    $.get(Url, async (err, resp, data) => {
      if (err) { console.log('【签到信息】请求失败'); resolve(); return; }
      try {
        data = JSON.parse(data);
        if (data.code === 0 && data.data) {
          $.signInInfo = data.data;
          console.log(`📅 连续签到: ${data.data.num || 0}天`);
        }
      } catch (e) {
        console.log(`【签到信息】解析出错: ${e}`);
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 自定义任务列表 =====================

async function CustomTaskList(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://eventv3.reader.qq.com/activity/new_welfare/getCustomTaskList?notify=0",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie
      }
    };

    $.get(Url, async (err, resp, data) => {
      if (err) { console.log('【自定义任务】请求失败'); resolve(); return; }
      try {
        data = JSON.parse(data);
        if (data.code === 0 && data.data) {
          const beforeTasks = data.data.beforeTasks || [];
          const afterTasks = data.data.afterTasks || [];
          if (beforeTasks.length || afterTasks.length) {
            console.log(`📋 自定义任务: ${beforeTasks.length + afterTasks.length}个 (需APP内操作)`);
            beforeTasks.forEach(t => {
              if (logs == 1) console.log(`  ├─ ${t.title} (state=${t.state})`);
            });
            afterTasks.forEach(t => {
              if (logs == 1) console.log(`  └─ ${t.title} (state=${t.state})`);
            });
          }
        }
      } catch (e) {
        console.log(`【自定义任务】解析出错: ${e}`);
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 个人信息 =====================

async function PersonalInfo(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/v7_6_6/nativepage/personal?lastMsgTime=0&lastCouponTime=0&rechargeCouponSwith=1",
      headers: { "cookie": Cookie }
    };

    $.get(Url, async (err, resp, data) => {
      if (err) {
        console.log(`【个人信息】请求失败: ${err}`);
        resolve();
        return;
      }
      if (logs == 1) console.log(`【个人信息】响应体: ${data}`);
      try {
        data = JSON.parse(data);
        if (data.code === "0" && data.personal) {
          $.personalInfo = data.personal;
          if (data.personal.userInfo) {
            const ui = data.personal.userInfo;
            console.log(`📊 用户等级: ${ui.normalUserLevel || '?'}级 | 阅读: ${ui.readTime || '?'} | 读过 ${ui.readBook || '?'}本`);
          }
        }
      } catch (e) {
        console.log(`【个人信息】解析出错: ${e}`);
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 签到 =====================

async function CheckinSign(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://eventv3.reader.qq.com/activity/new_welfare/sign",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) {
        console.log(`【签到】原始响应体: ${data}`);
      }
      try {
        data = JSON.parse(data);
        if (data.code === 0 && data.data) {
          console.log(`✅ 签到成功 | 连续签到: ${data.data.continueSignDay || 0}天`);
        } else {
          console.log(`📌 签到: ${data.msg}`);
        }
        $.checkin = data;
      } catch (e) {
        console.log(`解析【签到】 JSON 出错: ${e}`);
        $.checkin = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 阅读任务 =====================

async function ReadTime(Cookie) {
  return new Promise(async (resolve) => {
    const url = `https://eventv3.reader.qq.com/activity/new_welfare/taskInitV2`;
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'cookie': Cookie
    };

    $.readTimeResult = [];

    $.get({ url, headers }, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if (logs === 1) {
          console.log(`【查询阅读任务】响应: ${JSON.stringify(data)}`);
        }

        if (data.code === 0 && data.data?.taskVoList) {
          // 动态识别任务名（从接口返回）
          // 已确认的 task id:
          // 70526237 = 每日阅读10分钟
          // 70526238 = 每日阅读30分钟
          // 70526239 = 每周阅读600分钟
          const fallbackMap = {
            "70526237": "📖 每日阅读10分钟",
            "70526238": "📖 每日阅读30分钟",
            "70526239": "📖 每周阅读600分钟"
          };

          for (let task of data.data.taskVoList) {
            const { id, needReadTime, title } = task;
            const taskName = title || fallbackMap[id] || `任务(${id})`;

            if (needReadTime === 0) {
              const claimUrl = `https://eventv3.reader.qq.com/activity/new_welfare/receiveReadTime?type=${id}`;
              await new Promise((res) => {
                $.get({ url: claimUrl, headers }, (err2, resp2, data2) => {
                  try {
                    const result = JSON.parse(data2);
                    if (logs === 1) console.log(`【${taskName}】领取响应: ${JSON.stringify(result)}`);
                    $.readTimeResult.push({ name: taskName, code: result.code, msg: result.msg });
                  } catch (e) {
                    $.readTimeResult.push({ name: taskName, code: -1, msg: "领取接口解析失败" });
                  } finally {
                    res();
                  }
                });
              });
            } else {
              $.readTimeResult.push({
                name: taskName,
                code: -2,
                msg: `还需阅读 ${needReadTime} 分钟`
              });
            }
          }
        } else {
          $.readTimeResult.push({ name: "阅读任务查询", code: -1, msg: "查询失败或数据为空" });
        }
      } catch (e) {
        console.log(`解析【查询阅读任务】 JSON 出错: ${e}`);
        $.readTimeResult.push({ name: "阅读任务查询", code: -1, msg: "数据解析异常" });
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 每周阅读进度 =====================

async function WeekReadTime(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://iostgw.reader.qq.com/v7_6_6/getWeekReadTime?loadColor=1",
      headers: { "cookie": Cookie }
    };

    $.get(Url, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if (data.code === "0") {
          const weekMin = data.weekReadTime || 0;
          console.log(`📅 本周已读: ${weekMin} 分钟 (${(weekMin / 60).toFixed(1)} 小时)`);
          $.weekReadTime = weekMin;
        }
      } catch (e) {
        console.log(`【每周阅读进度】解析出错: ${e}`);
        $.weekReadTime = 0;
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 每日听书30分钟 =====================

async function ReceiveListenTime(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://eventv3.reader.qq.com/activity/new_welfare/receiveListenTime?type=70543157",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) console.log(`【每日听书30分钟】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        if (logs == 1) console.log(`【每日听书30分钟】结果: ${data.msg}`);
        $.awardDay = data;
      } catch (e) {
        console.log(`解析【每日听书30分钟】 JSON 出错: ${e}`);
        $.awardDay = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 每周5天听书抽奖 =====================

async function GetAwardlistenTime(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://eventv3.reader.qq.com/activity/new_welfare/getAward?entrance=listenTime",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) console.log(`【每周听书抽奖】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        if (logs == 1) console.log(`【每周听书抽奖】结果: ${data.msg}`);
        $.listenAward = data;  // ⚠️ 修复：改用独立变量，避免和$.awardWeek冲突
      } catch (e) {
        console.log(`解析【每周听书抽奖】 JSON 出错: ${e}`);
        $.listenAward = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 周抽奖 =====================

async function GetAwardWeek(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://eventv3.reader.qq.com/activity/new_welfare/getAward?entrance=week",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) console.log(`【周抽奖】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        $.awardWeek = data;
      } catch (e) {
        console.log(`解析【周抽奖】 JSON 出错: ${e}`);
        $.awardWeek = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 月抽奖 =====================

async function GetAwardMonth(Cookie) {
  return new Promise((resolve) => {
    const Url = {
      url: `https://eventv3.reader.qq.com/activity/new_welfare/getAward?entrance=month`,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) QQReader',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) console.log(`【月抽奖】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        $.awardMonth = data;
      } catch (e) {
        console.log(`解析【月抽奖】 JSON 出错: ${e}`);
        $.awardMonth = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 视频初始化（查询宝箱） =====================

async function GetVideoinit(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://eventv3.reader.qq.com/activity/new_welfare/init",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie
      }
    };

    $.get(Url, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if (data.code === 0 && data.data?.multiVideoRewardVo?.giftInfoList) {
          const unitMap = extractUnitMap(data.data.multiVideoRewardVo.giftInfoList);

          $.availableGifts = data.data.multiVideoRewardVo.giftInfoList
              .filter(gift => !gift.received)
              .map(gift => ({
                giftId: gift.giftId,
                packageCount: gift.packageCount,
                giftName: gift.giftName,
                awardType: gift.awardType,
                unit: unitMap[gift.awardType] || '🎁'
              }));

          console.log(`🎁 宝箱: ${$.availableGifts.length} 个可领取`);
        } else {
          $.availableGifts = [];
          console.log(`🎁 宝箱: 无可领取礼物`);
        }
        $.videoInit = data;  // ⚠️ 修复：改用独立变量
      } catch (e) {
        console.log(`解析 GetVideoinit JSON 出错: ${e}`);
        $.availableGifts = [];
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 视频扫一扫（前置检查） =====================

async function ScanVideo(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://ih5.reader.qq.com/api/comAds/scan?mark=0&scene=1",
      headers: {
        'User-Agent': 'QQReaderUI/52154 CFNetwork/3860.500.112 Darwin/25.4.0',
        'ua': 'iPhone 16 Pro Max-iOS26.4',
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie
      }
    };

    $.get(Url, async (err, resp, data) => {
      if (err) { console.log('【视频扫描】请求失败'); resolve(); return; }
      try {
        data = JSON.parse(data);
        if (data.code === 0) {
          console.log('📡 视频扫描完成，准备领取礼物');
        }
      } catch (e) {
        console.log(`【视频扫描】解析出错: ${e}`);
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 宝箱视频任务 =====================

async function BoxVideo(Cookie) {
  await GetVideoinit(Cookie);

  if (!$.availableGifts?.length) {
    console.log("🎁 宝箱视频: 当前没有可领取的礼物\n");
    return;
  }

  // 🔥 关键修复：先调用 scan 前置检查（HAR证实这是领取前必须的步骤）
  await ScanVideo(Cookie);
  await sleep(1000);

  const rewardsSummary = {};
  let successCount = 0;

  console.log(`\n📦 发现 ${$.availableGifts.length} 个可领取礼物`);

  for (let i = 0; i < $.availableGifts.length; i++) {
    const gift = $.availableGifts[i];
    console.log(`\n🎁 正在领取 ${i+1}/${$.availableGifts.length}: ${gift.giftName} x${gift.packageCount}`);

    const result = await runBoxVideo(Cookie, gift.giftId, i+1);

    if (result.code === 0) {
      successCount++;
      if (!rewardsSummary[gift.awardType]) {
        rewardsSummary[gift.awardType] = {
          name: gift.giftName.replace(/x\d+$/, "").trim(),
          total: 0,
          unit: gift.unit || "🎁"
        };
      }
      rewardsSummary[gift.awardType].total += gift.packageCount;
      console.log(`✅ 领取成功 +${gift.packageCount}${gift.unit}`);
    } else {
      const errHint = result.code === -5 ? " (需要先看广告)" :
          result.code === -3 ? " (条件不满足)" : "";
      console.log(`❌ 领取失败 [${result.code}]: ${result.msg || '未知错误'}${errHint}`);
    }

    await sleep(1500);
  }

  $.videoRewards = rewardsSummary;
  console.log(`\n📊 宝箱视频任务完成: 成功 ${successCount}/${$.availableGifts.length}`);
}

async function runBoxVideo(Cookie, giftId, attempt) {
  return new Promise((resolve) => {
    const Url = {
      url: `https://ih5.reader.qq.com/api/comAds/getGift?giftId=${giftId}&scene=1`,
      headers: {
        'User-Agent': 'QQReaderUI/52154 CFNetwork/3860.500.112 Darwin/25.4.0',
        'ua': 'iPhone 16 Pro Max-iOS26.4',
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie
      }
    };

    $.get(Url, async (err, resp, data) => {
      if (logs == 1) {
        console.log(`第 ${attempt} 次请求状态码: ${resp?.status}`);
        console.log(`原始响应: ${data}`);
      }

      try {
        data = JSON.parse(data);
        resolve(data);
      } catch (e) {
        console.log(`解析响应出错: ${e}`);
        resolve({ code: -1, msg: '解析响应失败' });
      }
    });
  });
}

// ===================== 等级广告视频 =====================

async function QuerVideo(Cookie, adPosId) {
  const posLabel = adPosId || 18;
  return new Promise((resolve) => {
    let Url = {
      url: `https://commontgw.reader.qq.com/v7_6_6/giveadreward?adPositionId=${adPosId || 18}`,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      const posStr = `等级广告(pos:${posLabel})`;
      if (logs == 1) console.log(`【${posStr}】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        if (data.code === 0) {
          console.log(`📺 ${posStr}: ${data.isValid ? '可领取' : '不可领取'} ${data.revardMsg || ''}`);
        }
        if (!$.querVideoResults) $.querVideoResults = {};
        $.querVideoResults[posLabel] = data;
      } catch (e) {
        console.log(`解析【${posStr}】 JSON 出错: ${e}`);
        if (!$.querVideoResults) $.querVideoResults = {};
        $.querVideoResults[posLabel] = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 等级福利 =====================

async function Reward(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/account/h5/level/receiveReward?equityId=1",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) console.log(`【赠币】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        $.reward = data;
      } catch (e) {
        console.log(`解析【赠币】 JSON 出错: ${e}`);
        $.reward = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

async function Rewardq(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/account/h5/level/receiveReward?equityId=4",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) console.log(`【听书券】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        $.rewardq = data;
      } catch (e) {
        console.log(`解析【听书券】 JSON 出错: ${e}`);
        $.rewardq = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

async function RewardVip(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/account/h5/level/receiveReward?equityId=13",
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,
      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) console.log(`【领会员】原始响应体: ${data}`);
      try {
        data = JSON.parse(data);
        $.rewardvip = data;
      } catch (e) {
        console.log(`解析【领会员】 JSON 出错: ${e}`);
        $.rewardvip = { code: -1, msg: "解析失败" };
      } finally {
        resolve();
      }
    });
  });
}

// ===================== 通知 =====================

async function Msg() {
  // 账户昵称
  if ($.nickName?.code === 0)
    t += `【账户昵称】${$.nickName.data.nickName}\n`;

  // 签到
  if ($.checkin?.code === -4) {
    t += `【首页签到】${$.checkin.msg}\n`;
  } else if ($.checkin?.code === 0) {
    const days = $.checkin.data?.continueSignDay ? `(连续${$.checkin.data.continueSignDay}天)` : '';
    t += `【首页签到】签到成功✅${days}\n`;
  }

  // 阅读时间任务
  if ($.readTimeResult?.length) {
    for (let r of $.readTimeResult) {
      if (r.code === 0) {
        t += `【${r.name}】领取成功✅\n`;
      } else if (r.code === -2) {
        t += `【${r.name}】${r.msg} 🕒\n`;
      } else {
        t += `【${r.name}】${r.msg || "领取失败"}\n`;
      }
    }
  }

  // 每周阅读进度
  if ($.weekReadTime !== undefined) {
    t += `【本周已读】${$.weekReadTime} 分钟 (${($.weekReadTime / 60).toFixed(1)}小时)\n`;
  }

  // 每日听书30分钟
  if ($.awardDay?.code === 0) {
    t += `【每日听书30分钟】领取成功✅\n`;
  } else if ($.awardDay?.code === -1) {
    t += `【每日听书30分钟】${$.awardDay.msg}\n`;
  }

  // 每周听书抽奖（独立变量 $.listenAward）
  if ($.listenAward?.code === 0) {
    const awardName = $.listenAward.data?.name || $.listenAward.msg;
    t += `【每周听书抽奖】获得 ${awardName} 🎉\n`;
  } else if ($.listenAward?.code === -3) {
    t += `【每周听书抽奖】${$.listenAward.msg}\n`;
  } else if ($.listenAward?.code && $.listenAward?.code !== -1) {
    t += `【每周听书抽奖】${$.listenAward.msg}\n`;
  }

  // 宝箱视频
  if ($.videoRewards && Object.keys($.videoRewards).length > 0) {
    t += `【宝箱视频】领取详情:\n`;
    Object.values($.videoRewards).forEach(reward => {
      t += `├─ ${reward.name} x${reward.total}${reward.unit}\n`;
    });
  } else {
    t += `【宝箱视频】今日无新礼物可领取\n`;
  }

  // 等级福利-赠币
  if ($.reward?.code === 0)
    t += `【等级福利-赠币】领取成功✅\n`;
  else if ($.reward?.code === -2)
    t += `【等级福利-赠币】${$.reward.msg}\n`;

  // 等级福利-听书券
  if ($.rewardq?.code === 0)
    t += `【等级福利-听书券】领取成功✅\n`;
  else if ($.rewardq?.code === -2)
    t += `【等级福利-听书券】${$.rewardq.msg}\n`;

  // 等级福利-体验会员
  if ($.rewardvip?.code === 0)
    t += `【等级福利-体验会员】领取成功✅\n`;
  else if ($.rewardvip?.code === -2)
    t += `【等级福利-体验会员】${$.rewardvip.msg}\n`;

  // 书架福利
  if ($.bookShelf) {
    t += `【书架福利】今日阅读 ${$.bookShelf.dayReadTime || 0} 分钟 | 可领 ${$.bookShelf.receiveCount || 0} 赠币\n`;
  }

  // 连续签到
  if ($.signInInfo) {
    t += `【连续签到】${$.signInInfo.num || 0} 天\n`;
  }

  // 等级广告视频
  if ($.querVideoResults) {
    for (const [pos, result] of Object.entries($.querVideoResults)) {
      if (result.code === 0) {
        t += `【等级广告(pos:${pos})】${result.isValid ? '可领取' : '不可领取'} ${result.revardMsg || ''}\n`;
      } else if (result.code === -5) {
        t += `【等级广告(pos:${pos})】今天的已看完\n`;
      } else if (result.code !== -1) {
        t += `【等级广告(pos:${pos})】${result.msg || ''}\n`;
      }
    }
  }

  // 周抽奖
  if ($.awardWeek?.code === 0) {
    const awardName = $.awardWeek.data?.name || $.awardWeek.msg;
    t += `【周抽奖】获得 ${awardName} 🎉\n`;
  } else if ($.awardWeek?.code === -3) {
    t += `【周抽奖】${$.awardWeek.msg}\n`;
  }

  // 月抽奖
  if ($.awardMonth?.code === 0) {
    const awardName = $.awardMonth.data?.name || $.awardMonth.msg;
    t += `【月抽奖】获得 ${awardName} 🎉\n`;
  } else if ($.awardMonth?.code === -3) {
    t += `【月抽奖】${$.awardMonth.msg}\n`;
  }

  // 个人信息摘要
  if ($.personalInfo?.userInfo) {
    const ui = $.personalInfo.userInfo;
    t += `【阅读总时长】${ui.readTime || '?'} | 读过 ${ui.readBook || '?'}本\n`;
  }

  // 发送通知
  if ($.isLoon() || $.isQuanX() || $.isSurge()) {
    $.msg(zh_name, "", t);
  } else if ($.isNode()) {
    await notify.sendNotify(zh_name, t);
  }
}

// ===================== Env API (保留原样) =====================

function Env(t, e) {
  class s {
    constructor(t) {
      this.env = t;
    }
    send(t, e = 'GET') {
      t = 'string' == typeof t ? { url: t } : t;
      let s = this.get;
      return (
          'POST' === e && (s = this.post),
              new Promise((e, a) => {
                s.call(this, t, (t, s, r) => {
                  t ? a(t) : e(s);
                });
              })
      );
    }
    get(t) {
      return this.send.call(this.env, t);
    }
    post(t) {
      return this.send.call(this.env, t, 'POST');
    }
  }
  return new (class {
    constructor(t, e) {
      (this.name = t),
          (this.http = new s(this)),
          (this.data = null),
          (this.dataFile = 'box.dat'),
          (this.logs = []),
          (this.isMute = !1),
          (this.isNeedRewrite = !1),
          (this.logSeparator = '\n'),
          (this.encoding = 'utf-8'),
          (this.startTime = new Date().getTime()),
          Object.assign(this, e),
          this.log('', `🔔${this.name}, 开始!`);
    }
    getEnv() {
      return 'undefined' != typeof $environment && $environment['surge-version']
          ? 'Surge'
          : 'undefined' != typeof $environment && $environment['stash-version']
              ? 'Stash'
              : 'undefined' != typeof module && module.exports
                  ? 'Node.js'
                  : 'undefined' != typeof $task
                      ? 'Quantumult X'
                      : 'undefined' != typeof $loon
                          ? 'Loon'
                          : 'undefined' != typeof $rocket
                              ? 'Shadowrocket'
                              : void 0;
    }
    isNode() { return 'Node.js' === this.getEnv(); }
    isQuanX() { return 'Quantumult X' === this.getEnv(); }
    isSurge() { return 'Surge' === this.getEnv(); }
    isLoon() { return 'Loon' === this.getEnv(); }
    isShadowrocket() { return 'Shadowrocket' === this.getEnv(); }
    isStash() { return 'Stash' === this.getEnv(); }
    toObj(t, e = null) { try { return JSON.parse(t); } catch { return e; } }
    toStr(t, e = null) { try { return JSON.stringify(t); } catch { return e; } }
    getjson(t, e) { let s = e; const a = this.getdata(t); if (a) try { s = JSON.parse(this.getdata(t)); } catch { } return s; }
    setjson(t, e) { try { return this.setdata(JSON.stringify(t), e); } catch { return !1; } }
    getScript(t) { return new Promise((e) => { this.get({ url: t }, (t, s, a) => e(a)); }); }
    runScript(t, e) {
      return new Promise((s) => {
        let a = this.getdata('@chavy_boxjs_userCfgs.httpapi');
        a = a ? a.replace(/\n/g, '').trim() : a;
        let r = this.getdata('@chavy_boxjs_userCfgs.httpapi_timeout');
        (r = r ? 1 * r : 20), (r = e && e.timeout ? e.timeout : r);
        const [i, o] = a.split('@'),
            n = {
              url: `http://${o}/v1/scripting/evaluate`,
              body: { script_text: t, mock_type: 'cron', timeout: r },
              headers: { 'X-Key': i, Accept: '*/*' },
              timeout: r,
            };
        this.post(n, (t, e, a) => s(a));
      }).catch((t) => this.logErr(t));
    }
    loaddata() {
      if (!this.isNode()) return {};
      {
        (this.fs = this.fs ? this.fs : require('fs')),
            (this.path = this.path ? this.path : require('path'));
        const t = this.path.resolve(this.dataFile),
            e = this.path.resolve(process.cwd(), this.dataFile),
            s = this.fs.existsSync(t),
            a = !s && this.fs.existsSync(e);
        if (!s && !a) return {};
        { const a = s ? t : e; try { return JSON.parse(this.fs.readFileSync(a)); } catch (t) { return {}; } }
      }
    }
    writedata() {
      if (this.isNode()) {
        (this.fs = this.fs ? this.fs : require('fs')),
            (this.path = this.path ? this.path : require('path'));
        const t = this.path.resolve(this.dataFile),
            e = this.path.resolve(process.cwd(), this.dataFile),
            s = this.fs.existsSync(t),
            a = !s && this.fs.existsSync(e),
            r = JSON.stringify(this.data);
        s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r);
      }
    }
    lodash_get(t, e, s) {
      const a = e.replace(/\[(\d+)\]/g, '.$1').split('.');
      let r = t;
      for (const t of a) if (((r = Object(r)[t]), void 0 === r)) return s;
      return r;
    }
    lodash_set(t, e, s) {
      return Object(t) !== t
          ? t
          : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []),
              (e.slice(0, -1).reduce((t, s, a) => Object(t[s]) === t[s] ? t[s] : (t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}), t)[e[e.length - 1]] = s), t);
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t),
            r = s ? this.getval(s) : '';
        if (r)
          try { const t = JSON.parse(r); e = t ? this.lodash_get(t, a, '') : e; } catch (t) { e = ''; }
      }
      return e;
    }
    setdata(t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e),
            i = this.getval(a),
            o = a ? ('null' === i ? null : i || '{}') : '{}';
        try { const e = JSON.parse(o); this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), a)); } catch (e) { const i = {}; this.lodash_set(i, r, t), (s = this.setval(JSON.stringify(i), a)); }
      } else s = this.setval(t, e);
      return s;
    }
    getval(t) {
      switch (this.getEnv()) {
        case 'Surge': case 'Loon': case 'Stash': case 'Shadowrocket': return $persistentStore.read(t);
        case 'Quantumult X': return $prefs.valueForKey(t);
        case 'Node.js': return (this.data = this.loaddata()), this.data[t];
        default: return (this.data && this.data[t]) || null;
      }
    }
    setval(t, e) {
      switch (this.getEnv()) {
        case 'Surge': case 'Loon': case 'Stash': case 'Shadowrocket': return $persistentStore.write(t, e);
        case 'Quantumult X': return $prefs.setValueForKey(t, e);
        case 'Node.js': return (this.data = this.loaddata()), (this.data[e] = t), this.writedata(), !0;
        default: return (this.data && this.data[e]) || null;
      }
    }
    initGotEnv(t) {
      (this.got = this.got ? this.got : require('got')),
          (this.cktough = this.cktough ? this.cktough : require('tough-cookie')),
          (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()),
      t && ((t.headers = t.headers ? t.headers : {}),
      void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar));
    }
    get(t, e = () => { }) {
      switch (
          (t.headers && (delete t.headers['Content-Type'], delete t.headers['Content-Length'], delete t.headers['content-type'], delete t.headers['content-length']),
          t.params && (t.url += '?' + this.queryStr(t.params)),
              this.getEnv())
          ) {
        case 'Surge': case 'Loon': case 'Stash': case 'Shadowrocket':
        default:
          this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { 'X-Surge-Skip-Scripting': !1 })),
              $httpClient.get(t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a); });
          break;
        case 'Quantumult X':
          this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
              $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i, o); }, (t) => e((t && t.error) || 'UndefinedError'));
          break;
        case 'Node.js':
          let s = require('iconv-lite');
          this.initGotEnv(t),
              this.got(t).on('redirect', (t, e) => { try { if (t.headers['set-cookie']) { const s = t.headers['set-cookie'].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), (e.cookieJar = this.ckjar); } } catch (t) { this.logErr(t); } }).then((t) => { const { statusCode: a, statusCode: r, headers: i, rawBody: o } = t, n = s.decode(o, this.encoding); e(null, { status: a, statusCode: r, headers: i, rawBody: o, body: n }, n); }, (t) => { const { message: a, response: r } = t; e(a, r, r && s.decode(r.rawBody, this.encoding)); });
      }
    }
    post(t, e = () => { }) {
      const s = t.method ? t.method.toLocaleLowerCase() : 'post';
      switch (
          (t.body && t.headers && !t.headers['Content-Type'] && !t.headers['content-type'] && (t.headers['content-type'] = 'application/x-www-form-urlencoded'),
          t.headers && (delete t.headers['Content-Length'], delete t.headers['content-length']),
              this.getEnv())
          ) {
        case 'Surge': case 'Loon': case 'Stash': case 'Shadowrocket':
        default:
          this.isSurge() && this.isNeedRewrite && ((t.headers = t.headers || {}), Object.assign(t.headers, { 'X-Surge-Skip-Scripting': !1 })),
              $httpClient[s](t, (t, s, a) => { !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode)), e(t, s, a); });
          break;
        case 'Quantumult X':
          (t.method = s),
          this.isNeedRewrite && ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
              $task.fetch(t).then((t) => { const { statusCode: s, statusCode: a, headers: r, body: i, bodyBytes: o } = t; e(null, { status: s, statusCode: a, headers: r, body: i, bodyBytes: o }, i); }, (t) => e((t && t.error) || 'UndefinedError'));
          break;
        case 'Node.js':
          let a = require('iconv-lite');
          this.initGotEnv(t);
          const { url: r, ...i } = t;
          this.got[s](r, i).then((t) => { const { statusCode: s, statusCode: r, headers: i, rawBody: o } = t, n = a.decode(o, this.encoding); e(null, { status: s, statusCode: r, headers: i, rawBody: o, body: n }, n); }, (t) => { const { message: s, response: r } = t; e(s, r, r && a.decode(r.rawBody, this.encoding)); });
      }
    }
    time(t, e = null) {
      const s = e ? new Date(e) : new Date();
      let a = { 'M+': s.getMonth() + 1, 'd+': s.getDate(), 'H+': s.getHours(), 'm+': s.getMinutes(), 's+': s.getSeconds(), 'q+': Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() };
      /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + '').substr(4 - RegExp.$1.length)));
      for (let e in a) new RegExp('(' + e + ')').test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? a[e] : ('00' + a[e]).substr(('' + a[e]).length)));
      return t;
    }
    queryStr(t) {
      let e = '';
      for (const s in t) { let a = t[s]; null != a && '' !== a && ('object' == typeof a && (a = JSON.stringify(a)), (e += `${s}=${a}&`)); }
      return (e = e.substring(0, e.length - 1)), e;
    }
    msg(e = t, s = '', a = '', r) {
      const i = (t) => {
        switch (typeof t) {
          case void 0: return t;
          case 'string':
            switch (this.getEnv()) {
              case 'Surge': case 'Stash': default: return { url: t };
              case 'Loon': case 'Shadowrocket': return t;
              case 'Quantumult X': return { 'open-url': t };
              case 'Node.js': return;
            }
          case 'object':
            switch (this.getEnv()) {
              case 'Surge': case 'Stash': case 'Shadowrocket': default: { let e = t.url || t.openUrl || t['open-url']; return { url: e }; }
              case 'Loon': { let e = t.openUrl || t.url || t['open-url'], s = t.mediaUrl || t['media-url']; return { openUrl: e, mediaUrl: s }; }
              case 'Quantumult X': { let e = t['open-url'] || t.url || t.openUrl, s = t['media-url'] || t.mediaUrl, a = t['update-pasteboard'] || t.updatePasteboard; return { 'open-url': e, 'media-url': s, 'update-pasteboard': a }; }
              case 'Node.js': return;
            }
          default: return;
        }
      };
      if (!this.isMute)
        switch (this.getEnv()) {
          case 'Surge': case 'Loon': case 'Stash': case 'Shadowrocket': default: $notification.post(e, s, a, i(r)); break;
          case 'Quantumult X': $notify(e, s, a, i(r)); break;
          case 'Node.js': break;
        }
      if (!this.isMuteLog) {
        let t = ['', '==============📣系统通知📣=============='];
        t.push(e), s && t.push(s), a && t.push(a), console.log(t.join('\n')), (this.logs = this.logs.concat(t));
      }
    }
    log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)); }
    logErr(t, e) { switch (this.getEnv()) { case 'Surge': case 'Loon': case 'Stash': case 'Shadowrocket': case 'Quantumult X': default: this.log('', `❗️${this.name}, 错误!`, t); break; case 'Node.js': this.log('', `❗️${this.name}, 错误!`, t.stack); } }
    wait(t) { return new Promise((e) => setTimeout(e, t)); }
    done(t = {}) {
      const e = new Date().getTime(), s = (e - this.startTime) / 1e3;
      switch (this.log('', `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), this.getEnv()) {
        case 'Surge': case 'Loon': case 'Stash': case 'Shadowrocket': case 'Quantumult X': default: $done(t); break;
        case 'Node.js': process.exit(1);
      }
    }
  })(t, e);
}