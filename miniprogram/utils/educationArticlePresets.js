/**
 * 宣教正文内嵌图：打包目录 miniprogram/images/education-articles/ 下的预设图
 * 正文插入占位 [[IMG:路径]]，居民端 detail 页解析渲染
 * 与 data/educationArticlesSeed.js 中封面使用同一批资源文件名
 */
var P = "/images/education-articles/";

var PRESETS = [
  { key: "general", label: "通用", path: P + "通用.jpg" },
  { key: "general1", label: "通用 2", path: P + "通用1.jpg" },
  { key: "bp", label: "血压", path: P + "血压.jpg" },
  { key: "rhinitis", label: "鼻炎", path: P + "鼻炎.jpg" },
  { key: "lung", label: "肺部", path: P + "肺部问题.jpg" },
  { key: "vessel", label: "血管", path: P + "血管.jpg" },
  { key: "heart", label: "心脏", path: P + "心脏问题.jpg" },
  { key: "viscera", label: "内脏", path: P + "内脏.jpg" },
  { key: "bone", label: "老人骨骼", path: P + "老人骨骼.jpg" },
  { key: "osteoporosis", label: "骨质疏松", path: P + "骨质疏松.jpg" },
  { key: "pregnant", label: "孕妇", path: P + "孕妇.jpg" },
  { key: "teeth", label: "牙齿", path: P + "牙齿.jpg" },
  { key: "insomnia", label: "失眠", path: P + "失眠.jpg" },
  { key: "heat", label: "炎热", path: P + "炎热.jpg" },
  { key: "myopia", label: "近视", path: P + "近视.jpg" },
  { key: "constipation", label: "便秘", path: P + "便秘.jpg" },
  { key: "hp", label: "幽门螺杆菌", path: P + "幽门螺旋杆菌.jpg" },
  { key: "anxiety", label: "焦虑", path: P + "焦虑.jpg" },
];

function list() {
  return PRESETS.slice();
}

function labels() {
  return PRESETS.map(function (p) {
    return p.label;
  });
}

/** 插入正文用的占位（单独成行，便于阅读源码） */
function markerForPath(path) {
  return "\n[[IMG:" + String(path || "").trim() + "]]\n";
}

/**
 * 将正文拆成图文块，供居民端渲染
 * @returns {{ type: 'text', text: string } | { type: 'img', src: string }}[]
 */
function parseBodyToBlocks(content) {
  var s = String(content || "");
  var re = /\[\[IMG:([^\]]+)\]\]/g;
  var blocks = [];
  var last = 0;
  var m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      var text = s.slice(last, m.index);
      if (text) blocks.push({ type: "text", text: text });
    }
    var src = String(m[1] || "").trim();
    if (src) blocks.push({ type: "img", src: src });
    last = re.lastIndex;
  }
  if (last < s.length) {
    var tail = s.slice(last);
    if (tail) blocks.push({ type: "text", text: tail });
  }
  if (!blocks.length) {
    blocks.push({ type: "text", text: s });
  }
  return blocks;
}

module.exports = {
  list: list,
  labels: labels,
  markerForPath: markerForPath,
  parseBodyToBlocks: parseBodyToBlocks,
};
