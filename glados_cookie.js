const cookie = $request.headers["Cookie"] || $request.headers["cookie"];

if (cookie) {
  $persistentStore.write(cookie, "glados_cookie");

  console.log("GLaDOS Cookie 获取成功");

  $notification.post(
    "GLaDOS",
    "Cookie获取成功",
    "已保存Cookie"
  );
} else {
  console.log("未获取到Cookie");

  $notification.post(
    "GLaDOS",
    "Cookie获取失败",
    "未发现Cookie"
  );
}

$done({});
