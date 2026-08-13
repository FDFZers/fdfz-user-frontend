import { AlertDialog, Avatar, Button, Label, ListBox, Surface } from '@heroui/react'
import {
  ArrowRightFromSquare,
  ArrowRightToSquare,
  HouseFill,
  PencilToSquare,
  PersonFill
} from '@gravity-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

interface SidebarProps {
  collapsed: boolean
  mobile: boolean
}

const navItems = [
  { icon: HouseFill, label: '主页', path: '/' },
  { icon: PersonFill, label: '我', path: '/me' }
]

function Sidebar({ collapsed, mobile }: SidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <Surface
      variant="transparent"
      className={[
        'flex flex-col overflow-hidden border-r border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] p-0 transition-[width,border-color,transform] duration-250 ease-smooth',
        mobile
          ? 'fixed left-0 top-0 bottom-0 z-30 w-[var(--sidebar-width,240px)] shadow-[12px_0_40px_-18px_rgba(0,0,0,0.4)]'
          : 'w-[var(--sidebar-width,240px)] shrink-0',
        collapsed
          ? mobile
            ? 'translate-x-[-100%]'
            : 'w-0 border-r-0'
          : mobile
            ? 'translate-x-0'
            : ''
      ].join(' ')}
    >
      <div className="flex shrink-0 items-center gap-3 p-5" aria-label="用户信息">
        <Avatar>
          <Avatar.Image
            alt="Blank Avatar"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
          />
          <Avatar.Fallback>
            <span className="avatar__fallback-text">客</span>
          </Avatar.Fallback>
        </Avatar>
        <div className="flex min-w-0 flex-col overflow-hidden">
          <Label className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.925rem] font-medium text-[var(--foreground)]">
            {user ? user.username : '访客'}
          </Label>
          <Label className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.75rem] font-normal text-[#555]">
            {user ? (user.student_num || user.real_name || '已登录') : '未登录'}
          </Label>
        </div>
      </div>

      <ListBox
        aria-label="导航"
        selectionMode="none"
        className={[
          'm-0 flex-1 overflow-y-auto overflow-x-hidden p-3',
          collapsed ? 'min-w-0' : 'min-w-[var(--sidebar-width,240px)]'
        ].join(' ')}
        onAction={(key) => {
          const item = navItems.find((i) => i.label === key)
          if (item) navigate(item.path)
        }}
      >
        {navItems.map(({ icon: Icon, label }) => (
          <ListBox.Item
            key={label}
            id={label}
            textValue={label}
            className={[
              'mb-2 flex w-full items-center gap-3 rounded-[var(--radius-md,0.75rem)] bg-transparent px-3 py-2 text-left text-[0.925rem] text-[var(--foreground)] whitespace-nowrap transition-colors duration-150 ease-out hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] data-[pressed=true]:bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)]',
              collapsed ? 'justify-center px-2' : ''
            ].join(' ')}
          >
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center">
              <Icon className="h-[1.15rem] w-[1.15rem]" />
            </span>
            {!collapsed && <Label>{label}</Label>}
          </ListBox.Item>
        ))}
      </ListBox>

      <div className="shrink-0 p-4" aria-label="用户控制">
        {user ? (
          <AlertDialog>
            <Button
              variant="ghost"
              size="md"
              fullWidth
            >
              <ArrowRightFromSquare className="mr-2"/>
              退出登录
            </Button>
            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog className="sm:max-w-[400px]">
                  <AlertDialog.CloseTrigger />
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="danger" />
                    <AlertDialog.Heading>确认退出登录？</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <p>

                    </p>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <Button slot="close" variant="tertiary">
                      取消
                    </Button>
                    <Button slot="close" variant="danger" 
                      onPress={() => {
                        logout()
                        navigate('/')
                    }}>
                      退出
                    </Button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        ) : (
          <>
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => navigate('/signup')}
              className="mb-2"
            >
              <PencilToSquare className="mr-2"/>
              注册
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={() => navigate('/login')}
            >
              <ArrowRightToSquare className="mr-2"/>
              登录
            </Button>
          </>
        )}
      </div>
    </Surface>
  )
}

export default Sidebar
