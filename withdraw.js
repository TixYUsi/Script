console.log("✅ 脚本已触发：准备刷视频或提现");

// ✅ 配置项：是否只提现
const onlyWithdraw = false;

// ✅ 安全封装主逻辑，避免异常中断
try {
  // ✅ 解析响应体
  let obj = JSON.parse($response.body);
  let ids = Array.isArray(obj?.data)
    ? obj.data.map(item => item.id).filter(id => typeof id === "number")
    : [];

  let auth = $request.headers["Authori-zation"] || $request.headers["Authorization"];
  if (!auth) {
    $notification.post("❌ 未获取到授权Token", "", "请求头中未包含 Authori-zation");
    return $done({});
  }

  // ✅ 公共Header
  const baseHeaders = {
    "Content-Type": "application/json",
    "Referer": "https://servicewechat.com/wx5b82dfe3747e533f/5/page-frame.html",
    "Host": "n05.sentezhenxuan.com",
    "Authori-zation": auth,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1) AppleWebKit/605.1.15 Mobile/15E148 MicroMessenger/8.0.50",
    "Cb-lang": "zh-CN",
    "Form-type": "routine-zhixiang"
  };

  // ✅ 提现函数
  function doWithdraw() {
    const req = {
      url: "https://n05.sentezhenxuan.com/api/userTx",
      method: "GET",
      headers: {
        ...baseHeaders,
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9"
      },
    };
    $httpClient.get(req, (err, resp, data) => {
      if (err) {
        $notification.post("❌ 提现失败", "", err.error || JSON.stringify(err));
      } else {
        $notification.post("✅ 提现成功", "", data);
      }
      $done({});
    });
  }

  // ✅ 刷视频函数
  function startVideoLoop() {
    let i = 0;
    const total = ids.length;

    if (total === 0) {
      $notification.post("⚠️ 无视频可刷", "", "返回数据中没有ID");
      return $done({});
    }

    function sendNext() {
      if (i >= total) {
        return doWithdraw();
      }

      const vid = ids[i++];
      const now = Date.now();
      const body = JSON.stringify({
        vid: vid,
        startTime: now - 80000,
        endTime: now,
        baseVersion: "3.5.8",
        playMode: 0,
      });

      const req = {
        url: "https://n05.sentezhenxuan.com/api/video/videoJob",
        method: "POST",
        headers: baseHeaders,
        body: body,
      };

      $httpClient.post(req, (err, resp, data) => {
        if (err) {
          console.log(`❌ 视频 ${vid} 刷失败: ${err.error}`);
        } else {
          console.log(`🎬 视频 ${vid} 刷完`);
        }

        // 防止 Surage 脚本整体超时（加计时器判断退出）
        if (i >= total) {
          setTimeout(doWithdraw, 500);
        } else {
          setTimeout(sendNext, 800);
        }
      });
    }

    $notification.post("🎬 开始刷视频", "", `共 ${total} 个视频`);
    sendNext();
  }

  // ✅ 主逻辑入口
  if (onlyWithdraw) {
    console.log("⚠️ 只提现模式已启用");
    doWithdraw();
  } else {
    console.log(`✅ 获取到 ${ids.length} 个视频ID，准备刷视频...`);
    startVideoLoop();
  }

} catch (e) {
  $notification.post("❌ 脚本异常", "", e.message || String(e));
  $done({});
}
