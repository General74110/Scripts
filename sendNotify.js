const axios = require('axios');

// Telegram 通知
async function sendNotifyToTelegram(title, content) {
    const telegramToken = process.env.TG_BOT_TOKEN;
    const telegramChatId = process.env.TG_USER_ID;

    if (!telegramToken || !telegramChatId) {
        console.log('未配置 Telegram 通知参数');
        return;
    }

    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

    try {
        await axios.post(telegramUrl, {
            chat_id: telegramChatId,
            text: `${title}\n${content}`,
            disable_web_page_preview: true
        });
        console.log('Telegram 通知发送成功');
    } catch (error) {
        console.error('Telegram 通知发送失败', error);
    }
}

// 企业微信通知
async function sendNotifyToWeCom(title, content) {
    const wecomToken = process.env.WECOM_BOT_TOKEN;

    if (!wecomToken) {
        console.log('未配置企业微信通知参数');
        return;
    }

    const wecomUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${wecomToken}`;
    try {
        await axios.post(wecomUrl, {
            msgtype: "text",
            text: {
                content: `${title}\n${content}`
            }
        });
        console.log('企业微信通知发送成功');
    } catch (error) {
        console.error('企业微信通知发送失败', error);
    }
}

// Bark 通知
async function sendNotifyToBark(title, content) {
    const barkToken = process.env.BARK_TOKEN;

    if (!barkToken) {
        console.log('未配置 Bark 通知参数');
        return;
    }

    const barkUrl = `${barkToken}/${encodeURIComponent(title)}/${encodeURIComponent(content)}`;
    try {
        await axios.get(barkUrl);
        console.log('Bark 通知发送成功');
    } catch (error) {
        console.error('Bark 通知发送失败', error);
    }
}

// 发送总通知函数，判断使用哪种通知方式
async function sendNotify(title, content) {
    console.log(`开始发送通知：${title}`);
    
    // 根据环境变量选择通知方式
    if (process.env.TG_BOT_TOKEN && process.env.TG_USER_ID) {
        await sendNotifyToTelegram(title, content);
    }

    if (process.env.WECOM_BOT_TOKEN) {
        await sendNotifyToWeCom(title, content);
    }

    if (process.env.BARK_TOKEN) {
        await sendNotifyToBark(title, content);
    }

    console.log("通知发送完毕");
}

module.exports = {
    sendNotify
};