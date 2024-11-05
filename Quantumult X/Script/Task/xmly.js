/*
###喜马拉雅签到活动任务
####（原脚本来自作者：【MartinsKing】[https://raw.githubusercontent.com/ClydeTime/Quantumult/main/Script/Task/xmlySign.js]）

1️.签到
2.声音点赞
3.收藏声音
4.关注用户
5.动态点赞
6.分享书籍
7.评论书籍
8.广告任务（技术烂，没修好）
9.其他任务（技术烂，没修好）


注意⚠️：当前脚本只测试Loon，node.js 其他自测！

[Script]
cron "35 8 * * *" script-path=https://raw.githubusercontent.com/General74110/Config/master/Script/Task/xmly.js, timeout=1000, enabled=true, tag=喜马拉雅签到脚本, img-url=https://gitlab.com/lodepuly/iconlibrary/-/raw/main/App_icon/120px/Himalaya.png

http-request ^https:\/\/m\.ximalaya\.com\/mobile-anchor-web\/api\/v1\/userPage\/getUserPageShow script-path=https://raw.githubusercontent.com/General74110/Config/master/Script/Task/xmly.js, requires-body=false, timeout=60, enabled=true, tag=喜马拉雅获取Cookies, img-url=https://gitlab.com/lodepuly/iconlibrary/-/raw/main/App_icon/120px/Himalaya.png

[MITM]
hostname = *.ximalaya.com
*/
const $ = new Env('喜马拉雅');
const name = 'xmly';
const zh_name = "喜马拉雅";
const startTime = $.time('yyyy-MM-dd HH:mm:ss');
let status;

status = (status = ($.getval("xmlystatus") || "1")) > 1 ? `${status}` : "";

const logs = 0; // 调试日志级别
const notify = $.isNode() ? require('./sendNotify') : '';  // 这里引用通知工具
let t = ""; // 通知内容
let AllCookie = '';

let config = {
  watch: { num: 0, time: '' },
  spec: { num: 0, time: '' }
};
// 格式化时间
const format = (ts, fmt = 'yyyy-MM-dd HH:mm:ss') => $.time(fmt, ts);

// URL 编码
const urlencode = (str) => {
  str = (str + '').toString();
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+');
};



// 检查是否在 Node.js 环境中
const isNode = typeof process !== "undefined" && process.env;

if (isNode) {
   // require('dotenv').config({ path: '/Users/general/Documents/WebStorm/Scripts/.env' });
  const dotenv = require('dotenv');
  dotenv.config(); // 读取 .env 文件中的环境变量
  const fs = require('fs');
  const path = require('path');
}

// 根据环境来获取 xmlytoken
let xmlytoken = $.getdata('xmlytoken') || (isNode ? process.env.xmlytoken : '') || '';
if (logs === 1) {
  console.log(`xmlytoken: ${xmlytoken}`); // 调试日志：检查 xmlytoken 值
}

// 将 token 通过 # 分隔，并转化为数组
const xmlytokenArr = xmlytoken.split(',');

