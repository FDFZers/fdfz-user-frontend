import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthTokens, School, Sex } from '../api/auth'

/** 与后端 `User` 结构对齐 */
export interface User {
  id: number
  username: string
  student_num: string | null
  real_name: string | null
  school: School | null
  sex: Sex
  birthday: string | null
  public_email: string | null
  public_qq: string | null
  bio: string
  status: 'banned' | 'active'
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  user: User | null
  tokens: AuthTokens | null
  /** 保存登录后拿到的令牌与会话用户信息 */
  login: (tokens: AuthTokens, user: User) => void
  logout: () => void
}

const STORAGE_KEY = 'ffwiki_user'
const TOKENS_KEY = 'ffwiki_tokens'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readJson<User>(STORAGE_KEY))
  const [tokens, setTokens] = useState<AuthTokens | null>(() => readJson<AuthTokens>(TOKENS_KEY))

  const login = (nextTokens: AuthTokens, nextUser: User) => {
    setTokens(nextTokens)
    setUser(nextUser)
    localStorage.setItem(TOKENS_KEY, JSON.stringify(nextTokens))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
  }

  const logout = () => {
    setTokens(null)
    setUser(null)
    localStorage.removeItem(TOKENS_KEY)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
