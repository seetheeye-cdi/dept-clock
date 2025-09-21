-- 국가부채 상태 테이블
CREATE TABLE IF NOT EXISTS debt_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Singleton 패턴
    total_debt BIGINT NOT NULL DEFAULT 0, -- 기준 부채 총액 (원)
    per_second_rate NUMERIC(15, 2) NOT NULL DEFAULT 0, -- 초당 증가율 (원/초)
    population INTEGER NOT NULL DEFAULT 50000000, -- 인구수 (기본: 5천만)
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- 마지막 업데이트 시각
    source_name TEXT NOT NULL DEFAULT '한국은행', -- 데이터 출처
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 알림톡 구독자 테이블
CREATE TABLE IF NOT EXISTS alert_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kakao_user_id TEXT UNIQUE NOT NULL, -- 카카오톡 사용자 ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 초기 데이터 삽입 (테스트용)
INSERT INTO debt_state (
    total_debt,
    per_second_rate,
    population,
    source_name
) VALUES (
    1200000000000000, -- 1,200조원
    3805175, -- 초당 약 380만원 증가 (연간 120조원 증가 기준)
    51744876, -- 2024년 대한민국 인구
    '기획재정부'
) ON CONFLICT (id) DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_alert_subscribers_kakao_user_id 
    ON alert_subscribers(kakao_user_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscribers_is_active 
    ON alert_subscribers(is_active);

-- 부채 상태 업데이트 시 타임스탬프 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_debt_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_debt_state_timestamp
    BEFORE UPDATE ON debt_state
    FOR EACH ROW
    EXECUTE FUNCTION update_debt_state_timestamp();