// 主函数
(async () => {
  if (typeof $request !== "undefined") {
    // Loon 环境下获取 Cookies
    GetCookies();
  } else {
    // 打印脚本执行时间
    console.log(
      `\n\n=============================================== 脚本执行 - 北京时间(UTC+8)：${new Date(
        new Date().getTime() +
          new Date().getTimezoneOffset() * 60 * 1000 +
          8 * 60 * 60 * 1000
      ).toLocaleString()} ===============================================\n`
    );

    // 循环处理每个 token
    for (let i = 0; i < xmlytokenArr.length; i++) {
      if (xmlytokenArr[i]) {
        console.log(`开始【喜马拉雅账号 ${i + 1}】`);

        // 构建 Cookie
        AllCookie = SetCookie(xmlytokenArr[i]);
        if (logs === 1) {
          console.log(`Cookie: ${AllCookie}`);
        }
       
        await GetNames(AllCookie); //获取昵称
        if ($.nickname && $.nickname.data.parentPaidStatus === "游客状态") {
          const title = "喜马拉雅";
          const content = "⚠️ Cookie 已失效，请更新";
      
          if ($.isNode()) {
            await notify.sendNotify(title, content); // Node.js 环境下使用 sendNotify
          } else if ($.isLoon() || $.isQuanX() || $.isSurge()) 
            {
            $.msg(title, "", content); // 其他环境下使用 $.msg
          } else {
            console.log(title, content)
          }
      
          $.done(); // 终止脚本
          return;
        }
        await Sign(AllCookie);  // 签到
        await $.wait(1000); // 延迟

     
        // 广告视频任务
       
        let token = await adVideoGetToken(AllCookie);
        if (token !== "null") {
          await adVideoFinish(AllCookie, token);
        } 
      

          await share(AllCookie);
          await voiceAdd(AllCookie);
          await voiceDelete(AllCookie);
          await giveDynamicsLike(AllCookie);
          await cancelDynamicsLike(AllCookie);
          await giveVoiceLike(AllCookie);
          await cancelVoiceLike(AllCookie);
          await userAdd(AllCookie);
          await userDelete(AllCookie);
          await flushTaskRecords(AllCookie);

          let uid = await getUid(AllCookie);
          let content = urlencode(await wyy());
          let commentId = await createComment(AllCookie, uid, content);
          if (commentId !== 0) {
            await deleteComment(commentId);
          } 



          let listset = [96, 168, 169, 170, 171, 336]; // 任务列表
          for (let i = 0; i < listset.length; i++) {
            await handInGeneralTask(AllCookie,listset[i]);
          }

         // 发送通知
         
          await Msg();
        
        }
      }
    }
  })()
    .catch((e) => $.logErr(e))
    .finally(() => $.done());   
    

// 构建 Cookie
function SetCookie(xmlytoken) {
  let IFDA = udid(); // 生成随机 UUID

  // 根据抓包的原始请求头，构建 cookie 字符串
  let cookie = `1&_token=${xmlytoken}; idfa=${IFDA}; device_model=iPhone%2012; 1&_device=iPhone&${IFDA}&9.2.94; channel=ios-b1; impl=com.gemd.iting; c-oper=%E7%94%B5%E4%BF%A1; net-mode=WIFI; res=1170%2C2532`;

  return cookie; // 返回构建好的 cookie 字符串
}

// 随机生成 UUID
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

// 获取 Cookie
async function GetCookies() {
  if ($request.url.indexOf("/userPage/getUserPageShow") > -1) {
    let cookie = $request.headers['cookie'];
    if (cookie) {
      const TokenMatch = cookie.match(/1&_token=([^;]*)/);
      if (TokenMatch) {
        const Token = TokenMatch[1];
        $.setdata(Token, 'xmlytoken'); // 设置 token 到本地存储
        $.log(`获取到的 Token: ${Token}`);
        $.msg($.name, "", `喜马拉雅获取 Cookie 成功`);
      }
    }
  }
}

//获取昵称
async function GetNames(timeout = 1000) {
  return new Promise((resolve) => {
  console.log (AllCookie

  )
      let url = {
          url: `https://m.ximalaya.com/x-web-activity/signIn/v2/querySignInInfo?aid=87&v=new`,
          headers: {
            'user-agent': 'ting_v9.2.94_c5(CFNetwork, iOS 16.7.2, iPhone13,2)',
            'content-type': 'application/json',
            'accept-language': 'zh-CN,zh-Hans;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'content-length': '10',
            'accept': '*/*',
            'cookie': AllCookie
          },
      }

      $.get(url, async (err, resp, data) => {
        if (logs === 1 ) {
          console.log(`⚠️昵称原始响应体⚠️: ${data}`); // 打印原始响应体
        }
        try {
          data = JSON.parse(data);
          if (logs === 1) {
            console.log(`昵称结果数据: ${data.context.currentUser.nickname}`);
          }
          $.nickname = data;
        } catch (e) {
          console.log(`解析 JSON 出错: ${e}`);
        } finally {
          resolve();
        }
      }, timeout);
    });
  }
  

