import { useEffect, useState } from "react";
import { Drawer } from "@heroui/react";
import type { WikiTreeNode } from "../content/wiki";
import WikiFileTree from "./WikiFileTree";

export interface WikiSidebarProps {
  nodes: WikiTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const NARROW_QUERY = "(max-width: 899.98px)";

function useIsNarrow(): boolean {
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia(NARROW_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(NARROW_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setIsNarrow(event.matches);
    setIsNarrow(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return isNarrow;
}

function WikiSidebar({
  nodes,
  selectedId,
  onSelect,
  collapsed,
  onCollapsedChange,
}: WikiSidebarProps) {
  const isNarrow = useIsNarrow();

  useEffect(() => {
    onCollapsedChange(isNarrow);
  }, [isNarrow, onCollapsedChange]);

  if (isNarrow) {
    const selectAndClose = (id: string) => {
      onSelect(id);
      onCollapsedChange(true);
    };

    // 窄屏把文件树放进 HeroUI Drawer，由它统一处理遮罩、Esc 关闭与焦点。
    // 展开状态由外部 collapsed 受控，因此直接用 Backdrop 的 isOpen/onOpenChange。
    return (
      <Drawer.Backdrop
        isOpen={!collapsed}
        onOpenChange={(isOpen) => onCollapsedChange(!isOpen)}
        isDismissable
      >
        <Drawer.Content placement="left">
          <Drawer.Dialog
            aria-label="Wiki 文件树"
            // 顶部留出浮动按钮的高度，避免第一项被应用外壳的侧边栏按钮盖住。
            className="flex w-[min(280px,80vw)] max-w-[85vw] flex-col bg-[var(--background)] p-4 pt-16"
          >
            <div className="h-full overflow-y-auto overscroll-contain">
              <WikiFileTree nodes={nodes} selectedId={selectedId} onSelect={selectAndClose} />
            </div>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    );
  }

  return (
    <aside
      aria-label="Wiki 文件树"
      className={[
        "shrink-0 overflow-hidden transition-[width,padding] duration-250 ease-smooth",
        collapsed
          ? "w-0 p-0"
          : "w-[240px] border-r border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] p-4",
      ].join(" ")}
    >
      <WikiFileTree nodes={nodes} selectedId={selectedId} onSelect={onSelect} />
    </aside>
  );
}

export default WikiSidebar;
