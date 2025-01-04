/*
APP：QQ阅读
版本：////
作者：General℡

脚本功能：签到 看广告视频获取赠币 (抽奖（只有在每个星期天和每月15号才会抽奖）)

bug：签到任务里的看视频总是只有每天第一次的第一条有效

Boxjs定阅(https://raw.githubusercontent.com/General74110/Quantumult-X/master/Boxjs/General74110.json)

操作：
Loon:点击 【我的】 获取Cookies！获取完后关掉重写，避免不必要的MITM
青龙：抓取ywguid, ywkey,ywtoken,csigs填入环境变量
 


注意⚠️：当前脚本只测试Loon，node.js 其他自测！

使用声明：⚠️⚠️⚠️此脚本仅供学习与交流，转载请注明出处
        请勿贩卖！⚠️⚠️⚠️

[Script]
http-request ^https:\/\/iostgw\.reader\.qq\.com\/v7_6_6\/userinfo\? script-path=https://raw.githubusercontent.com/General74110/Quantumult-X/master/Task/QQreader.js, timeout=10, enabled=true, tag=QQ阅读获取Cookies, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/QQ.png


[Task]
cron "30 6 * * *" script-path=https://raw.githubusercontent.com/General74110/Quantumult-X/master/Task/QQreader.js, timeout=3600, tag=QQ阅读, img-url=https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/QQ.png


[MITM]
hostname = *.reader.qq.com


*/
const General = 'QQ阅读';
const $ = new Env(General);
const zh_name = 'QQ阅读';
const logs = 0;  // 设置0关闭日志, 1开启日志
const notify = $.isNode() ? require('./sendNotify') : '';
// 检查是否在 Node.js 环境中
const isNode = typeof process !== "undefined" && process.env;

if (isNode) {
  // Node.js 环境中使用 require 加载依赖
  const dotenv = require('dotenv');
  dotenv.config(); // 读取 .env 文件中的环境变量
}

let ywguidArr = [], ywkeyArr = [], ywtokenArr = [], csigsArr = [];
let globalCookie = '';
let boxVideoTotalCoins = 0;
let t = "";


// 读取环境变量
ywkeyArr.push($.getdata('ywkey') || (isNode ? process.env.ywkey : ''));
ywguidArr.push($.getdata('ywguid') || (isNode ? process.env.ywguid : ''));
ywtokenArr.push($.getdata('ywtoken') || (isNode ? process.env.ywtoken : ''));
csigsArr.push($.getdata('csigs') || (isNode ? process.env.csigs : ''));



