// ============================================
// 资源分享数据文件
// 每行一个资源，会出现在首页气泡区和 /resources/ 页面
// ============================================

export interface Resource {
	id: string; // 唯一标识
	name: string; // 资源名称
	description: string; // 简短描述
	url: string; // 链接地址
}

export const resources: Resource[] = [
  {
    id: "res-1785121177991",
    name: "哔哩哔哩",
    description: "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili",
    url: "https://www.bilibili.com/",
  },
  {
    id: "res-1785121225067",
    name: "Minecraft Soundss",
    description: "我的世界音效收录网站。",
    url: "https://o.xbottle.top/mcsounds/",
  },
  {
    id: "res-1785121305574",
    name: "Windwos 12 网页版",
    description: "用浏览器体验Win 12",
    url: "https://win12.tech/boot",
  },
  {
    id: "res-1785121394121",
    name: "樱之空动漫",
    description: "免费版小破站",
    url: "https://skr.skr3.cc:666/",
  },
  {
    id: "res-1785121434885",
    name: "Steam",
    description: "Steam官网",
    url: "https://store.steampowered.com/",
  },
  {
    id: "res-1785121483512",
    name: "网页里的电脑博物馆",
    description: "收录了各种古董系统",
    url: "https://www.compumuseum.com/index.html?utm_source=xinquji",
  },
  {
    id: "res-1785142125486",
    name: "MAS",
    description: "免费激活Windows和MS365",
    url: "https://massgrave.dev/",
  },
  {
    id: "res-1785213242507",
    name: "离线游戏资源文档",
    description: "免费下载GTA这类游戏。",
    url: "https://www.114game.net/",
  },
  {
    id: "res-1785258920224",
    name: "我告诉你",
    description: "Windows系统镜像下载。",
    url: "https://msdn.itellyou.cn/?utm_source=xinquji",
  },
  {
    id: "res-1785287948925",
    name: "网易云游戏",
    description: "10元5小时云电脑。",
    url: "https://cg.163.com",
  },
  {
    id: "res-1785501286660",
    name: "FreeConvert",
    description: "免费文件格式转换器。",
    url: "https://www.freeconvert.com/zh",
  },
  {
    id: "res-1785769986310",
    name: "StackEdit",
    description: "MD文章编辑器。",
    url: "https://stackedit.cn/",
  }
];
