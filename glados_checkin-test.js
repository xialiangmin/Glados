// glados_checkin.js
// 仅保留签到状态和会员天数显示

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

async function start() {
    try {
        // 1. 执行签到请求
        let checkinRes = await post(checkinUrl, JSON.stringify({ token: "glados.one" }));
        let checkinObj = JSON.parse(checkinRes);
        
        // 2. 获取会员状态（天数）
        let statusRes = await get(statusUrl);
        let statusObj = JSON.parse(statusRes);

        if (statusObj.code === 0) {
            const info = statusObj.data;
            // 处理天数：parseFloat 转数字 -> Math.floor 取整
            const days = info.leftDays !== undefined ? Math.floor(parseFloat(info.leftDays)) : "未知";

            // 根据签到返回的 code 判断标题
            let title = "";
            if (checkinObj.code === 0) title = "✅ 签到成功";
            else if (checkinObj.code === 1) title = "⚠️ 今日已签到";
            else title = "❓ 签到状态异常";

            // 弹出通知
            $notification.post("GLaDOS", title, `会员剩余：${days} 天`);
        } else {
            $notification.post("GLaDOS", "❌ 状态获取失败", statusObj.message);
        }
    } catch (err) {
        $notification.post("GLaDOS 签到", "❌ 运行出错", "请检查网络或 Cookie");
    } finally {
        $done();
    }
}

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

start();
