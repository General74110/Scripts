/**
 * @name 通用整合脚本 (改自Tom佬 )
 * @author Tom佬
 * @version 2.0.0
 * @description 整合 GET/POST 模版，支持多账号循环，动态加载基础依赖，带全行极详注释。
 * 感谢强大的AI
 */

// ==========================================
// 【全局变量与环境前置声明】
// ==========================================

// 判断当前运行环境是否为 Node.js（通过检查 process 和 node 版本是否存在）
const isNode = typeof process !== 'undefined' && !!process.versions && !!process.versions.node;

// 官方压缩混淆版 Env.min.js 的远端下载源地址
const envUrl = 'https://raw.githubusercontent.com/chavyleung/scripts/refs/heads/master/Env.min.js';

// 如果是 Node.js 环境，进行特殊前置配置
if (isNode) {
    require('dotenv').config(); // 尝试加载同级目录下的 .env 环境变量文件
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 忽略 SSL/TLS 证书验证错误，防止某些本地代理（如Charles/Fiddler）拦截时报错
}

let $; // 定义全局万能操作对象 $（等同于以前老代码里的 new Env() 实例）
let status; // 定义当前抓包或多账号操作的目标“角标/状态”（如 jiaochengstatus）

// 声明存储多账号配置的全局数组
const jiaochengurlArr = [];  // 用于存放所有账号的 URL 数组
const jiaochenghdArr = [];   // 用于存放所有账号的 Headers(请求头) 数组
const jiaochengbodyArr = []; // 用于存放所有账号的 Body(请求体) 数组

// 声明当前正在执行任务的单账号变量（在循环中会被不断赋予当前账号的值）
let jiaochengurl = '';   // 当前账号的 URL
let jiaochenghd = '';    // 当前账号的 Headers 字符串
let jiaochengbody = '';  // 当前账号的 Body 字符串

// ==========================================
// 【核心入口：异步环境自适应加载与执行】
// ==========================================
(async () => {
    try {
        $ = await initEnv(); // 等待初始化环境，完成对 $ 对象的赋值
        await main();        // 环境初始化成功后，立即进入主业务逻辑
    } catch (e) {
        // 如果最核心的初始化就崩了，向控制台输出致命错误日志
        console.error(`\n[Fatal Error] 初始化环境失败: ${e.message}\n`);
    }
})();

/**
 * 智能环境加载器：解决 Node.js 找不到持久化及网络 API 的根源问题
 */
async function initEnv() {
    if (isNode) {
        // ---- Node.js 核心处理分支 ----
        const fs = require('fs');     // 引入 Node 原生文件系统模块
        const path = require('path'); // 引入 Node 原生路径处理模块
        const axios = require('axios'); // 引入 Node 第三方网络请求库
        const localEnvPath = path.join(__dirname, 'chavy.env.min.js'); // 定义本地缓存依赖文件的绝对路径

        // 如果本地没有缓存依赖文件，则从 GitHub 动态下载
        if (!fs.existsSync(localEnvPath)) {
            console.log(`⏳ 首次运行，正在为您下载并适配官方压缩版 Env.min.js ...`);
            const res = await axios.get(envUrl); // 远程拉取官方源码

            // 【核心注入补丁】：在官方源码末尾强行追加兼容 Node.js 的导出语句 module.exports = Env;
            const patchedCode = `${res.data}\n\nif (typeof module !== 'undefined') { module.exports = Env; }`;

            fs.writeFileSync(localEnvPath, patchedCode, 'utf-8'); // 将打好补丁的代码写入本地保存
            console.log(`✅ Env.min.js 下载并适配完成`);
        }

        const Env = require(localEnvPath); // 使用 Node.js 的 require 机制正常导入已打补丁的本地模块
        return new Env('教程'); // 返回实例化对象，设定日志前缀为“教程”
    } else {
        // ---- Surge / Quantumult X / Loon / Stash 等 App 客户端分支 ----
        return new Promise((resolve, reject) => {
            // 使用 App 自带的 $httpClient 去拉取远端依赖
            $httpClient.get(envUrl, (err, resp, data) => {
                if (err || !data) return reject(new Error(err || "无法拉取远端依赖"));
                eval(data); // App 环境下直接 eval 运行源码即可将其注入全局环境
                resolve(new Env('教程')); // 返回实例化对象
            });
        });
    }
}

