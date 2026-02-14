import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

// 网站基本配置
export const siteConfig: SiteConfig = {
	title: "Fuwari",  // 网站标题
	subtitle: "Demo Site",  // 网站副标题
	lang: "en", // 语言代码，例如 'en'（英文）、'zh_CN'（中文）、'ja'（日文）等
	themeColor: {  // 主题颜色设置
		hue: 250, // 主题色的默认色调，0-360度。例如：红色:0，青色:200，蓝紫色:250，粉红色:345
		fixed: false, // 是否固定主题色，true则访客无法切换颜色
	},
	banner: {  // 网站横幅图片设置
		enable: false,  // 是否启用横幅
		src: "assets/images/demo-banner.png", // 图片路径，相对于/src目录，如果以'/'开头则相对于/public目录
		position: "center", // 图片位置，相当于object-position属性，支持'top'、'center'、'bottom'，默认为'center'
		credit: {  // 图片来源信息
			enable: false, // 是否显示图片来源文字
			text: "", // 要显示的来源文字
			url: "", // （可选）原作品或艺术家页面的链接
		},
	},
	toc: {  // 文章目录设置
		enable: true, // 是否在文章右侧显示目录
		depth: 2, // 目录显示的最大标题深度，1-3，例如2表示显示h1和h2
	},
	favicon: [  // 网站图标设置，留空数组则使用默认图标
		// 如果需要自定义，按以下格式添加：
		// {
		//   src: '/favicon/icon.png',    // 图标路径，相对于/public目录
		//   theme: 'light',              // （可选）浅色或深色模式专用图标，可选'light'或'dark'
		//   sizes: '32x32',              // （可选）图标尺寸，如果有不同尺寸的图标才需要设置
		// }
	],
};

// 导航栏配置
export const navBarConfig: NavBarConfig = {
	links: [  // 导航链接列表
		LinkPreset.Home,  // 首页（预设链接）
		LinkPreset.Archive,  // 归档（预设链接）
		LinkPreset.About,  // 关于（预设链接）
		{  // 自定义链接
			name: "GitHub",  // 链接显示名称
			url: "https://github.com/saicaca/fuwari", // 链接地址，内部链接不需要加基础路径，会自动添加
			external: true, // 是否为外部链接，true会显示外部链接图标并在新标签页打开
		},
	],
};

// 个人资料配置
export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png", // 头像路径，相对于/src目录，如果以'/'开头则相对于/public目录
	name: "Lorem Ipsum",  // 显示的名字
	bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",  // 个人简介
	links: [  // 社交媒体链接列表
		{
			name: "Twitter",  // 平台名称
			icon: "fa6-brands:twitter", // 图标代码，可在 https://icones.js.org/ 查找
			// 如果没有对应的图标集，需要先安装：`pnpm add @iconify-json/<图标集名称>`
			url: "https://twitter.com",  // 个人主页链接
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://store.steampowered.com",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/saicaca/fuwari",
		},
	],
};

// 文章许可证配置
export const licenseConfig: LicenseConfig = {
	enable: true,  // 是否在文章底部显示许可证信息
	name: "CC BY-NC-SA 4.0",  // 许可证名称
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",  // 许可证详情链接
};

// 代码块样式配置
export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：某些样式（如背景色）可能在astro.config.mjs文件中被覆盖
	// 请选择深色主题，因为本博客主题目前只支持深色背景
	theme: "github-dark",  // 代码块主题，可选如'github-dark'、'dracula'等
};