// 签到功能
async function Sign(timeout = 3000) {
  return new Promise((resolve) => {
    let body = "{\"aid\":87}";
    let url = {
      url: `https://m.ximalaya.com/x-web-activity/signIn/v2/signIn?v=new`,
      headers: {
        'user-agent': 'ting_v9.2.94_c5(CFNetwork, iOS 16.7.2, iPhone13,2)',
        'content-type': 'application/json',
        'accept-language': 'zh-CN,zh-Hans;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'content-length': '10',
        'accept': '*/*',
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body,
    };
    $.post(url, async (err, resp, data) => {
      if (logs === 1) {
        console.log(`⚠️签到原始响应体⚠️: ${data}`); // 打印原始响应体
      }
      try {
        data = JSON.parse(data);
        if (logs === 1) {
          console.log(`签到结果数据: ${data.data.msg}`);
        }
        $.sign = data;
      } catch (e) {
        console.log(`解析 JSON 出错: ${e}`);
      } finally {
        resolve();
      }
    }, timeout);
  });
}

//刷新列表
async function flushTaskRecords(){
  
  let body = `{"aid":112}`
  let myRequest = {
      url: `http://m.ximalaya.com/web-activity/task/v2/taskRecords?tag=pc`,
      headers: {
        'user-agent': 'ting_v9.2.94_c5(CFNetwork, iOS 16.7.2, iPhone13,2)',
        'content-type': 'application/json',
        'accept-language': 'zh-CN,zh-Hans;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        'content-length': '10',
        'accept': '*/*',
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {

      if (logs === 1) {
        console.log(`⚠️列表原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.reco = body;
          if (body.ret == 0) {
              console.log("- 刷新列表成功")
              return true
          } else {
              console.log("- !!!刷新列表失败")
              return false
          }
      },(reason) => {
          console.log("- !!!刷新列表失败")
          return false
      }
  )
}

//分享
async function share(){
  
  let myRequest = {
      url: `https://mobile.ximalaya.com/thirdparty-share/share/content?srcId=422711158&srcType=7&subType=1098&tpName=weixin`,
      headers: {
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
  }
  return await $.http.get(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️分享任务原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.shar = body;
          if (body.ret == 0) {
              console.log("- 分享成功")
              return true
          } else {
              console.log("- !!!分享失败")
              return false
          }
      },(reason) => {
          console.log("- !!!分享失败")
          return false
      }
  )
}
//获取uid
async function getUid(){
  let myRequest = {
      url: `https://passport.ximalaya.com/user-http-app/v1/nickname/info`,
      headers: {
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
  }
  let uid = 0
  return await $.http.get(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️uid-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          if (body.ret == 0) {
              uid = body.data.uid
              $.log("- 获取uid成功")
              return uid
          } else {
              $.log("- !!!获取uid失败")
              return uid
          }
      },(reason) => {
          $.log("- !!!获取uid失败")
          return uid
      }
  )
}

//获取评论
async function wyy(){
  return await $.http.get({
          url: `https://keai.icu/apiwyy/api`
      }).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️获取评论-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          let content = body.content
          return content
      },(reason) => {
          $.log("- 获取评论失败")
          let content = "真不错呀"
          return content
      }
  )
}


//评论
async function createComment(uid, content){
  
  let body = `content=${content}&source=0&synchaos=1&timeStampType=1&trackId=424771991&uid=${uid}`
  let myRequest = {
      url: "https://mobile.ximalaya.com/comment-mobile/v1/create",
      headers: {
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  let commentId = 0
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️评论-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.comme = body;
          if (body.ret == 0) {
              console.log("- 评论成功")
              commentId = body.id
          } else if (body.ret == 801){
              console.log("- !!!请勿发送相同内容")
          }else if (body.ret == 805){
              console.log("- !!!发送内容频繁")
          } else {
              console.log("- !!!评论失败")
          }
          return commentId
      },(reason) => {
          console.log("- !!!评论失败")
          return commentId
      }
  )
}
//删除评论
async function deleteComment(commentId){
  
  let body = `commentId=${commentId}&trackId=424771991`
  let myRequest = {
      url: "https://mobile.ximalaya.com/comment-mobile/delete",
      headers: {
        'Content-Type' : `application/x-www-form-urlencoded`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️删除评论-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.decomme = body;
          if (body.ret == 0) {
            console.log("- 删除评论成功")
              return true
          } else {
            console.log("- !!!未知评论状态")
              return false
          }
      },(reason) => {
        console.log("- !!!删除评论失败")
          return false
      }
  )
}

async function voiceAdd(){
  let body = `{"relatedId":423641159,"businessType":100}`
  let myRequest = {
      url: `https://mobile.ximalaya.com/general-relation-service/track/collect/add/1667873518984`,
      headers: {
        'Content-Type': `application/json`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️收藏声音-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.voice = body;
          if (body.ret == 0) {
            console.log("- 收藏声音成功")
              return true
          } else if (body.ret == 103) {
            console.log("- !!!此声音已收藏, 无法再次收藏")
              return false
          } else {
            console.log("- !!!未知收藏状况")
              return false
          }
      },(reason) => {
        console.log("- !!!收藏声音失败")
          return false
      }
  )
}

async function voiceDelete(){
 
  let body = `{"relatedId":423641159,"businessType":100}`
  let myRequest = {
      url: `https://mobile.ximalaya.com/general-relation-service/track/collect/delete/ts-1667873513996`,
      headers: {
        'Content-Type': `application/json`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️删除声音收藏-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.devoice = body;
          if (body.ret == 0) {
            console.log("- 删除收藏声音成功")
              return true
          } else if (body.ret == 112) {
            console.log("- !!!此声音未收藏, 无法删除")
              return false
          } else {
            console.log("- !!!未知收藏状况")
              return false
          }
      },(reason) => {
        console.log("- !!!删除收藏声音失败")
          return false
      }
  )
}

async function userAdd(){
  let body = `bizType=11&isFollow=1&toUid=2342717`
  let myRequest = {
      url: `https://mobile.ximalaya.com/mobile/follow`,
      headers: {
        'Content-Type': `application/x-www-form-urlencoded`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️关注用户-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.user = body;
          if (body.ret == 0) {
            console.log("- 关注用户成功")
              return true
          } else if (body.ret == 3002) {
            console.log("- !!!此用户已关注过")
              return false
          } else if (body.ret == 3001) {
            console.log("- !!!关注频率过高,无法关注")
            console.log("- 遇到此种情况,没有很好的解决办法,建议手动关注并交还任务")
              return false
          } else {
            console.log("- !!!未知关注状况")
            console.log(JSON.stringify(body))
              return false
          }
      },(reason) => {
        console.log("- !!!关注用户失败")
          return false
      }
  )
}

async function userDelete(){
  
  let body = `bizType=13&isFollow=0&toUid=2342717`
  let myRequest = {
      url: `https://mobile.ximalaya.com/mobile/follow`,
      headers: {
        'Content-Type': `application/x-www-form-urlencoded`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️取关用户-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.deuser = body;
          if (body.ret == 0) {
            console.log("- 取关用户成功")
              return true
          } else {
            console.log("- !!!未知关注状况")
              return false
          }
      },(reason) => {
        console.log("- !!!取关用户失败")
          return false
      }
  )
}

async function giveVoiceLike(){
 
  let body = `favorite=1&trackId=423641159`
  let myRequest = {
      url: `https://mobile.ximalaya.com/favourite-business/favorite/track`,
      headers: {
        'Content-Type': `application/x-www-form-urlencoded`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️点赞声音-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.gvoice = body;
          if (body.ret == 0) {
            console.log("- 点赞声音成功")
              return true
          } else if (body.ret == 111) {
            console.log("- !!!此声音已点赞过")
              return false
          } else {
            console.log("- !!!未知声音点赞状况")
              return false
          }
      },(reason) => {
        console.log("- !!!点赞声音失败")
          return false
      }
  )
}

async function cancelVoiceLike(){
 
  let body = `favorite=0&trackId=423641159`
  let myRequest = {
      url: `https://mobile.ximalaya.com/favourite-business/favorite/track`,
      headers: {
        'Content-Type': `application/x-www-form-urlencoded`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️取消声音点赞-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.degvoice = body;
          if (body.ret == 0) {
            console.log("- 取消声音点赞成功")
              return true
          }else if (body.ret == -1) {
            console.log("- !!!此声音尚未点赞, 无法取消")
              return false
          } else {
            console.log("- !!!未知声音点赞状况")
              return false
          }
      },(reason) => {
        console.log("- !!!取消声音点赞失败")
          return false
      }
  )
}

async function giveDynamicsLike(){

  let body = `{"feedId":217014623}`
  let myRequest = {
      url: `https://mobile.ximalaya.com/chaos/v2/feed/praise/create`,
      headers: {
       'Content-Type': `application/json`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️动态点赞-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.gived = body;
          if (body.ret == 0) {
            console.log("- 点赞动态成功")
              return true
          } else {
            console.log("- !!!未知动态点赞状况")
              return false
          }
      },(reason) => {
        console.log("- !!!点赞动态失败")
          return false
      }
  )
}

async function cancelDynamicsLike(){

  let body = `{"feedId":217014623}`
  let myRequest = {
      url: `https://mobile.ximalaya.com/chaos/v2/feed/praise/delete`,
      headers: {
        'Content-Type': `application/json`,
         'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
       },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️取消动态点赞-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.degived = body;
          if (body.ret == 0) {
            console.log("- 取消动态点赞成功")
              return true
          } else {
            console.log("- !!!未知动态点赞状况")
              return false
          }
      },(reason) => {
        console.log("- !!!取消动态点赞失败")
          return false
      }
  )
}
//获取广告token
async function adVideoGetToken(){
      
      let body = `{"aid":112,"taskId":254}`
      let myRequest = {
          url: `http://m.ximalaya.com/web-activity/task/v2/genTaskToken`,
          headers: {
            'Content-Type': `application/json`,
            'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
          },
          body: body
      }
      return await $.http.post(myRequest).then(
         (response) => {
          if (logs === 1) {
            console.log(`⚠️获取广告token-原始响应体⚠️: ${response.body}`); // 打印原始响应体
          }
              body = JSON.parse(response.body)
              if (body.ret == 0) {
                  let token = body.data.token
                  return token
              } else {
                  $.log("- !!!token获取失败")
                  let token = "null"
                  return token
              }
          },(reason) => {
              $.log("- !!!token获取失败")
              let token = "null"
              return token
          }
      )
  }
  //看广告
  async function adVideoFinish(token){
    
    let body = `{"aid":112,"taskId":252,"token":"${token}","progress":1}`
    let myRequest = {
        url: `http://m.ximalaya.com/web-activity/task/v2/incrTaskProgress`,
        headers: {
          'Content-Type': `application/json`,
          'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
        },
        body: body
    }
    return await $.http.post(myRequest).then(
       (response) => {
        if (logs ===1) {
          console.log(`⚠️看广告-原始响应体⚠️: ${response.body}`); // 打印原始响应体
        }
            body = JSON.parse(response.body)
            $.advideo = body;
            if (body.ret == 0) {
                if (body.data.status == 0) {
                  console.log("- 本条视频广告观看已完成, 获得50点奖励")
                    config.watch.num += 1
                    config.watch.time = format(startTime)
                    $.setdata(JSON.stringify(config.watch), name + "_watch")
                    return true
                } else if (body.data.status == -1) {
                  console.log("### 今日观看广告任务已全部完成 ✅ ")
                    config.watch.num = 6
                    config.watch.time = format(startTime)
                    console.setdata(JSON.stringify(config.watch), name + "_watch")
                    return true
                } else {
                  console.log("- !!!未知完成状态")
                  console.log(JSON.stringify(body.data))
                    return false
                }
            } else {
              console.log("- !!!观看广告任务交还失败")
                return false
            }
        },(reason) => {
          console.log("- !!!观看广告任务交还失败")
            return false
        }
    )
}

async function handInGeneralTask(taskId){  
  let body = `{"aid":112,"taskId":${taskId}}`
  let myRequest = {
      url: `http://m.ximalaya.com/web-activity/task/v2/drawTaskAward`,
      headers: {
        'Content-Type': `application/json`,
        'cookie': AllCookie // 使用 AllCookie 函数返回的 cookie
      },
      body: body
  }
  return await $.http.post(myRequest).then(
     (response) => {
      if (logs === 1) {
        console.log(`⚠️特殊任务-原始响应体⚠️: ${response.body}`); // 打印原始响应体
      }
          body = JSON.parse(response.body)
          $.hand = body;
          if (body.ret == 0) {
              if (body.data.status == 0) { 
                  if ((taskId > 167 && taskId < 173) || taskId == 96 || taskId == 336) {
                      config.spec.num += 1
                      config.spec.time = format(startTime)
                      $.setdata(JSON.stringify(config.spec), name + "_spec")
                      console.log("- 交还特殊任务成功, 获得奖励")
                  } /* else {
                      config.gene.num += 1
                      config.gene.time = format(startTime)
                      $.setdata(JSON.stringify(config.gene), name + "_gene")
                      $.log("- 交还通用任务成功, 获得10点奖励")
                  } */
                  return true
              } else if (body.data.status == 1) {
                  if ((taskId > 167 && taskId < 173) || taskId == 96 || taskId == 336) {
                      config.spec.num += 1
                      config.spec.time = format(startTime)
                      $.setdata(JSON.stringify(config.spec), name + "_spec")
                      console.log("- 此项特殊任务今日已交还")
                  } /* else {
                      config.gene.num += 1
                      config.gene.time = format(startTime)
                      $.setdata(JSON.stringify(config.gene), name + "_gene")
                      $.log("- 此项通用任务今日已交还")
                  } */
                  return true
              } else if (body.data.status == -1) {
                console.log("--- !!!此任务尚未完成,不能交还")
                  return false
              } else {
                console.log("--- !!!未知交还状态")
                console.log(JSON.stringify(body.data))
                  return false
              }
          } else {
            console.log("--- !!!交还任务失败")
              return false
          }
      },(reason) => {
        console.log("--- !!!交还通用任务失败")
          return false
      }
  )
}


// 发送通知
async function Msg() {
  if ($.nickname && $.nickname.data != null) {
    t += `【账号昵称】 এ${$.nickname.context.currentUser.nickname}এ\n`;
  }
  if ($.sign && $.sign.data.code == -2) {
    t += `【签到结果】 ${$.sign.data.msg}💥\n`;
  } else if ($.sign && $.sign.data.code == 0) {
    t += `【签到结果】 ${$.sign.data.msg}✨, 获得: ${$.sign.data.dayAward.name}, 当前已签到 ${$.sign.data.dayAward.day} 天\n`;
  }

  if ($.gvoice && $.gvoice.ret == 0) {
    t += `【声音点赞】 ${$.gvoice.popCopy}🏅\n`;
  } else if ($.gvoice && $.gvoice.ret == 111) {
    t += '【声音点赞】 - !!!此声音已点赞过🏅\n';
  } else {
    t += '【声音点赞】 - !!!点赞声音失败☹️\n';
  }
  if ($.degvoice && $.degvoice.ret == 0) {
    t += '【声音点赞】 - 取消声音点赞成功🏅\n';
  } else if ($.degvoice && $.degvoice.ret == -1) {
    t += `【声音点赞】 - !!!此声音尚未点赞, 无法取消\n`;
  } else {
    t += `【声音点赞】 - !!!取消声音点赞失败☹️\n`;
  }

  if ($.voice && $.voice.ret == 0){
    t += '【收藏声音】 - 收藏声音成功🏅\n';
  } else if ($.voice && $.voice.ret == 103) {
    t += '【收藏声音】 - !!!此声音已收藏, 无法再次收藏😊\n';
  } else {
    t += '【收藏声音】 - !!!收藏声音失败☹️\n';
  }
  if ($.devoice && $.devoice.ret == 0){
    t += '【收藏声音】 - 删除收藏声音成功🏅\n';
  } else if ($.devoice && $.devoice.ret == 112) {
    t += '【收藏声音】 - !!!此声音未收藏, 无法删除😊\n';
  } else {
    t += '【收藏声音】 - !!!删除收藏声音失败☹️\n';
  }

  if ($.user && $.user.ret == 0) {
    t += '【关注用户】 - 关注用户成功🏅\n';
  } else if ($.user && $.user.ret == 3002) {
    t += '【关注用户】 - !!!此用户已关注过✌️\n';
  } else if ($.user && $.user.ret == 3001) {
    t += '【关注用户】 - !!!关注频率过高,无法关注😓\n';
  } else {
    '【关注用户】 - 关注用户失败☹️\n';
  }
  if ($.deuser && $.deuser.ret == 0) {
    t += '【关注用户】 -- 取关用户成功🏅\n';
  } else {
    '【关注用户】 - 取关用户成功☹️\n';
  }

  if ($.gived && $.gived.ret == 0) {
    t += '【动态点赞】 - 点赞动态成功🏅\n';
  } else {
    t += '【动态点赞】 - 点赞动态失败☹️\n';
  }
  if ($.degived && $.degived.ret == 0) {
    t += '【动态点赞】 - 取消点赞动态成功🏅\n';
  } else {
    t += '【动态点赞】 - 取消点赞动态失败☹️\n';
  }

  if ($.shar && $.shar.ret == 0) {
    t += '【分享书籍】 - 分享成功🏅\n';
  } else {
    t += '【分享书籍】 - 分享失败☹️\n';
  }

  if ($.comme && $.comme.ret == 0) {
    t += '【评论书籍】 - 评论成功🏅\n';
  } else if ($.comme && $.comme.ret == 801) {
    t += '【评论书籍】 - !!!请勿发送相同内容\n';
  } else if ($.comme && $.comme.ret == 805) {
    t += '【评论书籍】 - !!!发送内容频繁\n';
  } else {
    t += '【评论书籍】 - !!!评论失败\n';
  }
  if ($.decomme && $.decomme.ret == 0) {
    t += '【评论书籍】 - 删除评论成功🏅\n'
  } else {
    t += '【评论书籍】 - 删除评论失败☹️\n';
  }

if ($.advideo && $.advideo.ret == 0 && $.advideo.data.status == 0) {
  t += '【广告任务】 - 本条视频广告观看已完成\n';
} else if ($.advideo && $.advideo.ret == 0 && $.advideo.data.status == -1) {
  t += '【广告任务】 ### 今日观看广告任务已全部完成 ✅\n';
} else {
  t += '【广告任务】 - !!!观看广告任务失败☹️\n';
}

if ($.hand && $.hand.ret == 0 && $.hand.data.status == 0) {
  t += '【其他任务】 - 交还特殊任务成功, 获得奖励\n';
  } else if ($.hand && $.hand.ret == 0 && $.hand.data.status == 1) {
    t += '【其他任务】 - 此项特殊任务今日已交还\n';
  } else if ($.hand && $.hand.ret == 0 && $.hand.data.status == -1) {
    t += '【其他任务】 --- !!!此任务尚未完成,不能交还\n';
  } else {
    t += '【其他任务】 --- !!!交还任务失败\n';
  }
   
   // 判断环境，发送通知
   if ($.isLoon() || $.isQuanX() || $.isSurge()) {
    $.msg(zh_name, "", t);
  } else if ($.isNode()) {
    // 在 Node.js 环境下，调用 notify 发送通知
    await notify.sendNotify(zh_name, t);  // 确保传入标题和内容
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
  