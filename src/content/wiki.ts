/**
 * Wiki 示例文章数据源。
 *
 * 正文存放在 `public/assets/wiki_test/` 下的 Markdown 文件中，目录层级不限，
 * 任意一层都可以放文章（例如根目录的 `介绍.md`）。
 * 元数据写在文件顶部的 front matter 里：
 *
 * ```
 * ---
 * title: 设备借用
 * author: u-2003
 * created_at: 2026-01-22
 * updated_at: 2026-07-30
 * ---
 * ```
 */

const WIKI_ROOT = "/public/assets/wiki_test/";

/** 同级目录的展示顺序，未列出的按名称排序排在后面。 */
const FOLDER_ORDER = ["学习资源", "校园生活", "办事指南"];

export interface WikiArticle {
  /** 相对 wiki_test 的路径（不含扩展名），如 "介绍"、"学习资源/图书馆与自习空间" */
  id: string;
  title: string;
  /** 作者的 user 值 */
  author: string;
  /** 所在目录（相对 wiki_test，根目录为空串），如 "学习资源"、"校园生活/社团" */
  category: string;
  createdAt: string;
  updatedAt: string;
  /** front matter 之后的 Markdown 正文 */
  content: string;
}

/** 文件树节点：目录或文章，层级不限。 */
export type WikiTreeNode =
  | { type: "folder"; name: string; path: string; children: WikiTreeNode[] }
  | { type: "article"; name: string; article: WikiArticle };

/** 解析文件顶部的 YAML front matter，仅支持 `key: value` 形式的标量字段。 */
function parseFrontMatter(raw: string): {
  data: Record<string, string>;
  content: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) {
    return { data: {}, content: raw };
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    if (key) data[key] = value;
  }

  return { data, content: raw.slice(match[0].length) };
}

const modules = import.meta.glob<string>("/public/assets/wiki_test/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** 作者的 user 值 → 展示名。占位数据，后续应改为从用户接口获取。 */
const USER_NAMES: Record<string, string> = {
  "u-2001": "张伟",
  "u-2002": "李娜",
  "u-2003": "王强",
  "u-2004": "陈静",
  "u-2005": "刘洋",
  "u-2006": "赵敏",
  "u-2007": "孙浩",
  "u-2008": "周雨",
};

export function getUserName(userId: string): string {
  return USER_NAMES[userId] ?? userId;
}

function buildArticle(path: string, raw: string): WikiArticle {
  const relative = path.slice(WIKI_ROOT.length).replace(/\.md$/, "");
  const segments = relative.split("/");
  const { data, content } = parseFrontMatter(raw);

  return {
    id: relative,
    title: data.title || segments[segments.length - 1],
    author: data.author ?? "",
    category: segments.slice(0, -1).join("/"),
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
    // 正文开头的 H1 与 front matter 的 title 重复，标题由文章页头统一渲染。
    content: content.replace(/^\s*#\s[^\n]*\r?\n?/, ""),
  };
}

/** 所有文章，按最后修改日期倒序。 */
export const wikiArticles: WikiArticle[] = Object.entries(modules)
  .map(([path, raw]) => buildArticle(path, raw))
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

interface FolderDraft {
  name: string;
  path: string;
  folders: Map<string, FolderDraft>;
  articles: WikiArticle[];
}

function compareFolders(a: FolderDraft, b: FolderDraft): number {
  const rank = (folder: FolderDraft) => {
    const index = FOLDER_ORDER.indexOf(folder.name);
    return index === -1 ? FOLDER_ORDER.length : index;
  };
  return rank(a) - rank(b) || a.name.localeCompare(b.name, "zh");
}

function toNodes(draft: FolderDraft): WikiTreeNode[] {
  const folders = [...draft.folders.values()].sort(compareFolders).map<WikiTreeNode>((folder) => ({
    type: "folder",
    name: folder.name,
    path: folder.path,
    children: toNodes(folder),
  }));
  const files = [...draft.articles]
    .sort((a, b) => a.title.localeCompare(b.title, "zh"))
    .map<WikiTreeNode>((article) => ({
      type: "article",
      name: article.title,
      article,
    }));

  return [...folders, ...files];
}

/** 按文章 id 的目录层级拼出完整文件树：目录在前、文章在后。 */
function buildTree(articles: WikiArticle[]): WikiTreeNode[] {
  const root: FolderDraft = { name: "", path: "", folders: new Map(), articles: [] };

  for (const article of articles) {
    let node = root;
    for (const segment of article.id.split("/").slice(0, -1)) {
      let child = node.folders.get(segment);
      if (!child) {
        child = {
          name: segment,
          path: node.path ? `${node.path}/${segment}` : segment,
          folders: new Map(),
          articles: [],
        };
        node.folders.set(segment, child);
      }
      node = child;
    }
    node.articles.push(article);
  }

  return toNodes(root);
}

/** 完整文件树。 */
export const wikiTree: WikiTreeNode[] = buildTree(wikiArticles);

/** 所有文章中出现过的作者，用于筛选项。 */
export const wikiAuthors: { id: string; name: string }[] = [
  ...new Set(wikiArticles.map((article) => article.author)),
]
  .filter(Boolean)
  .map((id) => ({ id, name: getUserName(id) }))
  .sort((a, b) => a.name.localeCompare(b.name, "zh"));

/** 取出链接的路径部分并解码（markdown-it 会把中文路径转义成 %xx）。 */
function linkPath(href: string): string {
  const raw = href.split(/[?#]/)[0];
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * 把文章正文里的相对 Markdown 链接解析成本站的另一个文章 id。
 * 链接指向的文件没有被收录时返回 null。
 */
export function resolveArticleLink(fromId: string, href: string): string | null {
  const path = linkPath(href);
  if (!path.endsWith(".md")) return null;

  const baseDir = fromId.split("/").slice(0, -1);
  const segments = [...baseDir, ...path.slice(0, -".md".length).split("/")];

  const stack: string[] = [];
  for (const segment of segments) {
    if (!segment || segment === ".") continue;
    if (segment === "..") stack.pop();
    else stack.push(segment);
  }

  const id = stack.join("/");
  return wikiArticles.some((article) => article.id === id) ? id : null;
}
