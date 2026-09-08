import Link from "next/link";
import { auth } from "@/auth";

const menuItems = [
  {
    href: "/staff",
    icon: "👥",
    title: "직원관리",
    description: "직원 계정을 등록하고 관리합니다.",
    adminOnly: true,
  },
  {
    href: "/customers",
    icon: "🧑‍💼",
    title: "내 고객",
    description: "고객을 등록하고 전용 매물 지도 링크를 관리합니다.",
    adminOnly: false,
  },
  {
    href: "/profile",
    icon: "⚙️",
    title: "내 정보",
    description: "내 계정 정보를 확인하고 수정합니다.",
    adminOnly: false,
  },
];

export default async function DashboardHome() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const items = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold text-slate-900">메뉴</h1>
        <p className="mt-1 text-sm text-slate-500">
          {session?.user.name ?? session?.user.username}님, 안녕하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:ring-slate-400"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium text-slate-400">
                {index + 1}
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-slate-700">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
