// glados_checkin.js
// 支持随机延迟签到版

const maxDelay = 30 * 60; // 最大延迟时间，单位为秒 (30分钟)
let cookie = $persistentStore.read("glados_cookie");

if (!cookie) {
    $notification.post("GLaDOS 签到", "❌ 签到失败", "未找到 Cookie，请重新登录网页获取。");
    $done();
}

const checkinUrl = "https://glados.space/api/user/checkin";
const statusUrl = "https://glados.space/api/user/status";

const header = {
    "Cookie": cookie,
    "Content-Type": "application/json;charset=utf-8",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
};

// 随机延迟逻辑
const delay = Math.floor(Math.random() * maxDelay);
console.log(`[GLaDOS] 将在 ${delay} 秒后开始签到...`);

// 使用 setTimeout 实现延迟执行
setTimeout(async () => {
    try {
        // 1. 执行签到请求
        let checkinRes = await post(checkinUrl, JSON.stringify({ token: "glados.one" }));
        let checkinObj = JSON.parse(checkinRes);
        
        // 2. 获取会员状态
        let statusRes = await get(statusUrl);
        let statusObj = JSON.parse(statusRes);

        if (statusObj.code === 0) {
            const info = statusObj.data;
            const days = info.leftDays !== undefined ? Math.floor(parseFloat(info.leftDays)) : "未知";

            let title = "";
            if (checkinObj.code === 0) title = "✅ 签到成功";
            else if (checkinObj.code === 1) title = "⚠️ 今日已签到";
            else title = "❓ 签到状态异常";

            $notification.post("GLaDOS", title, `会员剩余：${days} 天 (随机延迟 ${Math.floor(delay/60)}分${delay%60}秒)`);
        } else {
            $notification.post("GLaDOS", "❌ 状态获取失败", statusObj.message);
        }
    } catch (err) {
        $notification.post("GLaDOS 签到", "❌ 运行出错", "请检查网络或 Cookie");
    } finally {
        $done();
    }
}, delay * 1000);

// 请求封装
function post(url, body) {
    return new Promise((resolve, reject) => {
        $httpClient.post({ url, headers: header, body }, (err, resp, data) => {
            if (err) reject(err); else resolve(data);
        });
    });
}

function get(url) {
    return new Promise((resolve, reject) => {
        $httpClient.get({ url, headers: header }, (err, resp, data) => {
            if (err) reject(err); else resolve(data);
        });
    });
}
