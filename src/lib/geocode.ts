// 주소 -> 좌표(위도/경도) 변환.
// 이미 갖고 있는 네이버 지도 키(NAVER_MAP_CLIENT_ID/SECRET)로 네이버 Geocoding API를 우선
// 사용하고, 카카오 REST API 키가 설정돼 있으면(현재는 없음) 그쪽도 시도한다.
// 둘 다 키가 없거나 요청이 실패하면 null을 반환하고, 호출부는 좌표 없이 진행한다.

const NAVER_GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";
const KAKAO_ADDRESS_SEARCH_URL =
  "https://dapi.kakao.com/v2/local/search/address.json";
const KAKAO_KEYWORD_SEARCH_URL =
  "https://dapi.kakao.com/v2/local/search/keyword.json";

type Coords = { lat: number; lng: number } | null;

async function geocodeWithNaver(address: string): Promise<Coords> {
  const clientId =
    process.env.NAVER_MAP_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch(
    `${NAVER_GEOCODE_URL}?query=${encodeURIComponent(address)}`,
    {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": clientId,
        "X-NCP-APIGW-API-KEY": clientSecret,
      },
    }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as {
    addresses?: { x: string; y: string }[];
  };
  const addr = data.addresses?.[0];
  if (!addr) return null;

  const lat = Number(addr.y);
  const lng = Number(addr.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

async function kakaoSearchOnce(url: string, address: string, apiKey: string): Promise<Coords> {
  const res = await fetch(`${url}?query=${encodeURIComponent(address)}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as { documents?: { x: string; y: string }[] };
  const doc = data.documents?.[0];
  if (!doc) return null;

  const lat = Number(doc.y);
  const lng = Number(doc.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

async function geocodeWithKakao(address: string): Promise<Coords> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey) return null;

  // 지번/도로명 주소 검색 먼저, 건물명 등이면 키워드 검색으로 재시도
  const byAddress = await kakaoSearchOnce(KAKAO_ADDRESS_SEARCH_URL, address, apiKey);
  if (byAddress) return byAddress;
  return await kakaoSearchOnce(KAKAO_KEYWORD_SEARCH_URL, address, apiKey);
}

export async function geocodeAddress(address: string): Promise<Coords> {
  if (!address.trim()) return null;

  try {
    const viaNaver = await geocodeWithNaver(address);
    if (viaNaver) return viaNaver;
  } catch {
    // 무시하고 카카오로 폴백
  }

  try {
    return await geocodeWithKakao(address);
  } catch {
    return null;
  }
}
