const today = new Date().toLocaleDateString();

const signedKey = "glados_random_sign_date";
const randomKey = "glados_random_minute";

// 今天已经签到过
if ($persistentStore.read(signedKey) === today) {
  console.log("今日已签到");
  $done();
}

// 获取当前时间
const now = new Date();

const currentHour = now.getHours();
const currentMinute = now.getMinutes();

// 第一次运行时生成随机时间
let randomMinute = $persistentStore.read(randomKey);

if (!randomMinute) {

  // 7:00 ~ 11:59
  const totalMinutes = Math.floor(Math.random() * 300);

  randomMinute = totalMinutes.toString();

  $persistentStore.write(
    randomMinute,
    randomKey
  );
}

randomMinute = parseInt(randomMinute);

const targetHour =
  7 + Math.floor(randomMinute / 60);

const targetMinute =
  randomMinute % 60;

console.log(
  `随机签到时间: ${targetHour}:${targetMinute}`
);

// 当前时间未达到
if (
  currentHour < targetHour ||
  (
    currentHour === targetHour &&
    currentMinute < targetMinute
  )
) {

  console.log("未到签到时间");

  $done();
}
const cookie = $persistentStore.read("glados_cookie");

if (!cookie) {

  $notification.post(
    "GLaDOS",
    "未获取Cookie",
    "请先手动签到一次"
  );

  $done();
}

const checkinUrl = "https://glados.cloud/api/user/checkin";
const statusUrl = "https://glados.cloud/api/user/status";

const headers = {
  "cookie": cookie,
  "content-type": "application/json;charset=UTF-8",
  "referer": "https://glados.cloud/console/checkin",
  "origin": "https://glados.cloud",
  "user-agent": "Mozilla/5.0"
};

const body = JSON.stringify({
  token: "glados.one"
});

function formatTraffic(bytes) {

  if (bytes < 1024) return bytes + " B";

  if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(2) + " KB";

  if (bytes < 1024 * 1024 * 1024)
    return (bytes / 1024 / 1024).toFixed(2) + " MB";

  return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

$httpClient.post(
  {
    url: checkinUrl,
    headers,
    body
  },
  function(error, response, data) {

    if (error) {

      $notification.post(
        "GLaDOS签到失败",
        "请求错误",
        error
      );

      $done();
      return;
    }

    let checkinMsg = "签到完成";

    try {

      const obj = JSON.parse(data);

      checkinMsg = obj.message || "签到成功";

    } catch(e) {}

    // 查询账户状态
    $httpClient.get(
      {
        url: statusUrl,
        headers
      },
      function(err, resp, result) {

        if (err) {

          $notification.post(
            "GLaDOS",
            checkinMsg,
            "用户信息获取失败"
          );

          $done();
          return;
        }

        try {

          const info = JSON.parse(result);

          const leftDays = info.data.leftDays || "未知";

          const traffic = formatTraffic(
            info.data.traffic || 0
          );

          const vip = info.data.vip || 0;

          const vipText = vip ? "VIP用户" : "普通用户";

          const message =
            `${checkinMsg}\n` +
            `剩余天数: ${leftDays}\n` +
            `剩余流量: ${traffic}\n` +
            `账户类型: ${vipText}`;

          $notification.post(
            "GLaDOS",
            "签到成功",
            message
          );
          $persistentStore.write(
  today,
  signedKey
);

// 清空随机时间
$persistentStore.write(
  "",
  randomKey
);

        } catch(e) {

          $notification.post(
            "GLaDOS",
            checkinMsg,
            "状态解析失败"
          );
        }

        $done();
      }
    );
  }
);
