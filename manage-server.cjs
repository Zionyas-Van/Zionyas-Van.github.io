// ============================================================
//  🛠️ ZionyasVan 内容管理工具 - 后端服务器 v2.0
//  用法: 双击 "管理工具.bat"
// ============================================================

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = __dirname;
// 端口可用环境变量覆盖（方便开第二个实例做测试，不影响双击启动）
const PORT = Number(process.env.PORT) || 3456;
const POSTS_DIR = path.join(ROOT, "src", "content", "posts");
const PROJECTS_FILE = path.join(ROOT, "src", "data", "projects.ts");
const VIDEOS_FILE = path.join(ROOT, "src", "data", "videos.ts");
const COVERS_DIR = path.join(ROOT, "public", "projects");
const COVERS_POST_DIR = path.join(ROOT, "public", "covers");
const RESOURCES_FILE = path.join(ROOT, "src", "data", "resources.ts");
const NOVELS_FILE = path.join(ROOT, "src", "data", "novels.ts");
const INTERESTS_FILE = path.join(ROOT, "src", "data", "interests.ts");

// ========== 解析 TypeScript 数据文件 ==========
// 从内容里取出 `export const xxx = [...]` 的数组字面量。
// 关键：必须跳过字符串内部和注释，否则字符串里的括号会让深度计数跑偏。
function extractArrayLiteral(content, arrayName) {
	const startMarker = `export const ${arrayName}`;
	const startIdx = content.indexOf(startMarker);
	if (startIdx === -1) throw new Error(`找不到 export const ${arrayName}`);
	const eqIdx = content.indexOf("=", startIdx);
	let i = eqIdx === -1 ? startIdx : eqIdx;
	while (i < content.length && content[i] !== "[") i++;
	if (i >= content.length) throw new Error("找不到数组起始位置");
	let depth = 0;
	let quote = null;
	let out = "";
	for (; i < content.length; i++) {
		const ch = content[i];
		const next = content[i + 1];
		const prev = content[i - 1];
		if (quote) {
			out += ch;
			if (ch === quote && prev !== "\\") quote = null;
			continue;
		}
		if (ch === '"' || ch === "'" || ch === "`") {
			quote = ch;
			out += ch;
			continue;
		}
		if (ch === "/" && next === "/") {
			while (i < content.length && content[i] !== "\n") i++;
			out += "\n";
			continue;
		}
		if (ch === "/" && next === "*") {
			const end = content.indexOf("*/", i);
			if (end === -1) throw new Error("块注释没有闭合");
			i = end + 1;
			continue;
		}
		if (ch === "[" || ch === "{") depth++;
		else if (ch === "]" || ch === "}") depth--;
		out += ch;
		if (depth === 0) return out;
	}
	throw new Error("数组没有正常闭合");
}

// 严格版：语法有问题就抛错（写盘自检用它）
function parseTsArrayStrict(filepath, arrayName) {
	const content = fs.readFileSync(filepath, "utf-8");
	const literal = extractArrayLiteral(content, arrayName);
	return new Function(`return (${literal});`)();
}

// 宽松版：解析失败返回空数组（读取接口用它，保证界面不会因为一个坏文件整体崩掉）
function parseTsArray(filepath, arrayName) {
	try {
		return parseTsArrayStrict(filepath, arrayName);
	} catch (e) {
		console.error("[解析失败]", path.basename(filepath), "-", e.message);
		return [];
	}
}

function rebuildArraySection(content, arrayName, items, itemFormatter) {
	const startMarker = `export const ${arrayName}`;
	const startIdx = content.indexOf(startMarker);
	if (startIdx === -1) return content;
	const eqIdx = content.indexOf("=", startIdx);
	const bracketStart =
		eqIdx !== -1 ? content.indexOf("[", eqIdx) : content.indexOf("[", startIdx);
	if (bracketStart === -1) return content;
	// 找配对的 ] 时必须跳过字符串和注释，否则正文里出现 [ ] { } 就会算错
	// （和 extractArrayLiteral 用的是同一套规则）
	let depth = 0;
	let quote = null;
	let i = bracketStart;
	for (; i < content.length; i++) {
		const ch = content[i];
		const next = content[i + 1];
		const prev = content[i - 1];
		if (quote) {
			if (ch === quote && prev !== "\\") quote = null;
			continue;
		}
		if (ch === '"' || ch === "'" || ch === "`") {
			quote = ch;
			continue;
		}
		if (ch === "/" && next === "/") {
			while (i < content.length && content[i] !== "\n") i++;
			continue;
		}
		if (ch === "/" && next === "*") {
			const end = content.indexOf("*/", i);
			if (end === -1) return content;
			i = end + 1;
			continue;
		}
		if (ch === "[" || ch === "{") depth++;
		else if (ch === "]" || ch === "}") {
			depth--;
			if (depth === 0 && ch === "]") break;
		}
	}
	if (i >= content.length) return content;
	const before = content.slice(0, bracketStart + 1);
	const after = content.slice(i);
	const middle =
		items.length === 0 ? "" : `\n${items.map(itemFormatter).join(",\n")}\n`;
	return before + middle + after;
}

// ========== 把字符串安全写进数据文件 ==========
// 注意：换行必须转义成 \n，否则会写出「跨行的字符串字面量」——
// 那会让 *_FILE.ts 变成非法 JS，直接导致网站构建失败（这是真实踩过的坑）。
function ds(v) {
	return String(v == null ? "" : v)
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\r?\n/g, "\\n");
}

// 写数组文件 + 写后自检：解析不回来就立刻回滚，绝不让工具把数据文件写坏
function saveArrayFile(filepath, arrayName, newContent) {
	const old = fs.readFileSync(filepath, "utf-8");
	fs.writeFileSync(filepath, newContent, "utf-8");
	try {
		const check = parseTsArrayStrict(filepath, arrayName);
		if (!Array.isArray(check)) throw new Error("解析结果不是数组");
	} catch (e) {
		fs.writeFileSync(filepath, old, "utf-8");
		throw new Error(
			`写入被拦截并已回滚：生成的数据文件语法有误（${e.message}）。文件未被修改。`,
		);
	}
	return true;
}

