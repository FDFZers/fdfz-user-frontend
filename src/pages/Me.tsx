import { Avatar, Label } from '@heroui/react'
import type { School, Sex } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

const SEX_LABEL: Record<Sex, string> = {
  unknown: '未知',
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
    // 模拟用户
    user = {
      id: 0,
      username: 'example_user',
      student_num: '00000000',
      real_name: '示例用户',
      school: 'fdfz' as School,
      sex: 'unknown' as Sex,
      birthday: '2000-01-01',
      public_email: 'demo@example.com',
      public_qq: '123456789',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: '这是一个模拟用户。',
    }
  }

  const details: { label: string; value: string | null }[] = [
    { label: '学号', value: user.student_num },
    { label: '真实姓名', value: user.real_name },
    { label: '学校', value: user.school ? SCHOOL_LABEL[user.school] : null },
    { label: '性别', value: SEX_LABEL[user.sex] },
    { label: '生日', value: user.birthday },
    { label: '邮箱', value: user.public_email },
    { label: 'QQ', value: user.public_qq },
  ]

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4">
      <Avatar>
        <Avatar.Image
          alt="Blank Avatar"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>
          <span className="avatar__fallback-text">{user.username[0]}</span>
        </Avatar.Fallback>
      </Avatar>
      <Label className="text-2xl font-bold">{user.real_name}</Label>
    </div>
  )
}

export default Me
