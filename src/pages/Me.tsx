import { Avatar, Button, Chip, Label } from '@heroui/react'
import { Pencil } from '@gravity-ui/icons'
import type { School, Sex } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

const SEX_LABEL: Record<Sex, string> = {
  unknown: '未知性别',
  male: '男',
  female: '女',
}

const SCHOOL_LABEL: Record<School, string> = {
  fdfz: '本校',
  ffpd: '浦东分校',
  ffqp: '青浦分校',
  ffxh: '徐汇分校',
  ffja: '静安分校',
}

function Me() {
  let { user } = useAuth()

  if (!user) {
    // 模拟用户，要删！！！
    user = {
      id: 0,
      username: 'example_user',
      student_num: '',
      real_name: '访客',
      school: 'fdfz' as School,
      sex: 'unknown' as Sex,
      birthday: '未知',
      public_email: '无',
      public_qq: '无',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: '请先登录再查看此页面！',
    }
  }

  const details: { label: string; value: string | null }[] = [
    { label: '学校', value: user.school ? SCHOOL_LABEL[user.school] : null },
    { label: '性别', value: SEX_LABEL[user.sex] },
    { label: '学号', value: user.student_num },
    { label: '生日', value: user.birthday },
    { label: '邮箱', value: user.public_email },
    { label: 'QQ', value: user.public_qq },
    { label: '真实姓名', value: user.real_name },
  ]

  const infoChips = details
    .slice(3, 6)
    .filter((d): d is { label: string; value: string } => Boolean(d.value))

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4">
      <Avatar className="w-12 h-12">
        <Avatar.Image
          alt="Blank Avatar"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>
          <span className="avatar__fallback-text">{user.username[0]}</span>
        </Avatar.Fallback>
      </Avatar>
      <Label className="text-4xl font-bold">{user.real_name}</Label>
      <Label className="text-md text-[#777] font-bold">
        {details
          .slice(0, 3)
          .map((d) => d.value)
          .filter(Boolean)
          .map((value, index, arr) => (
            <span key={value ?? `${index}-${Math.random()}`}>
              {value}
              {index < arr.length - 1 && <span className="inline-block w-3" aria-hidden="true" />}
            </span>
          ))}
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        {infoChips.map(({ label, value }) => (
          <>
            <label className="text-[0.75rem]">{label}</label>
            <Chip
              key={label}
              size="sm"
              variant="primary"
              className="text-[0.75rem] text-[color-mix(in_srgb,var(--foreground)_70%,transparent)] mr-3"
            >
              {value}
            </Chip>
          </>
        ))}
        <Button
          type="button"
          aria-label="修改信息"
          variant="tertiary"
          className="inline-flex h-6 w-6"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label className="text-xl font-bold">个人介绍</Label>
        <Label className="text-[0.875rem] text-[#555]">
          {user.bio || '这个人很懒，什么都没写... '}
        </Label>
      </div>
    </div>

  )
}

export default Me
