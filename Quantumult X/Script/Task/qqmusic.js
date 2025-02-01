/*
APP：QQ音乐
版本：/////
作者：General℡

脚本功能：
签到



更新：

操作：
获取完后关掉重写，避免不必要的MITM


注意⚠️：
当前脚本只测试Loon，node.js 其他自测！





使用声明：⚠️⚠️⚠️此脚本仅供学习与交流，
        请勿贩卖！⚠️⚠️⚠️

[Script]
 script-path=https://raw.githubusercontent.com/General74110/Config/master/Script/Task/qqmusic.js, requires-body=true, timeout=10, enabled=true, tag=QQ音乐获取Cookie, img-url=https://raw.githubusercontent.com/LovedGM/Quantumult-X-TuBiao/main/zishi-cs/zs23.png


[Task]
cron "3 6 * * * script-path=https://raw.githubusercontent.com/General74110/Config/master/Script/Task/qqmusic.js, timeout=3600, tag=酷我音乐(时长), img-url=https://raw.githubusercontent.com/Semporia/Hand-Painted-icon/master/Social_Media/Bebo.png



续时长看广告
 https://tmead.y.qq.com/actnodesvr/act/main?actid=aY6bdVaSm&_b=qmusic&g_tk=634497320&_=1737633947728



[MITM]
hostname =

*/


const $ = new Env('QQ音乐');
const logs = 0;
const  notify = $.isNode() ? require('./sendNotify') : '';
let message = '';
let tz = $._getValue('tz') || '1';

const isNode = typeof process !== 'undefined' && process.env;

if (isNode) {
    const dotenv = require('dotenv');
    dotenv.config();
}




