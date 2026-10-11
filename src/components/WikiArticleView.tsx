import { useMemo, type MouseEvent } from "react";
import { Separator, Typography } from "@heroui/react";
import { getUserName, resolveArticleLink, type WikiArticle } from "../content/wiki";
import { renderMarkdown } from "../lib/markdown";

export interface WikiArticleViewProps {
  article: WikiArticle;
  /** 跳转到另一篇文章；传 null 表示回到 Wiki 广场首页。 */
  onNavigate: (id: string | null) => void;
}

function WikiArticleView({ article, onNavigate }: WikiArticleViewProps) {
  const html = useMemo(() => renderMarkdown(article.content), [article.content]);

  // 正文里的链接都指向仓库内的 Markdown 文件，统一拦截并走站内跳转，
  // 否则会当成普通路由跳到不存在的地址。
  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (!anchor) return;

    event.preventDefault();
    const href = anchor.getAttribute("href") ?? "";

    const target = resolveArticleLink(article.id, href);
    if (target) onNavigate(target);
  };

  return (
    <article className="mx-auto w-full max-w-[720px]">
      <header className="mb-6 pb-4">
        <Typography.Heading level={1} className="m-0 text-2xl font-bold text-[var(--foreground)]">
          {article.title}
        </Typography.Heading>
        <Typography.Paragraph size="sm" className="mt-2 mb-0 opacity-60">
          {getUserName(article.author)} · 创建于 {article.createdAt} · 更新于 {article.updatedAt}
        </Typography.Paragraph>
        <Separator className="mt-4" />
      </header>

      <div
        className="wiki-markdown"
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

export default WikiArticleView;
