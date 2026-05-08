// glados_checkin.js (固定时间版)
let cookie = $persistentStore.read("glados_cookie");

if (!cookie) {
    $notification.post("GLaDOS 签到", "❌ 签到失败", "未找到 Cookie，请登录 glados.cloud 获取");
    $done();
}

const checkinUrl = "https://glados.cloud/api/user/checkin";
const statusUrl = "https://glados.cloud/api/user/status";

const header = {
    "Cookie": cookie,
    "Content-Type": "application/json;charset=utf-8",
    "Origin": "https://glados.cloud",
    "Referer": "https://glados.cloud/console/checkin",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
};

async function start() {
    try {
        // 1. 立即执行签到
        let checkinRes = await post(checkinUrl, JSON.stringify({ token: "glados.one" }));
        let checkinObj = JSON.parse(checkinRes);
        
        // 2. 立即获取状态
        let statusRes = await get(statusUrl);
        let statusObj = JSON.parse(statusRes);

        if (statusObj.code === 0) {
            const days = Math.floor(parseFloat(statusObj.data.leftDays));
            let title = "";
            if (checkinObj.code === 0) title = "✅ 签到成功";
            else if (checkinObj.code === 1) title = "⚠️ 今日已签到";
            else title = "❓ 状态异常";

            $notification.post("GLaDOS", title, `会员剩余：${days} 天`);
        } else {
            $notification.post("GLaDOS", "❌ 状态获取失败", statusObj.message);
        }
    } catch (err) {
        $notification.post("GLaDOS 签到", "❌ 运行出错", "请检查网络或域名是否可用");
    } finally {
        $done();
    }
}

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

start();
