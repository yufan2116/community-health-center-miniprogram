/**
 * 宣教文章配图（演示版）
 * 管理端选择的图片保存到 wx.env.USER_DATA_PATH/education-articles/
 * 与项目内 miniprogram/images/education-articles/（打包示意图）区分见该目录 readme.txt
 */

var SUBDIR = "education-articles";

function getUserBasePath() {
  try {
    if (wx.env && wx.env.USER_DATA_PATH) {
      return String(wx.env.USER_DATA_PATH).replace(/\/$/, "");
    }
  } catch (e) {}
  return "";
}

function getUserArticleImageDir() {
  var base = getUserBasePath();
  if (!base) return "";
  return base + "/" + SUBDIR;
}

/**
 * 确保用户目录下 education-articles 存在
 * @param {function(boolean): void} callback success(dirReady)
 */
function ensureUserArticleImageDir(callback) {
  var dir = getUserArticleImageDir();
  if (!dir) {
    if (callback) callback(false);
    return;
  }
  var fs = wx.getFileSystemManager();
  try {
    fs.accessSync(dir);
    if (callback) callback(true);
  } catch (e) {
    try {
      fs.mkdirSync(dir, true);
      if (callback) callback(true);
    } catch (e2) {
      if (callback) callback(false);
    }
  }
}

function pickExtFromTempPath(tempPath) {
  var lower = String(tempPath || "").toLowerCase();
  if (lower.indexOf(".gif") > 0) return ".gif";
  if (lower.indexOf(".webp") > 0) return ".webp";
  if (lower.indexOf(".png") > 0) return ".png";
  if (lower.indexOf(".jpeg") > 0) return ".jpg";
  if (lower.indexOf(".jpg") > 0) return ".jpg";
  return ".jpg";
}

/**
 * 将临时文件保存到用户目录 education-articles 下
 * @returns {Promise<string>} 保存后的本地路径，供 image src 使用
 */
function savePickedImageFromTemp(tempFilePath) {
  return new Promise(function (resolve, reject) {
    var temp = String(tempFilePath || "").trim();
    if (!temp) {
      reject(new Error("no_temp"));
      return;
    }
    ensureUserArticleImageDir(function (ok) {
      if (!ok) {
        reject(new Error("mkdir_fail"));
        return;
      }
      var dir = getUserArticleImageDir();
      var ext = pickExtFromTempPath(temp);
      var name = "article_" + Date.now() + "_" + Math.floor(Math.random() * 10000) + ext;
      var dest = dir + "/" + name;
      wx.getFileSystemManager().copyFile({
        srcPath: temp,
        destPath: dest,
        success: function () {
          resolve(dest);
        },
        fail: function (err) {
          reject(err || new Error("copy_fail"));
        },
      });
    });
  });
}

module.exports = {
  SUBDIR: SUBDIR,
  getUserArticleImageDir: getUserArticleImageDir,
  ensureUserArticleImageDir: ensureUserArticleImageDir,
  savePickedImageFromTemp: savePickedImageFromTemp,
};
