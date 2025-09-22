# Vercel 환경 변수 설정 가이드

## 방법 1: Vercel 대시보드에서 설정

1. [Vercel Dashboard](https://vercel.com) 접속
2. `dept-clock` 프로젝트 선택
3. Settings → Environment Variables 메뉴 이동
4. 다음 환경 변수 추가:

| 변수명 | 설명 | 적용 환경 |
|--------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public 키 | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role 키 (비밀) | Production, Preview, Development |

## 방법 2: Vercel CLI 사용

```bash
# 환경 변수 추가 (각각 실행)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 배포 재실행
vercel --prod
```

## Supabase 정보 찾기

1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. Settings → API 메뉴에서:
   - `URL`: `NEXT_PUBLIC_SUPABASE_URL`에 복사
   - `anon public`: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 복사
   - `service_role`: `SUPABASE_SERVICE_ROLE_KEY`에 복사

## 환경 변수 설정 후

환경 변수 설정이 완료되면 자동으로 재배포됩니다.
몇 분 후에 https://dept-clock.vercel.app 에서 정상 작동을 확인하세요.

## 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 민감한 정보이므로 절대 공개하지 마세요
- 모든 환경(Production, Preview, Development)에 변수를 추가해야 합니다
