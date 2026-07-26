// ============================================
// 视频数据文件
// ============================================

export interface Video {
	id: string; // 唯一标识
	title: string; // 视频标题
	bvid: string; // B站 BV 号，比如 "BV1xx411c7mD"
	cover: string; // 封面图（可选），留空则自动用 B站封面
	description: string; // 简短描述
	featured: boolean; // true = 显示在首页精选区
}

export const videos: Video[] = [
	{
		id: "BV1ZHVVzQERz",
		title: "我的第一个视频",
		bvid: "BV1ZHVVzQERz",
		cover: "", // 留空就用B站自动封面
		description: "【生存模组推荐】基岩版生存模组必备合集｜链接已附简介｜高亮显示、移动光源、小地图等等",
		featured: true,
	},
];