// ==========================================
// 【1. 业务主逻辑控制台】
// ==========================================
async function main() {
    // 读取持久化缓存中的状态值，如果没有则默认为 "1"
    status = $.getval("jiaochengstatus") || "1";
    // 如果状态大于 1，则转换为字符串形式（例如 "2"），如果是 1 则保持空字符串 ""，用于契合后面拼接变量名（如 jiaochengurl2）
    status = Number(status) > 1 ? `${status}` : "";

    // 【抓包拦截判定】：如果发现存在 $request 对象，说明此时脚本是被重写拦截触发的，直接进入抓包存 CK 流程
    if (typeof $request !== "undefined") {
        jiaochengck(); // 执行抓包提取 Cookie 函数
        return;        // 抓包结束后必须 return 中断后续的定时任务逻辑
    }

    // ---- 正常定时任务跑脚本流程 ----

    // 【载入账号 1】：从持久化层获取第一个账号的数据，并推入对应的全局数组
    jiaochengurlArr.push($.getdata('jiaochengurl'));
    jiaochenghdArr.push($.getdata('jiaochenghd'));
    jiaochengbodyArr.push($.getdata('jiaochengbody'));

    // 【载入多账号】：获取用户设置的账号总数，转为 10 进制整数，若没设置则默认为 1
    let jiaochengcount = parseInt($.getval('jiaochengcount') || '1', 10);
    // 循环从第二个账号开始，拼接序号（如 jiaochengurl2），依次读取并塞入数组中
    for (let i = 2; i <= jiaochengcount; i++) {
        jiaochengurlArr.push($.getdata(`jiaochengurl${i}`));
        jiaochenghdArr.push($.getdata(`jiaochenghd${i}`));
        jiaochengbodyArr.push($.getdata(`jiaochengbody${i}`));
    }

    // 格式化输出北京时间的脚本启动提示线
    console.log(
        `\n=============================================== 脚本执行 - 北京时间(UTC+8)：${new Date(
            new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000
        ).toLocaleString()} ===============================================\n`
    );

    // 【多账号大循环】：遍历所有获取到 Headers 的账号
    for (let i = 0; i < jiaochenghdArr.length; i++) {
        // 确保当前索引下有 Headers 数据才执行，防止空配置抛错
        if (jiaochenghdArr[i]) {
            // 将当前账号的各项参数从数组中提取出来，赋值给单操作变量
            jiaochengurl = jiaochengurlArr[i];
            jiaochenghd = jiaochenghdArr[i];
            jiaochengbody = jiaochengbodyArr[i] || ''; // 若无 body 则赋空字符串，防止调用时出现 undefined

            $.index = i + 1; // 标记当前是第几个账号，Env 内部日志会用到
            console.log(`\n\n开始【教程${$.index}】`);

            // 【单账号内任务刷单循环】：在当前账号下连续跑 200 次请求（多用于刷广告、刷金币等逻辑）
            for (let c = 0; c < 200; c++) {
                console.log(`  -> 正在执行第 ${c + 1} 次请求...`);

                await bankuai();       // 执行核心网络请求板块（下方定义的 bankuai 函数）
                await $.wait(1000);    // 每次请求完毕后，强制随机/固定等待 1000毫秒 = 1秒，防止频繁操作被封号
            }
        }
    }
    $.done(); // 所有账号的所有循环任务全部结束后，调用通知并彻底关闭结束进程
}

