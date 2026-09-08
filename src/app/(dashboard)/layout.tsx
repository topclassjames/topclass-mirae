import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/customers" className="font-bold text-slate-900">
            🏠 탑클래스 미래
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {isAdmin && (
              <Link
                href="/staff"
                className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
              >
                직원관리
              </Link>
            )}
            <Link
              href="/customers"
              className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
            >
              내 고객
            </Link>
            <Link
              href="/profile"
              className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
            >
              내정보
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="ml-2 rounded-lg px-3 py-2 font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                로그아웃
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
