/**
 * 管理端表格导出：生成 UTF-8 BOM 的 CSV，Excel 可直接打开中文列。
 * 交付方式：操作菜单（分享文件 / 其它应用打开 / 复制剪贴板）。
 */

function escapeCsv(s) {
  s = String(s == null ? "" : s);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowToLine(cells) {
  return cells.map(escapeCsv).join(",");
}

function formatTs(ts) {
  if (!ts) return "";
  try {
    var d = new Date(Number(ts));
    if (isNaN(d.getTime())) return String(ts);
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    var h = d.getHours();
    var mi = d.getMinutes();
    function z(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    return y + "-" + z(m) + "-" + z(day) + " " + z(h) + ":" + z(mi);
  } catch (e) {
    return String(ts);
  }
}

function appointmentsToCsv(rows) {
  var header = [
    "分类",
    "服务类型",
    "科室",
    "医生",
    "预约日期",
    "姓名",
    "手机",
    "状态",
    "创建时间",
    "记录ID",
  ];
  var lines = [rowToLine(header)];
  (rows || []).forEach(function (r) {
    lines.push(
      rowToLine([
        r.category,
        r.serviceType,
        r.departmentName || "",
        r.doctorName || "",
        r.date,
        r.name,
        r.phone,
        r.status,
        formatTs(r.createTime || r.createdAt),
        r._id || r.id,
      ])
    );
  });
  return lines.join("\r\n");
}

function residentPersonalArchivesToCsv(rows) {
  var header = [
    "手机",
    "姓名",
    "性别",
    "出生日期",
    "民族",
    "证件号",
    "常住地址",
    "职业",
    "紧急联系人",
    "紧急联系电话",
    "血型",
    "身高cm",
    "体重kg",
    "健康信息",
    "过敏史",
    "暴露史",
    "既往史",
    "家族史",
    "遗传病史",
    "残疾状况",
    "更新时间",
    "记录ID",
  ];
  var lines = [rowToLine(header)];
  (rows || []).forEach(function (r) {
    lines.push(
      rowToLine([
        r.phone,
        r.residentName,
        r.gender,
        r.birthDate,
        r.nation,
        r.idNumber,
        r.address,
        r.occupation,
        r.emergencyName,
        r.emergencyPhone,
        r.bloodType,
        r.heightCm,
        r.weightKg,
        r.healthNote,
        r.allergies,
        r.exposureHistory,
        r.pastHistory,
        r.familyHistory,
        r.geneticHistory,
        r.disabilityStatus,
        formatTs(r.updatedAt || r.createTime || r.createdAt),
        r._id || r.id,
      ])
    );
  });
  return lines.join("\r\n");
}

function healthRecordsToCsv(rows) {
  var header = [
    "姓名",
    "手机",
    "性别",
    "年龄",
    "血压",
    "慢病",
    "最近就诊",
    "备注",
    "记录ID",
  ];
  var lines = [rowToLine(header)];
  (rows || []).forEach(function (r) {
    lines.push(
      rowToLine([
        r.name,
        r.phone,
        r.gender,
        r.age,
        r.bloodPressure,
        r.chronic,
        r.lastVisit,
        r.note,
        r._id || r.id,
      ])
    );
  });
  return lines.join("\r\n");
}

function sanitizeFileName(name) {
  return String(name || "export").replace(/[\\/:*?"<>|]/g, "_");
}

/**
 * @param {string} fileBase 不含扩展名
 * @param {string} csvBody 不含 BOM
 * @returns {Promise<{method:string}>}
 */
function writeAndDeliverCsv(fileBase, csvBody) {
  var bom = "\uFEFF";
  var full = bom + csvBody;
  var fileName = sanitizeFileName(fileBase) + ".csv";
  var filePath = wx.env.USER_DATA_PATH + "/" + fileName;
  var fs = wx.getFileSystemManager();

  return new Promise(function (resolve, reject) {
    fs.writeFile({
      filePath: filePath,
      data: full,
      encoding: "utf8",
      success: function () {
        showDeliverMenu(filePath, fileName, full, resolve);
      },
      fail: function (err) {
        reject(err || new Error("writeFile"));
      },
    });
  });
}

function showDeliverMenu(filePath, fileName, fullText, resolve) {
  var items = [];
  var actions = [];
  if (typeof wx.shareFileMessage === "function") {
    items.push("发送文件（微信）");
    actions.push(function () {
      wx.shareFileMessage({
        filePath: filePath,
        fileName: fileName,
        success: function () {
          resolve({ method: "shareFileMessage" });
        },
        fail: function () {
          wx.showToast({ title: "发送失败，可换其它方式", icon: "none" });
          resolve({ method: "shareFileMessage_fail" });
        },
      });
    });
  }
  items.push("其它应用打开");
  actions.push(function () {
    wx.openDocument({
      filePath: filePath,
      showMenu: true,
      success: function () {
        resolve({ method: "openDocument" });
      },
      fail: function () {
        wx.showToast({ title: "无法打开，请试复制", icon: "none" });
        resolve({ method: "openDocument_fail" });
      },
    });
  });
  items.push("复制全部（粘贴到 Excel）");
  actions.push(function () {
    wx.setClipboardData({
      data: fullText,
      success: function () {
        wx.showToast({ title: "已复制", icon: "success" });
        resolve({ method: "clipboard" });
      },
      fail: function () {
        resolve({ method: "clipboard_fail" });
      },
    });
  });

  wx.showActionSheet({
    itemList: items,
    success: function (res) {
      var fn = actions[res.tapIndex];
      if (fn) fn();
      else resolve({ method: "cancel" });
    },
    fail: function () {
      resolve({ method: "cancel" });
    },
  });
}

module.exports = {
  escapeCsv: escapeCsv,
  appointmentsToCsv: appointmentsToCsv,
  residentPersonalArchivesToCsv: residentPersonalArchivesToCsv,
  healthRecordsToCsv: healthRecordsToCsv,
  writeAndDeliverCsv: writeAndDeliverCsv,
};
