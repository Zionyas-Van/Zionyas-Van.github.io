// ============================================
//作品数据文件
// ============================================

export interface DownloadLink {
	label: string; // 按钮显示文字，例如 "GitHub"、"网盘"
	url: string; // 下载链接
	icon?: string; // （可选）图标名，如 "fa6-brands:github"
}

export interface Project {
	id: string; // 唯一标识，用英文和连字符，比如 "my-first-game"
	title: string; // 作品名称
	description: string; // 简短描述（1-2句话，用于卡片）
	longDescription: string; // 详细介绍（支持多行，用于详情页）
	cover: string; // 封面图路径
	screenshots: string[]; // 截图路径数组，例如 ["/projects/screenshot1.jpg"]
	type: "game" | "software"; // 分类：游戏 or 软件
	tags: string[]; // 标签
	platform: string; // 平台，如 "Windows / macOS"、"Web"
	status: string; // 开发状态，如 "已发布"、"开发中"、"抢先体验"
	downloadLinks: DownloadLink[]; // 下载链接列表
	featured: boolean; // true = 显示在首页精选区
}

export const projects: Project[] = [
	{
		id: "neu-zionyasvan-mark",
		title: "Mark",
		description: "Mark 是一款轻量化的 Markdown 编辑器。",
		longDescription:
			"使用Mark，\n\n使你轻松开始 Markdown 编写，\n\n并获得持久地更新。",
		cover: "/projects/Mark.png",
		screenshots: [
			"/projects/Mark-screenshot-01.png",
			// "/projects/screenshot2.jpg",
		],
		type: "software",
		tags: ["开发者：ZionyasVan（DXL）","类型：工具", "框架：Neutralionjs"],
		platform: "Windows",
		status: "已发布 · 2026年7月16日",
		downloadLinks: [
			{
				label: "GitHub",
				url: "https://github.com/Zionyas-Van/Mark",
				icon: "fa6-brands:github",
			},
			{
				label: "蓝奏云（密码：di78）",
				url: "https://zionyasvan.lanzouq.com/iVFPA3x4owfc",
			},
		],
		featured: true, // true = 显示在首页精选区
	},


	{
		id: "neu-zionyasvan-neuroai",
		title: "Neuro",
		description: "Neuro 是一款轻量化的 DeepSeek API 客户端。",
		longDescription:
			"Neuro 目前正在测试。",
		cover: "/projects/Neuro.jpg",
		screenshots: [
			// "/projects/Mark-post-01.png",
			// "/projects/screenshot2.jpg",
		],
		type: "software",
		tags: ["开发者：ZionyasVan（DXL）","类型：工具", "框架：Neutralionjs"],
		platform: "Windows",
		status: "预发布 · 待发布日期",
		downloadLinks: [
		],
		featured: true, // true = 显示在首页精选区
	},


	{
		id: "codemao-zionyasvan-HoverOS",
		title: "HoverOS",
		description: "闲着无聊而随便做的小作品。",
		longDescription:
			"只是来凑数的，不建议尝试哦。",
		cover: "/projects/HoverOS.jpg",
		screenshots: [
			// "/projects/Mark-post-01.png",
			// "/projects/screenshot2.jpg",
		],
		type: "game",
		tags: ["开发者：ZionyasVan（DXL）","类型：模拟", "框架：CodeMao"],
		platform: "CodeMao",
		status: "已发布 · 2024年01月23日",
		downloadLinks: [
			{
				label: "编程猫平台",
				url: "https://shequ.codemao.cn/work/226460915",
			},
		],
		featured: false, // true = 显示在首页精选区
	},
];
