// ============================================
// 资源分享数据文件
// 每行一个资源，会出现在首页气泡区和 /resources/ 页面
// ============================================

export interface Resource {
	id: string; // 唯一标识
	name: string; // 资源名称
	description: string; // 简短描述
	url: string; // 链接地址
	category?: string; // 分类：网站 / 应用 / 游戏 / 文件 / 其他
	cover?: string; // 配图链接（123 云盘图床，可留空）
}

export const resources: Resource[] = [
  {
    id: "res-1785121177991",
    name: "哔哩哔哩",
    description: "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili",
    url: "https://www.bilibili.com/",
    category: "网站",
  },
  {
    id: "res-1785121225067",
    name: "Minecraft Soundss",
    description: "我的世界音效收录网站。",
    url: "https://o.xbottle.top/mcsounds/",
    category: "网站",
  },
  {
    id: "res-1785121305574",
    name: "Windwos 12 网页版",
    description: "用浏览器体验Win 12",
    url: "https://win12.tech/boot",
    category: "网站",
  },
  {
    id: "res-1785121394121",
    name: "樱之空动漫",
    description: "免费版小破站",
    url: "https://skr.skr3.cc:666/",
    category: "网站",
  },
  {
    id: "res-1785121434885",
    name: "Steam",
    description: "Steam官网",
    url: "https://store.steampowered.com/",
    category: "网站",
  },
  {
    id: "res-1785121483512",
    name: "网页里的电脑博物馆",
    description: "收录了各种古董系统",
    url: "https://www.compumuseum.com/index.html?utm_source=xinquji",
    category: "网站",
  },
  {
    id: "res-1785142125486",
    name: "MAS",
    description: "免费激活Windows和MS365",
    url: "https://massgrave.dev/",
    category: "网站",
  },
  {
    id: "res-1785213242507",
    name: "离线游戏资源文档",
    description: "免费下载GTA这类游戏。",
    url: "https://www.114game.net/",
    category: "网站",
  },
  {
    id: "res-1785258920224",
    name: "我告诉你",
    description: "Windows系统镜像下载。",
    url: "https://msdn.itellyou.cn/?utm_source=xinquji",
    category: "网站",
  },
  {
    id: "res-1785287948925",
    name: "网易云游戏",
    description: "10元5小时云电脑。",
    url: "https://cg.163.com",
    category: "游戏",
  },
  {
    id: "res-1785501286660",
    name: "FreeConvert",
    description: "免费文件格式转换器。",
    url: "https://www.freeconvert.com/zh",
    category: "网站",
  },
  {
    id: "res-1785769986310",
    name: "StackEdit",
    description: "MD文章编辑器。",
    url: "https://stackedit.cn/",
    category: "网站",
  },
  {
    id: "res-1788271966155",
    name: "苦力怕论坛",
    description: "MC中文论坛",
    url: "https://klpbbs.net/",
    category: "游戏",
  },
  {
    id: "res-1790436769069",
    name: "萤火虫资源网",
    description: "刷机资源圣地。",
    url: "https://yhcres.top/",
    category: "文件",
  },
  {
    id: "res-1790437041013",
    name: "王者荣耀素材库",
    description: "王者图标资源。",
    url: "https://pvp.icreate.qq.com/index?biz=397",
    category: "网站",
  },
  {
    id: "res-1790437385601",
    name: "Gamemodd/CS",
    description: "CS模组。",
    url: "https://www.gamemodd.com/cs/",
    category: "游戏",
  },
  {
    id: "res-1790437448102",
    name: "Apple 设计中心",
    description: "Apple 开发者图标资源库。",
    url: "https://developer.apple.com/design/resources/#product-bezels",
    category: "网站",
  },
  {
    id: "res-1790526946906",
    name: "Windows系统镜像",
    description: "有xp到11的大部分系统镜像文件，123盘。",
    url: "https://1815356055.share.123pan.cn/123pan/wd3iVv-DfeHh",
    category: "文件",
  },
  {
    id: "res-1790527010917",
    name: "小米桌面_ALPHA-4.37.0（修改版）",
    description: "有动画的流畅精简版。",
    url: "https://1815356055.share.123pan.cn/123pan/wd3iVv-gHyHh",
    category: "应用",
  },
  {
    id: "res-1790527074548",
    name: "哔哩哔哩v.7.38.0（插件版）",
    description: "目前可登录的哔站插件版。",
    url: "https://1815356055.share.123pan.cn/123pan/wd3iVv-LXhHh",
    category: "应用",
  },
  {
    id: "res-1790611124626",
    name: "爱听音乐网",
    description: "免费下载热门歌曲。",
    url: "https://www.2t58.com/",
    category: "网站",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0l000dlnm5r5o3nnp95akfcDIYPAIDyAqayAGxzDdU0Dqe=.png",
  }
];
