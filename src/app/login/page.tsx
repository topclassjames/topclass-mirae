import { loginAction } from "@/lib/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/customers";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="mb-1 text-xl font-bold text-slate-900">
          🏠 탑클래스 미래
        </h1>
        <p className="mb-6 text-sm text-slate-500">직원 로그인</p>

        {params.error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            아이디 또는 비밀번호가 올바르지 않습니다.
          </p>
        )}

        <form action={loginAction} className="space-y-3">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              아이디
            </label>
            <input
              name="username"
              required
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
