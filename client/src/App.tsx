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
    <div className="app-shell">
      <Sidebar collapsed={collapsed} />
      {isMobile && !collapsed && (
        <div className="sidebar-backdrop" onClick={toggleSidebar} aria-hidden="true" />
      )}

      <div className="app-main">
        <header className="app-header">
          <div className="app-header__left">
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

          <div className="app-header__right">
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

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default App
