/**
 * 大陆手机号校验（演示版）：11 位，1 开头第二位 3–9。
 * 与 cloudStore.normalizeMobile 规则保持一致。
 */
var CN_MOBILE = /^1[3-9]\d{9}$/;

function normalizeMainlandMobile(raw) {
  var d = String(raw == null ? "" : raw).replace(/\D/g, "");
  if (d.length > 11) d = d.slice(-11);
  if (d.length === 11 && CN_MOBILE.test(d)) return d;
  return "";
}

/**
 * @returns {{ ok: true, normalized: string } | { ok: false, message: string }}
 */
function validatePhoneSubmit(raw) {
  var t = String(raw != null ? raw : "").trim();
  if (!t) return { ok: false, message: "请输入手机号" };
  var d = t.replace(/\D/g, "");
  if (d.length !== 11 || !CN_MOBILE.test(d)) {
    return { ok: false, message: "手机号格式不正确" };
  }
  return { ok: true, normalized: d };
}

function digitsInputSlice11(v) {
  return String(v == null ? "" : v).replace(/\D/g, "").slice(0, 11);
}

module.exports = {
  CN_MOBILE: CN_MOBILE,
  normalizeMainlandMobile: normalizeMainlandMobile,
  validatePhoneSubmit: validatePhoneSubmit,
  digitsInputSlice11: digitsInputSlice11,
};
