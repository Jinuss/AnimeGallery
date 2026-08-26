/**
 * 数据加载层
 * - ANIMES 为单一数据源：动漫 id / 名称 / 图标 / JSON 文件
 * - CATEGORIES 由 ANIMES 派生（含"全部"）
 * - loadWallpapers() 异步拉取各动漫 JSON，合并并补齐 category / 图片路径
 *   图片按动漫分目录存放：images/<anime>/<id>.png
 */
const ANIMES = [
  { id: "xianni", name: "仙逆", icon: "☽", file: "data/xianni.json" },
  { id: "fanren", name: "凡人修仙传", icon: "☯", file: "data/fanren.json" },
  // { id: "doupo", name: "斗破苍穹", icon: "✦", file: "data/doupo.json" },
  { id: "wanmei", name: "完美世界", icon: "✧", file: "data/wanmei.json" },
  // { id: "douluo", name: "斗罗大陆", icon: "◈", file: "data/douluo.json" },
  // { id: "zhetian", name: "遮天", icon: "☀", file: "data/zhetian.json" },
  { id: "jianlai", name: "剑来", icon: "†", file: "data/jianlai.json" },
];

const CATEGORIES = [
  { id: "all", name: "全部", icon: "✦" },
  ...ANIMES.map((a) => ({ id: a.id, name: a.name, icon: a.icon })),
];

/** 异步加载全部壁纸（合并 + 补齐 category / src / thumb，保持 ANIMES 顺序） */
async function loadWallpapers() {
  const results = await Promise.all(
    ANIMES.map(async (a) => {
      const res = await fetch(a.file);
      if (!res.ok) throw new Error(`加载 ${a.file} 失败: ${res.status}`);
      const items = await res.json();
      return items.map((w) => ({
        ...w,
        category: a.id,
        src: `images/${a.id}/${w.id}${w.type}`,
        thumb: `images/${a.id}/${w.id}${w.type}`,
      }));
    }),
  );
  return results.flat();
}

window.__DATA__ = { CATEGORIES, ANIMES, loadWallpapers };
