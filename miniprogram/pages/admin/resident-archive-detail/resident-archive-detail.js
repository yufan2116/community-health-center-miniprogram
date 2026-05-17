var adminAuth = require("../../../utils/adminAuth.js");
var adminCloud = require("../../../utils/adminCloud.js");

function val(v) {
  var s = String(v == null ? "" : v).trim();
  return s || "—";
}

function rowHasFilledFields(row) {
  var keys = [
    "residentName",
    "gender",
    "birthDate",
    "nation",
    "idNumber",
    "address",
    "occupation",
    "emergencyName",
    "emergencyPhone",
    "bloodType",
    "heightCm",
    "weightKg",
    "healthNote",
    "allergies",
    "exposureHistory",
    "pastHistory",
    "familyHistory",
    "geneticHistory",
    "disabilityStatus",
  ];
  for (var i = 0; i < keys.length; i++) {
    var t = String(row[keys[i]] == null ? "" : row[keys[i]]).trim();
    if (t) return true;
  }
  return false;
}

function buildSections(row) {
  return [    {
      title: "基本信息",
      items: [
        { label: "手机", value: val(row.phone) },
        { label: "姓名", value: val(row.residentName) },
        { label: "性别", value: val(row.gender) },
        { label: "出生日期", value: val(row.birthDate) },
        { label: "民族", value: val(row.nation) },
        { label: "证件号", value: val(row.idNumber) },
        { label: "常住地址", value: val(row.address) },
        { label: "职业", value: val(row.occupation) },
      ],
    },
    {
      title: "紧急联系人",
      items: [
        { label: "姓名", value: val(row.emergencyName) },
        { label: "联系电话", value: val(row.emergencyPhone) },
      ],
    },
    {
      title: "健康信息",
      items: [
        { label: "血型", value: val(row.bloodType) },
        { label: "身高(cm)", value: val(row.heightCm) },
        { label: "体重(kg)", value: val(row.weightKg) },
        { label: "健康状况说明", value: val(row.healthNote) },
      ],
    },
    {
      title: "史况与残疾",
      items: [
        { label: "过敏史", value: val(row.allergies) },
        { label: "暴露史", value: val(row.exposureHistory) },
        { label: "既往史", value: val(row.pastHistory) },
        { label: "家族史", value: val(row.familyHistory) },
        { label: "遗传病史", value: val(row.geneticHistory) },
        { label: "残疾状况", value: val(row.disabilityStatus) },
      ],
    },
  ];
}

Page({
  data: {
    loaded: false,
    error: "",
    sections: [],
  },

  onLoad: function (options) {
    if (!adminAuth.isLoggedIn()) {
      wx.redirectTo({ url: "/pages/admin/login/login" });
      return;
    }
    var phone = options.phone ? decodeURIComponent(options.phone) : "";
    if (!phone) {
      this.setData({ loaded: true, error: "缺少手机号参数" });
      return;
    }
    var that = this;
    adminCloud
      .getPersonalArchiveByPhone(phone)
      .then(function (res) {
        var row = (res && res.data) || {};
        if (!rowHasFilledFields(row)) {
          that.setData({
            loaded: true,
            error: "暂无该手机号的自填档案内容（居民端尚未填写或仅有余号）。",
            sections: [],
          });
          wx.showToast({ title: "暂无档案内容", icon: "none" });
          return;
        }
        that.setData({
          loaded: true,
          error: "",
          sections: buildSections(row),
        });
      })
      .catch(function () {
        that.setData({
          loaded: true,
          error: "内容加载失败，请返回重试。",
          sections: [],
        });
        wx.showToast({ title: "内容加载失败", icon: "none" });
      });  },
});
