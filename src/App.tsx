import { type Key, useEffect, useState } from 'react'
import { Button, Tabs } from '@heroui/react'
import {
  LayoutSideContentLeft,
  Sun,
  Moon,
} from '@gravity-ui/icons'
import { Outlet } from 'react-router-dom'
import './App.css'
import './base.css'
import Sidebar from './components/Sidebar'

const THEME_KEY = 'ffwiki_theme'

function getInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  return 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.setAttribute('data-theme', theme)
}

// Track whether the viewport is "mobile" (< 768px) so the sidebar can behave
// as an off-canvas drawer instead of a fixed side column.
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

function App() {
  const isMobile = useMediaQuery('(max-width: 767px)')
  // On mobile the drawer starts closed so it never covers the content.
  const [collapsed, setCollapsed] = useState(() => isMobile)
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // When crossing onto a mobile viewport, close the drawer.
  useEffect(() => {
    if (isMobile) setCollapsed(true)
  }, [isMobile])

  const toggleSidebar = () => setCollapsed((c) => !c)

  const handleThemeChange = (key: Key) => {
    const next = key === 'dark' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem(THEME_KEY, next)
  }

  return (
    <div className="app-shell relative flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} mobile={isMobile} />
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 z-20 bg-black/35 animate-[sidebar-backdrop-in_250ms_var(--ease-out)_both]"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      <div className="app-main flex flex-1 min-w-0 flex-col overflow-hidden">
        <header className="app-header flex items-center justify-between gap-4 px-4 py-3 sticky top-0 z-10 bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-[10px] max-[767px]:px-3 max-[767px]:py-2.5">
          <div className="app-header__left flex items-center gap-2">
            <Button
              variant="ghost"
              size="md"
              isIconOnly
              onPress={toggleSidebar}
              aria-label="切换侧边栏"
            >
              <LayoutSideContentLeft />
            </Button>
          </div>

          <div className="app-header__right flex items-center gap-2">
            <Tabs selectedKey={theme} onSelectionChange={handleThemeChange}>
              <Tabs.ListContainer>
                <Tabs.List aria-label="主题">
                  <Tabs.Tab id="light">
                    <Sun />
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="dark">
                    <Moon />
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        </header>

        <main className="app-content flex-1 overflow-y-auto px-4 py-5 bg-[color-mix(in_srgb,var(--background)_92%,transparent)] max-[767px]:px-3 max-[767px]:py-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default App
