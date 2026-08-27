/**
 * 数据加载层
 * - ANIMES 为单一数据源：动漫 id / 名称 / 图标 / JSON 文件
 * - CATEGORIES 由 ANIMES 派生（含"全部"）
 * - loadAnime(anime) 按分类懒加载 JSON 并缓存，已加载的分类不会重复请求
 * - loadCategory(catId) 对外暴露：传入 "all" 加载全部，传入分类 id 只加载该分类
 * - loadWallpapers() 一次性加载全部（向后兼容）
 *   原图按动漫分目录存放：images/<anime>/<id>.<ext>
 *   缩略图按动漫分目录存放：thumbs/<anime>/<id>.<ext>（卡片用缩略图，详情/下载用原图）
 */
const ANIMES = [
  { id: "xianni", name: "仙逆", icon: "☽", file: "data/xianni.json" },
  { id: "fanren", name: "凡人修仙传", icon: "☯", file: "data/fanren.json" },
  // { id: "doupo", name: "斗破苍穹", icon: "✦", file: "data/doupo.json" },
  { id: "wanmei", name: "完美世界", icon: "✧", file: "data/wanmei.json" },
  { id: "nezha", name: "哪吒", icon: "◈", file: "data/nezha.json" },
  // { id: "zhetian", name: "遮天", icon: "☀", file: "data/zhetian.json" },
  { id: "jianlai", name: "剑来", icon: "†", file: "data/jianlai.json" },
];

const CATEGORIES = [
  { id: "all", name: "全部", icon: "✦" },
  ...ANIMES.map((a) => ({ id: a.id, name: a.name, icon: a.icon })),
];

/** 分类级缓存：已加载过的分类不会重复 fetch */
const _cache = {};

/** 加载单个动漫的 JSON（带缓存），补齐 category / src / thumb */
async function loadAnime(anime) {
  if (_cache[anime.id]) return _cache[anime.id];
  const res = await fetch(anime.file);
  if (!res.ok) throw new Error(`加载 ${anime.file} 失败: ${res.status}`);
  const items = await res.json();
  _cache[anime.id] = items.map((w) => ({
    ...w,
    category: anime.id,
    src: `images/${anime.id}/${w.id}${w.type}`,
    thumb: `thumbs/${anime.id}/${w.id}${w.type}`,
  }));
  return _cache[anime.id];
}

/** 按分类加载壁纸：传入 "all" 加载全部，传入分类 id 只加载该分类（命中缓存零网络请求） */
async function loadCategory(catId) {
  if (catId === "all") {
    const results = await Promise.all(ANIMES.map(loadAnime));
    return results.flat();
  }
  const anime = ANIMES.find((a) => a.id === catId);
  return anime ? loadAnime(anime) : [];
}

/** 一次性加载全部壁纸（向后兼容，等同于 loadCategory("all") */
async function loadWallpapers() {
  return loadCategory("all");
}

window.__DATA__ = { CATEGORIES, ANIMES, loadWallpapers, loadCategory };
