const cookie = $persistentStore.read("glados_cookie");

if (!cookie) {
  $notification.post(
    "GLaDOS签到",
    "失败",
    "未获取到Cookie，请先手动签到一次"
  );

  $done();
}

const url = "https://glados.cloud/api/user/checkin";

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

$httpClient.post(
  {
    url,
    headers,
    body
  },
  function(error, response, data) {

    if (error) {

      console.log(error);

      $notification.post(
        "GLaDOS签到",
        "请求失败",
        error
      );

      $done();
      return;
    }

    console.log(data);

    try {

      const result = JSON.parse(data);

      $notification.post(
        "GLaDOS签到",
        result.message || "签到完成",
        data
      );

    } catch(e) {

      $notification.post(
        "GLaDOS签到",
        "解析失败",
        data
      );
    }

    $done();
  }
);
