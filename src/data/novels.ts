// ============================================
// 📚 那些故事 · 小说数据文件
// 每部小说包含：基本信息 + 章节列表
// ============================================

export interface Chapter {
  slug: string;      // 章节URL标识，如 "chapter-01"
  title: string;     // 章节标题，如 "第一章：开端"
  content: string;   // 章节正文（Markdown格式）
}

export interface Novel {
  id: string;            // 唯一标识
  title: string;         // 小说名
  cover: string;         // 封面图路径，图片放 public/novels/
  description: string;   // 一句话简短描述（首页卡片用）
  author: string;        // 作者
  publishedDate: string; // 发布日期，如 "2026-03-15"
  platform: string;      // 发布平台，如 "B站专栏 / 起点中文网"
  intro: string;         // 详细介绍（详情页用）
  chapters: Chapter[];   // 章节列表（按顺序排列）
}

export const novels: Novel[] = [
  {
    id: "novel-1785254064988",
    title: "和结婚对象同居之后",
    cover: "/projects/novel-1785254064988.png",
    description: "",
    author: "ZionyasVan",
    publishedDate: "2026-06-15",
    platform: "暂无",
    intro: "《和结婚对象同居之后》，又名《未来与你》。",
    chapters: [

    ],
  }
];