!(async () => {
  if (typeof $request !== "undefined") {
    // 如果是请求环境，获取 Cookies
    GetCookies();
  } else {
    // 环境变量处理
    let count = ($.getval('count') || '1');
    for (let i = 2; i <= count; i++) {
      ywkeyArr.push($.getdata(`ywkey${i}`));
      ywguidArr.push($.getdata(`ywguid${i}`));
      ywtokenArr.push($.getdata(`ywtoken${i}`));
      csigsArr.push($.getdata(`csigs${i}`));
    }

    console.log(
      `\n\n=============================================== 脚本执行 - 北京时间(UTC+8)：${new Date(
        new Date().getTime() +
        new Date().getTimezoneOffset() * 60 * 1000 +
        8 * 60 * 60 * 1000
      ).toLocaleString()} ===============================================\n`);

    // 构建全局 Cookie
    globalCookie = buildCookie(ywguidArr[0], ywkeyArr[0], ywtokenArr[0], csigsArr[0]);
    if (logs == 1) {
      console.log(`生成全局 Cookie: ${globalCookie}`);
    }

    for (let i = 0; i < ywguidArr.length; i++) {
      if (ywguidArr[i] && ywkeyArr[i] && ywtokenArr[i]) {
        $.index = i + 1;
        console.log (`\n\n开始【QQ阅读任务】`);

        // 1. 检测昵称，判断 Cookie 是否有效
        await NickName (globalCookie);
        const content = "⚠️ Cookie 已失效，请更新\n";

        if ($.nickName && $.nickName.msg === "登录鉴权失败") {

          if ($.isNode ()) {
            await notify.sendNotify (zh_name, content); // Node.js 环境下使用 sendNotify
          } else if ($.isLoon () || $.isQuanX () || $.isSurge ()) {
            $.msg (zh_name, "", content); // 其他环境下使用 $.msg
          } else {
            console.log (zh_name, content);
          }
          $.done (); // 确保终止脚本运行
          return;
        }

          // 2. 执行签到任务
          await $.wait (1000);  // 延迟 1 秒
          await CheckinSign (globalCookie);

          // 3. 执行宝箱视频任务
          await $.wait (1000);  // 延迟 1 秒
          await BoxVideo (globalCookie);

          // 4. 执行等级广告视频任务
          await $.wait (1000);  // 延迟 1 秒
          await QuerVideo (globalCookie);

          // 5. 周抽奖和月抽奖逻辑
          const currentDay = new Date ().getDay ();
          const currentDate = new Date ().getDate ();

          if (currentDay === 0) {
            await GetAwardWeek (globalCookie); // 周抽奖
          }

          if (currentDate === 15) {
            await GetAwardMonth (globalCookie); // 月抽奖
          }

          if (currentDate === 1) {
            await Reward (globalCookie); //等级福利
            await RewardVip (globalCookie); //等级福利
          }



          // 6. 发送任务总结通知
          await $.wait (1000);  // 延迟 1 秒
          await Msg ();
        }

    }
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function buildCookie(ywguid, ywkey, ywtoken, csigs) {

  function trs() {
    return Date.now().toString();
  }
  function ts() {
    return Math.floor(Date.now() / 1000).toString();
  }

  let IFDA = udid();
  let qrsn = udid2();

  // 构建 Cookie

  let Cookie = `IFDA=${IFDA}; c_version=qqreader_8.1.62.0607_iphone;  csigs=${csigs};  loginType=1; platform=ioswp; qrsn=${qrsn}; qrsn_new=${qrsn};  qrtm=${ts()}; ttime=${trs()}; ywguid=${ywguid}; ywkey=${ywkey}; ywtoken=${ywtoken}`;


  return Cookie;
}


/**
* 随机 UUID 生成函数
*/
// 随机udid 大写
function udid() {
  var s = [];
  var hexDigits = "0123456789ABCDEF";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
}

// 随机udid 小写
function udid2() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

// 获取Cookies
function GetCookies() {
  // 获取请求头中的相关字段
  const ywkey = $request.headers['ywkey'];
  const ywguid = $request.headers['ywguid'];
  const ywtoken = $request.headers['ywtoken'];
  const csigs = $request.headers['csigs'];

  if (ywkey) {
    $.setdata(ywkey, 'ywkey');
    $.log(`获取到的 ywkey: ${ywkey}`);
  } else {
    $.log("未能获取到 ywkey");
  }

  if (ywguid) {
    $.setdata(ywguid, 'ywguid');
    $.log(`获取到的 ywguid: ${ywguid}`);
  } else {
    $.log("未能获取到 ywguid");
  }

  if (ywtoken) {
    $.setdata(ywtoken, 'ywtoken');
    $.log(`获取到的 ywtoken: ${ywtoken}`);
  } else {
    $.log("未能获取到 ywtoken");
  }

  if (csigs) {
    $.setdata(csigs, 'csigs');
    $.log(`获取到的 csigs: ${csigs}`);
  } else {
    $.log("未能获取到 csigs");
  }

  // 成功后通知
  $.msg($.name, "", `QQ阅读获取 Cookie 成功`);
}



/**
* NickName 函数，获取昵称
/**
* 获取昵称
*/
async function NickName(Cookie) {
  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/account/h5/level/mine",
    headers : {

        "cookie": Cookie  // 确保Cookie变量内容符合请求头标准
    }
    };

    $.get(Url, async (err, resp, data) => {
      if (err) {
        console.log(`请求失败: ${err}`);
        resolve();
        return;
      }
      if (logs == 1) {
        console.log(`响应状态码: ${resp.status}`);  // 打印状态码
        console.log(`【昵称】原始响应体: ${data}`);  // 打印原始响应体
      }
      try {
        data = JSON.parse(data);
        if (logs == 1)
          console.log(`⚠️获取【昵称】数据: ${data.data.nickName}`);
        $.nickName = data;
      } catch (e) {
        console.log(`解析【昵称】 JSON 出错: ${e}`);
        console.log(`【昵称】原始响应体: ${data}`);  // 打印原始响应体
      } finally {
        resolve();
      }
    });
  });
}



