// 카카오 로컬 API로 주소 -> 좌표(위도/경도) 변환.
// REST API 키가 없거나 요청이 실패하면 null을 반환하고, 호출부는 좌표 없이 진행한다.

const KAKAO_ADDRESS_SEARCH_URL =
  "https://dapi.kakao.com/v2/local/search/address.json";
const KAKAO_KEYWORD_SEARCH_URL =
  "https://dapi.kakao.com/v2/local/search/keyword.json";

type KakaoDocument = { x: string; y: string };
type KakaoSearchResponse = { documents: KakaoDocument[] };

async function searchOnce(
  url: string,
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(`${url}?query=${encodeURIComponent(address)}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as KakaoSearchResponse;
  const doc = data.documents?.[0];
  if (!doc) return null;

  const lat = Number(doc.y);
  const lng = Number(doc.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.KAKAO_REST_API_KEY;
  if (!apiKey || !address.trim()) return null;

  try {
    // 지번/도로명 주소 검색 먼저 시도
    const byAddress = await searchOnce(
      KAKAO_ADDRESS_SEARCH_URL,
      address,
      apiKey
    );
    if (byAddress) return byAddress;

    // 건물명 등 정확한 주소가 아닐 수 있으므로 키워드 검색으로 재시도
    return await searchOnce(KAKAO_KEYWORD_SEARCH_URL, address, apiKey);
  } catch {
    return null;
  }
}
