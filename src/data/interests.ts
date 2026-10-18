// ============================================================
// 兴趣分区 / 兴趣帖子
//
// 【一条必须遵守的统计规则】
//   一个分区 = 一部作品（一个游戏、一张专辑、一部影视、一本书）。
//   帖子里的时长是"进度快照"（今天玩到 4 小时、下次玩到 6 小时），
//   所以一个分区的时长 = 该分区所有帖子里**最大的那个值**，而不是累加。
//   总游戏时长 = 所有游戏分区的"最大值"相加。
//   （举例：反恐精英2 有 1h / 4h / 6h 三篇 → 该分区算 6h，不是 11h）
//
// 【字段约定】
//   · 游戏 / 音乐：帖子填 minutes（分钟，进度快照）
//   · 影视 / 书籍：帖子填 rating（10 分制）
//   · 其它：两个都不填，只写正文
//   · 封面与截图一律填图片链接（用户使用图床，不走本地上传）
// ============================================================

export type InterestType = "game" | "music" | "film" | "book" | "other";

export interface InterestSection {
	id: string; // 英文标识，同时作为网址：/interests/<id>/
	name: string; // 显示名，例如「反恐精英2」
	type: InterestType;
	cover: string; // 封面图链接
	description?: string; // 一句话介绍
}

export interface InterestPost {
	id: string;
	sectionId: string; // 所属分区 id
	title: string;
	content: string; // 正文（Markdown）
	screenshots?: string[]; // 截图链接
	date: string; // 日期 YYYY-MM-DD
	minutes?: number; // 游戏/音乐：已游玩 / 已听时长（分钟，进度快照）
	rating?: number; // 影视/书籍：10 分制
}

export const INTEREST_TYPE_META: Record<
	InterestType,
	{ label: string; icon: string; emojiFree: string }
> = {
	game: {
		label: "游戏",
		icon: "material-symbols:sports-esports-outline-rounded",
		emojiFree: "game",
	},
	music: {
		label: "音乐",
		icon: "material-symbols:music-note-rounded",
		emojiFree: "music",
	},
	film: {
		label: "影视",
		icon: "material-symbols:movie-outline-rounded",
		emojiFree: "film",
	},
	book: {
		label: "书籍",
		icon: "material-symbols:menu-book-rounded",
		emojiFree: "book",
	},
	other: {
		label: "其它",
		icon: "material-symbols:category-outline-rounded",
		emojiFree: "other",
	},
};

// 各类型帖子需要填的字段（管理工具与页面共用这一份定义）
export const INTEREST_TYPE_FIELDS: Record<InterestType, { minutes: boolean; rating: boolean }> = {
	game: { minutes: true, rating: false },
	music: { minutes: true, rating: false },
	film: { minutes: false, rating: true },
	book: { minutes: false, rating: true },
	other: { minutes: false, rating: false },
};

export const interestSections: InterestSection[] = [
	{
		id: "gta-v",
		name: "GTA5",
		type: "game",
		cover: "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0l000dlnm5r610ifepgfr4lDIYPAIDyAqayAGxzDdU0Dqe=.jpg",
		description: "他们谁也不能相信，尤其是身边的同伙。",
	},
];

export const interestPosts: InterestPost[] = [
  {
    id: "ip-1792293262513",
    sectionId: "gta-v",
    title: "GTA5入库",
    date: "2026-7-8",
    rating: 10,
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0n000dlnm5sp5oaexkpneazDIYPAIDyAqayAGxzDdU0Dqe=.png", "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0n000dlnm5sp5ob49kpoqleDIYPAIDyAqayAGxzDdU0Dqe=.png"],
    content: "小时候被表哥带着玩GTA3，从此一发不可收拾，彻底迷上GTA系列。\n期盼了10年的GTA5终于在今天拿下，也算是圆了儿时的梦了😊",
  },
  {
    id: "ip-1792293530128",
    sectionId: "gta-v",
    title: "通关了",
    date: "2026-7-13",
    minutes: 2756,
    content: "解锁成就：大干一票\n5天时间通关 GTA5 故事模式。",
  }
];
