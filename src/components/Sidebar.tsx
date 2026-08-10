import { AlertDialog, Avatar, Button, Label, ListBox, Surface } from '@heroui/react'
import {
  ArrowRightFromSquare,
  ArrowRightToSquare,
  House,
  PencilToSquare
} from '@gravity-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

interface SidebarProps {
  collapsed: boolean
}

const navItems = [
  { icon: House, label: '主页' },
]

function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <Surface
      variant="transparent"
      className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}
    >
      <div className="sidebar__usrinfo" aria-label="用户信息">
        <Avatar>
          <Avatar.Image
            alt="Blank Avatar"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
          />
          <Avatar.Fallback>
            <span className="avatar__fallback-text">客</span>
          </Avatar.Fallback>
        </Avatar>
        <div className="sidebar__usrinfo-text">
          <Label className="sidebar__usrinfo-name">
            {user ? user.username : '访客'}
          </Label>
          <Label className="sidebar__usrinfo-email">
            {user ? user.email : '未登录'}
          </Label>
        </div>
      </div>

      <ListBox
        aria-label="导航"
        selectionMode="none"
        className="sidebar__nav"
        onAction={(key) => console.log('navigate', key)}
      >
        {navItems.map(({ icon: Icon, label }) => (
          <ListBox.Item
            key={label}
            id={label}
            textValue={label}
            className="sidebar__item"
          >
            <span className="sidebar__icon">
              <Icon />
            </span>
            <Label className="sidebar__label">{label}</Label>
          </ListBox.Item>
        ))}
      </ListBox>

      <div className="sidebar__usrctrl" aria-label="用户控制">
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
              onPress={() => navigate('/login')}
              className="mb-2"
            >
              <ArrowRightToSquare className="mr-2"/>
              登录
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={() => navigate('/signup')}
            >
              <PencilToSquare className="mr-2"/>
              注册
            </Button>
          </>
        )}
      </div>
    </Surface>
  )
}

export default Sidebar
