const cookie = $persistentStore.read("glados_cookie");

if (!cookie) {
    console.log("❌ 未获取到Cookie，请先浏览器登录 glados.cloud");
    $done();
}

const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
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
    if (error) {
        console.log("❌ 获取信息失败");
        $done();
        return;
    }

    var user = JSON.parse(data);
    if (user.code !== 0) {
        console.log("❌ 用户信息错误");
        $done();
        return;
    }

    var d = user.data;
    var leftDays = Math.ceil((d.expire_at - Date.now() / 1000) / 86400);

    console.log("");
    console.log("📌 GLaDOS.cloud 账号信息");
    console.log("🔹 套餐: " + d.plan);
    console.log("🔹 到期: " + new Date(d.expire_at * 1000).toLocaleString());
    console.log("🔹 剩余: " + leftDays + " 天");
    console.log("🔹 已用流量: " + bytesToGB(d.traffic_used) + " GB");
    console.log("🔹 总流量: " + bytesToGB(d.traffic_total) + " GB");
    console.log("🔹 剩余流量: " + bytesToGB(d.traffic_total - d.traffic_used) + " GB");
    console.log("");

    // 执行签到
    $httpClient.post({
        url: "https://glados.cloud/api/user/checkin",
        headers: headers,
        body: "{}"
    }, function(err, resp, body) {
        if (err) {
            console.log("❌ 签到失败");
            $done();
            return;
        }
        var res = JSON.parse(body);
        if (res.code === 0) {
            console.log("✅ 签到成功：" + res.message);
        } else {
            console.log("ℹ️ 签到结果：" + res.message);
        }
        $done();
    });
});
