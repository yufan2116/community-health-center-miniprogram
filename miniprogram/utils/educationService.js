/**
 * 居民端健康宣教（薄封装）
 *
 * 【当前为学生作业「本地演示版」】数据来自 cloudStore.listPublishedArticles；
 * 若本地尚无文章，则使用 data/articles.js 静态兜底，便于首次打开演示。
 * 后续接云开发时仅需改 cloudStore 实现，本文件可保持不变。
 */
var cloudStore = require("./cloudStore.js");
var staticArticles = require("../data/articles.js");

function normalizeDoc(d) {
  return {
    id: d.id || d._id,
    title: d.title,
    summary: d.summary || "",
    content: d.content || "",
    date: d.date || "",
    published: !!d.published,
    coverImage: String(d.coverImage || "").trim(),
  };
}

function listPublishedForResident() {
  return cloudStore.listPublishedArticles().then(function (rows) {
    if (rows && rows.length) {
      return rows.map(normalizeDoc);
    }
    return staticArticles;
  });
}

function getEducationPageStyle() {
  return cloudStore.getEducationPageStyle();
}

function getArticleById(id) {
  return cloudStore.listPublishedArticles().then(function (rows) {
    if (id == null || id === "") return null;
    var sid = String(id);
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (String(r.id || r._id || "") === sid) {
        return normalizeDoc(r);
      }
    }
    for (var j = 0; j < staticArticles.length; j++) {
      if (String(staticArticles[j].id) === sid) {
        return staticArticles[j];
      }
    }
    return null;
  });
}

module.exports = {
  listPublishedForResident: listPublishedForResident,
  getEducationPageStyle: getEducationPageStyle,
  getArticleById: getArticleById,
};
