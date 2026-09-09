// 네이버부동산 매물 링크가 따로 없을 때, 주소 검색 결과 페이지로 연결하는 링크를 생성.
// 정확한 매물 링크는 아니고 검색 화면으로 연결되는 링크다.
// 서버/클라이언트 양쪽에서 쓰이는 순수 함수라 geocode.ts(서버 전용)와 분리해뒀다.
export function naverLandSearchUrl(address: string): string {
  return `https://new.land.naver.com/search?query=${encodeURIComponent(
    address
  )}`;
}
