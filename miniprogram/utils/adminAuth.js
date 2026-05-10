/**
 * 演示版管理员登录态（仅存本机，非生产方案）
 */
var ADMIN_KEY = "nh_admin_demo_session_v1";

function getSession() {
  try {
    return wx.getStorageSync(ADMIN_KEY) || null;
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  var s = getSession();
  return !!(s && s.username);
}

function setSession(username) {
  wx.setStorageSync(ADMIN_KEY, {
    username: username,
    loginAt: Date.now(),
  });
}

function clearSession() {
  try {
    wx.removeStorageSync(ADMIN_KEY);
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
  ADMIN_KEY: ADMIN_KEY,
  getSession: getSession,
  isLoggedIn: isLoggedIn,
  setSession: setSession,
  clearSession: clearSession,
  requireLogin: requireLogin,
};
