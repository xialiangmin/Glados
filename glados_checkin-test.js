var cookie = $persistentStore.read("glados_cookie");

if (!cookie) {
    console.log("❌ 未获取到 Cookie，请先浏览器登录 glados.cloud");
    $done();
}

var headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    "Cookie": cookie,
    "Content-Type": "application/json"
};

function bytesToGB(b) {
    return (b / 1024 / 1024 / 1024).toFixed(2);
}

// 获取用户信息
$httpClient.get({
    url: "https://glados.cloud/api/user",
    headers: headers
}, function(error, response, data) {
    if (error || !data) {
        console.log("❌ 网络请求失败");
        $done();
        return;
    }

    var user;
    try {
        user = JSON.parse(data);
    } catch (e) {
        console.log("❌ Cookie 已失效，请重新浏览器登录");
        $done();
        return;
    }

    if (user.code !== 0 || !user.data) {
        console.log("❌ 登录已过期，请重新登录");
        $done();
        return;
    }

    var d = user.data;
    var leftDays = Math.ceil((d.expire_at - Date.now() / 1000) / 86400);
    var leftTraffic = bytesToGB(d.traffic_total - d.traffic_used);

    console.log("");
    console.log("📌 GLaDOS.cloud 账号信息");
    console.log("🔹 套餐类型: " + d.plan);
    console.log("🔹 到期时间: " + new Date(d.expire_at * 1000).toLocaleString());
    console.log("🔹 剩余天数: " + leftDays + " 天");
    console.log("🔹 已用流量: " + bytesToGB(d.traffic_used) + " GB");
    console.log("🔹 总流量: " + bytesToGB(d.traffic_total) + " GB");
    console.log("🔹 剩余流量: " + leftTraffic + " GB");
    console.log("");

    // 执行签到
    $httpClient.post({
        url: "https://glados.cloud/api/user/checkin",
        headers: headers,
        body: "{}"
    }, function(err, resp, body) {
        if (err || !body) {
            console.log("❌ 签到请求失败");
            $done();
            return;
        }

        var res;
        try {
            res = JSON.parse(body);
        } catch (e) {
            console.log("❌ 签到失败，请稍后重试");
            $done();
            return;
        }

        if (res.code === 0) {
            console.log("✅ 签到成功：" + res.message);
        } else {
            console.log("ℹ️ 签到结果：" + res.message);
        }
        $done();
    });
});
