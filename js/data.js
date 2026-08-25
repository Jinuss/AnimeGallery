/**
 * 壁纸数据源
 * 分类 + 壁纸条目；image 通过 text_to_image 接口动态生成。
 */

const IMAGE_API = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image";

/**
 * 根据提示词与尺寸生成图片地址
 * @param {string} prompt
 * @param {string} size - square_hd | square | portrait_4_3 | portrait_16_9 | landscape_4_3 | landscape_16_9
 */
function buildImage(prompt, size = "portrait_4_3") {
  return `${IMAGE_API}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

const CATEGORIES = [
  { id: "all",      name: "全部",   icon: "✦" },
  { id: "character", name: "人物",   icon: "❀" },
  { id: "scenery",   name: "风景",   icon: "⛰" },
  { id: "mecha",     name: "机甲",   icon: "⚙" },
  { id: "cyber",     name: "赛博",   icon: "◇" },
  { id: "classic",   name: "古风",   icon: "❖" },
  { id: "healing",   name: "治愈",   icon: "✿" }
];

const WALLPAPERS = [
  // ========== 人物 ==========
  {
    id: "c01", category: "character", title: "银发少女",
    desc: "晨光中的银发少女，仰望飘落的花瓣。",
    prompt: "anime girl with long silver hair, soft morning light, falling cherry petals, delicate facial features, detailed eyes, studio quality, cinematic lighting, 8k",
    size: "portrait_4_3", tags: ["银发", "晨光", "少女"]
  },
  {
    id: "c02", category: "character", title: "蓝眸法师",
    desc: "身着长袍的青年法师，凝视远方。",
    prompt: "anime boy mage wearing dark robe, glowing blue eyes, fantasy atmosphere, magic particles, dramatic rim light, highly detailed, painterly style",
    size: "portrait_4_3", tags: ["法师", "蓝眸", "奇幻"]
  },
  {
    id: "c03", category: "character", title: "海边少女",
    desc: "海边迎风的少女，裙摆与发丝飞扬。",
    prompt: "anime girl standing on beach, wind blowing hair and dress, golden sunset, ocean waves, warm color palette, soft bokeh, cinematic anime style",
    size: "portrait_4_3", tags: ["海边", "夕阳", "少女"]
  },
  {
    id: "c04", category: "character", title: "雨中行者",
    desc: "撑伞的少女在霓虹雨夜中独行。",
    prompt: "anime girl with umbrella walking alone in neon rainy night, reflections on wet street, cinematic mood, moody lighting, detailed anime illustration",
    size: "portrait_4_3", tags: ["雨夜", "霓虹", "独行"]
  },
  {
    id: "c05", category: "character", title: "花海少女",
    desc: "伫立于紫色花海中的少女。",
    prompt: "anime girl standing in endless purple flower field, wind blowing, dreamy sky, soft pastel colors, painterly anime, scenic composition",
    size: "portrait_4_3", tags: ["花海", "梦幻", "少女"]
  },

  // ========== 风景 ==========
  {
    id: "s01", category: "scenery", title: "云端浮岛",
    desc: "悬浮于云海之上的孤岛与瀑布。",
    prompt: "floating island above clouds, waterfall into sky, fantasy landscape, soft sunrise light, ghibli inspired, detailed anime scenery, panoramic",
    size: "landscape_16_9", tags: ["浮岛", "云海", "幻想"]
  },
  {
    id: "s02", category: "scenery", title: "雪国静谧",
    desc: "雪山小镇的清晨，炊烟袅袅。",
    prompt: "snowy mountain village at dawn, smoke from chimneys, soft pink sky, pine trees, anime scenery, ghibli style, peaceful atmosphere, wide shot",
    size: "landscape_16_9", tags: ["雪国", "小镇", "清晨"]
  },
  {
    id: "s03", category: "scenery", title: "星河湖泊",
    desc: "映照银河的高山湖泊。",
    prompt: "milky way reflected on alpine lake at night, silhouetted mountains, ultra detailed anime scenery, starry sky, cinematic, vivid colors",
    size: "landscape_16_9", tags: ["星河", "湖泊", "夜空"]
  },
  {
    id: "s04", category: "scenery", title: "秋日林道",
    desc: "金红色秋叶铺满的林间小路。",
    prompt: "autumn forest path covered with golden red leaves, sun rays through trees, anime scenery, warm palette, ghibli inspired, painterly",
    size: "landscape_16_9", tags: ["秋日", "林道", "落叶"]
  },

  // ========== 机甲 ==========
  {
    id: "m01", category: "mecha", title: "黎明机甲",
    desc: "黎明中伫立的巨型机甲，云层环绕。",
    prompt: "giant mecha robot standing at dawn, clouds around legs, detailed mechanical design, dramatic lighting, anime style, cinematic composition",
    size: "portrait_4_3", tags: ["机甲", "黎明", "巨型"]
  },
  {
    id: "m02", category: "mecha", title: "城市守卫",
    desc: "守卫未来都市的飞行机甲。",
    prompt: "flying mecha guardian over futuristic city, neon lights, detailed mechanical parts, dynamic pose, anime illustration, dramatic sky",
    size: "portrait_4_3", tags: ["机甲", "都市", "飞行"]
  },
  {
    id: "m03", category: "mecha", title: "废墟遗甲",
    desc: "废弃于荒漠中的旧世代机甲。",
    prompt: "abandoned old mecha in desert ruins, sandstorm, weathered armor, dramatic sunset, anime style, cinematic, detailed mechanical design",
    size: "portrait_4_3", tags: ["机甲", "废墟", "荒漠"]
  },
  {
    id: "m04", category: "mecha", title: "深蓝舰桥",
    desc: "宇宙舰桥之上的孤甲背影。",
    prompt: "mecha silhouette on spaceship bridge, deep space background, blue color palette, stars, anime style, cinematic mood, detailed",
    size: "portrait_4_3", tags: ["机甲", "宇宙", "深蓝"]
  },

  // ========== 赛博朋克 ==========
  {
    id: "y01", category: "cyber", title: "霓虹街巷",
    desc: "雨后霓虹倒映的赛博小巷。",
    prompt: "cyberpunk alley after rain, neon signs reflections, steam, detailed anime style, purple and cyan palette, cinematic, atmospheric",
    size: "portrait_4_3", tags: ["霓虹", "小巷", "赛博"]
  },
  {
    id: "y02", category: "cyber", title: "全息都市",
    desc: "全息广告铺天盖地的未来都市。",
    prompt: "futuristic cyberpunk city with huge holographic ads, flying cars, neon lights, dense buildings, anime style, cinematic wide shot",
    size: "landscape_16_9", tags: ["全息", "都市", "未来"]
  },
  {
    id: "y03", category: "cyber", title: "数据行者",
    desc: "身披电子斗篷的赛博行者。",
    prompt: "cyberpunk traveler wearing electronic glowing cloak, neon city background, data particles, detailed anime illustration, cinematic",
    size: "portrait_4_3", tags: ["赛博", "行者", "数据"]
  },
  {
    id: "y04", category: "cyber", title: "夜港船坞",
    desc: "霓虹笼罩的赛博港口。",
    prompt: "cyberpunk harbor at night, neon lights on water, docked ships, fog, anime scenery, purple cyan palette, atmospheric, detailed",
    size: "landscape_16_9", tags: ["夜港", "船坞", "霓虹"]
  },

  // ========== 古风 ==========
  {
    id: "g01", category: "classic", title: "山寺秋枫",
    desc: "深山古寺与漫山红枫。",
    prompt: "ancient mountain temple surrounded by red maple trees, mist, traditional eastern architecture, anime scenery, ink wash influence, cinematic",
    size: "landscape_16_9", tags: ["古寺", "红枫", "山雾"]
  },
  {
    id: "g02", category: "classic", title: "月下长廊",
    desc: "月光洒落下的木质长廊。",
    prompt: "wooden corridor under moonlight, traditional eastern palace, lanterns, shadows, anime scenery, serene mood, detailed, cinematic",
    size: "portrait_4_3", tags: ["月下", "长廊", "宫阙"]
  },
  {
    id: "g03", category: "classic", title: "水墨竹影",
    desc: "水墨风格的竹林深处。",
    prompt: "bamboo forest in ink wash painting style, misty, lone figure with umbrella, eastern aesthetic, anime scenery, monochrome with red accent",
    size: "portrait_4_3", tags: ["水墨", "竹林", "东方"]
  },
  {
    id: "g04", category: "classic", title: "鹤舞霞光",
    desc: "霞光中飞舞的仙鹤与远山。",
    prompt: "flying cranes at sunrise over distant mountains, golden light, traditional eastern scenery, anime style, elegant composition, detailed",
    size: "landscape_16_9", tags: ["仙鹤", "霞光", "远山"]
  },

  // ========== 治愈 ==========
  {
    id: "h01", category: "healing", title: "窗边咖啡",
    desc: "午后阳光下的窗边咖啡与猫。",
    prompt: "coffee by window in afternoon sunlight, sleeping cat, cozy room, plants, anime style, warm soft palette, healing atmosphere, detailed",
    size: "portrait_4_3", tags: ["咖啡", "午后", "猫咪"]
  },
  {
    id: "h02", category: "healing", title: "花田小屋",
    desc: "盛开的花田与远处的小屋。",
    prompt: "small cottage in blooming flower field, blue sky with clouds, anime scenery, ghibli inspired, warm pastel colors, peaceful mood",
    size: "landscape_16_9", tags: ["花田", "小屋", "晴空"]
  },
  {
    id: "h03", category: "healing", title: "星夜露营",
    desc: "星空下的山间帐篷与篝火。",
    prompt: "camping tent under starry night sky, small campfire, mountains silhouette, anime scenery, warm firelight, peaceful, detailed",
    size: "portrait_4_3", tags: ["星夜", "露营", "篝火"]
  },
  {
    id: "h04", category: "healing", title: "图书馆午后",
    desc: "阳光洒入的旧式图书馆。",
    prompt: "cozy old library with afternoon sunlight through tall windows, bookshelves, floating dust particles, anime style, warm palette, detailed",
    size: "portrait_4_3", tags: ["图书馆", "午后", "暖光"]
  }
];

// 预构建图片地址，供渲染直接使用
WALLPAPERS.forEach(w => {
  w.src = buildImage(w.prompt, w.size);
  // 缩略图统一使用 4:3 竖图便于瀑布流对齐
  w.thumb = buildImage(w.prompt, "portrait_4_3");
});

window.__DATA__ = { CATEGORIES, WALLPAPERS, buildImage };