// ==========================================
// 【2. 抓包流量提取 Cookie 函数】
// ==========================================
function jiaochengck() {
    // 检查拦截到的请求 URL 中是否包含特定关键词（如 "getAdVideoReward"），确保抓对接口
    if ($request.url.indexOf("getAdVideoReward") > -1) {

        // 1. 提取并存储请求的 URL
        const reqUrl = $request.url;
        if (reqUrl) $.setdata(reqUrl, `jiaochengurl${status}`); // 存入对应账号的缓存键中
        $.log(`[抓包 URL]: ${reqUrl}`); // 在日志中打印抓到的 URL

        // 2. 提取并存储请求头 Headers（需要通过 JSON.stringify 转成字符串持久化）
        const reqHd = JSON.stringify($request.headers);
        if (reqHd) $.setdata(reqHd, `jiaochenghd${status}`);
        $.log(`[抓包 Headers]: ${reqHd}`);

        // 3. 提取并存储请求体 Body（GET请求可能为空，做兼容处理）
        const reqBody = $request.body || '';
        if (reqBody) $.setdata(reqBody, `jiaochengbody${status}`);
        $.log(`[抓包 Body]: ${reqBody}`);

        // 发送 App 系统弹窗通知，明确告诉用户抓到了第几个账号
        $.msg($.name, "", `🎉 教程${status || '1'} 核心参数获取成功`);
    }
}

// ==========================================
// 【3. 核心业务网络请求板块】
// ==========================================
function bankuai(timeout = 0) {
    return new Promise((resolve) => {
        // 构建标准请求结构体
        let options = {
            url: jiaochengurl || ``, // 要请求的 URL，如果接口固定，可以直接把链接写在双引号里
            headers: jiaochenghd ? JSON.parse(jiaochenghd) : {}, // 将之前抓包存下的 Headers 字符串解密回 JSON 对象
        };

        // 【🔥 智能判定双模版核心】：判断抓到的变量中是否有 body 数据
        if (jiaochengbody) {
            // ---- 分支 A：有 Body，说明是 POST 请求 ----
            options.body = jiaochengbody; // 将 body 装载进请求包

            // 调用 Env.js 底层的 $.post 发送 POST 请求
            $.post(options, async (err, resp, data) => {
                handleResponse(err, resp, data); // 将请求结果送去统一处理器
                resolve(); // 释放 Promise 状态，允许上层 await 往下走
            }, timeout);
        } else {
            // ---- 分支 B：无 Body，说明是 GET 请求 ----
            // 调用 Env.js 底层的 $.get 发送 GET 请求
            $.get(options, async (err, resp, data) => {
                handleResponse(err, resp, data); // 将请求结果送去统一处理器
                resolve(); // 释放 Promise 状态
            }, timeout);
        }
    });
}

/**
 * 统一处理网络响应结果的专门回调函数
 * @param {string|object} err  - 错误信息，请求正常时为 null
 * @param {object} resp        - 响应头、状态码等详细响应对象
 * @param {string} data        - 服务器返回的核心文本数据
 */
function handleResponse(err, resp, data) {
    try {
        // 如果底层网络请求就出错了（如断网、超时、证书错误等）
        if (err) {
            console.log(`❌ 网络请求层失败: ${err}`);
            return;
        }
        // 如果服务器返回的内容彻底为空，直接拦截不作解析
        if (!data) return;

        // 尝试将接口返回的文本数据解析为可读的 JSON 对象
        let resObj = JSON.parse(data);

        // 判定服务器返回的业务状态码（这里根据具体App的返回微调，比如 data.code === 200 等）
        if (resObj.status == 0) {
            // 在这里编写你【操作成功】后的业务逻辑（例如打印金币、记录次数）
            // console.log(`  ✅ 操作成功: ${resObj.message || ''}`);
        } else {
            // 在这里编写你【操作失败/风控/次数耗尽】后的业务逻辑
            // console.log(`  ❌ 操作失败: ${resObj.message || ''}`);
        }
    } catch (e) {
        // 如果服务器返回的不是标准 JSON 格式（比如返回了网页、或者报错白屏），会触发这里
        // console.log(`解析响应出错或非标准JSON数据，原数据为: ${data}`);
    }
}