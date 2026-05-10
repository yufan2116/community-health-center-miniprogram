/**
 * 一键写入演示数据（需云开发可用且集合已建）
 */
var isCloudReady = require("./cloudStore.js").isCloudReady;

function getDb() {
  return wx.cloud.database();
}

function addIfEmpty(collection, docs) {
  return getDb()
    .collection(collection)
    .limit(1)
    .get()
    .then(function (res) {
      if (res.data && res.data.length) {
        return { skipped: true, name: collection };
      }
      var chain = Promise.resolve();
      docs.forEach(function (d) {
        chain = chain.then(function () {
          return getDb().collection(collection).add({ data: d });
        });
      });
      return chain.then(function () {
        return { skipped: false, name: collection, count: docs.length };
      });
    });
}

function runSeed() {
  if (!isCloudReady()) {
    return Promise.reject(new Error("云开发未就绪"));
  }

  var adminDocs = [
    {
      username: "admin",
      password: "admin123",
      remark: "演示账号（请及时调整数据库权限）",
    },
  ];

  var recordDocs = [
    {
      name: "张三",
      phone: "13800001001",
      gender: "男",
      age: 62,
      bloodPressure: "135/85",
      chronic: "高血压",
      lastVisit: "2026-04-10",
      note: "规律服药，低盐饮食（演示数据）",
    },
    {
      name: "李四",
      phone: "13800001002",
      gender: "女",
      age: 58,
      bloodPressure: "118/76",
      chronic: "2型糖尿病",
      lastVisit: "2026-04-22",
      note: "血糖监测中（演示数据）",
    },
  ];

  var articleDocs = [
    {
      title: "演示：春季呼吸道防护",
      summary: "勤洗手、戴口罩、保持通风（已发布）",
      content:
        "春季气温变化大，注意个人防护，不适及时就诊。本文为演示内容。",
      date: "2026-05-01",
      published: true,
      createTime: Date.now(),
    },
    {
      title: "演示：草稿-未发布文章",
      summary: "居民端不可见",
      content: "管理员可在后台编辑后勾选发布。",
      date: "2026-05-02",
      published: false,
      createTime: Date.now(),
    },
  ];

  var recipeDocs = [
    {
      title: "山药小米粥",
      tags: "健脾、清淡",
      ingredients: "小米 50g，山药 100g，水适量",
      steps: "小米洗净，山药切块，同煮至粘稠即可。",
      createTime: Date.now(),
    },
  ];

  return addIfEmpty("admins", adminDocs)
    .then(function () {
      return addIfEmpty("health_records", recordDocs);
    })
    .then(function () {
      return addIfEmpty("education_articles", articleDocs);
    })
    .then(function () {
      return addIfEmpty("recipes", recipeDocs);
    });
}

module.exports = {
  runSeed: runSeed,
};
