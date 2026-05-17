// 居民端食疗方案本地兜底（演示用）
// 当云开发不可用或 diet_plans 集合未创建时，用于展示示例方案，保证功能可演示。

var phoneValidate = require("./phoneValidate.js");

var DEMO_PLANS = [
  {
    phone: "13800001001",
    residentName: "张三",
    title: "高血压日常食疗建议（演示）",
    advice:
      "【总体原则】\n清淡少盐、规律三餐、控制体重。\n\n【建议食物】\n燕麦、全谷物、深色蔬菜、豆制品、低脂奶；适量坚果。\n\n【少吃/避免】\n腌制品、重口味外卖、含糖饮料。\n\n【示例一日】\n早餐：燕麦粥 + 水煮蛋 + 番茄\n午餐：杂粮饭 + 清蒸鱼 + 炒青菜\n晚餐：小米粥 + 豆腐青菜汤\n\n提示：如有头痛胸闷等不适请及时就医。（演示内容）",
    linkedRecipe: "山药小米粥",
    createTime: Date.now() - 5 * 24 * 3600 * 1000,
  },
  {
    phone: "13800001002",
    residentName: "李四",
    title: "2型糖尿病控糖食疗建议（演示）",
    advice:
      "【总体原则】\n控制总能量，主食粗细搭配，少量多餐。\n\n【建议食物】\n杂粮、豆类、非淀粉类蔬菜、优质蛋白（鱼、蛋、瘦肉）。\n\n【少吃/避免】\n甜点、含糖饮料、夜宵。\n\n【示例一日】\n早餐：全麦面包 1 片 + 无糖豆浆\n午餐：糙米饭半碗 + 鸡胸肉 + 凉拌黄瓜\n晚餐：藜麦半碗 + 清炒西兰花 + 豆腐\n\n提示：按医嘱监测血糖并规律用药。（演示内容）",
    linkedRecipe: "",
    createTime: Date.now() - 2 * 24 * 3600 * 1000,
  },
];

function getByPhone(phone) {
  var p = phoneValidate.normalizeMainlandMobile(phone);
  if (!p) return null;
  for (var i = 0; i < DEMO_PLANS.length; i++) {
    if (DEMO_PLANS[i].phone === p) return DEMO_PLANS[i];
  }
  return null;
}

module.exports = {
  getByPhone: getByPhone,
};