// 签到
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
        console.log(`响应状态码: ${resp.status}`); // 打印状态码
        console.log(`【签到】原始响应体: ${data}`); // 打印原始响应体
      }
      try {
        data = JSON.parse(data);
        if (logs == 1) {
          console.log(`⚠️【签到】结果数据: ${data.msg}`);
        }
        $.checkin = data;
      } catch (e) {
        console.log(`解析【签到】 JSON 出错: ${e}`);
        console.log(`【签到】原始响应体: ${data}`); // 打印原始响应体
      } finally {
        resolve();
      }
    });
  });
}

//等级内的赠币
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
            if (logs == 1) {
                console.log(`响应状态码: ${resp.status}`); // 打印状态码
                console.log(`【赠币】原始响应体: ${data}`); // 打印原始响应体
            }
            try {
                data = JSON.parse(data);
                if (logs == 1) {
                    console.log(`⚠️【赠币】结果数据: ${data.msg}`);
                }
                $.reward = data;
            } catch (e) {
                console.log(`解析【赠币】 JSON 出错: ${e}`);
                console.log(`【赠币】原始响应体: ${data}`); // 打印原始响应体
            } finally {
                resolve();
            }
        });
    });
}

//每月一号领会员
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
        if (logs == 1) {
          console.log (`响应状态码: ${resp.status}`); // 打印状态码
          console.log (`【领会员】原始响应体: ${data}`); // 打印原始响应体
        }
        try {
          data = JSON.parse (data);
          if (logs == 1) {
            console.log (`⚠️【领会员】结果数据: ${data.msg}`);
          }
          $.rewardvip = data;
        } catch (e) {
          console.log (`解析【领会员】 JSON 出错: ${e}`);
          console.log (`【领会员】原始响应体: ${data}`); // 打印原始响应体
        } finally {
          resolve ();
        }
      });
    });
}

// 周抽奖
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
      if (logs == 1) {
        console.log(`响应状态码: ${resp.status}`); // 打印状态码
        console.log(`【周抽奖】原始响应体: ${data}`); // 打印原始响应体
      }
      try {
        data = JSON.parse(data);
        if (logs == 1) console.log(`⚠️【周抽奖】结果数据: ${data.msg}`);
        $.awardWeek = data;
      } catch (e) {
        console.log(`解析【周抽奖】 JSON 出错: ${e}`);
        console.log(`【周抽奖】原始响应体: ${data}`); // 打印原始响应体
      } finally {
        resolve();
      }
    });
  });
}

// 月抽奖
async function GetAwardMonth(Cookie) {
  return new Promise((resolve) => {

    // 构造 URL
    const Url = {
      url: `https://eventv3.reader.qq.com/activity/new_welfare/getAward?entrance=month`,
      headers: {

        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,


      }
    };
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) {
        console.log(`响应状态码: ${resp.status}`); // 打印状态码
        console.log(`【月抽奖】原始响应体: ${data}`); // 打印原始响应体
      }
      try {
        data = JSON.parse(data);
        if (logs == 1) console.log(`⚠️月抽奖结果数据: ${data}`);
        $.awardMonth = data;
      } catch (e) {
        console.log(`解析【月抽奖】 JSON 出错: ${e}`);
        console.log(`【月抽奖】原始响应体: ${data}`); // 打印原始响应体
      } finally {
        resolve();
      }
    });
  });
}


// 添加 sleep 函数，用于延时操作
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// 宝箱视频任务，循环运行 3 次，但当任务已经领取时，跳过后续操作
async function BoxVideo(Cookie) {
  let totalCoins = 0;  // 用于累加每次宝箱视频获得的赠币
  for (let i = 1; i <= 3; i++) {
    let result = await runBoxVideo(Cookie, i);  // 修正：传递 Cookie 参数
    if (result.code === -1) {
      console.log("宝箱视频任务已经完成，跳过后续任务执行。\n");
      break; // 如果已经领取，停止后续执行
    }

    totalCoins += result.data;  // 累加每次宝箱获得的赠币

    if (i < 3) {  // 在第 1、2 次循环后，执行延时
      let delay = i === 1 ? 5000 : 10000;  // 第一次延迟5秒，第二次延迟10秒
      console.log(`宝箱视频第 ${i} 次任务执行完毕，等待 ${delay / 1000} 秒后执行下一次任务...\n`);
      await sleep(delay); // 使用 sleep 函数进行延时
    }
  }

  // 将总的赠币累加到全局变量
  boxVideoTotalCoins += totalCoins;

  console.log(`宝箱视频任务总共获得 ${totalCoins} 💰赠币\n`);
}







