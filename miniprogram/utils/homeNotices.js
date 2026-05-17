// 首页通知公告（演示数据，与详情页共用）
var NOTICES = [
  {
    id: 1,
    title: "五一假期门诊时间调整公告",
    date: "2026-04-28",
    content:
      "根据国家法定节假日安排，2026 年五一劳动节期间本中心门诊时间调整如下：\n\n5 月 1 日（周四）至 5 月 3 日（周六）：全科门诊上午 8:00—12:00 正常接诊，下午休息；预防接种门诊 5 月 2 日按周六接种日开放，其余时间暂停。\n\n5 月 4 日（周日）起恢复正常门诊时间。急诊请拨打 120 或前往上级医院。\n\n给您带来不便，敬请谅解。（演示版文案）",
  },
  {
    id: 2,
    title: "儿童疫苗接种日安排（5月）",
    date: "2026-05-02",
    content:
      "5 月儿童预防接种门诊开放日：每周二、周四、周六上午 8:00—11:30（法定节假日除外）。\n\n请家长提前在「我的—预约记录」或现场取号排队，携带儿童预防接种证及监护人身份证。流感疫苗、水痘疫苗等二类疫苗库存以当日窗口公示为准。\n\n如有发热、急性疾病请暂缓接种，痊愈后再预约。（演示版文案）",
  },
  {
    id: 3,
    title: "老年人免费体检开始预约",
    date: "2026-05-08",
    content:
      "本辖区 65 周岁及以上常住老年人免费健康体检现已开放预约，项目包括一般体格检查、血常规、尿常规、肝肾功能、空腹血糖、血脂、心电图、腹部 B 超等。\n\n体检时间：工作日上午 8:00—10:30（需空腹）。请携带身份证或社保卡，按预约时段到一楼健康小屋登记。\n\n每日名额有限，约满即止。详情可致电中心前台或现场咨询。（演示版文案）",
  },
];

function getById(id) {
  var n = typeof id === "number" ? id : parseInt(String(id), 10);
  if (isNaN(n)) return null;
  for (var i = 0; i < NOTICES.length; i++) {
    if (NOTICES[i].id === n) return NOTICES[i];
  }
  return null;
}

function getListForHome() {
  return NOTICES.map(function (n) {
    return { id: n.id, title: n.title, date: n.date };
  });
}

module.exports = {
  getById: getById,
  getListForHome: getListForHome,
};
