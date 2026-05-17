/**
 * 演示版管理员登录态（本机 Storage，本地演示版不依赖云开发）
 * 登录标记键：isAdmin（由 setLoggedIn 写入）
 */
var cloudStore = require("./cloudStore.js");
var IS_ADMIN = "isAdmin";
var LEGACY_KEY = "nh_admin_demo_session_v1";

function isLoggedIn() {
  try {
    return wx.getStorageSync(IS_ADMIN) === true;
  } catch (e) {
    return false;
  }
}

/**
 * @returns {{ ok: true } | { ok: false }} 写入失败时 ok 为 false，页面应 Toast
 */
function setLoggedIn(value) {
  try {
    if (value) {
      var wr = cloudStore.safeSetStorage(IS_ADMIN, true);
      if (!wr.ok) return { ok: false };
      return { ok: true };
    }
    wx.removeStorageSync(IS_ADMIN);
    return { ok: true };
  } catch (e) {
    return { ok: false };
  }
}

/** 供后台页展示用；固定账号演示 */
function getSession() {
  if (!isLoggedIn()) return null;
  return { username: "admin", loginAt: Date.now() };
}

function clearSession() {
  try {
    wx.removeStorageSync(IS_ADMIN);
    wx.removeStorageSync(LEGACY_KEY);
  } catch (e) {}
}

function requireLogin() {
  if (!isLoggedIn()) {
    wx.redirectTo({ url: "/pages/admin/login/login" });
    return false;
  }
  return true;
}

module.exports = {
  IS_ADMIN_KEY: IS_ADMIN,
  isLoggedIn: isLoggedIn,
  setLoggedIn: setLoggedIn,
  getSession: getSession,
  clearSession: clearSession,
  requireLogin: requireLogin,
};
