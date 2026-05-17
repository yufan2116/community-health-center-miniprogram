/**
 * 居民端数据访问层（cloudStore）
 *
 * 【当前为学生作业「本地演示版」】全部数据读写使用 wx.setStorageSync，
 * 不调用 wx.cloud.database()，避免未开通云开发时报错。
 * 后续接入微信云开发数据库时，只需替换本文件与 adminCloud.js 的实现，
 * 保持对外方法签名不变，页面与其它业务模块无需修改。
 *
 * 【演示级隔离】居民端「我的预约」仅展示与当前绑定身份一致的记录；
 * 当前绑定键为 local_resident_bind_phone（演示用手机号）。
 * 后续接云开发可将居民标识替换为 openid，仍通过 getCurrentResidentPhone 等
 * 同名方法返回/写入（内部改为 openid 字段即可）。
 */

var phoneValidate = require("./phoneValidate.js");

/** Storage 键名（与需求一致） */
var KEYS = {
  appointments: "local_appointments",
  feedbacks: "local_feedbacks",
  educationArticles: "local_education_articles",
  healthRecords: "local_health_records",
  recipes: "local_recipes",
  dietPlans: "local_diet_plans",
  departments: "local_departments",
  doctors: "local_doctors",
  /** 宣教列表页顶栏背景图（本地持久路径，管理端上传后写入） */
  educationPageStyle: "local_education_page_style",
  /** 居民自填健康档案（按绑定手机号一条；非中心公卫档案） */
  residentPersonalArchives: "local_resident_personal_archives",
};

/** 当前居民绑定手机号（演示身份）；与食疗、我的预约过滤共用 */
var RESIDENT_PHONE_KEY = "local_resident_bind_phone";

/** 本地 Storage 写入失败时返回给页面的统一提示 */
var LOCAL_STORAGE_FAIL_MSG = "本地存储失败，请清理缓存后重试";

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

/**
 * 统一封装 Storage 写入：失败不抛错，由调用方根据 ok / message 处理
 * @returns {{ ok: true } | { ok: false, error: * }}
 */
function safeSetStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

/** 统一 11 位大陆手机号，避免全角数字、空格、+86 等导致匹配失败 */
function normalizeMobile(p) {
  return phoneValidate.normalizeMainlandMobile(p);
}

/**
 * 演示用手机号的食疗详版文案（居民端展示为多段文字，换行用 \\n）
 */
function getDietPlanDemoTemplates() {
  var adviceHbp = [
    "【重要提示】以下为健康教育演示内容，不能替代医生诊疗与用药调整；头晕、胸闷、胸痛或血压持续偏高请及时就医。",
    "",
    "【饮食原则】",
    "· 限钠：成人每日食盐建议不超过 5 g；少用酱油、豆瓣酱、咸菜、火腿、腊肉及方便面调料包。",
    "· 优脂：少用猪油、黄油；适量选用橄榄油、菜籽油；烹调以蒸、煮、炖、凉拌为主，少煎炸。",
    "· 增钾与纤维：深色叶菜、番茄、菇类、香蕉、豆类适量；主食可搭配燕麦、糙米、红薯等杂粮。",
    "· 足量饮水，限酒；避免空腹大量饮浓茶、浓咖啡。",
    "",
    "【三餐结构建议】",
    "早餐：全谷物或杂粮粥 + 奶类/豆浆 + 少盐小菜。",
    "午晚餐：约 1 拳杂粮主食 + 1 掌优质蛋白（鱼、禽、豆制品）+ 2 拳蔬菜；先菜后饭更易控盐控油。",
    "",
    "【宜选食材举例】",
    "燕麦、小米、山药、芹菜、木耳、海带、豆腐、鱼类、去皮禽肉。",
    "",
    "【宜少或慎选】",
    "腌制品、加工肉制品、浓白汤、动物内脏、含糖饮料、外卖重盐重油菜品。",
    "",
    "【生活配合】",
    "家庭自测血压并记录；规律作息与适度步行；情绪放松。以下为本地演示数据，后续接入云库后仍通过同一接口读取。",
  ].join("\n");

  var adviceDm = [
    "【重要提示】以下为健康教育演示内容，不能替代内分泌科医生制定的个体化饮食与用药方案；口渴多尿加重、乏力或血糖大幅波动请及时就诊。",
    "",
    "【饮食原则】",
    "· 控制总能量与精制碳水：减少白米、白面、甜食、含糖饮料；主食可与糙米、燕麦、荞麦、薯类搭配并定量。",
    "· 少食多餐：三餐定时，必要时增加一次健康加餐（如少量原味坚果、无糖酸奶），避免长时间空腹后暴食。",
    "· 增加膳食纤维：每餐先吃够蔬菜，菌菇、豆制品优先；烹调少油少盐。",
    "· 清淡饮水，限制含糖点心、果汁、蜂蜜水。",
    "",
    "【血糖友好搭配示例】",
    "早餐：杂粮馒头/全麦面包少量 + 鸡蛋或豆腐脑（少卤）+ 凉拌蔬菜。",
    "午晚餐：杂粮饭小份 + 清蒸鱼或瘦肉 + 大量蔬菜；细嚼慢咽，七八分饱。",
    "",
    "【宜选食材举例】",
    "糙米、燕麦、荞麦、绿叶菜、西兰花、蘑菇、海带、豆制品、深海鱼。",
    "",
    "【宜少或慎选】",
    "糖水、蛋糕、糯米制品、油条、含糖酸奶、炼乳、含糖糕点及含糖奶茶。",
    "",
    "【监测与记录】",
    "建议规律监测空腹与餐后血糖并简要记录；复诊时带给医生参考。以下为本地演示数据。",
  ].join("\n");

  return [
    {
      phone: "13800001001",
      residentName: "张三",
      title: "社区食疗指导（高血压风险 · 详版演示）",
      advice: adviceHbp,
      linkedRecipe:
        "山药小米粥（可与后台「通用菜谱」对照用料）；本周可增加凉拌芹菜木耳等低盐小菜。",
    },
    {
      phone: "13800001002",
      residentName: "李四",
      title: "社区食疗指导（2 型糖尿病 · 详版演示）",
      advice: adviceDm,
      linkedRecipe:
        "凉拌木耳黄瓜（低脂高纤维）；加餐可选小番茄、黄瓜条，避免果汁代替水果。",
    },
  ];
}