// 实际执行的宝箱视频任务
async function runBoxVideo(Cookie, i) {
  return new Promise((resolve) => {
    const Url = {
      url: `https://eventv3.reader.qq.com/activity/new_welfare/receiveVideo?type=70526242`,
      headers: {

        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,


      }
    };

    $.get(Url, async (err, resp, data) => {
      if (logs == 1) {
        console.log(`响应状态码: ${resp.status}`); // 打印状态码
        console.log(`【宝箱】原始响应体: ${data}`); // 打印原始响应体
      }
      try {
        data = JSON.parse(data);  // 解析 JSON 数据
        if (logs == 1) console.log(`⚠️【宝箱视频】任务执行结果 (第 ${i} 次): ${data.msg}`);
        if (data.code === 0) {
          $.boxVideo = data;  // 只有在成功时才保存
        } else {
          $.boxVideo = { code: data.code, msg: data.msg };  // 保存错误信息
        }

        resolve(data); // 返回数据结果，用于停止循环
      } catch (e) {
        console.log(`解析【宝箱】 JSON 出错: ${e}`);
        console.log(`【宝箱】原始响应体: ${data}`); // 打印原始响应体
      } finally {
        resolve();
      }
    });
  });
}


//等级广告视频
async function QuerVideo(Cookie) {

  return new Promise((resolve) => {
    let Url = {
      url: "https://commontgw.reader.qq.com/v7_6_6/giveadreward?adPositionId=18",
      headers: {

        'Accept': 'application/json, text/plain, */*',
        'cookie': Cookie,


      }
    }
    $.get(Url, async (err, resp, data) => {
      if (logs == 1) {
        console.log(`响应状态码: ${resp.status}`); // 打印状态码
        console.log(`【等级广告】原始响应体: ${data}`); // 打印原始响应体
      }
      try {
        data = JSON.parse(data);
        if (logs == 1) console.log(`⚠️【等级广告】视频: ${data.isValid}`);
        $.querVideo = data;
      } catch (e) {
        console.log(`解析【等级广告】 JSON 出错: ${e}`);
        console.log(`【等级广告】原始响应体: ${data}`); // 打印原始响应体
      } finally {
        resolve();
      }
    })
  })
}


//通知
async function Msg() {

  if ($.nickName?.code === 0)
    t += `【账户昵称】${$.nickName.data.nickName}\n`;

  if ($.checkin?.code === -4) {
    t += `【签到状态】${$.checkin.msg}\n`;
  }
  if ($.checkin?.code === 0) {
    t += `【首页签到】签到成功✅\n`;
  }

  if (boxVideoTotalCoins > 0) {
    t += `【宝箱视频】获得 ${boxVideoTotalCoins} 💰赠币\n`;  // 输出总赠币
  } else if ($.boxVideo?.code === -1)
    {
      t += `【宝箱视频】${$.boxVideo.msg}\n`;
  }

  if ($.reward?.code === 0)
      t += `【等级福利】获得相应等级福利 ${$.reward.msg} !\n`;
    else if ($.reward?.code === -2)
        t += `【等级福利】${$.reward.msg}\n`;

    if ($.rewardvip?.code === 0)
        t += `【等级福利】获得相应等级福利 ${$.rewardvip.msg} !\n`;
    else if ($.rewardvip?.code === -2)
        t += `【等级福利】${$.rewardvip.msg}\n`;

  if ($.querVideo?.code == 0)
    t += `【等级内广告视频】获得 ${$.querVideo.revardMsg}\n`;
  else if ($.querVideo?.code == -5)
    t += `【等级内广告视频】今天的视频已经看完了\n`;

  if ($.awardWeek?.code === 0)
    t += `【周抽奖】获得 ${$.awardWeek.data.name}\n`;
  else if ($.awardWeek?.code === -3)
    t += `【周抽奖】${$.awardWeek.msg}\n`;

  if ($.awardMonth?.code === 0)
    t += `【月抽奖】获得 ${$.awardMonth.data.name}\n`;
  else if ($.awardMonth?.code === -3)
    t += `【月抽奖】${$.awardMonth.msg}\n`;

   // 判断环境，发送通知
   if ($.isLoon() || $.isQuanX() || $.isSurge()) {
    $.msg(zh_name, "", t);
  } else if ($.isNode()) {
    await notify.sendNotify(zh_name, t);
  }
}



