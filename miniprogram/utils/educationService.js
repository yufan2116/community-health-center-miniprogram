/**
 * 居民端健康宣教：云库 education_articles 仅展示 published===true；失败或无数据时用本地 data/articles 兜底
 */
var cloudStore = require("./cloudStore.js");
var staticArticles = require("../data/articles.js");

function isCloudReady() {
  return cloudStore.isCloudReady();
}

function getDb() {
  return wx.cloud.database();
}

function normalizeDoc(d) {
  return {
    id: d._id || d.id,
    title: d.title,
    summary: d.summary || "",
    content: d.content || "",
    date: d.date || "",
    published: !!d.published,
  };
}

function listPublishedForResident() {
  return new Promise(function (resolve) {
    if (!isCloudReady()) {
      resolve(staticArticles);
      return;
    }
    getDb()
      .collection("education_articles")
      .where({ published: true })
      .limit(100)
      .get()
      .then(function (res) {
        var rows = (res.data || []).map(normalizeDoc);
        rows.sort(function (a, b) {
          return String(b.date).localeCompare(String(a.date));
        });
        if (!rows.length) {
          resolve(staticArticles);
        } else {
          resolve(rows);
        }
      })
      .catch(function () {
        resolve(staticArticles);
      });
  });
}

function getArticleById(id) {
  return new Promise(function (resolve) {
    if (!id) {
      resolve(null);
      return;
    }
    for (var i = 0; i < staticArticles.length; i++) {
      if (staticArticles[i].id === id) {
        resolve(staticArticles[i]);
        return;
      }
    }
    if (!isCloudReady()) {
      resolve(null);
      return;
    }
    getDb()
      .collection("education_articles")
      .doc(id)
      .get()
      .then(function (res) {
        var d = res.data;
        if (!d || d.published !== true) {
          resolve(null);
          return;
        }
        resolve(normalizeDoc(Object.assign({}, d, { _id: id })));
      })
      .catch(function () {
        resolve(null);
      });
  });
}

module.exports = {
  listPublishedForResident: listPublishedForResident,
  getArticleById: getArticleById,
};
