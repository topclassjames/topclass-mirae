import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "@/lib/actions";

export default async function ProfilePage() {
  const session = await auth();
  const me = await prisma.staff.findUnique({
    where: { id: session!.user.id },
  });
  if (!me) return null;

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-lg font-bold text-slate-900">내정보</h1>
        <p className="mt-1 text-sm text-slate-500">
          아이디: {me.username} ·{" "}
          {me.role === "ADMIN" ? "관리자" : "일반 직원"}
        </p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              이름
            </label>
            <input
              name="name"
              defaultValue={me.name}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              연락처
            </label>
            <input
              name="phone"
              defaultValue={me.phone ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <hr className="border-slate-100" />
          <p className="text-xs text-slate-400">
            비밀번호를 변경하지 않으려면 비워두세요.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              새 비밀번호
            </label>
            <input
              name="password"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              새 비밀번호 확인
            </label>
            <input
              name="passwordConfirm"
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            저장
          </button>
        </form>
      </section>
    </div>
  );
}
