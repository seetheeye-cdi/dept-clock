# 🚀 국가부채시계 로컬 실행 가이드

## 📋 사전 준비사항

- Node.js 18.17 이상
- npm (패키지 매니저)
- Supabase 계정 (무료 가능)

## 🔧 설정 단계

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 입력합니다:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> Supabase 프로젝트가 없다면 [supabase.com](https://supabase.com)에서 무료로 생성할 수 있습니다.

### 3. Supabase 설정

1. Supabase 대시보드에서 새 프로젝트 생성
2. Settings > API에서 위의 환경 변수 값들 복사
3. SQL Editor에서 `/supabase/migrations/20250920_initial_schema.sql` 파일 내용 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🧪 테스트 방법

### 기본 기능 확인
1. **실시간 카운터**: 페이지 로드 시 숫자가 자동으로 증가하는지 확인
2. **1인당 부담 금액**: 총 부채를 인구수로 나눈 값이 정확히 표시되는지 확인
3. **반응형 디자인**: 모바일/데스크톱 화면 크기에서 적절히 표시되는지 확인

### Supabase 데이터 수정
SQL Editor에서 다음 쿼리로 데이터 업데이트 가능:

```sql
UPDATE debt_state 
SET 
    total_debt = 1300000000000000,  -- 1,300조원
    per_second_rate = 4000000        -- 초당 400만원
WHERE id = 1;
```

## 🚨 알려진 이슈 및 미구현 기능

### 구현 완료
- ✅ 메인 페이지 UI
- ✅ 실시간 카운터 애니메이션
- ✅ 1인당 부담 금액 계산
- ✅ SSE 기반 실시간 업데이트 구조
- ✅ 반응형 디자인

### 미구현 기능
- ❌ 카카오톡 공유 기능
- ❌ 알림톡 구독 기능
- ❌ 방법론(Methodology) 페이지
- ❌ 정책 이벤트 반영 시스템
- ❌ 일일 데이터 동기화 크론잡
- ❌ GDP 대비 비율 계산
- ❌ 초당 이자 비용 계산

### 개선 필요 사항
- 현재 mock 데이터 사용 중 (전일 대비 증가, GDP 비율, 초당 이자)
- 에러 처리 및 로딩 상태 개선 필요
- 성능 최적화 (LCP < 2.5s 목표)

## 📊 데이터베이스 구조

### debt_state 테이블
- `total_debt`: 기준 부채 총액
- `per_second_rate`: 초당 증가율
- `population`: 인구수
- `last_updated_at`: 마지막 업데이트 시각
- `source_name`: 데이터 출처

### alert_subscribers 테이블
- `kakao_user_id`: 카카오톡 사용자 ID
- `is_active`: 구독 활성화 여부

## 🔍 디버깅 팁

1. **Network 탭 확인**: 
   - `/api/debt-state` 엔드포인트 응답 확인
   - SSE 연결 상태 확인

2. **콘솔 로그**:
   - React Query 에러 메시지 확인
   - SSE 연결 에러 확인

3. **Supabase 대시보드**:
   - Table Editor에서 데이터 직접 확인
   - API Logs에서 쿼리 실행 확인

