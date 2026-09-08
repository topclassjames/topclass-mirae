"use client";

import { useEffect, useRef, useState } from "react";

export type MapProperty = {
  id: string;
  address: string;
  lat: number | null;
  lng: number | null;
  label: string;
};

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (opts: Record<string, unknown>) => {
          setMap: (map: unknown) => void;
        };
        Event: {
          addListener: (
            target: unknown,
            type: string,
            handler: () => void
          ) => void;
        };
      };
    };
  }
}

const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

export default function PropertyMap({
  properties,
  onSelect,
}: {
  properties: MapProperty[];
  onSelect: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");

  const withCoords = properties.filter(
    (p): p is MapProperty & { lat: number; lng: number } =>
      p.lat != null && p.lng != null
  );

  useEffect(() => {
    if (!clientId) return;
    if (withCoords.length === 0) return;

    const init = () => {
      if (!window.naver || !mapRef.current) return;
      const { naver } = window;
      const center = new naver.maps.LatLng(
        withCoords[0].lat,
        withCoords[0].lng
      );
      const map = new naver.maps.Map(mapRef.current, {
        center,
        zoom: 14,
      });

      withCoords.forEach((p) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(p.lat, p.lng),
          map,
          title: p.label,
        });
        naver.maps.Event.addListener(marker, "click", () => onSelect(p.id));
      });

      setStatus("ready");
    };

    if (window.naver) {
      init();
      return;
    }

    const scriptId = "naver-maps-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.async = true;
      script.onerror = () => setStatus("error");
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);
    return () => script?.removeEventListener("load", init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.length]);

  if (!clientId) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-center text-sm text-slate-500">
        지도를 표시하려면 네이버 지도 API 키 설정이 필요합니다.
        <br />
        아래 매물 목록을 확인해주세요.
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-center text-sm text-slate-500">
        등록된 매물에 위치 좌표가 없습니다.
        <br />
        아래 매물 목록을 확인해주세요.
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-2xl ring-1 ring-slate-200">
      <div ref={mapRef} className="h-full w-full" />
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-sm text-red-500">
          지도를 불러오지 못했습니다.
        </div>
      )}
    </div>
  );
}
