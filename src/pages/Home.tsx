import { useAuth } from "../auth/AuthContext";
import { SearchField } from "@heroui/react";

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page -mx-4 -mt-5 min-h-full max-[767px]:-mx-3 max-[767px]:-mt-4">
      <div className="relative h-[140px] w-full overflow-hidden bg-[var(--surface-secondary)]">
        <img
          src="/assets/images/fdfz.png"
          alt=""
          className="h-full w-full object-cover object-center opacity-[0.08]"
          aria-hidden="true"
        />
        <SearchField
          name="search-main"
          className="absolute top-4 left-1/2 -translate-x-1/2 opacity-[0.8]"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input className="w-[300px]" placeholder="搜索资源站..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <p className="absolute bottom-3 left-7 m-0 text-3xl font-bold text-[var(--foreground)] max-[767px]:left-3">
          复旦附中数字资源站
        </p>
      </div>
      <h1 className="px-7 pt-7 text-xl font-medium">你好，{user?.username}</h1>

      {/* 主体：左侧内容 + 右侧侧栏 */}
      <div className="grid grid-cols-[minmax(0,1fr)_256px] gap-7 px-7 py-7 max-[900px]:grid-cols-1 max-[900px]:px-3">
        <section className="min-w-0">{/* 主内容 */}</section>

        <aside className="flex flex-col gap-7">{/* 侧栏 */}</aside>
      </div>
    </div>
  );
}

export default Home;
