// ============================================================
//  🛠️ ZionyasVan 内容管理工具 - 后端服务器 v2.0
//  用法: 双击 "管理工具.bat"
// ============================================================

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = __dirname;
const PORT = 3456;
const POSTS_DIR = path.join(ROOT, "src", "content", "posts");
const PROJECTS_FILE = path.join(ROOT, "src", "data", "projects.ts");
const VIDEOS_FILE = path.join(ROOT, "src", "data", "videos.ts");
const COVERS_DIR = path.join(ROOT, "public", "projects");

// ========== 解析 TypeScript 数据文件 ==========
function parseTsArray(filepath, arrayName) {
	const content = fs.readFileSync(filepath, "utf-8");
	const startMarker = `export const ${arrayName}`;
	const startIdx = content.indexOf(startMarker);
	if (startIdx === -1) return [];
	// 跳过 = 号，确保找到的是数组的 [ 而非类型注解中的 [
	const eqIdx = content.indexOf("=", startIdx);
	const bracketStart =
		eqIdx !== -1 ? content.indexOf("[", eqIdx) : content.indexOf("[", startIdx);
	if (bracketStart === -1) return [];
	let depth = 0;
	let i = bracketStart;
	for (; i < content.length; i++) {
		if (content[i] === "[" || content[i] === "{") depth++;
		if (content[i] === "]" || content[i] === "}") depth--;
		if (depth === 0 && content[i] === "]") break;
	}
	if (i >= content.length) return [];
	const arrayStr = content.slice(bracketStart, i + 1);
	try {
		return eval(`(${arrayStr})`);
	} catch (e) {
		console.error("解析失败:", filepath, e.message);
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
	let depth = 0;
	let i = bracketStart;
	for (; i < content.length; i++) {
		if (content[i] === "[" || content[i] === "{") depth++;
		if (content[i] === "]" || content[i] === "}") depth--;
		if (depth === 0 && content[i] === "]") break;
	}
	if (i >= content.length) return content;
	const before = content.slice(0, bracketStart + 1);
	const after = content.slice(i);
	const middle =
		items.length === 0 ? "" : `\n${items.map(itemFormatter).join(",\n")}\n`;
	return before + middle + after;
}

function formatProject(p) {
	const dl = (p.downloadLinks || [])
		.map((d) => {
			const parts = [];
			if (d.icon) parts.push(`icon: "${d.icon}"`);
			parts.push(`label: "${d.label}"`);
			parts.push(`url: "${d.url}"`);
			return `      { ${parts.join(", ")} }`;
		})
		.join(",\n");
	const tags = (p.tags || []).map((t) => `"${t}"`).join(", ");
	const screenshots = (p.screenshots || []).map((s) => `"${s}"`).join(", ");
	const desc = (p.description || "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"');
	const long = (p.longDescription || "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"')
		.replace(/\n/g, "\\n");
	return `  {
    id: "${p.id}",
    title: "${p.title}",
    description: "${desc}",
    longDescription: "${long}",
    cover: "${p.cover || "/projects/placeholder-cover.jpg"}",
    screenshots: [${screenshots}],
    type: "${p.type}",
    tags: [${tags}],
    platform: "${p.platform || ""}",
    status: "${p.status || "开发中"}",
    downloadLinks: [
${dl}
    ],
    featured: ${p.featured === true},
  }`;
}

function formatVideo(v) {
	const desc = (v.description || "")
		.replace(/\\/g, "\\\\")
		.replace(/"/g, '\\"');
	return `  {
    id: "${v.id}",
    title: "${v.title}",
    bvid: "${v.bvid}",
    cover: "${v.cover || ""}",
    description: "${desc}",
    featured: ${v.featured === true},
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
	const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	if (!match) return { body: raw };
	const fmStr = match[1];
	const body = match[2];
	const result = { body };
	const lines = fmStr.split("\n");
	for (const line of lines) {
		const keyMatch = line.match(/^(\w+):\s*(.*)$/);
		if (keyMatch) {
			const key = keyMatch[1];
			let val = keyMatch[2].trim();
			if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
			if (val.startsWith("[") && val.endsWith("]")) {
				val = val
					.slice(1, -1)
					.split(",")
					.map((s) => s.trim().replace(/^"|"$/g, ""));
			}
			result[key] = val;
		}
	}
	return result;
}

function toFrontmatter(fm) {
	const lines = [];
	if (fm.title) lines.push(`title: "${fm.title}"`);
	if (fm.published) lines.push(`published: ${fm.published}`);
	if (fm.description !== undefined)
		lines.push(`description: "${(fm.description || "").replace(/"/g, '\\"')}"`);
	if (fm.tags && fm.tags.length > 0) {
		lines.push(`tags: [${fm.tags.map((t) => `"${t}"`).join(", ")}]`);
	}
	if (fm.category) lines.push(`category: "${fm.category}"`);
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

// ========== 请求路由 ==========
const server = http.createServer(async (req, res) => {
	if (
		req.method === "GET" &&
		(req.url === "/" || req.url === "/manage-ui.html")
	) {
		const html = fs.readFileSync(path.join(ROOT, "manage-ui.html"), "utf-8");
		res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
		return res.end(html);
	}

	// API: 扫描分类
	if (req.method === "GET" && req.url === "/api/categories") {
		return sendJSON(res, scanPostCategories());
	}

	// API: 发布博客 (生成 category/slug.md 平铺格式)
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
			} = body;

			if (!title || !category || !slug || !content) {
				return sendJSON(
					res,
					{ error: "标题、分类文件夹、slug 和内容不能为空" },
					400,
				);
			}

			const filePath = path.join(POSTS_DIR, category, `${slug}.md`);
			if (fs.existsSync(filePath)) {
				return sendJSON(
					res,
					{ error: `文件已存在: ${category}/${slug}.md` },
					400,
				);
			}

			fs.mkdirSync(path.join(POSTS_DIR, category), { recursive: true });

			const tagsStr = tags
				? tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean)
						.map(tsString)
						.join(", ")
				: "";
			const descStr = tsString(description || "");
			const catDisplay = displayCategory || category;

			const md = `---
title: ${tsString(title)}
published: ${now()}
description: ${descStr}
tags: [${tagsStr}]
category: ${tsString(catDisplay)}
---

${content}
`;

			fs.writeFileSync(filePath, md, "utf-8");
			return sendJSON(res, { ok: true, path: `${category}/${slug}.md` });
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
				coverBase64,
			} = body;

			if (!id || !title || !type) {
				return sendJSON(res, { error: "id、名称和类型不能为空" }, 400);
			}

			let coverPath = "/projects/placeholder-cover.jpg";
			if (coverBase64) {
				const saved = saveCover(coverBase64, id);
				if (saved) coverPath = saved;
			}

			const dlStr = (downloadLinks || [])
				.filter((l) => l.label && l.url)
				.map((l) => {
					const iconPart = l.icon ? `icon: ${tsString(l.icon)}, ` : "";
					return `      { ${iconPart}label: ${tsString(l.label)}, url: ${tsString(l.url)} }`;
				})
				.join(",\n");

			const tagsArr = (tags || []).map(tsString).join(", ");
			const newProject = `
  {
    id: ${tsString(id)},
    title: ${tsString(title)},
    description: ${tsString(description || "")},
    longDescription: ${tsString(longDescription || "")},
    cover: ${tsString(coverPath)},
    screenshots: [],
    type: ${tsString(type)},
    tags: [${tagsArr}],
    platform: ${tsString(platform || "")},
    status: ${tsString(status || "开发中")},
    downloadLinks: [
${dlStr}
    ],
    featured: ${featured === true || featured === "true"},
  },`;

			insertIntoArrayFile(PROJECTS_FILE, "projects", newProject);
			return sendJSON(res, { ok: true, id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// ========== 资源管理 API ==========
	const RESOURCES_FILE = path.join(ROOT, "src", "data", "resources.ts");

	function formatResource(r) {
		const desc = (r.description || "")
			.replace(/\\/g, "\\\\")
			.replace(/"/g, '\\"');
		return `  {
    id: "${r.id}",
    name: "${r.name}",
    description: "${desc}",
    url: "${r.url}",
  }`;
	}

	if (req.method === "GET" && req.url === "/api/resources/list") {
		const items = parseTsArray(RESOURCES_FILE, "resources");
		return sendJSON(res, items);
	}

	if (req.method === "POST" && req.url === "/api/resources/add") {
		try {
			const body = JSON.parse(await readBody(req));
			const { name, description, url } = body;
			if (!name || !url)
				return sendJSON(res, { error: "名称和链接不能为空" }, 400);
			const id = `res-${Date.now()}`;
			const newItem = `  {
    id: "${id}",
    name: ${tsString(name)},
    description: ${tsString(description || "")},
    url: ${tsString(url)},
  },`;
			insertIntoArrayFile(RESOURCES_FILE, "resources", newItem);
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
			fs.writeFileSync(RESOURCES_FILE, newContent, "utf-8");
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
			fs.writeFileSync(RESOURCES_FILE, newContent, "utf-8");
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// API: 新建视频
	if (req.method === "POST" && req.url === "/api/create-video") {
		try {
			const body = JSON.parse(await readBody(req));
			const { id, title, bvid, description, featured, coverBase64 } = body;

			if (!id || !title || !bvid) {
				return sendJSON(res, { error: "id、标题和BV号不能为空" }, 400);
			}

			let coverPath = "";
			if (coverBase64) {
				const saved = saveCover(coverBase64, `video-${id}`);
				if (saved) coverPath = saved;
			}

			const newVideo = `
  {
    id: ${tsString(id)},
    title: ${tsString(title)},
    bvid: ${tsString(bvid)},
    cover: ${tsString(coverPath)},
    description: ${tsString(description || "")},
    featured: ${featured === true || featured === "true"},
  },`;

			insertIntoArrayFile(VIDEOS_FILE, "videos", newVideo);
			return sendJSON(res, { ok: true, id });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

	// API: 推送
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
			log.push(execSync("git push", { cwd: ROOT, encoding: "utf-8" }).trim());

			return sendJSON(res, { ok: true, log: log.filter(Boolean).join("\n") });
		} catch (e) {
			const stderr = e.stderr || e.message || "";
			if (stderr.includes("nothing to commit")) {
				try {
					const pushLog = execSync("git push", {
						cwd: ROOT,
						encoding: "utf-8",
					}).trim();
					return sendJSON(res, {
						ok: true,
						log: `没有新内容需要提交\n${pushLog}`,
					});
				} catch (e2) {
					return sendJSON(
						res,
						{ error: `推送失败: ${e2.stderr || e2.message}` },
						500,
					);
				}
			}
			return sendJSON(res, { error: `Git 操作失败: ${stderr}` }, 500);
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
		});
	}

	// 更新文章
	if (req.method === "PUT" && req.url === "/api/posts/update") {
		try {
			const body = JSON.parse(await readBody(req));
			const { category, slug, title, description, tags, content } = body;
			if (!category || !slug)
				return sendJSON(res, { error: "分类和slug不能为空" }, 400);
			// 优先找新格式
			let indexPath = path.join(POSTS_DIR, category, `${slug}.md`);
			if (!fs.existsSync(indexPath)) {
				indexPath = path.join(POSTS_DIR, category, slug, "index.md");
			}
			if (!fs.existsSync(indexPath))
				return sendJSON(res, { error: "文章不存在" }, 404);
			const fm = {
				title: title || slug,
				published: new Date().toISOString().replace("T", " ").slice(0, 19),
				description: description || "",
				tags: tags || [],
				category,
			};
			const newMd = toFrontmatter(fm) + (content || "");
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

			let coverPath = projs[idx].cover;
			if (body.coverBase64) {
				const saved = saveCover(body.coverBase64, body.id);
				if (saved) coverPath = saved;
			}

			projs[idx] = {
				...projs[idx],
				...body,
				cover: coverPath || projs[idx].cover,
			};
			delete projs[idx].coverBase64;

			const content = fs.readFileSync(PROJECTS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"projects",
				projs,
				formatProject,
			);
			fs.writeFileSync(PROJECTS_FILE, newContent, "utf-8");
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
			fs.writeFileSync(PROJECTS_FILE, newContent, "utf-8");
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

			let coverPath = vids[idx].cover;
			if (body.coverBase64) {
				const saved = saveCover(body.coverBase64, `video-${body.id}`);
				if (saved) coverPath = saved;
			}

			vids[idx] = {
				...vids[idx],
				...body,
				cover: coverPath || vids[idx].cover,
			};
			delete vids[idx].coverBase64;

			const content = fs.readFileSync(VIDEOS_FILE, "utf-8");
			const newContent = rebuildArraySection(
				content,
				"videos",
				vids,
				formatVideo,
			);
			fs.writeFileSync(VIDEOS_FILE, newContent, "utf-8");
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
			fs.writeFileSync(VIDEOS_FILE, newContent, "utf-8");
			return sendJSON(res, { ok: true });
		} catch (e) {
			return sendJSON(res, { error: e.message }, 500);
		}
	}

  // ========== 小说管理 API ==========
  const NOVELS_FILE = path.join(ROOT, "src", "data", "novels.ts");

  function formatNovel(n) {
    const intro = (n.intro || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
    const desc = (n.description || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const chapters = (n.chapters || []).map((ch) => {
      const chContent = (ch.content || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
      const chTitle = (ch.title || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return `    {
      slug: "${ch.slug}",
      title: "${chTitle}",
      content: "${chContent}",
    }`;
    }).join(",\n");
    return `  {
    id: "${n.id}",
    title: "${n.title}",
    cover: "${n.cover || "/novels/cover-placeholder.jpg"}",
    description: "${desc}",
    author: "${n.author || ""}",
    publishedDate: "${n.publishedDate || ""}",
    platform: "${n.platform || ""}",
    intro: "${intro}",
    chapters: [
${chapters}
    ],
  }`;
  }

  if (req.method === "GET" && req.url === "/api/novels/list") {
    const items = parseTsArray(NOVELS_FILE, "novels");
    return sendJSON(res, items.map(n => ({ ...n, chapters: n.chapters || [] })));
  }

  if (req.method === "POST" && req.url === "/api/novels/add") {
    try {
      const body = JSON.parse(await readBody(req));
      const { title, description, author, publishedDate, platform, intro, chapters, coverBase64 } = body;
      if (!title) return sendJSON(res, { error: "小说名称不能为空" }, 400);
      const id = "novel-" + Date.now();
      let coverPath = "/novels/cover-placeholder.jpg";
      if (coverBase64) {
        const saved = saveCover(coverBase64, id);
        if (saved) coverPath = saved;
      }
      const newItem = formatNovel({ id, title, cover: coverPath, description: description || "", author: author || "", publishedDate: publishedDate || "", platform: platform || "", intro: intro || "", chapters: chapters || [] });
      insertIntoArrayFile(NOVELS_FILE, "novels", newItem);
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
      let coverPath = items[idx].cover;
      if (body.coverBase64) {
        const saved = saveCover(body.coverBase64, body.id);
        if (saved) coverPath = saved;
      }
      items[idx] = { ...items[idx], ...body, cover: coverPath || items[idx].cover };
      delete items[idx].coverBase64;
      const content = fs.readFileSync(NOVELS_FILE, "utf-8");
      const newContent = rebuildArraySection(content, "novels", items, formatNovel);
      fs.writeFileSync(NOVELS_FILE, newContent, "utf-8");
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
      if (filtered.length === items.length) return sendJSON(res, { error: "小说不存在" }, 404);
      const content = fs.readFileSync(NOVELS_FILE, "utf-8");
      const newContent = rebuildArraySection(content, "novels", filtered, formatNovel);
      fs.writeFileSync(NOVELS_FILE, newContent, "utf-8");
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
function insertIntoArrayFile(filepath, arrayName, newItemStr) {
	let content = fs.readFileSync(filepath, "utf-8");
	const pattern = new RegExp(`export const ${arrayName}[^=]*=\\s*\\[`);
	const match = content.match(pattern);
	if (!match) throw new Error(`找不到 export const ${arrayName} 数组`);

	const startIdx = match.index + match[0].length;
	const rest = content.slice(startIdx);
	const isEmpty = /^\s*\]/.test(rest);

	if (isEmpty) {
		content = `${content.slice(0, startIdx)}\n${newItemStr}\n${content.slice(startIdx)}`;
	} else {
		const lastSemicolonBracket = content.lastIndexOf("];");
		if (lastSemicolonBracket === -1) throw new Error("找不到数组结束标记 ];");
		content = `${content.slice(0, lastSemicolonBracket) + newItemStr}\n${content.slice(lastSemicolonBracket)}`;
	}

	fs.writeFileSync(filepath, content, "utf-8");
}

// ========== 启动服务器 ==========
server.listen(PORT, () => {
	console.log("========================================");
	console.log("  ZionyasVan 内容管理工具 v2.0");
	console.log(`  地址: http://localhost:${PORT}`);
	console.log("  按 Ctrl+C 退出");
	console.log("========================================");
});
