/**
 * 管理端数据访问层（adminCloud）
 *
 * 【当前为学生作业「本地演示版」】与 cloudStore 共用同一套 Storage 键，
 * 不调用 wx.cloud.database()，避免云开发未开通或权限错误。
 * 后续接入微信云开发数据库时，只需替换本文件与 cloudStore.js 的实现，
 * 保持对外方法签名不变，管理端页面无需修改。
 */

var cloudStore = require("./cloudStore.js");
var K = cloudStore.KEYS;

function storageFailResolve() {
  return Promise.resolve({
    ok: false,
    message: cloudStore.LOCAL_STORAGE_FAIL_MSG,
  });
}

function readList(key) {
  try {
    var v = wx.getStorageSync(key);
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim()) {
      try {
        var parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  } catch (e) {
    return [];
  }
}

function writeList(key, arr) {
  return cloudStore.safeSetStorage(key, arr || []);
}

function genId() {
  return "local_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
}

function now() {
  return Date.now();
}

function findIndexById(list, id) {
  if (id == null || id === "") return -1;
  var sid = String(id);
  for (var i = 0; i < list.length; i++) {
    var it = list[i];
    if (String(it.id || it._id || "") === sid) return i;
  }
  return -1;
}

function stampNew(base) {
  var t = now();
  var id = genId();
  return Object.assign({}, base, {
    id: id,
    _id: id,
    createdAt: t,
    updatedAt: t,
    createTime: t,
  });
}

function stampUpdate(row, patch) {
  var t = now();
  return Object.assign({}, row, patch, {
    updatedAt: t,
    createTime: row.createTime != null ? row.createTime : row.createdAt || t,
  });
}

/**
 * 全量预约（管理端）；仅按分类筛，不按居民身份过滤。
 * 居民端请用 cloudStore.listMyAppointments()。
 */
function listAppointments(filter) {
  var rows = readList(K.appointments).slice();
  if (filter && filter !== "全部" && filter !== "") {
    rows = rows.filter(function (r) {
      return String(r.category || "") === String(filter);
    });
  }
  rows.sort(function (a, b) {
    return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
  });
  return Promise.resolve({ data: rows });
}

function listHealthRecords() {
  var rows = readList(K.healthRecords).slice();
  rows.sort(function (a, b) {
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return Promise.resolve({ data: rows });
}

function saveHealthRecord(data) {
  return cloudStore.saveHealthRecord(data);
}

function deleteHealthRecord(id) {
  var list = readList(K.healthRecords);
  var idx = findIndexById(list, id);
  if (idx < 0) return Promise.reject(new Error("not_found"));
  list.splice(idx, 1);
  var wr = writeList(K.healthRecords, list);
  if (!wr.ok) return storageFailResolve();
  return Promise.resolve({ ok: true });
}

function listArticles() {
  var rows = readList(K.educationArticles).slice();
  rows.sort(function (a, b) {
    return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
  });
  return Promise.resolve({ data: rows });
}

function saveArticle(doc) {
  var list = readList(K.educationArticles);
  var id = doc._id || doc.id;
  var title = String(doc.title || "").trim();
  if (!title) return Promise.reject(new Error("empty_title"));

  if (id) {
    var idx = findIndexById(list, id);
    if (idx < 0) return Promise.reject(new Error("not_found"));
    list[idx] = stampUpdate(list[idx], {
      title: title,
      summary: String(doc.summary != null ? doc.summary : ""),
      content: String(doc.content != null ? doc.content : ""),
      date: String(doc.date != null ? doc.date : ""),
      published: !!doc.published,
      coverImage: String(
        doc.coverImage != null ? doc.coverImage : list[idx].coverImage || ""
      ).trim(),
    });
  } else {
    list.unshift(
      stampNew({
        title: title,
        summary: String(doc.summary || ""),
        content: String(doc.content || ""),
        date: String(doc.date || ""),
        published: !!doc.published,
        coverImage: String(doc.coverImage || "").trim(),
      })
    );
  }
  var wr = writeList(K.educationArticles, list);
  if (!wr.ok) return storageFailResolve();
  return Promise.resolve({ ok: true });
}

function deleteArticle(id) {
  var list = readList(K.educationArticles);
  var idx = findIndexById(list, id);
  if (idx < 0) return Promise.reject(new Error("not_found"));
  list.splice(idx, 1);
  var wrA = writeList(K.educationArticles, list);
  if (!wrA.ok) return storageFailResolve();
  return Promise.resolve({ ok: true });
}

function publishArticle(id, published) {
  var list = readList(K.educationArticles);
  var idx = findIndexById(list, id);
  if (idx < 0) return Promise.reject(new Error("not_found"));
  list[idx] = stampUpdate(list[idx], { published: !!published });
  var wrP = writeList(K.educationArticles, list);
  if (!wrP.ok) return storageFailResolve();
  return Promise.resolve({ ok: true });
}

function listRecipes() {
  var rows = readList(K.recipes).slice();
  rows.sort(function (a, b) {
    return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
  });
  return Promise.resolve({ data: rows });
}

function saveRecipe(data) {
  var list = readList(K.recipes);
  var id = data.id || data._id;
  var title = String(data.title || "").trim();
  if (!title) return Promise.reject(new Error("empty_title"));

  if (id) {
    var idx = findIndexById(list, id);
    if (idx < 0) return Promise.reject(new Error("not_found"));
    list[idx] = stampUpdate(list[idx], {
      title: title,
      tags: String(data.tags != null ? data.tags : ""),
      ingredients: String(data.ingredients != null ? data.ingredients : ""),
      steps: String(data.steps != null ? data.steps : ""),
    });
  } else {
    list.unshift(
      stampNew({
        title: title,
        tags: String(data.tags || ""),
        ingredients: String(data.ingredients || ""),
        steps: String(data.steps || ""),
      })
    );
  }
  var wrR = writeList(K.recipes, list);
  if (!wrR.ok) return storageFailResolve();
  return Promise.resolve({ ok: true });
}

function deleteRecipe(id) {
  var list = readList(K.recipes);
  var idx = findIndexById(list, id);
  if (idx < 0) return Promise.reject(new Error("not_found"));
  list.splice(idx, 1);
  var wrDelR = writeList(K.recipes, list);
  if (!wrDelR.ok) return storageFailResolve();
  return Promise.resolve({ ok: true });
}

function listDietPlans() {
  var rows = readList(K.dietPlans).slice();
  rows.sort(function (a, b) {
    return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
  });
  return Promise.resolve({ data: rows });
}

function saveDietPlan(data) {
  return cloudStore.saveDietPlan(data);
}

function deleteDietPlan(id) {
  var list = readList(K.dietPlans);
  var idx = findIndexById(list, id);
  if (idx < 0) return Promise.reject(new Error("not_found"));
  list.splice(idx, 1);
  var wrD = writeList(K.dietPlans, list);
  if (!wrD.ok) return storageFailResolve();
  return Promise.resolve({ ok: true });
}

function getDietPlanByPhone(phone) {
  return cloudStore.getDietPlanByPhone(phone);
}

function listDepartments() {
  return cloudStore.listDepartments().then(function (rows) {
    return { data: rows || [] };
  });
}

/** @param {string} [departmentId] 传入则只返回该科室医生；不传返回全部 */
function listDoctors(departmentId) {
  return cloudStore.listDoctors(departmentId).then(function (rows) {
    return { data: rows || [] };
  });
}

function saveDepartment(data) {
  return cloudStore.saveDepartment(data || {});
}

function deleteDepartment(id) {
  return cloudStore.deleteDepartment(id);
}

function saveDoctor(data) {
  return cloudStore.saveDoctor(data || {});
}

function deleteDoctor(id) {
  return cloudStore.deleteDoctor(id);
}

function getEducationPageStyle() {
  return cloudStore.getEducationPageStyle().then(function (o) {
    return { data: o || { heroImagePath: "" } };
  });
}

function setEducationPageHeroImage(savedFilePath) {
  return cloudStore.setEducationPageHeroImage(savedFilePath);
}

function clearEducationPageHeroImage() {
  return cloudStore.clearEducationPageHeroImage();
}

function listResidentPersonalArchives() {
  return cloudStore.listResidentPersonalArchives().then(function (rows) {
    return { data: rows || [] };
  });
}

function getPersonalArchiveByPhone(phone) {
  return cloudStore.getResidentPersonalArchiveByPhone(phone).then(function (row) {
    return { data: row || {} };
  });
}

module.exports = {
  listAppointments: listAppointments,
  listHealthRecords: listHealthRecords,
  saveHealthRecord: saveHealthRecord,
  deleteHealthRecord: deleteHealthRecord,
  listArticles: listArticles,
  saveArticle: saveArticle,
  deleteArticle: deleteArticle,
  publishArticle: publishArticle,
  listRecipes: listRecipes,
  saveRecipe: saveRecipe,
  deleteRecipe: deleteRecipe,
  listDietPlans: listDietPlans,
  saveDietPlan: saveDietPlan,
  deleteDietPlan: deleteDietPlan,
  getDietPlanByPhone: getDietPlanByPhone,
  listDepartments: listDepartments,
  listDoctors: listDoctors,
  saveDepartment: saveDepartment,
  deleteDepartment: deleteDepartment,
  saveDoctor: saveDoctor,
  deleteDoctor: deleteDoctor,
  getEducationPageStyle: getEducationPageStyle,
  setEducationPageHeroImage: setEducationPageHeroImage,
  clearEducationPageHeroImage: clearEducationPageHeroImage,
  listResidentPersonalArchives: listResidentPersonalArchives,
  getPersonalArchiveByPhone: getPersonalArchiveByPhone,
};