function writeList(key, arr) {
  return safeSetStorage(key, arr || []);
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
 * 兼容旧逻辑：是否具备云能力（本地演示版恒为 false，占位供未来接云判断）
 */
function isCloudReady() {
  return false;
}

function saveAppointment(record) {
  var rawPhone = String(record.phone || "").trim();
  var phoneNorm = normalizeMobile(rawPhone) || rawPhone;
  var serviceType = String(record.serviceType || "").trim();
  var base = {
    name: String(record.name || "").trim(),
    phone: phoneNorm,
    date: String(record.date || "").trim(),
    serviceType: serviceType,
    category: String(record.category || "门诊").trim(),
    status: String(record.status || "待确认").trim(),
  };
  if (serviceType === "挂号") {
    base.departmentId = String(record.departmentId || "").trim();
    base.departmentName = String(record.departmentName || "").trim();
    base.doctorId = String(record.doctorId || "").trim();
    base.doctorName = String(record.doctorName || "").trim();
  }
  var row = stampNew(base);
  var list = readList(KEYS.appointments);
  list.unshift(row);
  var wr = writeList(KEYS.appointments, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  if (normalizeMobile(phoneNorm)) {
    var pr = setCurrentResidentPhone(phoneNorm);
    if (!pr.ok) {
      return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
    }
  }
  return Promise.resolve({ ok: true, usedLocal: true });
}

/** 管理端/全量列表：不做居民过滤（adminCloud 使用） */
function listAppointments() {
  var list = readList(KEYS.appointments).slice();
  list.sort(function (a, b) {
    return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
  });
  return Promise.resolve(list);
}

/**
 * 居民端「我的预约」：仅返回当前绑定手机号下的记录（过滤逻辑仅此一处）
 */
function listMyAppointments() {
  var mine = getCurrentResidentPhone();
  if (!mine) {
    return Promise.resolve([]);
  }
  var list = readList(KEYS.appointments).slice();
  list = list.filter(function (r) {
    return normalizeMobile(r.phone) === mine;
  });
  list.sort(function (a, b) {
    return (b.createdAt || b.createTime || 0) - (a.createdAt || a.createTime || 0);
  });
  return Promise.resolve(list);
}

function getCurrentResidentPhone() {
  try {
    var raw = wx.getStorageSync(RESIDENT_PHONE_KEY);
    return normalizeMobile(raw) || "";
  } catch (e) {
    return "";
  }
}

function setCurrentResidentPhone(phone) {
  var n = normalizeMobile(phone);
  return safeSetStorage(RESIDENT_PHONE_KEY, n || "");
}

function getResidentBindPhone() {
  return getCurrentResidentPhone();
}

function setResidentBindPhone(phone) {
  return setCurrentResidentPhone(phone);
}

function saveFeedback(record) {
  var row = stampNew({
    content: String(record.content || "").trim(),
    contact: String(record.contact || "").trim(),
  });
  var list = readList(KEYS.feedbacks);
  list.unshift(row);
  var wr = writeList(KEYS.feedbacks, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true, usedLocal: true });
}

function listFeedbacks() {
  var list = readList(KEYS.feedbacks).slice();
  list.sort(function (a, b) {
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return Promise.resolve(list);
}

function saveHealthRecord(data) {
  var list = readList(KEYS.healthRecords);
  var id = data.id || data._id;
  var idx = id != null && id !== "" ? findIndexById(list, id) : -1;
  if (idx >= 0) {
    list[idx] = stampUpdate(list[idx], {
      name: String(data.name != null ? data.name : list[idx].name || "").trim(),
      phone: String(data.phone != null ? data.phone : list[idx].phone || "").trim(),
      gender: String(data.gender != null ? data.gender : list[idx].gender || ""),
      age: data.age != null ? data.age : list[idx].age,
      bloodPressure: String(
        data.bloodPressure != null ? data.bloodPressure : list[idx].bloodPressure || ""
      ),
      chronic: String(data.chronic != null ? data.chronic : list[idx].chronic || ""),
      lastVisit: String(data.lastVisit != null ? data.lastVisit : list[idx].lastVisit || ""),
      note: String(data.note != null ? data.note : list[idx].note || ""),
    });
  } else {
    list.unshift(
      stampNew({
        name: String(data.name || "").trim(),
        phone: String(data.phone || "").trim(),
        gender: String(data.gender || ""),
        age: data.age != null ? data.age : "",
        bloodPressure: String(data.bloodPressure || ""),
        chronic: String(data.chronic || ""),
        lastVisit: String(data.lastVisit || ""),
        note: String(data.note || ""),
      })
    );
  }
  var wr = writeList(KEYS.healthRecords, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

function listHealthRecords() {
  var list = readList(KEYS.healthRecords).slice();
  list.sort(function (a, b) {
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return Promise.resolve(list);
}

function normalizeArticleForResident(d) {
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

function listPublishedArticles() {
  var list = readList(KEYS.educationArticles);
  var rows = list
    .filter(function (d) {
      return d.published === true;
    })
    .map(normalizeArticleForResident);
  rows.sort(function (a, b) {
    return String(b.date || "").localeCompare(String(a.date || ""));
  });
  return Promise.resolve(rows);
}

function saveDietPlan(data) {
  var list = readList(KEYS.dietPlans);
  var phoneNorm = normalizeMobile(data.phone);
  var row = stampNew({
    phone: phoneNorm || String(data.phone || "").replace(/\s/g, ""),
    residentName: String(data.residentName || "").trim(),
    title: String(data.title || "").trim(),
    advice: String(data.advice || "").trim(),
    linkedRecipe: String(data.linkedRecipe || "").trim(),
  });
  list.unshift(row);
  var wr = writeList(KEYS.dietPlans, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

/**
 * 居民端查询前：补齐演示手机号记录；若本地仍为旧版短文则升级为详版（便于演示迭代文案）
 */
function ensureDemoDietPlans() {
  var list = readList(KEYS.dietPlans);
  var templates = getDietPlanDemoTemplates();
  var changed = false;
  templates.forEach(function (d) {
    var want = normalizeMobile(d.phone);
    if (!want) return;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (normalizeMobile(list[i].phone) === want) {
        idx = i;
        break;
      }
    }
    if (idx < 0) {
      list.unshift(
        stampNew({
          phone: want,
          residentName: d.residentName,
          title: d.title,
          advice: d.advice,
          linkedRecipe: d.linkedRecipe,
        })
      );
      changed = true;
      return;
    }
    var row = list[idx];
    var adv = row.advice || "";
    var needsUpgrade =
      adv.length < 120 || adv.indexOf("【饮食原则】") < 0;
    if (needsUpgrade) {
      list[idx] = stampUpdate(row, {
        title: d.title,
        advice: d.advice,
        linkedRecipe: d.linkedRecipe,
        residentName: d.residentName,
      });
      changed = true;
    }
  });
  if (changed) {
    var wr = writeList(KEYS.dietPlans, list);
    if (!wr.ok) {
      /* 静默：读取路径不阻塞 UI */
    }
  }
}

function getDietPlanByPhone(phone) {
  var p = normalizeMobile(phone);
  if (!p) return Promise.resolve(null);
  ensureDemoDietPlans();
  var list = readList(KEYS.dietPlans);
  var best = null;
  var bestTs = 0;
  for (var i = 0; i < list.length; i++) {
    var rowPhone = normalizeMobile(list[i].phone);
    if (!rowPhone || rowPhone !== p) continue;
    var ts = list[i].createdAt || list[i].createTime || 0;
    if (ts >= bestTs) {
      bestTs = ts;
      best = list[i];
    }
  }
  return Promise.resolve(best);
}

function listDepartments() {
  var list = readList(KEYS.departments).slice();
  list.sort(function (a, b) {
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
  return Promise.resolve(list);
}

/**
 * @param {string} [departmentId] 若传入则只返回该科室下的医生
 */
function listDoctors(departmentId) {
  var list = readList(KEYS.doctors).slice();
  if (departmentId != null && String(departmentId).trim() !== "") {
    var sid = String(departmentId);
    list = list.filter(function (d) {
      return String(d.departmentId || "") === sid;
    });
  }
  list.sort(function (a, b) {
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
  return Promise.resolve(list);
}

function saveDepartment(data) {
  var list = readList(KEYS.departments);
  var id = data.id || data._id;
  var name = String(data.name || "").trim();
  if (!name) return Promise.reject(new Error("empty_name"));
  if (id) {
    var idx = findIndexById(list, id);
    if (idx < 0) return Promise.reject(new Error("not_found"));
    list[idx] = stampUpdate(list[idx], { name: name });
  } else {
    list.unshift(stampNew({ name: name }));
  }
  var wr = writeList(KEYS.departments, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

function deleteDepartment(id) {
  var list = readList(KEYS.departments);
  var idx = findIndexById(list, id);
  if (idx < 0) return Promise.reject(new Error("not_found"));
  var sid = String(list[idx].id || list[idx]._id || "");
  list.splice(idx, 1);
  var wr1 = writeList(KEYS.departments, list);
  if (!wr1.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  var docs = readList(KEYS.doctors).filter(function (d) {
    return String(d.departmentId || "") !== sid;
  });
  var wr2 = writeList(KEYS.doctors, docs);
  if (!wr2.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

function saveDoctor(data) {
  var list = readList(KEYS.doctors);
  var id = data.id || data._id;
  var name = String(data.name || "").trim();
  var departmentId = String(data.departmentId || "").trim();
  if (!name) return Promise.reject(new Error("empty_name"));
  if (!departmentId) return Promise.reject(new Error("empty_department"));
  var depts = readList(KEYS.departments);
  if (findIndexById(depts, departmentId) < 0) return Promise.reject(new Error("bad_department"));
  if (id) {
    var idx = findIndexById(list, id);
    if (idx < 0) return Promise.reject(new Error("not_found"));
    list[idx] = stampUpdate(list[idx], {
      name: name,
      departmentId: departmentId,
    });
  } else {
    list.unshift(
      stampNew({
        name: name,
        departmentId: departmentId,
      })
    );
  }
  var wr = writeList(KEYS.doctors, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

function deleteDoctor(id) {
  var list = readList(KEYS.doctors);
  var idx = findIndexById(list, id);
  if (idx < 0) return Promise.reject(new Error("not_found"));
  list.splice(idx, 1);
  var wr = writeList(KEYS.doctors, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

// —— 演示种子数据（各键为空数组时才写入）——

/** 种子科室 ID 与医生引用保持一致，便于演示「挂号」预约 */
var SEED_DEPT_GP = "seed_dept_gp";
var SEED_DEPT_CHILD = "seed_dept_child";

function seedDepartmentRows() {
  var t = now();
  function one(id, name) {
    return {
      id: id,
      _id: id,
      createdAt: t,
      updatedAt: t,
      createTime: t,
      name: name,
    };
  }
  return [one(SEED_DEPT_GP, "全科门诊"), one(SEED_DEPT_CHILD, "儿童保健科")];
}

function seedDoctorRows() {
  var t = now();
  function one(id, name, departmentId) {
    return {
      id: id,
      _id: id,
      createdAt: t,
      updatedAt: t,
      createTime: t,
      name: name,
      departmentId: departmentId,
    };
  }
  return [
    one("seed_doc_1", "张医生", SEED_DEPT_GP),
    one("seed_doc_2", "李医生", SEED_DEPT_GP),
    one("seed_doc_3", "王医生", SEED_DEPT_CHILD),
  ];
}

function seedAppointmentsRows() {
  var baseTs = now();
  /** offsetMin：每条预约提交时间错开，便于列表按时间排序演示 */
  function one(name, phone, date, st, cat, status, offsetMin, extra) {
    var ts = baseTs - (offsetMin || 0) * 60000;
    var id = genId();
    var row = {
      id: id,
      _id: id,
      createdAt: ts,
      updatedAt: ts,
      createTime: ts,
      name: name,
      phone: phone,
      date: date,
      serviceType: st,
      category: cat,
      status: status,
    };
    if (extra && typeof extra === "object") {
      Object.keys(extra).forEach(function (k) {
        row[k] = extra[k];
      });
    }
    return row;
  }
  return [
    /** 与食疗演示、公卫种子同号，便于「我的预约」联调 */
    one("张三", "13800001001", "2026-05-13", "慢病管理", "家庭医生", "已确认", -2),
    one("李四", "13800001002", "2026-05-14", "慢病管理", "家庭医生", "待确认", -1),
    one("王芳", "13800001003", "2026-05-15", "疫苗接种", "疫苗", "待确认", 0),
    one("赵强", "13800001004", "2026-05-16", "健康体检", "门诊", "待确认", 1),
    one("孙丽", "13800001005", "2026-05-18", "慢病管理", "家庭医生", "待确认", 2),
    one("陈明", "13800001006", "2026-05-20", "儿童保健", "门诊", "待确认", 3),
    one("刘洋", "13800001007", "2026-05-21", "疫苗接种", "疫苗", "待确认", 4),
    one("周敏", "13800001001", "2026-05-12", "健康体检", "门诊", "已确认", 5),
    one("吴磊", "13800001008", "2026-05-22", "全科诊疗", "门诊", "待确认", 6),
    one("郑洁", "13800001002", "2026-05-19", "慢病管理", "家庭医生", "待确认", 7),
    one("何静", "13800001009", "2026-05-23", "儿童保健", "门诊", "待确认", 8),
    one("马超", "13800001010", "2026-05-24", "健康体检", "门诊", "待确认", 9),
    one(
      "演示挂号",
      "13800001011",
      "2026-05-25",
      "挂号",
      "门诊",
      "待确认",
      10,
      {
        departmentId: SEED_DEPT_GP,
        departmentName: "全科门诊",
        doctorId: "seed_doc_1",
        doctorName: "张医生",
      }
    ),
  ];
}

function seedHealthRows() {
  var t = now();
  function one(name, phone, gender, age, bp, chronic, last, note) {
    var id = genId();
    return {
      id: id,
      _id: id,
      createdAt: t,
      updatedAt: t,
      createTime: t,
      name: name,
      phone: phone,
      gender: gender,
      age: age,
      bloodPressure: bp,
      chronic: chronic,
      lastVisit: last,
      note: note,
    };
  }
  return [
    one(
      "张三",
      "13800001001",
      "男",
      62,
      "135/85",
      "高血压",
      "2026-04-10",
      "规律服药，低盐饮食（演示）"
    ),
    one(
      "李四",
      "13800001002",
      "女",
      58,
      "118/76",
      "2型糖尿病",
      "2026-04-22",
      "血糖监测中（演示）"
    ),
    one(
      "王芳",
      "13800001003",
      "女",
      45,
      "128/82",
      "高血压、血脂异常",
      "2026-05-05",
      "家庭医生签约随访，建议复查血脂（演示）"
    ),
    one(
      "赵强",
      "13800001004",
      "男",
      52,
      "142/92",
      "高血压、冠心病",
      "2026-05-08",
      "规律服药，避免剧烈运动；不适随诊（演示）"
    ),
    one(
      "孙丽",
      "13800001005",
      "女",
      67,
      "120/70",
      "2型糖尿病、骨质疏松",
      "2026-05-12",
      "年度体检骨密度偏低，补钙与防跌倒宣教（演示）"
    ),
    one(
      "陈明",
      "13800001006",
      "男",
      9,
      "—/—",
      "—",
      "2026-05-14",
      "儿童保健建档，生长发育正常（演示）"
    ),
    one(
      "刘洋",
      "13800001007",
      "男",
      71,
      "132/78",
      "慢阻肺",
      "2026-05-16",
      "戒烟宣教，吸入药物规范使用指导（演示）"
    ),
    one(
      "徐敏",
      "13800001008",
      "女",
      55,
      "126/80",
      "高脂血症",
      "2026-05-18",
      "饮食运动干预，3个月后复查血脂（演示）"
    ),
    one(
      "高飞",
      "13800001009",
      "男",
      48,
      "130/85",
      "脂肪肝、超重",
      "2026-05-19",
      "体重管理门诊转诊建议（演示）"
    ),
    one(
      "林悦",
      "13800001010",
      "女",
      35,
      "112/72",
      "甲状腺功能减退（随访）",
      "2026-05-20",
      "规律复查甲功，按医嘱调整药量（演示）"
    ),
  ];
}

function seedResidentPersonalArchiveRows() {
  var samples = [
    {
      phone: "13800001001",
      residentName: "张三",
      gender: "男",
      birthDate: "1963-08-12",
      nation: "汉族",
      idNumber: "4521********1234",
      address: "南宁市青秀区民族大道××小区×栋（演示）",
      occupation: "退休职工",
      emergencyName: "张亮",
      emergencyPhone: "13900001001",
      bloodType: "A",
      heightCm: "168",
      weightKg: "72",
      healthNote: "高血压随访，血压控制尚可。",
      allergies: "青霉素（演示标注）",
      exposureHistory: "无职业性粉尘接触史",
      pastHistory: "高血压约8年",
      familyHistory: "父亲患高血压",
      geneticHistory: "无特殊",
      disabilityStatus: "无",
    },
    {
      phone: "13800001002",
      residentName: "李四",
      gender: "女",
      birthDate: "1968-03-20",
      nation: "汉族",
      idNumber: "4501********5678",
      address: "××市××区××路××号（演示）",
      occupation: "会计",
      emergencyName: "王强",
      emergencyPhone: "13900001002",
      bloodType: "O",
      heightCm: "158",
      weightKg: "64",
      healthNote: "2型糖尿病，饮食与运动管理。",
      allergies: "无已知药物过敏",
      exposureHistory: "无",
      pastHistory: "2型糖尿病5年",
      familyHistory: "母亲有糖尿病",
      geneticHistory: "无",
      disabilityStatus: "无",
    },
    {
      phone: "13800001003",
      residentName: "王芳",
      gender: "女",
      birthDate: "1981-11-05",
      nation: "壮族",
      idNumber: "4501********9012",
      address: "××市××区××社区（演示）",
      occupation: "社区工作人员",
      emergencyName: "李勇",
      emergencyPhone: "13900001003",
      bloodType: "B",
      heightCm: "162",
      weightKg: "58",
      healthNote: "血脂偏高，生活方式干预中。",
      allergies: "海鲜轻度过敏（演示）",
      exposureHistory: "无",
      pastHistory: "血脂异常2年",
      familyHistory: "父母均有高血压",
      geneticHistory: "无",
      disabilityStatus: "无",
    },
    {
      phone: "13800001004",
      residentName: "赵强",
      gender: "男",
      birthDate: "1973-06-18",
      nation: "汉族",
      idNumber: "4501********3456",
      address: "南宁市青秀区伶俐镇××村（演示）",
      occupation: "司机",
      emergencyName: "赵丽",
      emergencyPhone: "13900001004",
      bloodType: "AB",
      heightCm: "172",
      weightKg: "82",
      healthNote: "冠心病支架术后随访（演示）。",
      allergies: "无",
      exposureHistory: "长期驾驶，久坐为主",
      pastHistory: "冠心病、PCI术后",
      familyHistory: "兄弟有高血压",
      geneticHistory: "无",
      disabilityStatus: "无",
    },
    {
      phone: "13800001005",
      residentName: "孙丽",
      gender: "女",
      birthDate: "1959-01-30",
      nation: "汉族",
      idNumber: "4501********7890",
      address: "南宁市青秀区仙葫××苑（演示）",
      occupation: "家务",
      emergencyName: "孙浩",
      emergencyPhone: "13900001005",
      bloodType: "A",
      heightCm: "155",
      weightKg: "60",
      healthNote: "骨质疏松与糖尿病综合管理。",
      allergies: "无",
      exposureHistory: "无",
      pastHistory: "2型糖尿病、骨质疏松",
      familyHistory: "姐妹有骨质疏松",
      geneticHistory: "无",
      disabilityStatus: "无",
    },
  ];
  return samples.map(function (s) {
    var p = normalizeMobile(s.phone);
    var base = Object.assign({ phone: p }, pickPersonalArchiveFields(s));
    return stampNew(base);
  });
}

function seedArticleRows() {
  var t = now();
  var defs = require("../data/educationArticlesSeed.js").seedRows;
  return defs.map(function (d) {
    var id = genId();
    return {
      id: id,
      _id: id,
      createdAt: t,
      updatedAt: t,
      createTime: t,
      title: d.title,
      summary: d.summary,
      content: d.content,
      date: d.date,
      published: !!d.published,
      coverImage: String(d.coverImage || "").trim(),
    };
  });
}

function seedRecipeRows() {
  var t = now();
  function one(title, tags, ing, steps) {
    var id = genId();
    return {
      id: id,
      _id: id,
      createdAt: t,
      updatedAt: t,
      createTime: t,
      title: title,
      tags: tags,
      ingredients: ing,
      steps: steps,
    };
  }
  return [
    one(
      "山药小米粥",
      "健脾、清淡",
      "小米 50g，山药 100g，水适量",
      "小米洗净，山药切块，同煮至粘稠即可。"
    ),
    one(
      "凉拌木耳黄瓜",
      "低脂、爽口",
      "木耳、黄瓜、蒜末、醋少许",
      "木耳泡发焯熟，与黄瓜条拌匀即可。"
    ),
  ];
}

function seedDietPlanRows() {
  var templates = getDietPlanDemoTemplates();
  return templates.map(function (d) {
    var id = genId();
    return {
      id: id,
      _id: id,
      createdAt: now(),
      updatedAt: now(),
      createTime: now(),
      phone: d.phone,
      residentName: d.residentName,
      title: d.title,
      advice: d.advice,
      linkedRecipe: d.linkedRecipe,
    };
  });
}

function readEducationPageStyleRaw() {
  try {
    var v = wx.getStorageSync(KEYS.educationPageStyle);
    if (v && typeof v === "object" && !Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim()) {
      var o = JSON.parse(v);
      if (o && typeof o === "object" && !Array.isArray(o)) return o;
    }
  } catch (e) {}
  return { heroImagePath: "" };
}

function getEducationPageStyle() {
  var o = readEducationPageStyleRaw();
  return Promise.resolve({
    heroImagePath: String(o.heroImagePath || "").trim(),
    updatedAt: o.updatedAt || 0,
  });
}

function setEducationPageHeroImage(savedFilePath) {
  var path = String(savedFilePath || "").trim();
  var wr = safeSetStorage(KEYS.educationPageStyle, {
    heroImagePath: path,
    updatedAt: now(),
  });
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

function clearEducationPageHeroImage() {
  var wr = safeSetStorage(KEYS.educationPageStyle, {
    heroImagePath: "",
    updatedAt: now(),
  });
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

function blankPersonalArchive(phoneNorm) {
  var p = String(phoneNorm || "").trim();
  return {
    phone: p,
    residentName: "",
    gender: "",
    birthDate: "",
    nation: "",
    idNumber: "",
    address: "",
    occupation: "",
    emergencyName: "",
    emergencyPhone: "",
    bloodType: "",
    heightCm: "",
    weightKg: "",
    healthNote: "",
    allergies: "",
    exposureHistory: "",
    pastHistory: "",
    familyHistory: "",
    geneticHistory: "",
    disabilityStatus: "",
  };
}

function findPersonalArchiveIndex(list, phoneNorm) {
  if (!phoneNorm) return -1;
  for (var i = 0; i < list.length; i++) {
    if (normalizeMobile(list[i].phone) === phoneNorm) return i;
  }
  return -1;
}

function mergePersonalArchiveRow(existing, phoneNorm) {
  var b = blankPersonalArchive(phoneNorm);
  if (!existing) return b;
  Object.keys(b).forEach(function (k) {
    if (k === "phone") return;
    if (existing[k] != null) b[k] = existing[k];
  });
  b.phone = phoneNorm;
  return b;
}

function pickPersonalArchiveFields(record) {
  var r = record || {};
  return {
    residentName: String(r.residentName != null ? r.residentName : "").trim(),
    gender: String(r.gender != null ? r.gender : "").trim(),
    birthDate: String(r.birthDate != null ? r.birthDate : "").trim(),
    nation: String(r.nation != null ? r.nation : "").trim(),
    idNumber: String(r.idNumber != null ? r.idNumber : "").trim(),
    address: String(r.address != null ? r.address : "").trim(),
    occupation: String(r.occupation != null ? r.occupation : "").trim(),
    emergencyName: String(r.emergencyName != null ? r.emergencyName : "").trim(),
    emergencyPhone: String(r.emergencyPhone != null ? r.emergencyPhone : "").trim(),
    bloodType: String(r.bloodType != null ? r.bloodType : "").trim(),
    heightCm: String(r.heightCm != null ? r.heightCm : "").trim(),
    weightKg: String(r.weightKg != null ? r.weightKg : "").trim(),
    healthNote: String(r.healthNote != null ? r.healthNote : "").trim(),
    allergies: String(r.allergies != null ? r.allergies : "").trim(),
    exposureHistory: String(r.exposureHistory != null ? r.exposureHistory : "").trim(),
    pastHistory: String(r.pastHistory != null ? r.pastHistory : "").trim(),
    familyHistory: String(r.familyHistory != null ? r.familyHistory : "").trim(),
    geneticHistory: String(r.geneticHistory != null ? r.geneticHistory : "").trim(),
    disabilityStatus: String(r.disabilityStatus != null ? r.disabilityStatus : "").trim(),
  };
}

function getResidentPersonalArchiveByPhone(rawPhone) {
  var p = normalizeMobile(rawPhone);
  if (!p) return Promise.resolve(blankPersonalArchive(""));
  var list = readList(KEYS.residentPersonalArchives);
  var idx = findPersonalArchiveIndex(list, p);
  var merged =
    idx >= 0 ? mergePersonalArchiveRow(list[idx], p) : blankPersonalArchive(p);
  return Promise.resolve(merged);
}

function saveResidentPersonalArchive(record) {
  var p = normalizeMobile(record && record.phone);
  if (!p) return Promise.reject(new Error("no_phone"));
  var patch = pickPersonalArchiveFields(record);
  patch.phone = p;
  var list = readList(KEYS.residentPersonalArchives).slice();
  var idx = findPersonalArchiveIndex(list, p);
  if (idx >= 0) {
    list[idx] = stampUpdate(list[idx], patch);
  } else {
    list.unshift(stampNew(patch));
  }
  var wr = writeList(KEYS.residentPersonalArchives, list);
  if (!wr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  var pr = setCurrentResidentPhone(p);
  if (!pr.ok) {
    return Promise.resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
  }
  return Promise.resolve({ ok: true });
}

function listResidentPersonalArchives() {
  var list = readList(KEYS.residentPersonalArchives).slice();
  list.sort(function (a, b) {
    return (b.updatedAt || b.createTime || 0) - (a.updatedAt || a.createTime || 0);
  });
  return Promise.resolve(list);
}

/**
 * 若对应 Storage 为空则写入演示数据（不覆盖已有数据）
 */
function runSeed() {
  return new Promise(function (resolve) {
    try {
      var filled = [];
      if (!readList(KEYS.departments).length) {
        var w0 = writeList(KEYS.departments, seedDepartmentRows());
        if (!w0.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("departments");
      }
      if (!readList(KEYS.doctors).length) {
        var w1 = writeList(KEYS.doctors, seedDoctorRows());
        if (!w1.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("doctors");
      }
      if (!readList(KEYS.appointments).length) {
        var w2 = writeList(KEYS.appointments, seedAppointmentsRows());
        if (!w2.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("appointments");
      }
      if (!readList(KEYS.healthRecords).length) {
        var w3 = writeList(KEYS.healthRecords, seedHealthRows());
        if (!w3.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("health_records");
      }
      if (!readList(KEYS.residentPersonalArchives).length) {
        var w3a = writeList(
          KEYS.residentPersonalArchives,
          seedResidentPersonalArchiveRows()
        );
        if (!w3a.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("resident_personal_archives");
      }
      if (!readList(KEYS.educationArticles).length) {
        var w4 = writeList(KEYS.educationArticles, seedArticleRows());
        if (!w4.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("education_articles");
      }
      if (!readList(KEYS.recipes).length) {
        var w5 = writeList(KEYS.recipes, seedRecipeRows());
        if (!w5.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("recipes");
      }
      if (!readList(KEYS.dietPlans).length) {
        var w6 = writeList(KEYS.dietPlans, seedDietPlanRows());
        if (!w6.ok) {
          resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
          return;
        }
        filled.push("diet_plans");
      }
      resolve({ ok: true, filled: filled });
    } catch (e) {
      resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
    }
  });
}

/**
 * 移除本演示项目使用的业务 Storage 键（不含管理员登录键 isAdmin）。
 * 会一并清除居民绑定手机号、意见反馈、宣教顶栏样式等上述 KEYS 与遗留会话键。
 */
function clearLocalDemoStorage() {
  return new Promise(function (resolve) {
    try {
      var bad = false;
      Object.keys(KEYS).forEach(function (name) {
        try {
          wx.removeStorageSync(KEYS[name]);
        } catch (e) {
          bad = true;
        }
      });
      try {
        wx.removeStorageSync(RESIDENT_PHONE_KEY);
      } catch (e1) {
        bad = true;
      }
      try {
        wx.removeStorageSync("nh_admin_demo_session_v1");
      } catch (e2) {
        /* 旧版会话键，忽略 */
      }
      resolve(
        bad
          ? { ok: false, message: LOCAL_STORAGE_FAIL_MSG }
          : { ok: true, cleared: true }
      );
    } catch (e) {
      resolve({ ok: false, message: LOCAL_STORAGE_FAIL_MSG });
    }
  });
}

/** 先清空业务演示键，再写入全套演示数据（覆盖式「重新初始化」） */
function runSeedForce() {
  return clearLocalDemoStorage().then(function (step1) {
    if (!step1.ok) return step1;
    return runSeed();
  });
}

module.exports = {
  /** 与 Storage 键一致，供 adminCloud 同步读写 */
  KEYS: KEYS,
  safeSetStorage: safeSetStorage,
  LOCAL_STORAGE_FAIL_MSG: LOCAL_STORAGE_FAIL_MSG,
  isCloudReady: isCloudReady,
  saveAppointment: saveAppointment,
  listAppointments: listAppointments,
  listMyAppointments: listMyAppointments,
  getCurrentResidentPhone: getCurrentResidentPhone,
  setCurrentResidentPhone: setCurrentResidentPhone,
  saveFeedback: saveFeedback,
  listFeedbacks: listFeedbacks,
  saveHealthRecord: saveHealthRecord,
  listHealthRecords: listHealthRecords,
  listPublishedArticles: listPublishedArticles,
  saveDietPlan: saveDietPlan,
  getDietPlanByPhone: getDietPlanByPhone,
  ensureDemoDietPlans: ensureDemoDietPlans,
  getResidentBindPhone: getResidentBindPhone,
  setResidentBindPhone: setResidentBindPhone,
  RESIDENT_PHONE_KEY: RESIDENT_PHONE_KEY,
  runSeed: runSeed,
  clearLocalDemoStorage: clearLocalDemoStorage,
  runSeedForce: runSeedForce,
  listDepartments: listDepartments,
  listDoctors: listDoctors,
  saveDepartment: saveDepartment,
  deleteDepartment: deleteDepartment,
  saveDoctor: saveDoctor,
  deleteDoctor: deleteDoctor,
  getEducationPageStyle: getEducationPageStyle,
  setEducationPageHeroImage: setEducationPageHeroImage,
  clearEducationPageHeroImage: clearEducationPageHeroImage,
  getResidentPersonalArchiveByPhone: getResidentPersonalArchiveByPhone,
  saveResidentPersonalArchive: saveResidentPersonalArchive,
  listResidentPersonalArchives: listResidentPersonalArchives,
};
