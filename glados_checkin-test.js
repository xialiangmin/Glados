const cookie = $persistentStore.read("GLaDOS_Cookie");

if (!cookie) {
    console.log("❌ 未获取到Cookie，请先浏览器登录 glados.space");
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

// 第一步：获取用户信息
$task.fetch({
    url: "https://glados.space/api/user",
    method: "GET",
    headers: headers
}).then(function(res1) {
    var user = JSON.parse(res1.body);
    if (user.code !== 0) {
        console.log("❌ 获取用户信息失败");
        $done();
        return;
    }

    var data = user.data;
    var plan = data.plan;
    var expire_at = data.expire_at;
    var traffic_used = data.traffic_used;
    var traffic_total = data.traffic_total;
    var now = Date.now() / 1000;
    var leftDays = Math.ceil((expire_at - now) / 86400);
    var leftTraffic = bytesToGB(traffic_total - traffic_used);

    console.log("");
    console.log("📌 GLaDOS 账号信息");
    console.log("🔹 套餐类型: " + plan);
    console.log("🔹 到期时间: " + new Date(expire_at * 1000).toLocaleString());
    console.log("🔹 剩余天数: " + leftDays + " 天");
    console.log("🔹 已用流量: " + bytesToGB(traffic_used) + " GB");
    console.log("🔹 总流量: " + bytesToGB(traffic_total) + " GB");
    console.log("🔹 剩余流量: " + leftTraffic + " GB");
    console.log("");

    // 第二步：执行签到
    $task.fetch({
        url: "https://glados.space/api/user/checkin",
        method: "POST",
        headers: headers,
        body: "{}"
    }).then(function(res2) {
        var ck = JSON.parse(res2.body);
        if (ck.code === 0) {
            console.log("✅ 签到成功：" + ck.message);
        } else {
            console.log("ℹ️ 签到结果：" + ck.message);
        }
        $done();
    }, function(err) {
        console.log("❌ 签到请求失败");
        $done();
    });

}, function(err) {
    console.log("❌ 获取用户信息失败");
    $done();
});
