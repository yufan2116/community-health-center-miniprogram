/**
 * 预约与意见反馈：优先云数据库，失败或未配置环境时使用本地存储
 */
var APPT_KEY = "nh_appt_demo_v1";
var FB_KEY = "nh_fb_demo_v1";

function isCloudReady() {
  try {
    var app = getApp();
    if (!wx.cloud || !app || !app.globalData) return false;
    if (app.globalData.env) return true;
    if (app.globalData.useDynamicCurrentEnv) return true;
    return false;
  } catch (e) {
    return false;
  }
}

function getDb() {
  return wx.cloud.database();
}

function sortByTimeDesc(arr) {
  return (arr || []).slice().sort(function (a, b) {
    return (b.createTime || 0) - (a.createTime || 0);
  });
}

function saveLocalAppointments(list) {
  wx.setStorageSync(APPT_KEY, list);
}

function saveLocalFeedback(list) {
  wx.setStorageSync(FB_KEY, list);
}

var RESIDENT_PHONE_KEY = "nh_resident_bind_phone_v1";

function saveAppointment(record) {
  var payload = {
    name: String(record.name || "").trim(),
    phone: String(record.phone || "").trim(),
    date: String(record.date || "").trim(),
    serviceType: String(record.serviceType || "").trim(),
    category: String(record.category || "门诊").trim(),
    createTime: Date.now(),
    status: "待确认",
  };

  return new Promise(function (resolve) {
    function fallback(reason) {
      if (reason) console.warn("appointment cloud fallback:", reason);
      var list = wx.getStorageSync(APPT_KEY) || [];
      list.unshift(
        Object.assign({ _id: "local_" + Date.now() }, payload)
      );
      saveLocalAppointments(list);
      resolve({ ok: true, usedLocal: true });
    }

    if (!isCloudReady()) {
      fallback();
      return;
    }

    getDb()
      .collection("appointments")
      .add({ data: payload })
      .then(function () {
        resolve({ ok: true, usedLocal: false });
      })
      .catch(function (err) {
        fallback(err);
      });
  });
}

function listAppointments() {
  return new Promise(function (resolve) {
    function fromLocal() {
      resolve(sortByTimeDesc(wx.getStorageSync(APPT_KEY) || []));
    }

    if (!isCloudReady()) {
      fromLocal();
      return;
    }

    getDb()
      .collection("appointments")
      .get()
      .then(function (res) {
        resolve(sortByTimeDesc(res.data || []));
      })
      .catch(function (err) {
        console.warn("list appointments:", err);
        fromLocal();
      });
  });
}

function saveFeedback(record) {
  var payload = {
    content: String(record.content || "").trim(),
    contact: String(record.contact || "").trim(),
    createTime: Date.now(),
  };

  return new Promise(function (resolve) {
    function fallback(reason) {
      if (reason) console.warn("feedback cloud fallback:", reason);
      var list = wx.getStorageSync(FB_KEY) || [];
      list.unshift(
        Object.assign({ _id: "local_" + Date.now() }, payload)
      );
      saveLocalFeedback(list);
      resolve({ ok: true, usedLocal: true });
    }

    if (!isCloudReady()) {
      fallback();
      return;
    }

    getDb()
      .collection("feedback")
      .add({ data: payload })
      .then(function () {
        resolve({ ok: true, usedLocal: false });
      })
      .catch(function (err) {
        fallback(err);
      });
  });
}

function getResidentBindPhone() {
  try {
    return wx.getStorageSync(RESIDENT_PHONE_KEY) || "";
  } catch (e) {
    return "";
  }
}

function setResidentBindPhone(phone) {
  try {
    wx.setStorageSync(RESIDENT_PHONE_KEY, String(phone || ""));
  } catch (e) {}
}

module.exports = {
  isCloudReady: isCloudReady,
  saveAppointment: saveAppointment,
  listAppointments: listAppointments,
  saveFeedback: saveFeedback,
  RESIDENT_PHONE_KEY: RESIDENT_PHONE_KEY,
  getResidentBindPhone: getResidentBindPhone,
  setResidentBindPhone: setResidentBindPhone,
};
