import { Avatar, Button, Card, Chip, Label, Tabs } from "@heroui/react";
import { useState } from "react";
import {
  LucideCalendarDays,
  LucideCircleX,
  LucideFlag,
  LucideGraduationCap,
  LucideHash,
  LucidePlus,
  LucideUserRound,
} from "lucide-react";
import type { School } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

const SCHOOL_LABEL: Record<School, string> = {
  fdfz: "本校",
  ffpd: "浦东分校",
  ffqp: "青浦分校",
  ffxh: "徐汇分校",
  ffja: "静安分校",
};

function Me() {
  let { user } = useAuth();
  const [activeTab, setActiveTab] = useState("intro");
  const [following, setFollowing] = useState(false);

  if (!user) {
    // 模拟用户，要删！！！
    user = {
      id: 0,
      username: "访客",
      student_num: "",
      real_name: "访客",
      school: "fdfz" as School,
      sex: "unknown",
      birthday: "未知",
      public_email: "无",
      public_qq: "无",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bio: "请先登录再查看此页面！",
    };
  }

  return (
    <div className="me-page -mx-4 -mt-5 min-h-full max-[767px]:-mx-3 max-[767px]:-mt-4">
      <div className="relative h-[140px] w-full overflow-hidden bg-[var(--surface-secondary)]">
        <img
          src="/assets/images/fdfz.png"
          alt=""
          className="h-full w-full object-cover object-center opacity-[0.08]"
          aria-hidden="true"
        />
      </div>

      <div className="h-2.5 w-full bg-[var(--background)]" />

      <Card className="relative z-10 mx-7 -mt-8 max-h-[120px] max-[767px]:mx-3 max-[767px]:h-auto max-[767px]:min-h-[140px]">
        <Card.Content className="grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-6 pl-32 pr-5 py-4 max-[767px]:gap-3 max-[767px]:pl-24 max-[767px]:pr-4">
          <Avatar
            aria-label="用户头像"
            className="absolute -top-10 left-7 size-24 shrink-0 rounded-[999px] border-4 border-[var(--background)] shadow-[0_3px_10px_rgba(0,0,0,0.18)] max-[767px]:left-4 max-[767px]:size-20"
          >
            <Avatar.Fallback className="text-2xl">
              {user.username?.charAt(0).toUpperCase() ?? "?"}
            </Avatar.Fallback>
          </Avatar>
          <div className="flex min-w-0 items-center justify-start gap-5">
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-xl font-semibold text-[var(--foreground)]">
                  {user.username}
                </Label>
                {user.school && (
                  <Chip size="sm" color="accent">
                    {SCHOOL_LABEL[user.school]}
                  </Chip>
                )}
              </div>
              <p className="m-0 truncate text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
                {user.bio || "这个人很神秘，什么也没有留下。"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-5">
            <div className="flex gap-5 max-[600px]:hidden">
              <div className="text-center">
                <strong className="block text-sm text-[var(--foreground)]">0</strong>
                <span className="text-xs text-[var(--muted)]">粉丝</span>
              </div>
              <div className="text-center">
                <strong className="block text-sm text-[var(--foreground)]">0</strong>
                <span className="text-xs text-[var(--muted)]">关注</span>
              </div>
            </div>
            <Button
              variant={following ? "secondary" : "primary"}
              size="sm"
              onPress={() => setFollowing((value) => !value)}
            >
              {following ? <LucideCircleX /> : <LucidePlus />}
              {following ? "已关注" : "关注"}
            </Button>
          </div>
        </Card.Content>
      </Card>

      <div className="grid grid-cols-[minmax(0,1fr)_256px] gap-7 px-7 py-7 max-[900px]:grid-cols-1 max-[900px]:px-3">
        <section>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(String(key))}
            className="w-[800px]"
          >
            <Tabs.ListContainer className="w-fit max-w-full">
              <Tabs.List aria-label="个人主页内容">
                <Tabs.Tab id="intro" className="whitespace-nowrap">
                  个人介绍
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="achievements" className="whitespace-nowrap">
                  成就
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="messages" className="whitespace-nowrap">
                  留言板
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id="intro" className="pt-6">
              <Card variant="transparent">
                <Card.Header>
                  <Card.Title>个人介绍</Card.Title>
                  <Card.Description>{user.bio || "暂未填写个人简介"}</Card.Description>
                </Card.Header>
              </Card>
            </Tabs.Panel>
            <Tabs.Panel id="achievements" className="pt-6">
              <Card variant="transparent">
                <Card.Header>
                  <Card.Title>成就</Card.Title>
                  <Card.Description>暂时还没有成就记录。</Card.Description>
                </Card.Header>
              </Card>
            </Tabs.Panel>
            <Tabs.Panel id="messages" className="pt-6">
              <Card variant="transparent">
                <Card.Header>
                  <Card.Title>留言板</Card.Title>
                  <Card.Description>暂时还没有留言。</Card.Description>
                </Card.Header>
              </Card>
            </Tabs.Panel>
          </Tabs>
        </section>

        <aside className="flex flex-col gap-7">
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-sm">基本信息</Card.Title>
            </Card.Header>
            <Card.Content className="flex flex-col gap-3 text-sm">
              <p className="m-0 flex items-center gap-3">
                <LucideUserRound className="size-4 text-[var(--muted)]" />
                用户 ID：{user.id}
              </p>
              <p className="m-0 flex items-center gap-3">
                <LucideHash className="size-4 text-[var(--muted)]" />
                学号：{user.student_num || "未填写"}
              </p>
              <p className="m-0 flex items-center gap-3">
                <LucideGraduationCap className="size-4 text-[var(--muted)]" />
                学校：{user.school ? SCHOOL_LABEL[user.school] : "未填写"}
              </p>
              <p className="m-0 flex items-center gap-3">
                <LucideCalendarDays className="size-4 text-[var(--muted)]" />
                注册时间：
                {user.created_at ? new Date(user.created_at).toLocaleDateString("zh-CN") : "未知"}
              </p>
            </Card.Content>
          </Card>

          <Card className="min-h-[92px]">
            <Card.Header>
              <Card.Title className="text-sm">勋章墙</Card.Title>
            </Card.Header>
          </Card>
          <Button variant="outline" size="sm" className="self-center text-[var(--muted)]">
            <LucideFlag />
            举报该用户
          </Button>
        </aside>
      </div>
    </div>
  );
}

export default Me;
