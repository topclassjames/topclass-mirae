# 배포/운영 정보

다른 컴퓨터나 새 세션에서 이 프로젝트를 이어서 작업할 때 참고하세요.

## 위치

- **로컬 코드**: `OneDrive\topclass-mirae` (OneDrive 동기화 폴더 안이라 다른 PC에서도 자동 동기화됨)
- **GitHub**: https://github.com/topclassjames/topclass-mirae (계정: topclassjames)
- **Railway 프로젝트**: `topclass-mirae` — 서비스 `topclass-mirae`(Next.js 앱)와 `postgres`(DB) 두 개
- **배포 URL**: https://topclass-mirae-production.up.railway.app

## 로그인

- 첫 관리자 계정: `admin` / `admin1234!` (내정보에서 변경 권장)

## 환경변수 (Railway 서비스 "topclass-mirae"에 설정됨, 값은 Railway 대시보드에서 확인)

- `DATABASE_URL` — Postgres 연결 (내부 네트워크 주소)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY` — 카카오맵 JavaScript 키 (앱 "탑클래스 미래", id 1571287)
- `NAVER_MAP_CLIENT_ID` / `NAVER_MAP_CLIENT_SECRET` — 초기에 네이버 지도로 시작했다가 카카오맵으로
  전환하면서 안 쓰게 됨. 코드에는 참조 없음, 필요 없으면 삭제해도 무방.

로컬 개발 시 같은 값들을 프로젝트 루트 `.env`에 넣어야 함 (`.gitignore`에 포함되어 git에는 없음).
Railway 대시보드 → topclass-mirae 서비스 → Variables 탭에서 값 확인 가능.

## 지도 API 관련 메모

- 카카오맵 JS 키의 "JavaScript SDK 도메인"에 배포 URL과 `http://localhost:3000` 둘 다 등록되어
  있어야 함 (카카오 개발자센터 → 앱 설정 → 앱 → 플랫폼 키 → Default JS Key).
- **추가로 "제품 설정 → 카카오맵" 메뉴에서 별도 활성화가 필요했음** (2026-07-21 정책 변경 이후).
  둘 중 하나만 하면 지도가 안 뜨니 둘 다 확인할 것.

## DB 마이그레이션

`package.json`의 `start` 스크립트가 `prisma migrate deploy && next start`라서 배포할 때마다
자동으로 마이그레이션이 적용됨. 로컬에서 스키마를 바꿨으면:

```bash
npx prisma migrate dev --name <설명>
```

로컬에서 Railway의 원격 DB에 직접 접속하려면 Postgres 서비스에 TCP 프록시가 하나 열려 있음
(Railway 대시보드에서 postgres 서비스 → Networking 탭에서 확인).

## 남은 작업 / 다음에 할 만한 것

- 주소 입력 시 좌표(위도/경도) 자동 변환 (현재는 수동 입력)
- 네이버부동산 링크 자동 수집 (현재는 수동 입력)
