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
  {
    id: "oyyhzwyxhsxbf-fxll",
    name: "偶遇又合租，我与校花双向奔赴",
    type: "book",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0n000dlnm5sp5oka7kq1g1sDIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "最美的烟花，送给最美的你。",
  },
  {
    id: "cs2",
    name: "反恐精英2",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0l000dlnm5pwbbs07pgkwgaDIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "反恐精英，再度闪耀！",
  },
  {
    id: "h3r3-gs",
    name: "h3r3",
    type: "music",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0l000dlnm5r611mpgphzmh2DIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "刘清云（h3R3），本名，中国男歌手、音乐制作人，出生于安徽，职业涵盖词曲创作、编曲、混音及母带制作等领域，曾与Felix Bennett合作演唱《他只是经过》。",
  },
  {
    id: "watch-dog2",
    name: "看门狗2",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0l000dlnm5pwc6mhqqomhkhDIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "第三人称射击角色扮演游戏。",
  },
  {
    id: "postal2",
    name: "夺命邮差2",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0l000dlnm5sy4c89qqq9dxfDIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "《喋血街头2》（Postal 2）又译《夺命邮差2》是一款第一人称射击游戏游戏。由美国Running With Scissors公司开发发行，2003年4月13日上线。",
  },
  {
    id: "green-hell",
    name: "绿色地狱",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0n000dlnm5spbd137lzytg9DIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "《绿色地狱》是由波兰游戏工作室Creepy Jar开发的开放世界生存模拟游戏，背景设定在危机四伏的亚马逊雨林。",
  },
  {
    id: "cs-1-6",
    name: "反恐精英",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0l000dlnm5sy7d42uujpe31DIYPAIDyAqayAGxzDdU0Dqe=.png",
    description: "反恐精英CS1.6是一种以团队合作为主的第一人称射击游戏。",
  },
  {
    id: "supermarkt-together",
    name: "Supermarkt Together",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0l000dlnm5sy7d4oaujqmwaDIYPAIDyAqayAGxzDdU0Dqe=.webp",
    description: "多人超市。",
  },
  {
    id: "thief-simulator",
    name: "Thief Simulator",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0m000dlnm5ts4akv9a65i0pDIYPAIDyAqayAGxzDdU0Dqe=.webp",
    description: "小偷模拟器。",
  },
  {
    id: "left-4-dead",
    name: "求生之路",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0n000dlnm5uinbdv8psis17DIYPAIDyAqayAGxzDdU0Dqe=.webp",
    description: "四人生还。",
  },
  {
    id: "titan-full",
    name: "泰坦陨落2",
    type: "game",
    cover: "https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0m000dlnm5qqa94d4a4wnk9DIYPAIDyAqayAGxzDdU0Dqe=.jpg",
    description: "协议三：保护铁驭。",
  }
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
  },
  {
    id: "ip-1792294249235",
    sectionId: "oyyhzwyxhsxbf-fxll",
    title: "发现一本宝藏书籍",
    date: "2024-8-31",
    rating: 9.5,
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0n000dlnm5sp5oka7kq1g1sDIYPAIDyAqayAGxzDdU0Dqe=.jpg"],
    content: "特别喜欢里面的这句话：\n“最美的烟花，送给最美的你。”（第299章）\n\n还有这一段，简直甜翻了：\n“\n大雪过后，并不是所有的街道都会清理干净，只有主干道路上的积雪才会被清理。\n而顾一承和梁瑜就喜欢不走寻常路。\n那种已经清理干净的道路走着有啥意思？\n要走就得走那种没有被清理的，踩着雪走路才有意思！\n于是，两人专挑有雪的道路走。\n梁瑜本来开开心心走在前头，一边走还一边唱着歌。\n可是顾一承腿长，步子宽，不一会儿就追上了梁瑜，甚至渐渐开始走在了她的前面。\n有种想要超过她的架势。\n这可勾起了梁瑜强烈的好胜心。\n她要赶在顾一承前头，率先踩到那些还没有留下脚印的路！\n她要成为第一个留下脚印的人！\n前方未被占领的雪地，都是属于她梁瑜的！\n梁瑜是这么想的，顾一承又何尝不是？\n“你不可以走在前面！”梁瑜拉扯着顾一承。\n“我不！我就要！”\n两个幼稚鬼你追我赶，在空无一人的街道上玩得不亦乐乎。\n而且两人走的还不是直线，秉承的就是一个随心所欲，渐渐地在身后留下了歪歪扭扭的脚印线。\n不知不觉间，两人走到了一个路口，前方的绿灯进入倒计时。\n“冲！”\n梁瑜加快了脚步，在绿灯即将转为红灯的最后一刻冲到了街对面。\n而顾一承则慢悠悠地，一点也不着急，他走到街边停了下来，准备等到绿灯亮起的时候再过马路。\n梁瑜朝他挥了挥手，然后双手环在嘴边，“你过来啊！”\n“今天下这么大雪，街上都没人，不用等红绿灯啦。”\n冰天雪地，整个世界就像是只属于顾一承和梁瑜二人。\n顾一承看着街对面可爱的人儿，心里暖洋洋的。\n他喜欢雪，更喜欢那个雪地中的身影。\n他多想和梁瑜就这样无忧无虑地一直走下去，直至天荒地老...\n情到深处，顾一承内心的一根弦像是被一种魔力撼动了一下，悠扬的弦音从心底向上传递，响彻整个脑海。\n浪漫的思绪在他脑海漂浮，他从羽绒服的口袋里拿出了自己的手机，点开了置顶聊天，给对方拨去语音电话。\n梁瑜望着一脸笑意的顾一承，感到很是纳闷，她不知道为什么顾一承要傻傻地站在街对面不过来，其实完全可以不等这个红灯的。\n就在她疑惑之时，口袋中的手机响了起来。\n她拿出来一看，发现是顾一承给自己打来的电话。\n她没有第一时间接通，而是歪着脑袋很是不解地看向街对面的顾一承。\n\n顾一承用手指指了一下手机，示意她接电话，梁瑜这才接起。\n“怎么啦？你怎么不过来呀？”\n顾一承轻扬起嘴角，缓缓开口。\n“没事，就是想这样子和你说说话，感觉这种氛围很是奇妙。”\n对于顾一承来说，他就是想和梁瑜不停地去经历各种事情，去在平淡的生活中制造一些不一样的体验，去热爱生活。\n这是他爱梁瑜的方式。\n“好的呀。”\n梁瑜自然不会拒绝，她静静地站在街对面，遥望着自己的男孩。\n“宝。”顾一承轻轻呼唤了一声梁瑜。\n“一直忘了和你说，认识你是我的小确幸。”\n“自从你出现在我的生活中后，我感觉自己就像是变了个人一般。”\n“你治愈了我感情悲观的性格，让我变得不再担惊受怕，你同时也在感情中给予了我充分的安全感，让我能够奋不顾身地坠入爱河。”\n“我很少做梦，可是每次只要一做梦，梦里一定有你。”\n“昨天我就在想，倘若这个世界真的有神明的话，那是不是以后每一个下雪的早晨，你都能够在窗外看到一个爱的印记。”\n“会的！”一直默默倾听的梁瑜坚定地应了一句。\n顾一承听了以后，脸上洋溢着幸福的笑容。\n“这场雪，是我们一起见证的第一场雪，以后，我们还会一起见证第二场，第三场...”\n“直至我们头发的颜色变得如同白雪那般。”\n说到这里，顾一承停顿了一下，然后挂断了电话，深吸一口气，朝着街对面大声呼喊。\n“宝，我爱你，真的真的很爱你！”\n听着心爱的男孩情深意切的呼喊，梁瑜热泪盈眶。\n她嘴唇开始颤抖，心脏被狠狠震撼了一番。\n她吸了吸鼻子，大声笑着回应：“我也爱你！超级超级超级爱你！”\n两人隔着一条街，互相遥望。\n彼此笑得像个傻子。\n时间一分一秒的流逝，空气中幸福的味道不曾有丝毫衰减。\n很快，绿灯亮起。\n顾一承朝着街对面迈出了一步，然后停了下来。\n“我靠近你一步了哦！”\n“好~”\n梁瑜笑着回应，她已经张开了双臂，等到顾一承一到自己面前，就给他一个大大的拥抱。\n紧接着，顾一承又迈近了一步。\n“我靠近你两步了哦！”\n...\n“我靠近你五步了哦！”\n...\n当他迈到第十步的时候，已经走到了梁瑜面前，两人紧紧拥抱在了一起。\n拥抱过后，两人又在雪地中深情一吻。\n”\n\n原作品地址：https://fanqienovel.com/page/7212509600463981602\nGoogle Play 图书：https://play.google.com/books/reader?id=EmtSPQAAAEAJ&pg=GBS.PA1640.w.0.0.0.2_75",
  },
  {
    id: "ip-1792296146302",
    sectionId: "cs2",
    title: "入手CS优先账户",
    date: "2026-10-14",
    minutes: 3048,
    rating: 9,
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0n000dlnm5rifugr7kpeh88DIYPAIDyAqayAGxzDdU0Dqe=.jpg", "https://1815356055.cdn.123clouddisk.com/1815356055/ynf1no03t0m000dlnm5qq64v155315daDIYPAIDyAqayAGxzDdU0Dqe=.png", "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0l000dlnm5sy3ikjqphj2mdDIYPAIDyAqayAGxzDdU0Dqe=.png"],
    content: "目前为止在steam上单次最高花销，比gta5还贵。\n希望能回本。",
  },
  {
    id: "ip-1792296408244",
    sectionId: "h3r3-gs",
    title: "还是会想你",
    date: "2026-10-18",
    minutes: 240,
    rating: 9.5,
    content: "歌词太真实了。\n“我知道我可以随时被代替”\n“却还是接受不了这种落差”\n",
  },
  {
    id: "ip-1792512081615",
    sectionId: "cs2",
    title: "才发现cs的每周奖励不是跟着日期走",
    date: "2026-10-20",
    minutes: 3168,
    content: "存着经验打算等今天打一把就可以升级领箱子，结果发现还要等11小时才能获得下周奖励。",
  },
  {
    id: "ip-1792512459765",
    sectionId: "gta-v",
    title: "感觉通关后的可玩性有点低",
    date: "2026-10-20",
    minutes: 3654,
    content: "GTA5的剧情真的神了，只不过通关后的可玩性太低了。\n今天听人说有一款地图比GTA5还大的，号称3A大作的手机游戏，问了AI，说是叫《祖国人模拟器》。我一搜——好家伙，这地图确实比GTA5大，只不过，这游戏能玩得下去也是神了，空旷的大马路和模板大楼，怪不得比GTA5大，让我去当开发我也能做得比GTA5大。\n3A更是吹牛逼，连2B都算不上。",
  },
  {
    id: "ip-1792512801899",
    sectionId: "watch-dog2",
    title: "入手看门狗2",
    date: "2026-07-01",
    minutes: 1296,
    rating: 8,
    content: "小时候看炮芯大怪玩过这个游戏，一直想尝试一下，刚好遇上打折就买了。\n当成低配版GTA5来玩了。",
  },
  {
    id: "ip-1792513060988",
    sectionId: "postal2",
    title: "神人收银员",
    date: "2026-06-07",
    minutes: 1316,
    rating: 9,
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0n000dlnm5spbcptklzinrxDIYPAIDyAqayAGxzDdU0Dqe=.PNG"],
    content: "好消息：有中文配音了。\n坏消息：这tm还不如不配，太搞了。\n\n一共是——十——三——元。",
  },
  {
    id: "ip-1792513129244",
    sectionId: "postal2",
    title: "通关了",
    date: "2026-06-13",
    minutes: 3714,
    rating: 9.5,
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0n000dlnm5uikiwg5lz1vfnDIYPAIDyAqayAGxzDdU0Dqe=.PNG"],
    content: "没想到还要打BOSS，不开作弊根本打不过。",
  },
  {
    id: "ip-1792513383376",
    sectionId: "green-hell",
    title: "求生类神作",
    date: "2026-10-20",
    minutes: 2298,
    rating: 9.5,
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0l000dlnm5r61ymj7qr8ye5DIYPAIDyAqayAGxzDdU0Dqe=.jpg"],
    content: "我的求生类游戏启蒙之作，8块钱入手的，赚翻了。\n特别硬核，但也特别好玩。只不过优化实在太差了。",
  },
  {
    id: "ip-1792682452757",
    sectionId: "cs2",
    title: "小鸡快点孵化",
    date: "2026-10-22",
    minutes: 3246,
    screenshots: ["https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0l000dlnm5sy7d2x7ujn8f8DIYPAIDyAqayAGxzDdU0Dqe=.jpg", "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0n000dlnm5uinb7tlpses9cDIYPAIDyAqayAGxzDdU0Dqe=.jpg", "https://1815356055.cdn.123clouddisk.com/1815356055/ymjew503t0m000dlnm5ts4aitva61znbDIYPAIDyAqayAGxzDdU0Dqe=.jpg"],
    content: "周奖励只有一个7角的箱子和2角的枪皮，没一个想要的，干脆选了个鸡蛋。\n快点孵化吧我亲爱的小鸡。",
  },
  {
    id: "ip-1792685024148",
    sectionId: "cs-1-6",
    title: "给童年补票了",
    date: "2026-02-12",
    minutes: 3066,
    rating: 9,
    content: "以前一直玩的都是自带Bot插件的盗版，今天也是赶着打折入手Steam正版了。",
  },
  {
    id: "ip-1792685469539",
    sectionId: "supermarkt-together",
    title: "又是一款神奇开黑游戏",
    date: "2026-01-22",
    minutes: 978,
    rating: 8,
    content: "可以和好友联机开超市，除了细节简陋了点，总体玩法还是非常有意思。",
  },
  {
    id: "ip-1792685680431",
    sectionId: "thief-simulator",
    title: "入手小偷模拟器",
    date: "2026-01-24",
    minutes: 558,
    content: "小时候看大博主玩过，自己也想玩，终于是补票了。",
  },
  {
    id: "ip-1792685897525",
    sectionId: "left-4-dead",
    title: "游戏史上最绝望的病毒",
    date: "2026-07-05",
    minutes: 924,
    content: "刚买完1代，才发现第二代可以直接玩第一代的内容，亏惨了。\n我见过的游戏史上最绝望的病毒，直接空气传播。。。",
  },
  {
    id: "ip-1792686050494",
    sectionId: "titan-full",
    title: "通关了",
    date: "2026-06-07",
    minutes: 455,
    rating: 9,
    content: "协议三：保护铁驭。\n剧情太感人了。",
  },
  {
    id: "ip-1792859085184",
    sectionId: "cs2",
    title: "我的小鸡怎么还没长大",
    date: "2026-10-24",
    content: "![](https://1815356055.cdn.123clouddisk.com/1815356055/yk6baz03t0m000dlnm5ry0k29zaisslvDIYPAIDyAqayAGxzDdU0Dqe=.jpg)\n都已经过去这么几天了，为什么还没长大。",
  }
];
