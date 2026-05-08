// GLaDOS Loon 签到 + 会员时长 + 流量查询
const cookie = $persistentStore.read("GLaDOS_Cookie");
if (!cookie) {
    console.log("❌ 无Cookie，请先浏览器登录 glados.space");
    $done();
}

const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    "Cookie": cookie,
    "Content-Type": "application/json"
};

// 工具：字节转 GB
const bytesToGB = b => (b / 1024 / 1024 / 1024).toFixed(2);

// 1. 获取用户信息（时长+流量）
$task.fetch({ url: "https://glados.space/api/user", method: "GET", headers })
.then(res1 => {
    const user = JSON.parse(res1.body);
    if (user.code !== 0) throw new Error("用户信息获取失败");

    const { plan, expire_at, traffic_used, traffic_total } = user.data;
    const now = Date.now() / 1000;
    const leftDays = Math.ceil((expire_at - now) / 86400);

    console.log(`\n📌 GLaDOS 账号信息`);
    console.log(`🔹 套餐: ${plan}`);
    console.log(`🔹 到期: ${new Date(expire_at * 1000).toLocaleString()}`);
    console.log(`🔹 剩余: ${leftDays} 天`);
    console.log(`🔹 已用流量: ${bytesToGB(traffic_used)} GB`);
    console.log(`🔹 总流量: ${bytesToGB(traffic_total)} GB`);
    console.log(`🔹 剩余流量: ${bytesToGB(traffic_total - traffic_used)} GB\n`);

    // 2. 执行签到
    return $task.fetch({
        url: "https://glados.space/api/user/checkin",
        method: "POST",
        headers,
        body: "{}"
    });
})
.then(res2 => {
    const ck = JSON.parse(res2.body);
    if (ck.code === 0) {
        console.log(`✅ 签到成功: ${ck.message}`);
    } else {
        console.log(`ℹ️ 签到提示: ${ck.message}`);
    }
})
.catch(err => {
    console.log(`❌ 失败: ${err.message || err}`);
});            if (checkinObj.code === 0) title = "✅ 签到成功";
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