// https://github.com/chavyleung/scripts/blob/master/Env.min.js
/*********************************** API *************************************/
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
    isNode() {
      return 'Node.js' === this.getEnv();
    }
    isQuanX() {
      return 'Quantumult X' === this.getEnv();
    }
    isSurge() {
      return 'Surge' === this.getEnv();
    }
    isLoon() {
      return 'Loon' === this.getEnv();
    }
    isShadowrocket() {
      return 'Shadowrocket' === this.getEnv();
    }
    isStash() {
      return 'Stash' === this.getEnv();
    }
    toObj(t, e = null) {
      try {
        return JSON.parse(t);
      } catch {
        return e;
      }
    }
    toStr(t, e = null) {
      try {
        return JSON.stringify(t);
      } catch {
        return e;
      }
    }
    getjson(t, e) {
      let s = e;
      const a = this.getdata(t);
      if (a)
        try {
          s = JSON.parse(this.getdata(t));
        } catch { }
      return s;
    }
    setjson(t, e) {
      try {
        return this.setdata(JSON.stringify(t), e);
      } catch {
        return !1;
      }
    }
    getScript(t) {
      return new Promise((e) => {
        this.get({ url: t }, (t, s, a) => e(a));
      });
    }
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
        {
          const a = s ? t : e;
          try {
            return JSON.parse(this.fs.readFileSync(a));
          } catch (t) {
            return {};
          }
        }
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
        s
          ? this.fs.writeFileSync(t, r)
          : a
            ? this.fs.writeFileSync(e, r)
            : this.fs.writeFileSync(t, r);
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
          (e
            .slice(0, -1)
            .reduce(
              (t, s, a) =>
                Object(t[s]) === t[s]
                  ? t[s]
                  : (t[s] = Math.abs(e[a + 1]) >> 0 == +e[a + 1] ? [] : {}),
              t
            )[e[e.length - 1]] = s),
          t);
    }
    getdata(t) {
      let e = this.getval(t);
      if (/^@/.test(t)) {
        const [, s, a] = /^@(.*?)\.(.*?)$/.exec(t),
          r = s ? this.getval(s) : '';
        if (r)
          try {
            const t = JSON.parse(r);
            e = t ? this.lodash_get(t, a, '') : e;
          } catch (t) {
            e = '';
          }
      }
      return e;
    }
    setdata(t, e) {
      let s = !1;
      if (/^@/.test(e)) {
        const [, a, r] = /^@(.*?)\.(.*?)$/.exec(e),
          i = this.getval(a),
          o = a ? ('null' === i ? null : i || '{}') : '{}';
        try {
          const e = JSON.parse(o);
          this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), a));
        } catch (e) {
          const i = {};
          this.lodash_set(i, r, t), (s = this.setval(JSON.stringify(i), a));
        }
      } else s = this.setval(t, e);
      return s;
    }
    getval(t) {
      switch (this.getEnv()) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
          return $persistentStore.read(t);
        case 'Quantumult X':
          return $prefs.valueForKey(t);
        case 'Node.js':
          return (this.data = this.loaddata()), this.data[t];
        default:
          return (this.data && this.data[t]) || null;
      }
    }
    setval(t, e) {
      switch (this.getEnv()) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
          return $persistentStore.write(t, e);
        case 'Quantumult X':
          return $prefs.setValueForKey(t, e);
        case 'Node.js':
          return (
            (this.data = this.loaddata()),
            (this.data[e] = t),
            this.writedata(),
            !0
          );
        default:
          return (this.data && this.data[e]) || null;
      }
    }
    initGotEnv(t) {
      (this.got = this.got ? this.got : require('got')),
        (this.cktough = this.cktough ? this.cktough : require('tough-cookie')),
        (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()),
        t &&
        ((t.headers = t.headers ? t.headers : {}),
          void 0 === t.headers.Cookie &&
          void 0 === t.cookieJar &&
          (t.cookieJar = this.ckjar));
    }
    get(t, e = () => { }) {
      switch (
      (t.headers &&
        (delete t.headers['Content-Type'],
          delete t.headers['Content-Length'],
          delete t.headers['content-type'],
          delete t.headers['content-length']),
        t.params && (t.url += '?' + this.queryStr(t.params)),
        this.getEnv())
      ) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
        default:
          this.isSurge() &&
            this.isNeedRewrite &&
            ((t.headers = t.headers || {}),
              Object.assign(t.headers, { 'X-Surge-Skip-Scripting': !1 })),
            $httpClient.get(t, (t, s, a) => {
              !t &&
                s &&
                ((s.body = a),
                  (s.statusCode = s.status ? s.status : s.statusCode),
                  (s.status = s.statusCode)),
                e(t, s, a);
            });
          break;
        case 'Quantumult X':
          this.isNeedRewrite &&
            ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
            $task.fetch(t).then(
              (t) => {
                const {
                  statusCode: s,
                  statusCode: a,
                  headers: r,
                  body: i,
                  bodyBytes: o,
                } = t;
                e(
                  null,
                  {
                    status: s,
                    statusCode: a,
                    headers: r,
                    body: i,
                    bodyBytes: o,
                  },
                  i,
                  o
                );
              },
              (t) => e((t && t.error) || 'UndefinedError')
            );
          break;
        case 'Node.js':
          let s = require('iconv-lite');
          this.initGotEnv(t),
            this.got(t)
              .on('redirect', (t, e) => {
                try {
                  if (t.headers['set-cookie']) {
                    const s = t.headers['set-cookie']
                      .map(this.cktough.Cookie.parse)
                      .toString();
                    s && this.ckjar.setCookieSync(s, null),
                      (e.cookieJar = this.ckjar);
                  }
                } catch (t) {
                  this.logErr(t);
                }
              })
              .then(
                (t) => {
                  const {
                    statusCode: a,
                    statusCode: r,
                    headers: i,
                    rawBody: o,
                  } = t,
                    n = s.decode(o, this.encoding);
                  e(
                    null,
                    {
                      status: a,
                      statusCode: r,
                      headers: i,
                      rawBody: o,
                      body: n,
                    },
                    n
                  );
                },
                (t) => {
                  const { message: a, response: r } = t;
                  e(a, r, r && s.decode(r.rawBody, this.encoding));
                }
              );
      }
    }
    post(t, e = () => { }) {
      const s = t.method ? t.method.toLocaleLowerCase() : 'post';
      switch (
      (t.body &&
        t.headers &&
        !t.headers['Content-Type'] &&
        !t.headers['content-type'] &&
        (t.headers['content-type'] = 'application/x-www-form-urlencoded'),
        t.headers &&
        (delete t.headers['Content-Length'],
          delete t.headers['content-length']),
        this.getEnv())
      ) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
        default:
          this.isSurge() &&
            this.isNeedRewrite &&
            ((t.headers = t.headers || {}),
              Object.assign(t.headers, { 'X-Surge-Skip-Scripting': !1 })),
            $httpClient[s](t, (t, s, a) => {
              !t &&
                s &&
                ((s.body = a),
                  (s.statusCode = s.status ? s.status : s.statusCode),
                  (s.status = s.statusCode)),
                e(t, s, a);
            });
          break;
        case 'Quantumult X':
          (t.method = s),
            this.isNeedRewrite &&
            ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
            $task.fetch(t).then(
              (t) => {
                const {
                  statusCode: s,
                  statusCode: a,
                  headers: r,
                  body: i,
                  bodyBytes: o,
                } = t;
                e(
                  null,
                  {
                    status: s,
                    statusCode: a,
                    headers: r,
                    body: i,
                    bodyBytes: o,
                  },
                  i,
                  o
                );
              },
              (t) => e((t && t.error) || 'UndefinedError')
            );
          break;
        case 'Node.js':
          let a = require('iconv-lite');
          this.initGotEnv(t);
          const { url: r, ...i } = t;
          this.got[s](r, i).then(
            (t) => {
              const {
                statusCode: s,
                statusCode: r,
                headers: i,
                rawBody: o,
              } = t,
                n = a.decode(o, this.encoding);
              e(
                null,
                { status: s, statusCode: r, headers: i, rawBody: o, body: n },
                n
              );
            },
            (t) => {
              const { message: s, response: r } = t;
              e(s, r, r && a.decode(r.rawBody, this.encoding));
            }
          );
      }
    }
    time(t, e = null) {
      const s = e ? new Date(e) : new Date();
      let a = {
        'M+': s.getMonth() + 1,
        'd+': s.getDate(),
        'H+': s.getHours(),
        'm+': s.getMinutes(),
        's+': s.getSeconds(),
        'q+': Math.floor((s.getMonth() + 3) / 3),
        S: s.getMilliseconds(),
      };
      /(y+)/.test(t) &&
        (t = t.replace(
          RegExp.$1,
          (s.getFullYear() + '').substr(4 - RegExp.$1.length)
        ));
      for (let e in a)
        new RegExp('(' + e + ')').test(t) &&
          (t = t.replace(
            RegExp.$1,
            1 == RegExp.$1.length
              ? a[e]
              : ('00' + a[e]).substr(('' + a[e]).length)
          ));
      return t;
    }
    queryStr(t) {
      let e = '';
      for (const s in t) {
        let a = t[s];
        null != a &&
          '' !== a &&
          ('object' == typeof a && (a = JSON.stringify(a)),
            (e += `${s}=${a}&`));
      }
      return (e = e.substring(0, e.length - 1)), e;
    }
    msg(e = t, s = '', a = '', r) {
      const i = (t) => {
        switch (typeof t) {
          case void 0:
            return t;
          case 'string':
            switch (this.getEnv()) {
              case 'Surge':
              case 'Stash':
              default:
                return { url: t };
              case 'Loon':
              case 'Shadowrocket':
                return t;
              case 'Quantumult X':
                return { 'open-url': t };
              case 'Node.js':
                return;
            }
          case 'object':
            switch (this.getEnv()) {
              case 'Surge':
              case 'Stash':
              case 'Shadowrocket':
              default: {
                let e = t.url || t.openUrl || t['open-url'];
                return { url: e };
              }
              case 'Loon': {
                let e = t.openUrl || t.url || t['open-url'],
                  s = t.mediaUrl || t['media-url'];
                return { openUrl: e, mediaUrl: s };
              }
              case 'Quantumult X': {
                let e = t['open-url'] || t.url || t.openUrl,
                  s = t['media-url'] || t.mediaUrl,
                  a = t['update-pasteboard'] || t.updatePasteboard;
                return {
                  'open-url': e,
                  'media-url': s,
                  'update-pasteboard': a,
                };
              }
              case 'Node.js':
                return;
            }
          default:
            return;
        }
      };
      if (!this.isMute)
        switch (this.getEnv()) {
          case 'Surge':
          case 'Loon':
          case 'Stash':
          case 'Shadowrocket':
          default:
            $notification.post(e, s, a, i(r));
            break;
          case 'Quantumult X':
            $notify(e, s, a, i(r));
            break;
          case 'Node.js':
        }
      if (!this.isMuteLog) {
        let t = ['', '==============📣系统通知📣=============='];
        t.push(e),
          s && t.push(s),
          a && t.push(a),
          console.log(t.join('\n')),
          (this.logs = this.logs.concat(t));
      }
    }
    log(...t) {
      t.length > 0 && (this.logs = [...this.logs, ...t]),
        console.log(t.join(this.logSeparator));
    }
    logErr(t, e) {
      switch (this.getEnv()) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
        case 'Quantumult X':
        default:
          this.log('', `❗️${this.name}, 错误!`, t);
          break;
        case 'Node.js':
          this.log('', `❗️${this.name}, 错误!`, t.stack);
      }
    }
    wait(t) {
      return new Promise((e) => setTimeout(e, t));
    }
    done(t = {}) {
      const e = new Date().getTime(),
        s = (e - this.startTime) / 1e3;
      switch (
      (this.log('', `🔔${this.name}, 结束! 🕛 ${s} 秒`),
        this.log(),
        this.getEnv())
      ) {
        case 'Surge':
        case 'Loon':
        case 'Stash':
        case 'Shadowrocket':
        case 'Quantumult X':
        default:
          $done(t);
          break;
        case 'Node.js':
          process.exit(1);
      }
    }
  })(t, e);
}
/*****************************************************************************/
