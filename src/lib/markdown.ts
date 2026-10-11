import MarkdownIt from "markdown-it";

/**
 * 正文渲染器。
 *
 * `html: true` 表示解析 Markdown 里的原始 HTML，输出全部由 markdown-it 转义，
 * 因此渲染结果可以直接塞进 `dangerouslySetInnerHTML`。
 */
const md = new MarkdownIt({
  html: true,
  linkify: true,
});

export function renderMarkdown(source: string): string {
  return md.render(source);
}
