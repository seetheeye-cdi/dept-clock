-- 국가부채 데이터를 최신 값으로 업데이트
UPDATE debt_state 
SET 
    total_debt = 6222000000000000, -- 6,222조원
    per_second_rate = 7900000, -- 초당 790만원 증가
    population = 51744876, -- 최신 인구 통계
    source_name = '한국은행·금융감독원 (2024년 4분기)',
    last_updated_at = NOW()
WHERE id = 1;
