import { Avatar, Card, Chip, Label } from '@heroui/react'
import type { School, Sex } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

const SEX_LABEL: Record<Sex, string> = {
  unknown: '未知',
  male: '男',
  female: '女',
}

const SCHOOL_LABEL: Record<School, string> = {
  fdfz: '复旦附中',
  ffpd: '浦东分校',
  ffqp: '青浦分校',
  ffxh: '徐汇分校',
  ffja: '静安分校',
}

function Me() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="mx-auto flex max-w-[720px] flex-col gap-4">
        <Card>
          <Card.Content className="flex justify-center px-8 py-8 text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
            <p>尚未登录，无法查看个人主页。</p>
          </Card.Content>
        </Card>
      </div>
    )
  }

  const details: { label: string; value: string | null }[] = [
    { label: '学号', value: user.student_num },
    { label: '真实姓名', value: user.real_name },
    { label: '学校', value: user.school ? SCHOOL_LABEL[user.school] : null },
    { label: '性别', value: SEX_LABEL[user.sex] },
    { label: '生日', value: user.birthday },
    { label: '公开邮箱', value: user.public_email },
    { label: '公开 QQ', value: user.public_qq },
  ]

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4">
      <Card>
        <Card.Content className="flex items-center gap-4">
          <Avatar size="lg" className="shrink-0">
            <Avatar.Image
              alt="用户头像"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
            />
            <Avatar.Fallback>
              <span className="text-lg font-semibold">{user.username[0]}</span>
            </Avatar.Fallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Label className="text-xl font-bold">{user.username}</Label>
              <Chip size="sm" variant="soft">
                {user.status === 'active' ? '正常' : '已封禁'}
              </Chip>
            </div>
            <Label className="text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
              {user.real_name || user.username} · 注册于{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </Label>
          </div>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>个人简介</Card.Header>
        <Card.Content>
          <p className="m-0 leading-relaxed">{user.bio || '这个人很懒，什么都没写。'}</p>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>资料信息</Card.Header>
        <Card.Content>
          <dl className="m-0 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-3">
            {details.map(
              (item) =>
                item.value && (
                  <div key={item.label}>
                    <dt className="text-xs text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">{item.label}</dt>
                    <dd className="m-0 mt-0.5 font-semibold break-all">{item.value}</dd>
                  </div>
                ),
            )}
          </dl>
        </Card.Content>
      </Card>
    </div>
  )
}

export default Me
