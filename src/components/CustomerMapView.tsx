"use client";

import { useMemo, useState } from "react";
import PropertyMap from "./PropertyMap";

const DEAL_TYPE_LABEL: Record<string, string> = {
  SALE: "매매",
  JEONSE: "전세",
  MONTHLY: "월세",
};

export type PropertyItem = {
  id: string;
  dealType: string;
  address: string;
  lat: number | null;
  lng: number | null;
  deposit: string | null;
  rent: string | null;
  price: string | null;
  floor: string | null;
  area: string | null;
  roomCount: string | null;
  grade1: string | null;
  grade2: string | null;
  memo: string | null;
  photoUrl: string | null;
  naverLink: string | null;
  createdAt: string;
};

function priceLabel(p: PropertyItem) {
  if (p.dealType === "SALE") return `매매 ${p.price ?? "-"}`;
  if (p.dealType === "JEONSE") return `전세 ${p.deposit ?? "-"}`;
  return `월세 ${p.deposit ?? "-"}/${p.rent ?? "-"}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CustomerMapView({
  customerName,
  staffName,
  staffPhone,
  properties,
}: {
  customerName: string;
  staffName: string;
  staffPhone: string | null;
  properties: PropertyItem[];
}) {
  const [filter, setFilter] = useState<"all" | "today" | "yesterday" | "3days">(
    "all"
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return properties;
    const now = new Date();
    return properties.filter((p) => {
      const created = new Date(p.createdAt);
      const diffDays = Math.floor(
        (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (filter === "today") return isSameDay(created, now);
      if (filter === "yesterday") return diffDays === 1;
      if (filter === "3days") return diffDays <= 3;
      return true;
    });
  }, [filter, properties]);

  const selected = properties.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-400">부동산을 구하는 과정을 지도에 담다</p>
            <h1 className="font-bold text-slate-900">
              🏠 {customerName}님의 매물 지도
            </h1>
          </div>
          <div className="flex items-center gap-1 text-xs">
            {(
              [
                ["all", "전체"],
                ["today", "오늘"],
                ["yesterday", "어제"],
                ["3days", "3일전"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 font-medium ${
                  filter === key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
            <span className="ml-1 rounded-full bg-blue-600 px-3 py-1.5 font-semibold text-white">
              매물 {filtered.length}개
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-4">
        <PropertyMap
          properties={filtered.map((p) => ({
            id: p.id,
            address: p.address,
            lat: p.lat,
            lng: p.lng,
            label: priceLabel(p),
          }))}
          onSelect={setSelectedId}
        />

        <div className="space-y-3">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 hover:ring-slate-300"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {DEAL_TYPE_LABEL[p.dealType]}
                </span>
                <span className="font-semibold text-blue-700">
                  {priceLabel(p)}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {p.address}
              </p>
              {(p.floor || p.area) && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {[p.floor, p.area].filter(Boolean).join(" · ")}
                </p>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200">
              해당 조건의 매물이 없습니다.
            </p>
          )}
        </div>
      </div>

      {staffPhone && (
        <a
          href={`tel:${staffPhone}`}
          className="fixed inset-x-4 bottom-4 mx-auto flex max-w-3xl items-center justify-center gap-2 rounded-full bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg"
        >
          📞 담당 {staffName}에게 전화 문의 ({staffPhone})
        </a>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {DEAL_TYPE_LABEL[selected.dealType]}
                </span>
                <p className="mt-1 font-bold text-blue-700">
                  {priceLabel(selected)}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="font-semibold text-slate-900">{selected.address}</p>
            <p className="mt-1 text-xs text-slate-400">
              {[selected.floor, selected.area, selected.roomCount]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {selected.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.photoUrl}
                alt={selected.address}
                className="mt-3 h-48 w-full rounded-xl object-cover"
              />
            )}

            {(selected.grade1 || selected.grade2) && (
              <div className="mt-3 flex gap-2 text-xs">
                {selected.grade1 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
                    {selected.grade1}
                  </span>
                )}
                {selected.grade2 && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                    {selected.grade2}
                  </span>
                )}
              </div>
            )}

            {selected.memo && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {selected.memo}
              </p>
            )}

            {selected.naverLink && (
              <a
                href={selected.naverLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700"
              >
                네이버부동산에서 상세보기
              </a>
            )}
            {staffPhone && (
              <a
                href={`tel:${staffPhone}`}
                className="mt-2 block w-full rounded-xl bg-slate-900 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                이 매물 전화 문의
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
