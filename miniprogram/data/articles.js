/**
 * 居民端无本地宣教库时的静态兜底，与 educationArticlesSeed 中已发布条目一致（含配图路径）
 */
module.exports = require("./educationArticlesSeed.js").staticFallback;
