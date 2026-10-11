import {
  Button,
  Description,
  EmptyState,
  Label,
  ListBox,
  SearchField,
  Typography,
} from "@heroui/react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateValue, RangeValue } from "@heroui/react";
import { wikiArticles, wikiTree, getUserName } from "../content/wiki";
import WikiArticleView from "../components/WikiArticleView";
import WikiFilterDropdown from "../components/WikiFilterDropdown";
import WikiSidebar from "../components/WikiSidebar";

function Wiki() {
  const [titleQuery, setTitleQuery] = useState("");
  const [dateRange, setDateRange] = useState<RangeValue<DateValue> | null>(null);
  const [authorKeys, setAuthorKeys] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [treeCollapsed, setTreeCollapsed] = useState(false);

  /** 只影响内容区结果列表，文件树始终展示完整目录。 */
  const filteredArticles = useMemo(() => {
    const query = titleQuery.trim().toLowerCase();
    const start = dateRange?.start.toString();
    const end = dateRange?.end.toString();

    return wikiArticles.filter((article) => {
      if (query && !article.title.toLowerCase().includes(query)) return false;
      if (start && end) {
        if (!article.updatedAt) return false;
        if (article.updatedAt < start || article.updatedAt > end) return false;
      }
      if (authorKeys.length > 0 && !authorKeys.includes(article.author)) return false;
      return true;
    });
  }, [titleQuery, dateRange, authorKeys]);

  const hasActiveFilters = titleQuery.trim() !== "" || dateRange !== null || authorKeys.length > 0;

  const selectedArticle = wikiArticles.find((article) => article.id === selectedId) ?? null;

  return (
    <div className="wiki-page -mx-4 -mt-5 min-h-full max-[767px]:-mx-3 max-[767px]:-mt-4">
      <div className="relative h-[140px] w-full overflow-hidden bg-[var(--surface-secondary)] max-[767px]:h-[188px]">
        <div
          className="h-full w-full object-cover object-center opacity-[0.08]"
          aria-hidden="true"
        />
        {/* 窄屏下浮动的侧边栏/主题按钮会占据顶部一行，搜索框下移让开。 */}
        <SearchField
          name="search-main"
          className="absolute top-4 left-1/2 w-[300px] max-w-[calc(100%-2.5rem)] -translate-x-1/2 opacity-[0.8] max-[767px]:top-[4.5rem]"
          value={titleQuery}
          onChange={setTitleQuery}
        >
          <SearchField.Group className="w-full">
            <SearchField.SearchIcon />
            <SearchField.Input className="w-full" placeholder="搜索词条" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Typography.Heading
          level={1}
          className="absolute bottom-3 left-8 m-0 text-3xl font-bold text-[var(--foreground)] max-[767px]:left-5"
        >
          FDFZ Wiki
        </Typography.Heading>

        <div className="absolute bottom-3 right-8 max-[767px]:right-5">
          <WikiFilterDropdown
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            authorKeys={authorKeys}
            onAuthorKeysChange={setAuthorKeys}
          />
        </div>
      </div>

      <div className="flex items-stretch">
        <WikiSidebar
          nodes={wikiTree}
          selectedId={selectedId}
          onSelect={setSelectedId}
          collapsed={treeCollapsed}
          onCollapsedChange={setTreeCollapsed}
        />

        <div className="min-w-0 flex-1 px-8 py-6 max-[767px]:px-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="md"
              isIconOnly
              onPress={() => setTreeCollapsed((collapsed) => !collapsed)}
              aria-label={treeCollapsed ? "展开文件树" : "折叠文件树"}
            >
              {treeCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>

            {selectedArticle && (
              <Button
                variant="ghost"
                size="md"
                isIconOnly
                onPress={() => setSelectedId(null)}
                aria-label="关闭词条"
              >
                <X />
              </Button>
            )}
          </div>

          {selectedArticle ? (
            <WikiArticleView article={selectedArticle} onNavigate={setSelectedId} />
          ) : (
            <div
              className={[
                "flex flex-col",
                hasActiveFilters
                  ? "gap-5"
                  : "min-h-[420px] items-center justify-center gap-6 max-[767px]:min-h-[280px]",
              ].join(" ")}
            >
              {!hasActiveFilters && (
                <Typography.Heading
                  level={2}
                  className="m-0 text-2xl font-semibold text-[var(--foreground)]"
                >
                  在 FDFZ Wiki 中查找词条
                </Typography.Heading>
              )}

              <div
                className={[
                  "flex w-full gap-3",
                  hasActiveFilters
                    ? "items-center max-[480px]:flex-col max-[480px]:items-stretch"
                    : "flex-col items-center",
                ].join(" ")}
              >
                <SearchField
                  name="wiki-search"
                  variant="primary"
                  className="wiki-search-large w-full min-w-0 max-w-[560px]"
                  value={titleQuery}
                  onChange={setTitleQuery}
                >
                  <SearchField.Group className="w-full">
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="搜索词条" />
                    <SearchField.ClearButton />
                  </SearchField.Group>
                </SearchField>
                <WikiFilterDropdown
                  buttonSize="lg"
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  authorKeys={authorKeys}
                  onAuthorKeysChange={setAuthorKeys}
                />
              </div>

              {hasActiveFilters &&
                (filteredArticles.length === 0 ? (
                  <EmptyState className="py-10 text-center">没有符合条件的词条</EmptyState>
                ) : (
                  <ListBox
                    aria-label="词条搜索结果"
                    selectionMode="none"
                    className="p-0 [&>*+*]:mt-0.5"
                    onAction={(key) => setSelectedId(String(key))}
                  >
                    {filteredArticles.map((article) => (
                      <ListBox.Item
                        key={article.id}
                        id={article.id}
                        textValue={article.title}
                        className="flex w-full flex-col items-start gap-0.5 rounded-[var(--radius-md,0.75rem)] px-3 py-2.5 text-left"
                      >
                        <Label className="text-[0.95rem] font-medium text-[var(--foreground)]">
                          {article.title}
                        </Label>
                        <Description className="text-xs">
                          {article.category ? `${article.category} · ` : ""}
                          {getUserName(article.author)} · 更新于 {article.updatedAt}
                        </Description>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wiki;