// 分区的网址标识：只允许 a-z 0-9 和连字符。
// 有人会把整条网址贴进这个字段（比如 https://www.rockstargames.com/zh/gta-v/），
// 那会让分区页变成 /interests/https:/… 这种畸形路径、直接把构建搞挂，
// 所以这里自动提取路径最后一段（gta-v）。
function slugifyAscii(s) {
	return String(s || "")
		.toLowerCase()
		.replace(/['"’”]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 40);
}
function sanitizeSectionId(raw) {
	const v = String(raw || "").trim();
	if (!v) return "";
	if (/^https?:\/\//i.test(v) || v.includes("/")) {
		const seg = v.split(/[?#]/)[0].split("/").filter(Boolean).filter((x) => !/^https?:$/i.test(x));
		const last = seg[seg.length - 1] || "";
		const host = seg[0] || "";
		// 最后一段通常才是想表达的标识；是域名的话退回用域名
		const candidate = last && !/^(www\.)?[a-z0-9-]+\.[a-z]{2,}$/i.test(last) ? last : host;
		return slugifyAscii(candidate);
	}
	return slugifyAscii(v);
}

// 日期统一补零成 yyyy-mm-dd，避免"2026-9-30"和"2026-10-1"排序错乱
function normalizeDate(v) {
	const s = String(v || "").trim();
	const m = s.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
	if (!m) return s || new Date().toISOString().slice(0, 10);
	return `${m[1]}-${String(m[2]).padStart(2, "0")}-${String(m[3]).padStart(2, "0")}`;
}

function formatProject(p) {
	const dl = (p.downloadLinks || [])
		.map((d) => {
			const parts = [];
			if (d.icon) parts.push(`icon: "${ds(d.icon)}"`);
			parts.push(`label: "${ds(d.label)}"`);
			parts.push(`url: "${ds(d.url)}"`);
			return `      { ${parts.join(", ")} }`;
		})
		.join(",\n");
	const tags = (p.tags || []).map((t) => `"${ds(t)}"`).join(", ");
	const screenshots = (p.screenshots || []).map((s) => `"${ds(s)}"`).join(", ");
	return `  {
    id: "${p.id}",
    title: "${ds(p.title)}",
    description: "${ds(p.description)}",
    longDescription: "${ds(p.longDescription)}",
    cover: "${p.cover || "/projects/placeholder-cover.jpg"}",
    screenshots: [${screenshots}],
    type: "${p.type}",
    tags: [${tags}],
    platform: "${ds(p.platform)}",
    status: "${ds(p.status || "开发中")}",
    downloadLinks: [
${dl}
    ],
    featured: ${p.featured === true},
  }`;
}

function formatVideo(v) {
	const desc = ds(v.description);
	return `  {
    id: "${v.id}",
    title: "${ds(v.title)}",
    bvid: "${v.bvid}",
    cover: "${v.cover || ""}",
    description: "${desc}",
    featured: ${v.featured === true},
  }`;
}

// ========== 兴趣分区 / 兴趣帖子 ==========
// 注意：字符串一律只走 ds() 转义一次（历史教训：双重转义会让数据每保存一次就多一层反斜杠）
function formatInterestSection(s) {
	const descLine = s.description ? `\n    description: "${ds(s.description)}",` : "";
	return `  {
    id: "${ds(s.id)}",
    name: "${ds(s.name)}",
    type: "${s.type || "other"}",
    cover: "${ds(s.cover)}",${descLine}
  }`;
}

function formatInterestPost(p) {
	const shots =
		Array.isArray(p.screenshots) && p.screenshots.length
			? `\n    screenshots: [${p.screenshots.map((x) => `"${ds(x)}"`).join(", ")}],`
			: "";
	const minutes = Number(p.minutes) > 0 ? `\n    minutes: ${Math.round(Number(p.minutes))},` : "";
	const rating =
		Number(p.rating) > 0 ? `\n    rating: ${Math.round(Number(p.rating) * 10) / 10},` : "";
	return `  {
    id: "${ds(p.id)}",
    sectionId: "${ds(p.sectionId)}",
    title: "${ds(p.title)}",
    date: "${ds(p.date)}",${minutes}${rating}${shots}
    content: "${ds(p.content)}",
  }`;
}

// ========== 扫描博客文章 (支持 category/slug.md 平铺格式) ==========
function scanAllPosts() {
	if (!fs.existsSync(POSTS_DIR)) {
		console.log("[scan] POSTS_DIR 不存在:", POSTS_DIR);
		return [];
	}
	const results = [];
	const dirs = fs.readdirSync(POSTS_DIR, { withFileTypes: true });
	console.log(
		"[scan] 找到分类文件夹:",
		dirs.filter((d) => d.isDirectory()).map((d) => d.name),
	);
	for (const dir of dirs) {
		if (!dir.isDirectory()) continue;
		try {
			const entries = fs.readdirSync(path.join(POSTS_DIR, dir.name), {
				withFileTypes: true,
			});
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
				if (entry.name === "index.md") continue;
				try {
					const slug = entry.name.replace(/\.md$/, "");
					const indexPath = path.join(POSTS_DIR, dir.name, entry.name);
					let raw = fs.readFileSync(indexPath, "utf-8");
					// 去掉 UTF-8 BOM（那个看不见的字符 ﻿）
					if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
					if (raw.charCodeAt(0) === 65279) raw = raw.slice(1);
					const fm = parseFrontmatter(raw);
					results.push({
						category: dir.name,
						displayCategory: fm.category || dir.name,
						slug: slug,
						title: fm.title || slug,
						description: fm.description || "",
						tags: fm.tags || [],
						published: fm.published || "",
						rawContent: fm.body || "",
						fullRaw: raw,
					});
				} catch (e) {
					console.error(
						"[scan] 读取文件失败:",
						path.join(dir.name, entry.name),
						e.message,
					);
				}
			}
		} catch (e) {
			console.error("[scan] 读目录失败:", dir.name, e.message);
		}
	}
	console.log("[scan] 共扫描到", results.length, "篇文章");
	return results;
}

function parseFrontmatter(raw) {
	// 去掉 UTF-8 BOM
	if (raw.charCodeAt(0) === 0xfeff || raw.charCodeAt(0) === 65279)
		raw = raw.slice(1);
	// 统一换行符
	raw = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	// 文件必须以 --- 开头
	if (!raw.startsWith("---")) return { body: raw };

	// 找第二个 ---（独立成行）
	const secondDash = raw.indexOf("\n---", 3);
	if (secondDash === -1) return { body: raw };

	// 提取 frontmatter 行和正文
	const fmStr = raw.slice(4, secondDash); // 跳过第一个 "---\n"
	let body = raw.slice(secondDash + 4); // 跳过 "\n---"
	if (body.startsWith("\n")) body = body.slice(1); // 去掉多余换行

	// 解析 frontmatter 键值对
	const result = { body };
	const lines = fmStr.split("\n");
	for (const line of lines) {
		const colonIdx = line.indexOf(":");
		if (colonIdx === -1) continue;
		const key = line.slice(0, colonIdx).trim();
		let val = line.slice(colonIdx + 1).trim();
		// 去首尾成对引号
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		// 数组 [xxx, yyy]
		if (val.startsWith("[") && val.endsWith("]")) {
			val = val
				.slice(1, -1)
				.split(",")
				.map((s) => s.trim().replace(/^["']|["']$/g, ""));
		}
		result[key] = val;
	}
	return result;
}

function toFrontmatter(fm) {
	const lines = [];
	if (fm.title) lines.push(`title: "${(fm.title || "").replace(/"/g, '\\"')}"`);
	if (fm.published) lines.push(`published: ${fm.published}`);
	if (fm.description !== undefined) {
		const d = fm.description || "";
		// 包含特殊字符用单引号包裹，否则双引号
		if (d.includes("'") && !d.includes('"'))
			lines.push(`description: "${d.replace(/"/g, '\\"')}"`);
		else if (d.includes('"') || d.includes(":"))
			lines.push(`description: '${d.replace(/'/g, "\\'")}'`);
		else lines.push(`description: "${d}"`);
	}
	if (fm.image !== undefined && fm.image !== "")
		lines.push(`image: "${(fm.image || "").replace(/"/g, '\\"')}"`);
	if (fm.tags && fm.tags.length > 0) {
		lines.push(
			`tags: [${fm.tags.map((t) => `"${(t || "").replace(/"/g, '\\"')}"`).join(", ")}]`,
		);
	}
	if (fm.category)
		lines.push(`category: "${(fm.category || "").replace(/"/g, '\\"')}"`);
	if (fm.draft !== undefined)
		lines.push(
			`draft: ${fm.draft === true || fm.draft === "true" ? "true" : "false"}`,
		);
	if (fm.lang !== undefined && fm.lang !== "")
		lines.push(`lang: '${(fm.lang || "").replace(/'/g, "\\'")}'`);
	return `---\n${lines.join("\n")}\n---\n`;
}

// ========== 工具函数 ==========
function sendJSON(res, data, status = 200) {
	res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
	return new Promise((resolve) => {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", () => resolve(body));
	});
}

function scanPostCategories() {
	if (!fs.existsSync(POSTS_DIR)) return [];
	return fs
		.readdirSync(POSTS_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);
}

function tsString(str) {
	return JSON.stringify(str);
}

function now() {
	const d = new Date();
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function saveCover(base64, filename) {
	if (!base64 || base64 === "") return "";
	const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
	if (!matches) return "";
	const ext = matches[1] === "png" ? "png" : "jpg";
	const fullname = `${filename}.${ext}`;
	const filepath = path.join(COVERS_DIR, fullname);
	fs.writeFileSync(filepath, Buffer.from(matches[2], "base64"));
	return `/projects/${fullname}`;
}

function _savePostCover(base64, slug) {
	if (!base64 || base64 === "") return "";
	const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
	if (!matches) return "";
	const ext = matches[1] === "png" ? "png" : "jpg";
	fs.mkdirSync(COVERS_POST_DIR, { recursive: true });
	const filepath = path.join(COVERS_POST_DIR, `${slug}.${ext}`);
	fs.writeFileSync(filepath, Buffer.from(matches[2], "base64"));
	return `/covers/${slug}.${ext}`;
}

// ========== 自动生成 slug / 标签汇总 / 网络请求 ==========

// 按标题生成 URL 标识：英文数字转成短横线形式；
// 中文标题（或英文部分太短）用「日期 + 随机串」兜底，避免出现一堆看不懂的编码
function slugify(title, existing = new Set()) {
	let base = String(title || "")
		.toLowerCase()
		.replace(/['"’”]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	if (base.length < 3) {
		const d = new Date();
		const pad = (n) => String(n).padStart(2, "0");
		base = `post-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random()
			.toString(36)
			.slice(2, 6)}`;
	}
	base = base.slice(0, 60).replace(/-+$/g, "");
	let slug = base;
	let i = 2;
	while (existing.has(slug)) slug = `${base}-${i++}`;
	return slug;
}

// 汇总全站已用过的标签（文章 frontmatter + 作品 + 视频）
function collectTags() {
	const tags = new Set();
	const addAll = (arr) =>
		(arr || []).forEach((t) => {
			const v = String(t == null ? "" : t).trim();
			if (v) tags.add(v);
		});
	const walk = (dir, depth = 0) => {
		if (!fs.existsSync(dir) || depth > 4) return;
		for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, d.name);
			if (d.isDirectory()) walk(full, depth + 1);
			else if (d.name.endsWith(".md")) {
				const txt = fs.readFileSync(full, "utf-8");
				const m = txt.match(/^tags:\s*\[([^\]]*)\]/m);
				if (m) {
					addAll(
						m[1]
							.split(",")
							.map((s) => s.trim().replace(/^["']|["']$/g, "")),
					);
				}
			}
		}
	};
	walk(POSTS_DIR);
	addAll(parseTsArray(PROJECTS_FILE, "projects").flatMap((p) => p.tags || []));
	addAll(parseTsArray(VIDEOS_FILE, "videos").flatMap((v) => v.tags || []));
	addAll(parseTsArray(path.join(ROOT, "src", "data", "novels.ts"), "novels").flatMap((n) => n.tags || []));
	return [...tags].filter(Boolean).sort((a, b) => a.localeCompare(b, "zh"));
}

let deployCache = { at: 0, data: null };

async function fetchJSON(url, headers = {}) {
	const r = await fetch(url, { headers });
	if (!r.ok) throw new Error(`HTTP ${r.status}`);
	return r.json();
}

// ========== 请求路由 ==========
const server = http.createServer(async (req, res) => {
	const NO_STORE = {
		"Cache-Control": "no-store, no-cache, must-revalidate",
		Pragma: "no-cache",
	};

	if (
		req.method === "GET" &&
		(req.url === "/" || req.url === "/manage-ui.html")
	) {
		const html = fs.readFileSync(path.join(ROOT, "manage-ui.html"), "utf-8");
		// 必须禁止缓存：否则改完界面刷新看到的还是旧版本（这是之前"改了没用"的元凶）
		res.writeHead(200, {
			"Content-Type": "text/html; charset=utf-8",
			...NO_STORE,
		});
		return res.end(html);
	}

	// 图标表（Material Symbols 的内联路径）单独一个文件，改界面时不用碰它
	if (req.method === "GET" && req.url === "/manage-icons.js") {
		const file = path.join(ROOT, "manage-icons.js");
		const js = fs.existsSync(file)
			? fs.readFileSync(file, "utf-8")
			: "window.MS_ICONS = {};";
		res.writeHead(200, {
			"Content-Type": "application/javascript; charset=utf-8",
			...NO_STORE,
		});
		return res.end(js);
	}

	// 本地图片预览：只允许 public 下的白名单目录（防目录穿越）
	if (
		req.method === "GET" &&
		/^\/(uploads|projects|covers|novels|images)\//.test(req.url || "")
	) {
		const rel = decodeURIComponent((req.url || "").split("?")[0]).replace(
			/^\/+/,
			"",
		);
		const publicDir = path.join(ROOT, "public");
		const full = path.resolve(publicDir, rel);
		if (
			full.startsWith(publicDir + path.sep) &&
			fs.existsSync(full) &&
			fs.statSync(full).isFile()
		) {
			const ext = path.extname(full).toLowerCase();
			const mime =
				ext === ".png"
					? "image/png"
					: ext === ".webp"
						? "image/webp"
						: ext === ".gif"
							? "image/gif"
							: ext === ".svg"
								? "image/svg+xml"
								: "image/jpeg";
			res.writeHead(200, { "Content-Type": mime, ...NO_STORE });
			return res.end(fs.readFileSync(full));
		}
		return sendJSON(res, { error: "图片不存在" }, 404);
	}

	// API: 扫描分类
	if (req.method === "GET" && req.url === "/api/categories") {
		return sendJSON(res, scanPostCategories());
	}

	// API: 已用过的全部标签（给标签输入做候选，不用再手打逗号）
	if (req.method === "GET" && req.url === "/api/tags") {
		return sendJSON(res, collectTags());
	}

	// API: 资源元信息（已有分类，供新建资源时下拉选择）
	if (req.method === "GET" && req.url === "/api/resources/meta") {
		const items = parseTsArray(
			path.join(ROOT, "src", "data", "resources.ts"),
			"resources",
		);
		const cats = [
			...new Set(items.map((r) => r.category).filter(Boolean)),
		].sort();
		return sendJSON(res, { categories: cats, count: items.length });
	}

	// API: 概览（首页仪表盘用）
	if (req.method === "GET" && req.url === "/api/summary") {
		const posts = scanAllPosts();
		const recent = posts
			.slice()
			.sort((a, b) => String(b.published || "").localeCompare(String(a.published || "")))
			.slice(0, 5)
			.map((p) => ({
				title: p.title,
				category: p.category,
				slug: p.slug,
				published: p.published,
			}));
		return sendJSON(res, {
			counts: {
				posts: posts.length,
				projects: parseTsArray(PROJECTS_FILE, "projects").length,
				videos: parseTsArray(VIDEOS_FILE, "videos").length,
				novels: parseTsArray(NOVELS_FILE, "novels").length,
				resources: parseTsArray(
					path.join(ROOT, "src", "data", "resources.ts"),
					"resources",
				).length,
			},
			categories: scanPostCategories(),
			tags: collectTags(),
			recent,
		});
	}

	// API: GitHub Actions 部署状态（公开仓库，无需 token）
	if (req.method === "GET" && (req.url || "").startsWith("/api/deploy-status")) {
		const now = Date.now();
		if (deployCache.data && now - deployCache.at < 5000) {
			return sendJSON(res, deployCache.data);
		}
		try {
			const api = "https://api.github.com/repos/Zionyas-Van/Zionyas-Van.github.io";
			const headers = {
				"User-Agent": "zionyasvan-manage-tool",
				Accept: "application/vnd.github+json",
			};
			const runs = await fetchJSON(`${api}/actions/runs?per_page=1`, headers);
			const run = runs && runs.workflow_runs && runs.workflow_runs[0];
			if (!run) return sendJSON(res, { error: "没有查到部署记录" }, 404);
			let jobs = [];
			try {
				const j = await fetchJSON(`${api}/actions/runs/${run.id}/jobs`, headers);
				jobs = (j.jobs || []).map((x) => ({
					name: x.name,
					status: x.status,
					conclusion: x.conclusion,
					startedAt: x.started_at,
					completedAt: x.completed_at,
					steps: (x.steps || []).map((s) => ({
						name: s.name,
						status: s.status,
						conclusion: s.conclusion,
					})),
				}));
			} catch {}
			const data = {
				ok: true,
				run: {
					number: run.run_number,
					status: run.status,
					conclusion: run.conclusion,
					title: run.display_title,
					sha: (run.head_sha || "").slice(0, 7),
					branch: run.head_branch,
					createdAt: run.created_at,
					updatedAt: run.updated_at,
					url: run.html_url,
				},
				jobs,
				fetchedAt: new Date().toISOString(),
			};
			deployCache = { at: now, data };
			return sendJSON(res, data);
		} catch (e) {
			return sendJSON(res, { error: `查询失败: ${e.message}` }, 502);
		}
	}

	// API: 上传本地图片（存到 public/uploads，返回可直接使用的路径）
	if (req.method === "POST" && req.url === "/api/upload-image") {
		try {
			const body = JSON.parse(await readBody(req));
			const base64 = body.data || body.base64 || "";
			const matches = String(base64).match(/^data:image\/(\w+);base64,(.+)$/);
			if (!matches)
				return sendJSON(res, { error: "图片格式无法识别（需要 png/jpg/webp/gif）" }, 400);
			const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
			const dir = path.join(ROOT, "public", "uploads");
			fs.mkdirSync(dir, { recursive: true });
			const stamp = new Date()
				.toISOString()
				.replace(/[-:T]/g, "")
				.slice(0, 14);
			const name = `${stamp}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
			fs.writeFileSync(path.join(dir, name), Buffer.from(matches[2], "base64"));
			return sendJSON(res, { ok: true, path: `/uploads/${name}` });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// API: 扫描分类（旧位置保留兼容）
	if (req.method === "GET" && req.url === "/api/categories") {
		return sendJSON(res, scanPostCategories());
	}

	// API: 发布博客
	if (req.method === "POST" && req.url === "/api/create-post") {
		try {
			const body = JSON.parse(await readBody(req));
			const {
				title,
				description,
				tags,
				category,
				displayCategory,
				slug,
				content,
				image,
				draft,
				lang,
				coverBase64,
			} = body;

			if (!title || !category || !content) {
				return sendJSON(res, { error: "标题、分类文件夹和内容不能为空" }, 400);
			}

			// slug 可以留空：留空时按标题自动生成（英文标题→短横线形式；中文标题→日期+随机串）
			const postDir = path.join(POSTS_DIR, category);
			const existingSlugs = fs.existsSync(postDir)
				? new Set(
						fs
							.readdirSync(postDir)
							.filter((f) => f.endsWith(".md"))
							.map((f) => f.replace(/\.md$/, "")),
					)
				: new Set();
			let finalSlug = String(slug || "")
				.trim()
				.replace(/[\\/:*?"<>|\s]+/g, "-")
				.replace(/^-+|-+$/g, "");
			if (!finalSlug) finalSlug = slugify(title, existingSlugs);

			const filePath = path.join(postDir, `${finalSlug}.md`);
			if (fs.existsSync(filePath)) {
				return sendJSON(
					res,
					{ error: `文件已存在: ${category}/${finalSlug}.md` },
					400,
				);
			}

			fs.mkdirSync(path.join(POSTS_DIR, category), { recursive: true });

			// 处理封面图上传
			let imagePath = image || "";
			if (coverBase64) {
				fs.mkdirSync(COVERS_POST_DIR, { recursive: true });
				const matches = coverBase64.match(/^data:image\/(\w+);base64,(.+)$/);
				if (matches) {
					const ext = matches[1] === "png" ? "png" : "jpg";
					const coverName = `${finalSlug}.${ext}`;
					fs.writeFileSync(
						path.join(COVERS_POST_DIR, coverName),
						Buffer.from(matches[2], "base64"),
					);
					imagePath = `/covers/${coverName}`;
				}
			}

			const tagsArr = tags
				? Array.isArray(tags)
					? tags
					: tags
							.split(",")
							.map((t) => t.trim())
							.filter(Boolean)
				: [];
			const tagsStr = tagsArr.map(tsString).join(", ");
			const descStr = tsString(description || "");
			const catDisplay = displayCategory || category;

			const md = `---
title: ${tsString(title)}
published: ${now()}
description: ${descStr}${imagePath ? `\nimage: "${imagePath}"` : ""}
tags: [${tagsStr}]
category: ${tsString(catDisplay)}
draft: ${draft === true || draft === "true" ? "true" : "false"}${lang ? `\nlang: '${lang}'` : ""}
---

${content}
`;

			fs.writeFileSync(filePath, md, "utf-8");
			return sendJSON(res, {
				ok: true,
				path: `${category}/${finalSlug}.md`,
				slug: finalSlug,
			});
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// API: 新建项目
	if (req.method === "POST" && req.url === "/api/create-project") {
		try {
			const body = JSON.parse(await readBody(req));
			const {
				id,
				title,
				description,
				longDescription,
				type,
				tags,
				platform,
				status,
				downloadLinks,
				featured,
				cover,
				coverBase64,
				screenshots,
			} = body;

			if (!id || !title || !type) {
				return sendJSON(res, { error: "id、名称和类型不能为空" }, 400);
			}

			let coverPath = cover || "/projects/placeholder-cover.jpg";
			if (coverBase64) {
				const saved = saveCover(coverBase64, id);
				if (saved) coverPath = saved;
			}

			const _dlStr = (downloadLinks || [])
				.filter((l) => l.label && l.url)
				.map((l) => {
					const iconPart = l.icon ? `icon: ${tsString(l.icon)}, ` : "";
					return `      { ${iconPart}label: ${tsString(l.label)}, url: ${tsString(l.url)} }`;
				})
				.join(",\n");

			const newProject = {
				id,
				title,
				description: description || "",
				longDescription: longDescription || "",
				cover: coverPath,
				// 宣传图（多张）：之前这里被写死成空数组，导致新建作品永远没有宣传图
				screenshots: (Array.isArray(screenshots) ? screenshots : [])
					.map((s) => String(s || "").trim())
					.filter(Boolean),
				type,
				tags: tags || [],
				platform: platform || "",
				status: status || "开发中",
				downloadLinks: downloadLinks || [],
				featured: featured === true || featured === "true",
			};

			insertIntoArrayFile(PROJECTS_FILE, "projects", newProject, formatProject);
			return sendJSON(res, { ok: true, id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// ========== 资源管理 API ==========
	function formatResource(r) {
		const desc = ds(r.description);
		const categoryLine = r.category ? `\n    category: "${ds(r.category)}",` : "";
		const coverLine = r.cover ? `\n    cover: "${ds(r.cover)}",` : "";
		return `  {
    id: "${r.id}",
    name: "${ds(r.name)}",
    description: "${desc}",
    url: "${ds(r.url)}",${categoryLine}${coverLine}
  }`;
	}

	if (req.method === "GET" && req.url === "/api/resources/list") {
		const items = parseTsArray(RESOURCES_FILE, "resources");
		return sendJSON(res, items);
	}

	if (req.method === "POST" && req.url === "/api/resources/add") {
		try {
			const body = JSON.parse(await readBody(req));
			const { name, description, url, category, cover } = body;
			if (!name || !url)
				return sendJSON(res, { error: "名称和链接不能为空" }, 400);
			const id = `res-${Date.now()}`;
			const items = parseTsArray(RESOURCES_FILE, "resources");
			const newItem = {
				id,
				name,
				description: description || "",
				url,
			};
			if (category) newItem.category = category;
			if (cover) newItem.cover = cover;
			items.push(newItem);
			const content = fs.readFileSync(RESOURCES_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"resources",
				items,
				formatResource,
			);
			saveArrayFile(RESOURCES_FILE, "resources", newContent);
			return sendJSON(res, { ok: true, id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "PUT" && req.url === "/api/resources/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const items = parseTsArray(RESOURCES_FILE, "resources");
			const idx = items.findIndex((r) => r.id === body.id);
			if (idx === -1) return sendJSON(res, { error: "资源不存在" }, 404);
			items[idx] = { ...items[idx], ...body };
			const content = fs.readFileSync(RESOURCES_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"resources",
				items,
				formatResource,
			);
			saveArrayFile(RESOURCES_FILE, "resources", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "DELETE" && req.url.startsWith("/api/resources/delete")) {
		try {
			const u = new URL(req.url, `http://localhost:${PORT}`);
			const id = u.searchParams.get("id");
			const items = parseTsArray(RESOURCES_FILE, "resources");
			const filtered = items.filter((r) => r.id !== id);
			if (filtered.length === items.length)
				return sendJSON(res, { error: "资源不存在" }, 404);
			const content = fs.readFileSync(RESOURCES_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"resources",
				filtered,
				formatResource,
			);
			saveArrayFile(RESOURCES_FILE, "resources", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// API: 新建视频
	if (req.method === "POST" && req.url === "/api/create-video") {
		try {
			const body = JSON.parse(await readBody(req));
			const { id, title, bvid, description, featured, cover, coverBase64 } =
				body;

			if (!id || !title || !bvid) {
				return sendJSON(res, { error: "id、标题和BV号不能为空" }, 400);
			}

			let coverPath = cover || "";
			if (coverBase64) {
				const saved = saveCover(coverBase64, `video-${id}`);
				if (saved) coverPath = saved;
			}

			const newVideo = {
				id,
				title,
				bvid,
				cover: coverPath,
				description: description || "",
				featured: featured === true || featured === "true",
			};

			insertIntoArrayFile(VIDEOS_FILE, "videos", newVideo, formatVideo);
			return sendJSON(res, { ok: true, id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// API: 推送
	// 提交已经落在本地了，所以"再推一次"永远是安全的：
	// 偶发的 DNS 抖动（ssh: Could not resolve hostname github.com）重试几次基本都能过去。
	function isNetworkGlitch(s) {
		return /could not resolve|name or service not known|name resolution|network is unreachable|connection timed out|operation timed out|connection reset|early eof|broken pipe|failed to connect/i.test(
			String(s || ""),
		);
	}
	function sleepMs(ms) {
		Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
	}
	function gitPushWithRetry(log) {
		for (let i = 1; ; i++) {
			try {
				return execSync("git push", { cwd: ROOT, encoding: "utf-8" }).trim();
			} catch (e) {
				const msg = String(e.stderr || e.message || "");
				if (i >= 3 || !isNetworkGlitch(msg)) throw e;
				if (log) log.push(`第 ${i} 次推送碰上网络抖动，2 秒后自动重试…`);
				sleepMs(2000 * i);
			}
		}
	}

	if (req.method === "POST" && req.url === "/api/push") {
		try {
			const body = JSON.parse(await readBody(req));
			const msg = body.message || "通过管理工具更新内容";

			const log = [];
			log.push(execSync("git add .", { cwd: ROOT, encoding: "utf-8" }).trim());
			log.push(
				execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, {
					cwd: ROOT,
					encoding: "utf-8",
				}).trim(),
			);
			log.push(gitPushWithRetry(log));

			return sendJSON(res, { ok: true, log: log.filter(Boolean).join("\n") });
		} catch (e) {
			const stderr = e.stderr || e.message || "";
			if (stderr.includes("nothing to commit")) {
				try {
					const pushLog = gitPushWithRetry();
					return sendJSON(res, {
						ok: true,
						log: `没有新内容需要提交\n${pushLog}`,
					});
				} catch (e2) {
					const m2 = String(e2.stderr || e2.message || "");
					const hint2 = isNetworkGlitch(m2)
						? "（网络/域名解析暂时不可用，不是权限问题。等半分钟再点一次「开始推送」即可。）"
						: "";
					return sendJSON(res, { error: `推送失败${hint2}: ${m2}` }, 500);
				}
			}
			const hint = isNetworkGlitch(stderr)
				? "（这是网络/域名解析暂时不可用，不是权限或仓库问题；改动已经安全提交到本地，等半分钟再点一次「开始推送」就行。）"
				: "";
			return sendJSON(res, { error: `Git 操作失败${hint}: ${stderr}` }, 500);
		}
	}

	// ========== 管理 API ==========

	// 列出所有博客文章
	if (req.method === "GET" && req.url === "/api/posts/list") {
		const posts = scanAllPosts().map((p) => ({
			category: p.category,
			slug: p.slug,
			title: p.title,
			displayCategory: p.displayCategory,
			description: p.description,
			tags: p.tags,
			published: p.published,
		}));
		return sendJSON(res, posts);
	}

	// 获取单篇文章详情
	if (req.method === "GET" && req.url.startsWith("/api/posts/detail")) {
		const u = new URL(req.url, `http://localhost:${PORT}`);
		const category = u.searchParams.get("category");
		const slug = u.searchParams.get("slug");
		// 新格式: category/slug.md
		const indexPath = path.join(POSTS_DIR, category, `${slug}.md`);
		// 兼容旧格式: category/slug/index.md
		const oldPath = path.join(POSTS_DIR, category, slug, "index.md");
		const realPath = fs.existsSync(indexPath)
			? indexPath
			: fs.existsSync(oldPath)
				? oldPath
				: null;
		if (!realPath) return sendJSON(res, { error: "文章不存在" }, 404);
		const raw = fs.readFileSync(realPath, "utf-8");
		const fm = parseFrontmatter(raw);
		return sendJSON(res, {
			category,
			slug,
			title: fm.title,
			description: fm.description,
			tags: fm.tags,
			published: fm.published,
			content: fm.body,
			image: fm.image || "",
			draft: fm.draft,
			lang: fm.lang,
			displayCategory: fm.category || category,
		});
	}

	// 更新文章
	if (req.method === "PUT" && req.url === "/api/posts/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const {
				category,
				slug,
				title,
				description,
				tags,
				content,
				image,
				draft,
				lang,
				coverBase64,
			} = body;
			if (!category || !slug)
				return sendJSON(res, { error: "分类和slug不能为空" }, 400);

			// 找到现有文件
			let indexPath = path.join(POSTS_DIR, category, `${slug}.md`);
			if (!fs.existsSync(indexPath)) {
				indexPath = path.join(POSTS_DIR, category, slug, "index.md");
			}
			if (!fs.existsSync(indexPath))
				return sendJSON(res, { error: "文章不存在" }, 404);

			// 读取旧的 frontmatter 以保留一些字段
			const oldRaw = fs.readFileSync(indexPath, "utf-8");
			const oldFm = parseFrontmatter(oldRaw);

			// 处理封面图覆盖
			let imagePath = image !== undefined ? image : oldFm.image;
			if (coverBase64) {
				fs.mkdirSync(COVERS_POST_DIR, { recursive: true });
				const matches = coverBase64.match(/^data:image\/(\w+);base64,(.+)$/);
				if (matches) {
					const ext = matches[1] === "png" ? "png" : "jpg";
					const coverName = `${slug}.${ext}`;
					fs.writeFileSync(
						path.join(COVERS_POST_DIR, coverName),
						Buffer.from(matches[2], "base64"),
					);
					imagePath = `/covers/${coverName}`;
				}
			}

			const tagsArr = tags
				? Array.isArray(tags)
					? tags
					: tags
							.split(",")
							.map((t) => t.trim())
							.filter(Boolean)
				: [];

			const fm = {
				title: title || oldFm.title || slug,
				published:
					oldFm.published ||
					new Date().toISOString().replace("T", " ").slice(0, 19),
				description:
					description !== undefined ? description : oldFm.description || "",
				image: imagePath !== undefined ? imagePath : oldFm.image || "",
				tags: tagsArr.length > 0 ? tagsArr : oldFm.tags || [],
				category: category || oldFm.category,
				draft: draft !== undefined ? draft : oldFm.draft,
				lang: lang !== undefined ? lang : oldFm.lang || "",
			};

			const newMd =
				toFrontmatter(fm) +
				(content !== undefined ? content : oldFm.body || "");
			fs.writeFileSync(indexPath, newMd, "utf-8");
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// 删除文章
	if (req.method === "DELETE" && req.url.startsWith("/api/posts/delete")) {
		try {
			const u = new URL(req.url, `http://localhost:${PORT}`);
			const category = u.searchParams.get("category");
			const slug = u.searchParams.get("slug");
			if (!category || !slug)
				return sendJSON(res, { error: "参数不完整" }, 400);
			// 删除 .md 文件
			const filePath = path.join(POSTS_DIR, category, `${slug}.md`);
			// 兼容旧格式子文件夹
			const dirPath = path.join(POSTS_DIR, category, slug);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			} else if (fs.existsSync(dirPath)) {
				fs.rmSync(dirPath, { recursive: true, force: true });
			} else {
				return sendJSON(res, { error: "文章不存在" }, 404);
			}
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// 列出所有项目
	if (req.method === "GET" && req.url === "/api/projects/list") {
		const projs = parseTsArray(PROJECTS_FILE, "projects");
		return sendJSON(res, projs);
	}

	// 更新项目
	if (req.method === "PUT" && req.url === "/api/projects/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const projs = parseTsArray(PROJECTS_FILE, "projects");
			const idx = projs.findIndex((p) => p.id === body.id);
			if (idx === -1) return sendJSON(res, { error: "项目不存在" }, 404);

			let coverPath = body.cover !== undefined ? body.cover : projs[idx].cover;
			if (body.coverBase64) {
				const saved = saveCover(body.coverBase64, body.id);
				if (saved) coverPath = saved;
			}

			projs[idx] = {
				...projs[idx],
				...body,
				cover: coverPath,
			};
			delete projs[idx].coverBase64;

			const content = fs.readFileSync(PROJECTS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"projects",
				projs,
				formatProject,
			);
			saveArrayFile(PROJECTS_FILE, "projects", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// 删除项目
	if (req.method === "DELETE" && req.url.startsWith("/api/projects/delete")) {
		try {
			const u = new URL(req.url, `http://localhost:${PORT}`);
			const id = u.searchParams.get("id");
			const projs = parseTsArray(PROJECTS_FILE, "projects");
			const filtered = projs.filter((p) => p.id !== id);
			if (filtered.length === projs.length)
				return sendJSON(res, { error: "项目不存在" }, 404);
			const content = fs.readFileSync(PROJECTS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"projects",
				filtered,
				formatProject,
			);
			saveArrayFile(PROJECTS_FILE, "projects", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// 列出所有视频
	if (req.method === "GET" && req.url === "/api/videos/list") {
		const vids = parseTsArray(VIDEOS_FILE, "videos");
		return sendJSON(res, vids);
	}

	// 更新视频
	if (req.method === "PUT" && req.url === "/api/videos/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const vids = parseTsArray(VIDEOS_FILE, "videos");
			const idx = vids.findIndex((v) => v.id === body.id);
			if (idx === -1) return sendJSON(res, { error: "视频不存在" }, 404);

			let coverPath = body.cover !== undefined ? body.cover : vids[idx].cover;
			if (body.coverBase64) {
				const saved = saveCover(body.coverBase64, `video-${body.id}`);
				if (saved) coverPath = saved;
			}

			vids[idx] = {
				...vids[idx],
				...body,
				cover: coverPath,
			};
			delete vids[idx].coverBase64;

			const content = fs.readFileSync(VIDEOS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"videos",
				vids,
				formatVideo,
			);
			saveArrayFile(VIDEOS_FILE, "videos", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// 删除视频
	if (req.method === "DELETE" && req.url.startsWith("/api/videos/delete")) {
		try {
			const u = new URL(req.url, `http://localhost:${PORT}`);
			const id = u.searchParams.get("id");
			const vids = parseTsArray(VIDEOS_FILE, "videos");
			const filtered = vids.filter((v) => v.id !== id);
			if (filtered.length === vids.length)
				return sendJSON(res, { error: "视频不存在" }, 404);
			const content = fs.readFileSync(VIDEOS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"videos",
				filtered,
				formatVideo,
			);
			saveArrayFile(VIDEOS_FILE, "videos", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// ========== 小说管理 API ==========
	function formatNovel(n) {
		// 一律用 ds() 转义一次就够；不要再套一层，否则每保存一次就多一层反斜杠
		const intro = ds(n.intro);
		const desc = ds(n.description);
		const chapters = (n.chapters || [])
			.map((ch) => {
				const chContent = ds(ch.content);
				const chTitle = ds(ch.title);
				const chDate = ds(ch.date);
				return `    {
      slug: "${ch.slug}",
      title: "${chTitle}",${chDate ? `\n      date: "${chDate}",` : ""}
      content: "${chContent}",
    }`;
			})
			.join(",\n");
		// 创作日志：没有就整段不写（旧数据不会被塞进 logs: []）
		const logs = (n.logs || [])
			.map((g) => {
				const imgs = (g.images || [])
					.filter(Boolean)
					.map((x) => `"${ds(x)}"`)
					.join(", ");
				const imgsLine = imgs ? `\n        images: [${imgs}],` : "";
				const chLine = g.chapterSlug
					? `\n        chapterSlug: "${ds(g.chapterSlug)}",`
					: "";
				return `      {
        title: "${ds(g.title)}",
        date: "${ds(g.date)}",${imgsLine}${chLine}
        content: "${ds(g.content)}",
      }`;
			})
			.join(",\n");
		const logsLine = logs ? `\n    logs: [\n${logs}\n    ],` : "";
		return `  {
    id: "${n.id}",
    title: "${ds(n.title)}",
    cover: "${n.cover || "/novels/cover-placeholder.jpg"}",
    description: "${desc}",
    author: "${ds(n.author)}",
    publishedDate: "${ds(n.publishedDate)}",
    platform: "${ds(n.platform)}",
    intro: "${intro}",
    chapters: [
${chapters}
    ],${logsLine}
  }`;
	}

	if (req.method === "GET" && req.url === "/api/novels/list") {
		const items = parseTsArray(NOVELS_FILE, "novels");
		return sendJSON(
			res,
			items.map((n) => ({ ...n, chapters: n.chapters || [] })),
		);
	}

	if (req.method === "POST" && req.url === "/api/novels/add") {
		try {
			const body = JSON.parse(await readBody(req));
			const {
				title,
				description,
				author,
				publishedDate,
				platform,
				intro,
				chapters,
				cover,
				coverBase64,
			} = body;
			if (!title) return sendJSON(res, { error: "小说名称不能为空" }, 400);
			const id = `novel-${Date.now()}`;
			let coverPath = cover || "/novels/cover-placeholder.jpg";
			if (coverBase64) {
				const saved = saveCover(coverBase64, id);
				if (saved) coverPath = saved;
			}
			const newNovel = {
				id,
				title,
				cover: coverPath,
				description: description || "",
				author: author || "",
				publishedDate: publishedDate || "",
				platform: platform || "",
				intro: intro || "",
				chapters: chapters || [],
			};
			insertIntoArrayFile(NOVELS_FILE, "novels", newNovel, formatNovel);
			return sendJSON(res, { ok: true, id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "PUT" && req.url === "/api/novels/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const items = parseTsArray(NOVELS_FILE, "novels");
			const idx = items.findIndex((n) => n.id === body.id);
			if (idx === -1) return sendJSON(res, { error: "小说不存在" }, 404);
			let coverPath = body.cover !== undefined ? body.cover : items[idx].cover;
			if (body.coverBase64) {
				const saved = saveCover(body.coverBase64, body.id);
				if (saved) coverPath = saved;
			}
			items[idx] = { ...items[idx], ...body, cover: coverPath };
			delete items[idx].coverBase64;
			const content = fs.readFileSync(NOVELS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"novels",
				items,
				formatNovel,
			);
			saveArrayFile(NOVELS_FILE, "novels", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "DELETE" && req.url.startsWith("/api/novels/delete")) {
		try {
			const u = new URL(req.url, `http://localhost:${PORT}`);
			const id = u.searchParams.get("id");
			const items = parseTsArray(NOVELS_FILE, "novels");
			const filtered = items.filter((n) => n.id !== id);
			if (filtered.length === items.length)
				return sendJSON(res, { error: "小说不存在" }, 404);
			const content = fs.readFileSync(NOVELS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"novels",
				filtered,
				formatNovel,
			);
			saveArrayFile(NOVELS_FILE, "novels", newContent);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// ==================== 兴趣分区 ====================
	if (req.method === "GET" && req.url === "/api/interests/sections/list") {
		return sendJSON(res, parseTsArray(INTERESTS_FILE, "interestSections"));
	}

	if (req.method === "POST" && req.url === "/api/interests/sections/add") {
		try {
			const body = JSON.parse(await readBody(req));
			if (!body.name) return sendJSON(res, { error: "分区名称不能为空" }, 400);
			const items = parseTsArray(INTERESTS_FILE, "interestSections");
			if (items.some((s) => s.name === body.name))
				return sendJSON(res, { error: `已经有一个叫「${body.name}」的分区了` }, 400);
			let id = sanitizeSectionId(body.id) || slugify(body.name, new Set(items.map((x) => x.id)));
			if (!sanitizeSectionId(body.id) && id.startsWith("post-")) id = id.replace(/^post-/, "sec-");
			if (items.some((x) => x.id === id))
				return sendJSON(res, { error: `标识「${id}」已被占用，换一个` }, 400);
			const item = {
				id,
				name: body.name,
				type: body.type || "other",
				cover: body.cover || "",
			};
			if (body.description) item.description = body.description;
			items.push(item);
			const content = fs.readFileSync(INTERESTS_FILE, "utf-8");
			saveArrayFile(
				INTERESTS_FILE,
				"interestSections",
				rebuildArraySection(content, "interestSections", items, formatInterestSection),
			);
			return sendJSON(res, { ok: true, id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "PUT" && req.url === "/api/interests/sections/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const items = parseTsArray(INTERESTS_FILE, "interestSections");
			const idx = items.findIndex((s) => s.id === body.id);
			if (idx === -1) return sendJSON(res, { error: "分区不存在" }, 404);
			const oldId = items[idx].id;
			const nextId = body.id !== undefined ? sanitizeSectionId(body.id) || oldId : oldId;
			items[idx] = { ...items[idx], ...body, id: nextId };
			// 改了标识，就把这个分区下的帖子一起指过去，避免帖子变成孤儿
			let posts = null;
			if (nextId !== oldId) {
				posts = parseTsArray(INTERESTS_FILE, "interestPosts").map((p) =>
					p.sectionId === oldId ? { ...p, sectionId: nextId } : p,
				);
			}
			let content = fs.readFileSync(INTERESTS_FILE, "utf-8");
			content = rebuildArraySection(content, "interestSections", items, formatInterestSection);
			if (posts) content = rebuildArraySection(content, "interestPosts", posts, formatInterestPost);
			saveArrayFile(INTERESTS_FILE, "interestSections", content);
			return sendJSON(res, { ok: true, id: nextId });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "DELETE" && req.url.startsWith("/api/interests/sections/delete")) {
		try {
			const u = new URL(req.url, `http://localhost:${PORT}`);
			const id = u.searchParams.get("id");
			const items = parseTsArray(INTERESTS_FILE, "interestSections");
			const filtered = items.filter((s) => s.id !== id);
			if (filtered.length === items.length)
				return sendJSON(res, { error: "分区不存在" }, 404);
			// 连这个分区下的帖子一起删，避免留下孤儿数据
			const posts = parseTsArray(INTERESTS_FILE, "interestPosts");
			const keptPosts = posts.filter((p) => p.sectionId !== id);
			let content = fs.readFileSync(INTERESTS_FILE, "utf-8");
			content = rebuildArraySection(content, "interestSections", filtered, formatInterestSection);
			if (keptPosts.length !== posts.length) {
				content = rebuildArraySection(content, "interestPosts", keptPosts, formatInterestPost);
			}
			saveArrayFile(INTERESTS_FILE, "interestSections", content);
			return sendJSON(res, { ok: true, removedPosts: posts.length - keptPosts.length });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// ==================== 兴趣帖子 ====================
	if (req.method === "GET" && req.url === "/api/interests/posts/list") {
		return sendJSON(res, parseTsArray(INTERESTS_FILE, "interestPosts"));
	}

	if (req.method === "POST" && req.url === "/api/interests/posts/add") {
		try {
			const body = JSON.parse(await readBody(req));
			if (!body.sectionId) return sendJSON(res, { error: "请先选择分区" }, 400);
			if (!body.title) return sendJSON(res, { error: "标题不能为空" }, 400);
			const items = parseTsArray(INTERESTS_FILE, "interestPosts");
			const item = {
				id: `ip-${Date.now()}`,
				sectionId: body.sectionId,
				title: body.title,
				content: body.content || "",
				date: normalizeDate(body.date),
			};
			if (Number(body.minutes) > 0) item.minutes = Math.round(Number(body.minutes));
			if (Number(body.rating) > 0) item.rating = Math.round(Number(body.rating) * 10) / 10;
			const shots = (body.screenshots || []).filter(Boolean);
			if (shots.length) item.screenshots = shots;
			items.push(item);
			const content = fs.readFileSync(INTERESTS_FILE, "utf-8");
			saveArrayFile(
				INTERESTS_FILE,
				"interestPosts",
				rebuildArraySection(content, "interestPosts", items, formatInterestPost),
			);
			return sendJSON(res, { ok: true, id: item.id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "PUT" && req.url === "/api/interests/posts/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const items = parseTsArray(INTERESTS_FILE, "interestPosts");
			const idx = items.findIndex((p) => p.id === body.id);
			if (idx === -1) return sendJSON(res, { error: "帖子不存在" }, 404);
			const next = { ...items[idx], ...body };
			// 时长/评分要能被清空（把 0 或空字符串当作删除）
			if (!(Number(next.minutes) > 0)) delete next.minutes;
			if (!(Number(next.rating) > 0)) delete next.rating;
			if (Array.isArray(next.screenshots)) {
				next.screenshots = next.screenshots.filter(Boolean);
				if (!next.screenshots.length) delete next.screenshots;
			}
			items[idx] = next;
			const content = fs.readFileSync(INTERESTS_FILE, "utf-8");
			saveArrayFile(
				INTERESTS_FILE,
				"interestPosts",
				rebuildArraySection(content, "interestPosts", items, formatInterestPost),
			);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	if (req.method === "DELETE" && req.url.startsWith("/api/interests/posts/delete")) {
		try {
			const u = new URL(req.url, `http://localhost:${PORT}`);
			const id = u.searchParams.get("id");
			const items = parseTsArray(INTERESTS_FILE, "interestPosts");
			const filtered = items.filter((p) => p.id !== id);
			if (filtered.length === items.length)
				return sendJSON(res, { error: "帖子不存在" }, 404);
			const content = fs.readFileSync(INTERESTS_FILE, "utf-8");
			saveArrayFile(
				INTERESTS_FILE,
				"interestPosts",
				rebuildArraySection(content, "interestPosts", filtered, formatInterestPost),
			);
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// 404
	res.writeHead(404);
	res.end("Not Found");
});

// ========== 辅助：向 TypeScript 数据文件中插入数组项 ==========
function insertIntoArrayFile(filepath, arrayName, newItem, formatFn) {
	// 用严格解析：文件一旦有语法问题就报错，绝不从空数组开始写（那会把已有内容整个抹掉）
	const items = parseTsArrayStrict(filepath, arrayName);
	items.push(newItem);

	const content = fs.readFileSync(filepath, "utf-8");
	const newContent = rebuildArraySection(content, arrayName, items, formatFn);
	saveArrayFile(filepath, arrayName, newContent);
}

// ========== 启动服务器 ==========
server.listen(PORT, () => {
	console.log("========================================");
	console.log("  ZionyasVan 内容管理工具 v2.0");
	console.log(`  地址: http://localhost:${PORT}`);
	console.log("  按 Ctrl+C 退出");
	console.log("========================================");
});
