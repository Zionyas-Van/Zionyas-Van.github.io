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
    name: "MnecraftSounds",
    description: "我的世界音效收录网站。",
    url: "https://o.xbottle.top/mcsounds/",
  },
  {
    id: "res-1785121305574",
    name: "Windows 12 网页版",
    description: "用浏览器体验Win 12",
    url: "https://win12.tech/boot",
  },
  {
    id: "res-1785121394121",
    name: "樱之空动漫",
    description: "不多说。",
    url: "https://skr.skr3.cc:666/",
  },
  {
    id: "res-1785121434885",
    name: "Steam",
    description: "Steam官网。",
    url: "https://store.steampowered.com/",
  },
  {
    id: "res-1785121483512",
    name: "网页里的电脑博物馆",
    description: "收录了各种古董系统。",
    url: "https://www.compumuseum.com/index.html?utm_source=xinquji",
  },
];
