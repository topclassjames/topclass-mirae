import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCustomer, deleteCustomer } from "@/lib/actions";
import CopyLinkButton from "@/components/CopyLinkButton";

export default async function CustomersPage() {
  const session = await auth();
  const isAdmin = session?.user.role === "ADMIN";

  const customers = await prisma.customer.findMany({
    where: isAdmin ? {} : { staffId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      staff: { select: { name: true } },
      _count: { select: { properties: true } },
    },
  });

  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold text-slate-900">내 고객</h1>
        <p className="mt-1 text-sm text-slate-500">
          고객을 등록하면 전용 매물 지도 링크가 생성됩니다.
        </p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          새 고객 등록
        </h2>
        <form
          action={createCustomer}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <input
            name="name"
            placeholder="고객 이름"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="phone"
            placeholder="연락처"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="memo"
            placeholder="메모 (선택)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            등록
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {customers.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200">
            등록된 고객이 없습니다.
          </p>
        )}
        {customers.map((c) => {
          const mapUrl = `${origin}/customer-map/${c.linkCode}`;
          return (
            <div
              key={c.id}
              className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {c.name}
                  </span>
                  {c.phone && (
                    <span className="text-sm text-slate-500">{c.phone}</span>
                  )}
                  {isAdmin && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      담당: {c.staff.name}
                    </span>
                  )}
                </div>
                {c.memo && (
                  <p className="mt-1 text-sm text-slate-500">{c.memo}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  매물 {c._count.properties}개 · {mapUrl}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/customers/${c.id}`}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  매물 관리
                </Link>
                <CopyLinkButton url={mapUrl} />
                <form
                  action={async () => {
                    "use server";
                    await deleteCustomer(c.id);
                  }}
                >
                  <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
