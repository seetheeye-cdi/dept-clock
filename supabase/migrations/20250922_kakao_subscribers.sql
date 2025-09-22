-- kakao_subscribers 테이블 생성 및 보안 정책
-- NOTE: 서비스 롤(SUPABASE_SERVICE_ROLE_KEY)은 RLS를 우회합니다. 클라이언트 키로는 접근 불가하도록 RLS를 활성화합니다.

-- 확장
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 테이블
CREATE TABLE IF NOT EXISTS public.kakao_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 TEXT UNIQUE NOT NULL,                                -- E.164 표기(+821012345678)
    phone_hash TEXT UNIQUE NOT NULL,                                -- HMAC-SHA256(salt + phone)
    status TEXT NOT NULL DEFAULT 'ACTIVE'                           -- 'ACTIVE' | 'UNSUBSCRIBED'
        CHECK (status IN ('ACTIVE','UNSUBSCRIBED')),
    consent BOOLEAN NOT NULL DEFAULT TRUE,                          -- 마케팅/알림 수신 동의
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_kakao_subscribers_status ON public.kakao_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_kakao_subscribers_created_at ON public.kakao_subscribers(created_at);

-- RLS 활성화 및 정책(기본 거부)
ALTER TABLE public.kakao_subscribers ENABLE ROW LEVEL SECURITY;

-- service_role 이외의 모든 접근 차단 (명시적 거부 정책)
DROP POLICY IF EXISTS "deny_all_non_service" ON public.kakao_subscribers;
CREATE POLICY "deny_all_non_service"
    ON public.kakao_subscribers
    FOR ALL
    TO public
    USING (false)
    WITH CHECK (false);

-- 선택적으로 service_role 만 허용하는 정책 (service_role은 RLS 우회하지만, 문서화 목적)
DROP POLICY IF EXISTS "allow_service_role_all" ON public.kakao_subscribers;
CREATE POLICY "allow_service_role_all"
    ON public.kakao_subscribers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


