/**
 * 管理端云数据库封装（学生演示）
 *
 * 演示环境请在云开发控制台为下列集合设置宽松权限（如：所有用户可读、所有用户可写），
 * 否则管理员客户端无法读取居民预约等数据。正式系统请改用云函数 + 鉴权。
 */
var isCloudReady = require("./cloudStore.js").isCloudReady;

function getDb() {
  return wx.cloud.database();
}

function guardCloud() {
  if (!isCloudReady()) {
    return Promise.reject(new Error("云开发未就绪"));
  }
  return Promise.resolve();
}

/** 管理员账号校验：集合 admins，字段 username、password（演示明文） */
function verifyAdmin(username, password) {
  return guardCloud().then(function () {
    return getDb()
      .collection("admins")
      .where({
        username: username,
        password: password,
      })
      .limit(1)
      .get();
  });
}

function listAllAppointments(category) {
  return guardCloud().then(function () {
    var q = getDb().collection("appointments");
    if (category && category !== "全部") {
      q = q.where({ category: category });
    }
    return q.limit(200).get();
  });
}

function listHealthRecords() {
  return guardCloud().then(function () {
    return getDb().collection("health_records").limit(200).get();
  });
}

function listEducationArticlesAdmin() {
  return guardCloud().then(function () {
    return getDb().collection("education_articles").limit(200).get();
  });
}

function getEducationArticleById(id) {
  return guardCloud().then(function () {
    return getDb().collection("education_articles").doc(id).get();
  });
}

function saveEducationArticle(doc) {
  return guardCloud().then(function () {
    var db = getDb();
    var id = doc._id;
    if (id) {
      return db
        .collection("education_articles")
        .doc(id)
        .update({
          data: {
            title: doc.title,
            summary: doc.summary,
            content: doc.content,
            date: doc.date,
            published: !!doc.published,
          },
        });
    }
    return db.collection("education_articles").add({
      data: {
        title: doc.title,
        summary: doc.summary,
        content: doc.content,
        date: doc.date,
        published: !!doc.published,
        createTime: Date.now(),
      },
    });
  });
}

function deleteEducationArticle(id) {
  return guardCloud().then(function () {
    return getDb().collection("education_articles").doc(id).remove();
  });
}

function listRecipes() {
  return guardCloud().then(function () {
    return getDb().collection("recipes").limit(200).get();
  });
}

function addRecipe(data) {
  return guardCloud().then(function () {
    var row = Object.assign({}, data, { createTime: Date.now() });
    return getDb().collection("recipes").add({ data: row });
  });
}

function listDietPlans() {
  return guardCloud().then(function () {
    return getDb().collection("diet_plans").limit(200).get();
  });
}

function addDietPlan(data) {
  return guardCloud().then(function () {
    var row = Object.assign({}, data, { createTime: Date.now() });
    return getDb().collection("diet_plans").add({ data: row });
  });
}

function deleteDietPlan(id) {
  return guardCloud().then(function () {
    return getDb().collection("diet_plans").doc(id).remove();
  });
}

/** 居民按手机号查食疗方案 */
function getDietPlanByPhone(phone) {
  return guardCloud()
    .then(function () {
      return getDb().collection("diet_plans").where({ phone: phone }).get();
    })
    .then(function (res) {
      var arr = (res.data || []).slice();
      arr.sort(function (a, b) {
        return (b.createTime || 0) - (a.createTime || 0);
      });
      return arr.length ? arr[0] : null;
    });
}

module.exports = {
  verifyAdmin: verifyAdmin,
  listAllAppointments: listAllAppointments,
  listHealthRecords: listHealthRecords,
  listEducationArticlesAdmin: listEducationArticlesAdmin,
  getEducationArticleById: getEducationArticleById,
  saveEducationArticle: saveEducationArticle,
  deleteEducationArticle: deleteEducationArticle,
  listRecipes: listRecipes,
  addRecipe: addRecipe,
  listDietPlans: listDietPlans,
  addDietPlan: addDietPlan,
  deleteDietPlan: deleteDietPlan,
  getDietPlanByPhone: getDietPlanByPhone,
};
