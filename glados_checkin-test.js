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

// 1. 执行签到
$httpClient.post({ url: checkinUrl, headers: header, body: JSON.stringify({ token: "glados.one" }) }, (error, response, data) => {
    if (error) {
        $notification.post("GLaDOS 签到", "❌ 网络请求失败", error);
        $done();
        return;
    }

    const checkinRes = JSON.parse(data);
    
    // 2. 获取流量状态
    $httpClient.get({ url: statusUrl, headers: header }, (error, response, data) => {
        if (error || !data) {
            $notification.post("GLaDOS 签到", "⚠️ 签到完成但状态获取失败", "请检查网络");
            $done();
            return;
        }

        try {
            const statusRes = JSON.parse(data);
            console.log("GLaDOS 状态返回数据: " + data); // 在 Loon 日志中可以查看完整返回

            if (statusRes.code === 0 && statusRes.data) {
                const info = statusRes.data;
                
                // --- 天数处理 ---
                const days = info.leftDays !== undefined ? Math.floor(parseFloat(info.leftDays)) : "未知";

                // --- 流量处理 (增加容错) ---
                let trafficDetail = "流量信息获取失败";
                if (info.usage !== undefined && info.usage_limit !== undefined) {
                    const total = parseFloat(info.usage_limit) / (1024 * 1024 * 1024);
                    const used = parseFloat(info.usage) / (1024 * 1024 * 1024);
                    const remaining = (total - used).toFixed(2);
                    trafficDetail = `剩余流量：${remaining} GB (总 ${total.toFixed(2)} GB)`;
                }

                let title = checkinRes.code === 0 ? "✅ 签到成功" : (checkinRes.code === 1 ? "⚠️ 今日已签到" : "❓ 状态异常");
                let detail = `会员剩余：${days} 天\n${trafficDetail}`;
                
                $notification.post("GLaDOS", title, detail);
            } else {
                $notification.post("GLaDOS 签到", "❌ 状态解析失败", statusRes.message || "未知错误");
            }
        } catch (e) {
            console.log("解析错误: " + e);
            $notification.post("GLaDOS 签到", "❌ 数据解析异常", "请查看 Loon 日志");
        }
        $done();
    });
});
