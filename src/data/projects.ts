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
    longDescription: "使用Mark，\n\n使你轻松开始 Markdown 编写，\n\n并获得持久地更新。",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0n000dkicf1bcgtoye3rntsDIYPAIDyAqayAGxzDdU0Dqe=.png",
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0l000dkicf1nbu9umivg75vDIYPAIDyAqayAGxzDdU0Dqe=.png"],
    type: "software",
    tags: ["开发者：ZionyasVan（DXL）", "类型：工具", "框架：Neutralionjs"],
    platform: "Windows",
    status: "已发布 · 2026年7月16日",
    downloadLinks: [
      { icon: "fa6-brands:github", label: "GitHub", url: "https://github.com/Zionyas-Van/Mark" },
      { label: "蓝奏云（密码：di78）", url: "https://zionyasvan.lanzouq.com/iVFPA3x4owfc" }
    ],
    featured: true,
  },
  {
    id: "neu-zionyasvan-neuroai",
    title: "Neuro",
    description: "Neuro 是一款轻量化的 DeepSeek API 客户端。",
    longDescription: "Neuro 目前正在测试。",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0m000dkicf2g45yy5yhu8cgDIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0n000dkicf37fqc8ke48txgDIYPAIDyAqayAGxzDdU0Dqe=.png", "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0l000dkicf0v097naiw40l2DIYPAIDyAqayAGxzDdU0Dqe=.png"],
    type: "software",
    tags: ["开发者：ZionyasVan（DXL）", "类型：工具", "框架：Neutralionjs"],
    platform: "Windows",
    status: "预发布 · 待发布日期",
    downloadLinks: [

    ],
    featured: false,
  },
  {
    id: "com.zvbg465.games",
    title: "ZionyasVan's BlockGrounds",
    description: "来 ZVBG 体验网游式的俄罗斯方块。",
    longDescription: "来 ZVBG 体验网游式的俄罗斯方块。",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0l000dlnm5r5r98rmdmesxvDIYPAIDyAqayAGxzDdU0Dqe=.png",
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0l000dlnm5pw1m0m1dm3553DIYPAIDyAqayAGxzDdU0Dqe=.png", "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0m000dlnm5tqqjlr1t8wmcfDIYPAIDyAqayAGxzDdU0Dqe=.png", "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0l000dlnm5r5r9645dm977mDIYPAIDyAqayAGxzDdU0Dqe=.png"],
    type: "game",
    tags: ["游戏", "俄罗斯方块", "经典"],
    platform: "Windows",
    status: "开发中",
    downloadLinks: [

    ],
    featured: true,
  }
];
