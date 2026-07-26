// ============================================================
//  内容管理工具 - 后端服务器
//  双击 "管理工具.bat" 或在终端执行 node manage-server.js
// ============================================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = __dirname; // 项目根目录
const PORT = 3456;
const POSTS_DIR = path.join(ROOT, "src", "content", "posts");
const PROJECTS_FILE = path.join(ROOT, "src", "data", "projects.ts");
const VIDEOS_FILE = path.join(ROOT, "src", "data", "videos.ts");
const COVERS_DIR = path.join(ROOT, "public", "projects");

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

// 安全地将字符串转为 TypeScript 字符串字面量
function tsString(str) {
  return JSON.stringify(str);
}

// 生成新闻稿格式的时间
function now() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 将 base64 图片保存到 public/projects/
function saveCover(base64, filename) {
  if (!base64 || base64 === "") return "";
  // 去掉 data:image/...;base64, 前缀
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
  // 静态文件：manage-ui.html
  if (req.method === "GET" && (req.url === "/" || req.url === "/manage-ui.html")) {
    const html = fs.readFileSync(path.join(ROOT, "manage-ui.html"), "utf-8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  // API: 扫描分类
  if (req.method === "GET" && req.url === "/api/categories") {
    return sendJSON(res, scanPostCategories());
  }

  // API: 发布博客
  if (req.method === "POST" && req.url === "/api/create-post") {
    try {
      const body = JSON.parse(await readBody(req));
      const { title, description, tags, category, slug, content } = body;

      if (!title || !category || !slug || !content) {
        return sendJSON(res, { error: "标题、分类、slug 和内容不能为空" }, 400);
      }

      const dir = path.join(POSTS_DIR, category, slug);
      if (fs.existsSync(dir)) {
        return sendJSON(res, { error: `文件夹已存在: ${category}/${slug}` }, 400);
      }

      fs.mkdirSync(dir, { recursive: true });

      const tagsStr = tags
        ? tags.split(",").map((t) => t.trim()).filter(Boolean).map(tsString).join(", ")
        : "";
      const descStr = tsString(description || "");

      const md = `---
title: ${tsString(title)}
published: ${now()}
description: ${descStr}
tags: [${tagsStr}]
category: ${tsString(category)}
---

${content}
`;

      fs.writeFileSync(path.join(dir, "index.md"), md, "utf-8");
      return sendJSON(res, { ok: true, path: `${category}/${slug}/` });
    } catch (e) {
      return sendJSON(res, { error: e.message }, 500);
    }
  }

  // API: 新建项目
  if (req.method === "POST" && req.url === "/api/create-project") {
    try {
      const body = JSON.parse(await readBody(req));
      const { id, title, description, longDescription, type, tags, platform, status, downloadLinks, featured, coverBase64 } = body;

      if (!id || !title || !type) {
        return sendJSON(res, { error: "id、名称和类型不能为空" }, 400);
      }

      // 保存封面图
      let coverPath = "/projects/placeholder-cover.jpg";
      if (coverBase64) {
        const saved = saveCover(coverBase64, id);
        if (saved) coverPath = saved;
      }

      // 构造下载链接数组字符串
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

      // 插入到 projects.ts
      insertIntoArrayFile(PROJECTS_FILE, "projects", newProject);
      return sendJSON(res, { ok: true, id });
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
      log.push(execSync(`git commit -m "${msg.replace(/"/g, '\\"')}"`, { cwd: ROOT, encoding: "utf-8" }).trim());
      log.push(execSync("git push", { cwd: ROOT, encoding: "utf-8" }).trim());

      return sendJSON(res, { ok: true, log: log.filter(Boolean).join("\n") });
    } catch (e) {
      // git commit 可能因为 "nothing to commit" 而报错
      const stderr = e.stderr || e.message || "";
      if (stderr.includes("nothing to commit")) {
        try {
          const pushLog = execSync("git push", { cwd: ROOT, encoding: "utf-8" }).trim();
          return sendJSON(res, { ok: true, log: "没有新内容需要提交\n" + pushLog });
        } catch (e2) {
          return sendJSON(res, { error: "推送失败: " + (e2.stderr || e2.message) }, 500);
        }
      }
      return sendJSON(res, { error: "Git 操作失败: " + stderr }, 500);
    }
  }

  // 404
  res.writeHead(404);
  res.end("Not Found");
});

// ========== 辅助：向 TypeScript 数据文件中插入数组项 ==========
function insertIntoArrayFile(filepath, arrayName, newItemStr) {
  let content = fs.readFileSync(filepath, "utf-8");

  // 找到 export const xxx = [ 后面的数组结束位置
  const pattern = new RegExp(`export const ${arrayName}[^=]*=\\s*\\[`);
  const match = content.match(pattern);
  if (!match) throw new Error(`找不到 export const ${arrayName} 数组`);

  const startIdx = match.index + match[0].length;

  // 检查数组是否为空（紧跟着 ]）
  const rest = content.slice(startIdx);
  const isEmpty = /^\s*\]/.test(rest);

  if (isEmpty) {
    // 空数组：直接插入
    content = content.slice(0, startIdx) + "\n" + newItemStr + "\n" + content.slice(startIdx);
  } else {
    // 找到最后一个 ];
    const lastSemicolonBracket = content.lastIndexOf("];");
    if (lastSemicolonBracket === -1) throw new Error("找不到数组结束标记 ];");
    content = content.slice(0, lastSemicolonBracket) + newItemStr + "\n" + content.slice(lastSemicolonBracket);
  }

  fs.writeFileSync(filepath, content, "utf-8");
}

// ========== 启动服务器 ==========
server.listen(PORT, () => {
  console.log("╔══════════════════════════════════════╗");
  console.log("║  🛠️  ZionyasVan 内容管理工具 v1.0  ║");
  console.log(`║  地址: http://localhost:${PORT}       ║`);
  console.log("║  按 Ctrl+C 退出                      ║");
  console.log("╚══════════════════════════════════════╝");
});