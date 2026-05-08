// glados_checkin.js
let cookie = $persistentStore.read("glados_cookie");

if (!cookie) {
    $notification.post("GLaDOS 签到", "❌ 签到失败", "未找到 Cookie，请重新登录网页。");
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
        // 1. 签到
        let checkinRes = await post(checkinUrl, JSON.stringify({ token: "glados.one" }));
        let checkinObj = JSON.parse(checkinRes);
        
        // 2. 获取状态
        let statusRes = await get(statusUrl);
        let statusObj = JSON.parse(statusRes);

        if (statusObj.code === 0) {
            const info = statusObj.data;
            
            // --- 天数处理 ---
            const days = info.leftDays !== undefined ? Math.floor(parseFloat(info.leftDays)) : "未知";

            // --- 流量处理 (多字段兼容逻辑) ---
            // 尝试获取“总流量”
            let totalByte = info.usage_limit || info.traffic_limit || info.limit || 0;
            // 尝试获取“已用流量”
            let usedByte = info.usage || info.traffic_used || info.used || 0;
            
            let trafficDetail = "";

            if (totalByte > 0) {
                const totalGB = (totalByte / (1024 * 1024 * 1024)).toFixed(2);
                const usedGB = (usedByte / (1024 * 1024 * 1024)).toFixed(2);
                const remainingGB = (totalGB - usedGB).toFixed(2);
                trafficDetail = `剩余流量：${remainingGB} GB (总 ${totalGB} GB)`;
            } else {
                // 如果依然获取不到，打印出 Data 里的所有键名，方便排查
                trafficDetail = "流量字段未知: " + Object.keys(info).join(", ");
            }

            let title = checkinObj.code === 0 ? "✅ 签到成功" : (checkinObj.code === 1 ? "⚠️ 今日已签到" : "❓ 状态异常");
            $notification.post("GLaDOS", title, `会员剩余：${days} 天\n${trafficDetail}`);
        } else {
            $notification.post("GLaDOS", "❌ 状态获取失败", statusObj.message);
        }
    } catch (err) {
        $notification.post("GLaDOS 签到", "❌ 运行出错", err.toString());
    } finally {
        $done();
    }
}

// 简单的请求封装
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
