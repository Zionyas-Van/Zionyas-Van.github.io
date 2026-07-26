// ============================================
// 视频数据文件
// 支持 B站 视频（通过 BV 号）
// 首页和视频专区会自动读取这里的数据
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
		id: "video-01",
		title: "我的第一个视频",
		bvid: "BV1xx411c7mD",
		cover: "", // 留空就用B站自动封面
		description: "这是一个关于XXX的视频",
		featured: true,
	},
];
