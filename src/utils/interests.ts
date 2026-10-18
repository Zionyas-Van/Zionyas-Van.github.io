import {
	type InterestPost,
	type InterestSection,
	type InterestType,
	INTEREST_TYPE_META,
	interestPosts,
	interestSections,
} from "../data/interests";

/** 分钟 → 「6 小时 30 分」/「45 分钟」 */
export function fmtMinutes(total: number): string {
	const m = Math.max(0, Math.round(Number(total) || 0));
	if (m === 0) return "0 分钟";
	const h = Math.floor(m / 60);
	const r = m % 60;
	if (h === 0) return `${r} 分钟`;
	if (r === 0) return `${h} 小时`;
	return `${h} 小时 ${r} 分`;
}

/** 0-10 分 → 「8.5」 */
export function fmtRating(v: number | undefined): string {
	if (v == null || Number.isNaN(Number(v))) return "—";
	const n = Math.round(Number(v) * 10) / 10;
	return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

const byDateDesc = (a: InterestPost, b: InterestPost) =>
	String(b.date || "").localeCompare(String(a.date || ""));
const byDateAsc = (a: InterestPost, b: InterestPost) =>
	String(a.date || "").localeCompare(String(b.date || ""));

export function postsOfSection(sectionId: string): InterestPost[] {
	return interestPosts.filter((p) => p.sectionId === sectionId).sort(byDateDesc);
}

/** 某分区所有帖子里最大的时长（分钟）——「进度快照取最大」规则 */
export function sectionMaxMinutes(sectionId: string): number {
	return postsOfSection(sectionId).reduce((max, p) => Math.max(max, Number(p.minutes) || 0), 0);
}

/** 某分区所有帖子里最高的评分 */
export function sectionMaxRating(sectionId: string): number {
	return postsOfSection(sectionId).reduce((max, p) => Math.max(max, Number(p.rating) || 0), 0);
}

export function sectionLastDate(sectionId: string): string {
	const list = postsOfSection(sectionId);
	return list.length ? String(list[0].date || "") : "";
}

export function sectionFirstDate(sectionId: string): string {
	const list = [...interestPosts.filter((p) => p.sectionId === sectionId)].sort(byDateAsc);
	return list.length ? String(list[0].date || "") : "";
}

export interface SectionCard {
	section: InterestSection;
	type: InterestType;
	postCount: number;
	maxMinutes: number;
	maxRating: number;
	lastDate: string;
	firstDate: string;
}

function toCard(section: InterestSection): SectionCard {
	return {
		section,
		type: section.type,
		postCount: postsOfSection(section.id).length,
		maxMinutes: sectionMaxMinutes(section.id),
		maxRating: sectionMaxRating(section.id),
		lastDate: sectionLastDate(section.id),
		firstDate: sectionFirstDate(section.id),
	};
}

/** 全部分区卡片，按最近更新排序（没更新的按建分区顺序） */
export function getSectionCards(): SectionCard[] {
	return interestSections
		.map(toCard)
		.sort((a, b) => {
			if (a.lastDate && b.lastDate) return b.lastDate.localeCompare(a.lastDate);
			return a.lastDate ? -1 : b.lastDate ? 1 : 0;
		});
}

export function getSectionCardsByType(type: InterestType | "all"): SectionCard[] {
	const all = getSectionCards();
	return type === "all" ? all : all.filter((c) => c.type === type);
}

/** 取「最大值」最高的前几个（并列时都返回，交给前端随机） */
function topBy(cards: SectionCard[], key: "maxMinutes" | "maxRating"): SectionCard[] {
	const pool = cards.filter((c) => (c[key] || 0) > 0);
	if (!pool.length) return [];
	const best = Math.max(...pool.map((c) => c[key] || 0));
	return pool.filter((c) => (c[key] || 0) === best);
}

export interface InterestSummary {
	totalGameMinutes: number;
	musicCount: number;
	filmCount: number;
	bookCount: number;
	otherCount: number;
	gameCount: number;
	postCount: number;
	sectionCount: number;
	topGame: SectionCard[];
	topMusic: SectionCard[];
	topFilm: SectionCard[];
	topBook: SectionCard[];
}

/**
 * 关于页 / 兴趣页顶部的总结项。
 *  · 总游戏时长 = 各游戏分区「最大时长」之和
 *  · 已听歌曲 = 音乐分区个数（按用户定义：一个分区=一部作品/一张专辑）
 *  · 最喜欢的游戏/音乐 = 时长最多的分区；最喜欢的影视/书籍 = 评分最高的分区
 *    （并列时返回多个候选，由前端随机挑一个展示）
 */
export function getInterestSummary(): InterestSummary {
	const cards = getSectionCards();
	const ofType = (t: InterestType) => cards.filter((c) => c.type === t);
	const games = ofType("game");
	const music = ofType("music");
	const films = ofType("film");
	const books = ofType("book");
	return {
		totalGameMinutes: games.reduce((sum, c) => sum + c.maxMinutes, 0),
		gameCount: games.length,
		musicCount: music.length,
		filmCount: films.length,
		bookCount: books.length,
		otherCount: ofType("other").length,
		sectionCount: cards.length,
		postCount: interestPosts.length,
		topGame: topBy(games, "maxMinutes"),
		topMusic: topBy(music, "maxMinutes"),
		topFilm: topBy(films, "maxRating"),
		topBook: topBy(books, "maxRating"),
	};
}

/** 分区类型的中文名 */
export function typeLabel(type: InterestType): string {
	return (INTEREST_TYPE_META[type] || INTEREST_TYPE_META.other).label;
}

/** 分区网址 */
export function sectionUrl(id: string): string {
	return `/interests/${encodeURIComponent(id)}/`;
}

/** 取随机 n 条帖子（跨分区），用于兴趣页「随便看看」 */
export function randomPosts(n: number): InterestPost[] {
	const pool = [...interestPosts];
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return pool.slice(0, Math.max(0, n));
}
