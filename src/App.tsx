import { LucideLayoutPanelLeft, LucideMoon, LucideSun } from "lucide-react";
import { type Key, useEffect, useState } from "react";
import { Button, Tabs } from "@heroui/react";
import { Outlet } from "react-router";
import "./App.css";
import Sidebar from "./components/Sidebar";

const THEME_KEY = "ffwiki_theme";

function getInitialTheme(): "light" | "dark" {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
}

// Track whether the viewport is "mobile" (< 768px) so the sidebar can behave
// as an off-canvas drawer instead of a fixed side column.
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

function App() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  // On mobile the drawer starts closed so it never covers the content.
  const [collapsed, setCollapsed] = useState(() => isMobile);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // When crossing onto a mobile viewport, close the drawer.
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  const toggleSidebar = () => setCollapsed((c) => !c);

  const handleThemeChange = (key: Key) => {
    const next = key === "dark" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  };

  return (
    <div className="app-shell relative flex h-screen w-full overflow-hidden">
      <Sidebar collapsed={collapsed} mobile={isMobile} />
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/35 animate-[sidebar-backdrop-in_250ms_var(--ease-out)_both]"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div className="app-main relative flex flex-1 min-w-0 flex-col overflow-hidden">
        <div className="pointer-events-none absolute left-4 top-3 z-30 max-[767px]:left-3 max-[767px]:top-2.5">
          <div className="pointer-events-auto flex w-fit items-center rounded-full bg-[color-mix(in_srgb,var(--background)_92%,transparent)] p-1 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-[10px]">
            <Button
              variant="ghost"
              size="md"
              isIconOnly
              onPress={toggleSidebar}
              aria-label="切换侧边栏"
            >
              <LucideLayoutPanelLeft />
            </Button>
          </div>
        </div>

        <div className="pointer-events-none absolute right-4 top-3 z-30 max-[767px]:right-3 max-[767px]:top-2.5">
          <div className="pointer-events-auto flex w-fit items-center rounded-full bg-[color-mix(in_srgb,var(--background)_92%,transparent)] p-1 shadow-[0_2px_10px_rgba(0,0,0,0.08)] backdrop-blur-[10px]">
            <Tabs selectedKey={theme} onSelectionChange={handleThemeChange}>
              <Tabs.ListContainer>
                <Tabs.List aria-label="主题">
                  <Tabs.Tab id="light" className="px-1.5">
                    <LucideSun />
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="dark" className="px-1.5">
                    <LucideMoon />
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        </div>

        <main className="app-content flex-1 overflow-y-auto px-4 py-5 bg-[color-mix(in_srgb,var(--background)_92%,transparent)] max-[767px]:px-3 max-[767px]:py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
