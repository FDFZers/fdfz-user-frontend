import { useState } from "react";
import { Mail } from "lucide-react";
import { Card, Link, SearchField } from "@heroui/react";

type Tool = {
  name: string;
  icon: typeof Mail;
  url: string;
  description: string;
};

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen?: (tool: Tool) => void }) {
  const { name, icon: Icon, url, description } = tool;
  return (
    <Card className="w-[160px] p-4 hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-secondary)]">
        <Icon className="h-5 w-5 text-[var(--foreground)]" />
      </div>
      <Card.Header className="p-0">
        <Link className="m-0 text-base font-semibold" href={url} onClick={() => onOpen?.(tool)}>
          {name}
          <Link.Icon />
        </Link>
      </Card.Header>
      {description && (
        <p className="mt-1 text-sm text-[var(--foreground)] opacity-60">{description}</p>
      )}
    </Card>
  );
}

function Tools() {
  const tools: Tool[] = [
    {
      name: "学生邮箱",
      icon: Mail,
      url: "",
      description: "",
    },
  ];
  const [recentlyUsedTools, setRecentlyUsedTools] = useState<Tool[]>([]);

  const handleToolClick = (tool: Tool) => {
    setRecentlyUsedTools((prev) => [tool, ...prev.filter((item) => item.name !== tool.name)]);
  };

  return (
    <div className="tools-page -mx-4 -mt-5 min-h-full max-[767px]:-mx-3 max-[767px]:-mt-4">
      <div className="relative h-[140px] w-full overflow-hidden bg-[var(--surface-secondary)]">
        <div
          className="h-full w-full object-cover object-center opacity-[0.08]"
          aria-hidden="true"
        />
        <SearchField
          name="search-main"
          className="absolute top-4 left-1/2 -translate-x-1/2 opacity-[0.8]"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-[300px]" placeholder="搜索功能..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <p className="absolute bottom-3 left-7 m-0 text-3xl font-bold text-[var(--foreground)] max-[767px]:left-3">
          工具箱
        </p>
      </div>

      <div className="tools-main px-6 py-4">
        {recentlyUsedTools.length > 0 && (
          <div className="mx-4 my-3">
            <p className="font-bold">最近使用</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {recentlyUsedTools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
            </div>
          </div>
        )}

        <div className="mx-4 my-3">
          <p className="font-bold">常用工具</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {tools.map((tool) => (
              <ToolCard key={tool.name} tool={tool} onOpen={handleToolClick} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tools;
