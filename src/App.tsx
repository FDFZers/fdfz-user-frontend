import { LucideLayoutPanelLeft, LucideMoon, LucideSun } from "lucide-react";
import { type Key, useEffect, useState } from "react";
import { Button, Tabs, useMediaQuery } from "@heroui/react";
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

const MOBILE_QUERY = "(max-width: 767px)";

function App() {
  // HeroUI's useMediaQuery drives the sidebar between an off-canvas drawer
  // (< 768px) and a fixed side column.
  const isMobile = useMediaQuery(MOBILE_QUERY);
  // On mobile the drawer starts closed so it never covers the content.
  const [collapsed, setCollapsed] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
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
      <Sidebar collapsed={collapsed} mobile={isMobile} onCollapsedChange={setCollapsed} />

      <div className="app-main relative flex flex-1 min-w-0 flex-col overflow-hidden">
        <Button
          variant="ghost"
          size="md"
          isIconOnly
          onPress={toggleSidebar}
          aria-label="切换侧边栏"
          className="floating-control absolute left-4 top-3 z-30 max-[767px]:left-3 max-[767px]:top-2.5"
        >
          <LucideLayoutPanelLeft />
        </Button>

        <Tabs
          selectedKey={theme}
          onSelectionChange={handleThemeChange}
          className="absolute right-4 top-3 z-30 max-[767px]:right-3 max-[767px]:top-2.5"
        >
          <Tabs.ListContainer className="floating-control">
            <Tabs.List aria-label="主题">
              <Tabs.Tab id="light" aria-label="浅色模式" className="px-2">
                <LucideSun />
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="dark" aria-label="深色模式" className="px-2">
                <LucideMoon />
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        <main className="app-content flex-1 overflow-y-auto px-4 py-5 bg-[color-mix(in_srgb,var(--background)_92%,transparent)] max-[767px]:px-3 max-[767px]:py-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;
