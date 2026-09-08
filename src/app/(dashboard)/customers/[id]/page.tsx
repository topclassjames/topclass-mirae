import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createProperty, updateProperty, deleteProperty } from "@/lib/actions";
import CopyLinkButton from "@/components/CopyLinkButton";

const DEAL_TYPE_LABEL: Record<string, string> = {
  SALE: "매매",
  JEONSE: "전세",
  MONTHLY: "월세",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      properties: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!customer) notFound();
  if (customer.staffId !== session!.user.id && session!.user.role !== "ADMIN") {
    redirect("/customers");
  }

  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const mapUrl = `${host ? `${proto}://${host}` : ""}/customer-map/${customer.linkCode}`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/customers" className="text-sm text-slate-500 hover:underline">
          ← 내 고객 목록
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {customer.name}님의 매물 관리
            </h1>
            <p className="mt-1 text-sm text-slate-500">{mapUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <CopyLinkButton url={mapUrl} />
            <a
              href={`/customer-map/${customer.linkCode}`}
              target="_blank"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              고객 화면 보기
            </a>
          </div>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">
          매물 추가
        </h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            await createProperty(customer.id, formData);
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <select
            name="dealType"
            defaultValue="MONTHLY"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="MONTHLY">월세</option>
            <option value="JEONSE">전세</option>
            <option value="SALE">매매</option>
          </select>
          <input
            name="address"
            placeholder="주소 (필수)"
            required
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-2"
          />
          <input
            name="deposit"
            placeholder="보증금"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="rent"
            placeholder="월세"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="price"
            placeholder="매매가"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="floor"
            placeholder="층수"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="area"
            placeholder="면적"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="roomCount"
            placeholder="방수"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="grade1"
            placeholder="등급1 (예: 좋음)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="grade2"
            placeholder="등급2 (예: 보통)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="lat"
            placeholder="위도 (선택)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="lng"
            placeholder="경도 (선택)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            name="photoUrl"
            placeholder="사진 URL (선택)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-2"
          />
          <input
            name="naverLink"
            placeholder="네이버부동산 매물 링크"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-3"
          />
          <textarea
            name="memo"
            placeholder="비고"
            rows={2}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-3"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-3 lg:col-span-1"
          >
            매물 추가
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          등록된 매물 ({customer.properties.length}개)
        </h2>
        {customer.properties.map((p) => (
          <details
            key={p.id}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="mr-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {DEAL_TYPE_LABEL[p.dealType]}
                  </span>
                  <span className="font-medium text-slate-900">
                    {p.address}
                  </span>
                </div>
                <span className="text-xs text-slate-400">펼쳐서 수정 ▾</span>
              </div>
            </summary>

            <form
              action={async (formData: FormData) => {
                "use server";
                await updateProperty(p.id, formData);
              }}
              className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <select
                name="dealType"
                defaultValue={p.dealType}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              >
                <option value="MONTHLY">월세</option>
                <option value="JEONSE">전세</option>
                <option value="SALE">매매</option>
              </select>
              <input
                name="address"
                defaultValue={p.address}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-2"
              />
              <input
                name="deposit"
                defaultValue={p.deposit ?? ""}
                placeholder="보증금"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="rent"
                defaultValue={p.rent ?? ""}
                placeholder="월세"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="price"
                defaultValue={p.price ?? ""}
                placeholder="매매가"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="floor"
                defaultValue={p.floor ?? ""}
                placeholder="층수"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="area"
                defaultValue={p.area ?? ""}
                placeholder="면적"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="roomCount"
                defaultValue={p.roomCount ?? ""}
                placeholder="방수"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="grade1"
                defaultValue={p.grade1 ?? ""}
                placeholder="등급1"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="grade2"
                defaultValue={p.grade2 ?? ""}
                placeholder="등급2"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="lat"
                defaultValue={p.lat ?? ""}
                placeholder="위도"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="lng"
                defaultValue={p.lng ?? ""}
                placeholder="경도"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
              />
              <input
                name="photoUrl"
                defaultValue={p.photoUrl ?? ""}
                placeholder="사진 URL"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-2"
              />
              <input
                name="naverLink"
                defaultValue={p.naverLink ?? ""}
                placeholder="네이버부동산 매물 링크"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-3"
              />
              <textarea
                name="memo"
                defaultValue={p.memo ?? ""}
                rows={2}
                placeholder="비고"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 sm:col-span-3"
              />
              <div className="flex gap-2 sm:col-span-3">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  저장
                </button>
              </div>
            </form>
            <form
              action={async () => {
                "use server";
                await deleteProperty(p.id);
              }}
              className="mt-2"
            >
              <button className="text-xs font-medium text-red-500 hover:underline">
                이 매물 삭제
              </button>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
