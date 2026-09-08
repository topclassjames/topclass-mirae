import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createStaff, deleteStaff } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function StaffPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/customers");
  }

  const staffList = await prisma.staff.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { customers: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold text-slate-900">직원관리</h1>
        <p className="mt-1 text-sm text-slate-500">
          직원 계정을 추가하고 관리합니다.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          새 직원 추가
        </h2>
        <form
          action={createStaff}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
        >
          <input
            name="username"
            placeholder="아이디"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="name"
            placeholder="이름"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="phone"
            placeholder="연락처 (선택)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <select
            name="role"
            defaultValue="STAFF"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="STAFF">일반 직원</option>
            <option value="ADMIN">관리자</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-2 lg:col-span-1"
          >
            추가
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">아이디</th>
              <th className="px-4 py-3 font-medium">연락처</th>
              <th className="px-4 py-3 font-medium">권한</th>
              <th className="px-4 py-3 font-medium">고객 수</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {s.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{s.username}</td>
                <td className="px-4 py-3 text-slate-600">{s.phone || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.role === "ADMIN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {s.role === "ADMIN" ? "관리자" : "일반 직원"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {s._count.customers}
                </td>
                <td className="px-4 py-3 text-right">
                  {s.id !== session.user.id && (
                    <form
                      action={async () => {
                        "use server";
                        await deleteStaff(s.id);
                      }}
                    >
                      <button className="text-xs font-medium text-red-500 hover:underline">
                        삭제
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
