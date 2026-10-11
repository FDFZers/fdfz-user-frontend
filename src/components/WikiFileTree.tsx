import { ChevronDown, FileText, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { ListBox } from "@heroui/react";
import type { WikiTreeNode } from "../content/wiki";

export interface WikiFileTreeProps {
  /** 完整文件树，层级不限。 */
  nodes: WikiTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** 每层缩进的宽度（rem）。 */
const INDENT_STEP = 0.75;

interface VisibleNode {
  key: string;
  depth: number;
  node: WikiTreeNode;
}

/** 依据折叠状态把树摊平成一维行，便于交给单个 ListBox 渲染。 */
function flattenVisible(
  nodes: WikiTreeNode[],
  collapsed: string[],
  depth = 0,
  out: VisibleNode[] = [],
): VisibleNode[] {
  for (const node of nodes) {
    if (node.type === "folder") {
      out.push({ key: `folder:${node.path}`, depth, node });
      if (!collapsed.includes(node.path)) {
        flattenVisible(node.children, collapsed, depth + 1, out);
      }
    } else {
      out.push({ key: `article:${node.article.id}`, depth, node });
    }
  }
  return out;
}

function WikiFileTree({ nodes, selectedId, onSelect }: WikiFileTreeProps) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const rows = flattenVisible(nodes, collapsed);

  const toggleFolder = (path: string) => {
    setCollapsed((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path],
    );
  };

  return (
    <ListBox
      aria-label="文件树"
      selectionMode="none"
      className="p-0 [&>*+*]:mt-0.5"
      onAction={(key) => {
        const row = rows.find((item) => item.key === key);
        if (!row) return;
        if (row.node.type === "folder") {
          toggleFolder(row.node.path);
        } else {
          onSelect(row.node.article.id);
        }
      }}
    >
      {rows.map((row) => {
        const indent = { paddingInlineStart: `${row.depth * INDENT_STEP + 0.5}rem` };

        if (row.node.type === "folder") {
          const isCollapsed = collapsed.includes(row.node.path);
          return (
            <ListBox.Item
              key={row.key}
              id={row.key}
              textValue={row.node.name}
              style={indent}
              className="flex w-full items-center gap-1.5 rounded-[var(--radius-md,0.75rem)] py-1.5 pe-2 text-left text-sm font-medium text-[var(--foreground)]"
            >
              {isCollapsed ? (
                <Folder className="h-4 w-4 shrink-0 opacity-70" />
              ) : (
                <FolderOpen className="h-4 w-4 shrink-0 opacity-70" />
              )}
              <span className="min-w-0 flex-1 truncate">{row.node.name}</span>
              <ChevronDown
                className={[
                  "h-4 w-4 shrink-0 opacity-50 transition-transform duration-150 ease-out",
                  isCollapsed ? "-rotate-90" : "",
                ].join(" ")}
              />
            </ListBox.Item>
          );
        }

        const isSelected = row.node.article.id === selectedId;
        return (
          <ListBox.Item
            key={row.key}
            id={row.key}
            textValue={row.node.name}
            aria-current={isSelected ? "true" : undefined}
            style={indent}
            className={[
              "flex w-full items-center gap-2 rounded-[var(--radius-md,0.75rem)] py-1.5 pe-2 text-left text-sm",
              isSelected
                ? "bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] font-medium text-[var(--accent)]"
                : "text-[var(--foreground)]",
            ].join(" ")}
          >
            <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span className="min-w-0 truncate">{row.node.name}</span>
          </ListBox.Item>
        );
      })}
    </ListBox>
  );
}

export default WikiFileTree;
