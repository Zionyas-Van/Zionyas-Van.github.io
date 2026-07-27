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
    id: "res-1785121002849",
    name: "Gamemodd CS",
    description: "CS1.6 模组、插件与地图包",
    url: "https://www.gamemodd.com/cs/",
  },
];
