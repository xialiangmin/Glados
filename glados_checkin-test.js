// glados_checkin.js
let cookie = $persistentStore.read("glados_cookie");

if (!cookie) {
    $notification.post("GLaDOS 签到", "❌ 签到失败", "未找到 Cookie，请先登录网页获取。");
    $done();
}

const checkinUrl = "https://glados.space/api/user/checkin";
const statusUrl = "https://glados.space/api/user/status";

const header = {
    "Cookie": cookie,
    "Content-Type": "application/json;charset=utf-8",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
};

// 1. 先执行签到
$httpClient.post({ url: checkinUrl, headers: header, body: JSON.stringify({ token: "glados.one" }) }, (error, response, data) => {
    if (error) {
        $notification.post("GLaDOS 签到", "❌ 请求失败", error);
        $done();
        return;
    }

    const checkinRes = JSON.parse(data);
    
    // 2. 无论签到成功还是今日已签到，都去获取具体流量状态
    if (checkinRes.code === 0 || checkinRes.code === 1) {
        $httpClient.get({ url: statusUrl, headers: header }, (error, response, data) => {
            const statusRes = JSON.parse(data);
            if (statusRes.code === 0) {
                const info = statusRes.data;
                // 处理天数：取整
                const days = Math.floor(info.leftDays);
                // 处理流量：计算剩余流量 (Total - Usage)，转为 GB 保持两位小数
                const total = info.usage_limit / (1024 * 1024 * 1024);
                const used = info.usage / (1024 * 1024 * 1024);
                const remaining = (total - used).toFixed(2);

                let title = checkinRes.code === 0 ? "✅ 签到成功" : "⚠️ 今日已签到";
                let detail = `会员剩余：${days} 天\n剩余流量：${remaining} GB (总 ${total.toFixed(2)} GB)`;
                
                $notification.post("GLaDOS", title, detail);
            }
            $done();
        });
    } else {
        $notification.post("GLaDOS 签到", "❌ 异常", checkinRes.message);
        $done();
    }
});
