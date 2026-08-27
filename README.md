动漫精美壁纸图集

目录下有几个个文件夹：images中存放的是各动漫的分类图片，以动漫名字命名的目录，该目录下是以各人物名字命名的图片，格式可能有.jpeg .jpg,.png，js/data.js中有一变量const ANIMES = [
  { id: "xianni", name: "仙逆", icon: "☽", file: "data/xianni.json" },
  { id: "fanren", name: "凡人修仙传", icon: "☯", file: "data/fanren.json" },
  // { id: "doupo", name: "斗破苍穹", icon: "✦", file: "data/doupo.json" },
  { id: "wanmei", name: "完美世界", icon: "✧", file: "data/wanmei.json" },
  { id: "nezha", name: "哪吒", icon: "◈", file: "data/nezha.json" },
  // { id: "zhetian", name: "遮天", icon: "☀", file: "data/zhetian.json" },
  { id: "jianlai", name: "剑来", icon: "†", file: "data/jianlai.json" },
]; 变量的每一项 id就是对应images层级下的动漫目录名称，file表示对应json配置文件，以data/xianni.json中的数组项为例说明  {
    "id": "红蝶01",
    "title": "荒星独行",
    "desc": "美人如画",
    "tags": [
      "仙逆",
      "红蝶",
      "美女"
    ],
    "type": ".jpg"
  },  id 对应images/xianni/红蝶01.jpg这个文件的名称,type字段就是文件的类型后缀，title 应该是红蝶除去数字后缀的文件名称（即人物名称），desc可以是对应古风的一句话，要求简短文雅，tags中包含ANIMES中对应id的name以及人物名称以及一个词汇（美好的词汇，除了王林和石昊是男的，其他目前都是女的），女的可以是盛世美颜，风华绝代，风姿绰约，男的可以是帅气，依据以上描述，请根据ANIMES下的未注释的数据项按照以上规则，补充data目录下的对应json，