# 한국판 국가부채 시계 Design Guide

## 1. 전체적인 무드

**신뢰할 수 있는 전문성과 즉각적인 임팩트**

이 서비스는 국가 재정이라는 민감하고 중요한 정보를 다루므로, 신뢰성과 전문성을 바탕으로 한 디자인이 필수입니다. 동시에 18-35세 청년층에게 강한 시각적 임팩트를 주어 '와!' 하는 순간을 만들어야 합니다. 

전체적인 무드는 다음과 같습니다:
- **신뢰성**: 정부 기관 수준의 객관적이고 정확한 정보 전달
- **긴급성**: 실시간으로 증가하는 숫자를 통한 위기 의식 조성
- **접근성**: 복잡한 경제 지식 없이도 직관적으로 이해 가능
- **공유 친화적**: SNS에서 자연스럽게 확산될 수 있는 시각적 매력

## 2. 참조 서비스

- **Name**: 미국 National Debt Clock
- **Description**: 미국 국가부채를 실시간으로 시각화하는 웹 서비스
- **Design Mood**: 진지하고 전문적이면서도 시각적으로 강렬한 임팩트
- **Primary Color**: #1E3A8A (진한 파란색)
- **Secondary Color**: #F1F5F9 (연한 회색)

## 3. 색상 & 그라데이션

**쿨톤 기반의 신뢰성 있는 색상 팔레트**

- **Primary Color**: #00539C (진한 파란색)
- **Secondary Color**: #E5EEF4 (연한 파란 회색)
- **Accent-Positive**: #10B981 (녹색 - 긍정적 지표용)
- **Accent-Critical**: #EF4444 (빨간색 - 부채 증가, 위험 표시용)
- **Gray-900**: #111827 (본문 텍스트)
- **Gray-600**: #4B5563 (보조 텍스트)
- **Gray-100**: #F3F4F6 (카드 배경)
- **White**: #FFFFFF (기본 배경)

**Mood**: 쿨톤, 낮은 채도로 전문성과 신뢰성 강조

**Color Usage**: 
1. **Primary**: 헤더, 주요 버튼, 링크, 브랜드 요소
2. **Accent-Critical**: 실시간 카운터 숫자, 부채 관련 지표, 긴급 알림
3. **Accent-Positive**: CTA 버튼, 성공 메시지, 긍정적 변화 표시
4. **Gray 계열**: 텍스트 계층, 배경, 구분선

## 4. 타이포그래피 & 폰트

**가독성과 숫자 표현에 최적화된 타이포그래피 시스템**

- **Primary Font**: Pretendard (한글), Inter (영문/숫자)
- **Heading 1**: Pretendard Bold, 36px, -0.02em
- **Heading 2**: Pretendard SemiBold, 28px, -0.01em
- **Heading 3**: Pretendard Medium, 22px, 0em
- **Body Large**: Pretendard Regular, 18px, 0.01em
- **Body**: Pretendard Regular, 16px, 0.01em
- **Caption**: Pretendard Regular, 14px, 0.02em
- **Counter Display**: Inter Bold, 48-64px, tabular-nums (숫자 정렬)

**특별 설정**:
- 실시간 카운터 숫자는 `font-variant-numeric: tabular-nums` 적용
- 모든 숫자 표시에는 천 단위 구분자(,) 사용
- 줄 높이: 제목 1.2, 본문 1.6

## 5. 레이아웃 & 구조

**모바일 우선의 단순하고 직관적인 구조**

- **Grid System**: 4pt 기반 스페이싱 시스템
- **Max Width**: 1280px (데스크톱)
- **Breakpoints**: 
  - Mobile: ~768px
  - Tablet: 768px~1024px  
  - Desktop: 1024px+
- **Margins**: 
  - Mobile: 16px
  - Desktop: 24px
- **Card Radius**: 8px
- **Button Radius**: 6px

**페이지 구조**:
1. **Hero Section**: 실시간 카운터 (전체 화면의 60%)
2. **Info Cards**: 1인당 부담, 전일 대비 변화 등
3. **Action Section**: 공유 버튼, 구독 신청
4. **Policy Updates**: 정책 변화 알림 (토스트/배너)

## 6. 비주얼 스타일

**미니멀하고 데이터 중심의 비주얼 접근**

- **아이콘**: Lucide React, 1.5px 선 굵기, 라운드 캡
- **일러스트레이션**: 최소 사용, 필요 시 라인 스타일로 Secondary 색상 활용
- **이미지**: 데이터 시각화 중심, 사진 사용 지양
- **그래픽 요소**: 
  - 심플한 구분선 (1px, Gray-200)
  - 카드 그림자: 0 1px 3px rgba(0,0,0,0.1)
  - 호버 효과: subtle elevation과 색상 변화

**데이터 시각화**:
- 숫자가 주인공이 되도록 배경은 최대한 단순화
- 증가/감소 표시는 화살표(↑↓)와 색상으로 직관적 표현
- 백분율, 통화 단위 등은 일관된 포맷 적용

## 7. UX 가이드

**청년층 대상의 직관적이고 공유 친화적인 사용자 경험**

**핵심 UX 원칙**:
1. **즉시성**: 3초 내 핵심 정보 파악 가능
2. **직관성**: 별도 설명 없이도 이해 가능한 인터페이스
3. **공유성**: 한 번의 탭으로 SNS 공유 가능
4. **신뢰성**: 데이터 출처와 업데이트 시각 명시

**사용자 플로우 최적화**:
- **첫 방문**: Hero 카운터 → 1인당 부담 확인 → 공유 또는 구독
- **재방문**: 변화 확인 → 정책 업데이트 → 추가 공유
- **모바일 우선**: 세로 스크롤 최소화, 엄지 손가락 도달 영역 고려

**마이크로 인터랙션**:
- 숫자 카운트업 애니메이션 (1초)
- 공유 버튼 탭 시 햅틱 피드백 (모바일)
- 정책 업데이트 시 subtle 펄스 효과

## 8. UI 컴포넌트 가이드

### 8.1 CounterCard (실시간 카운터)
```
배경: White
테두리: 1px solid Gray-200
패딩: 32px (mobile: 24px)
숫자: Accent-Critical, Inter Bold 64px
라벨: Gray-600, Pretendard Medium 18px
애니메이션: 증가 시 0.2초 subtle pulse
```

### 8.2 InfoCard (정보 카드)
```
배경: Gray-100
테두리: none
패딩: 24px (mobile: 16px)
제목: Gray-900, Pretendard Medium 16px
값: Primary, Pretendard Bold 24px
변화량: Accent-Positive/Critical, 14px
```

### 8.3 ShareButton (공유 버튼)
```
기본: bg-Primary, text-White
호버: bg-Primary-dark (shade -20%)
패딩: 12px 24px
텍스트: Pretendard Medium 16px
아이콘: Lucide Share, 20px
```

### 8.4 PolicyToast (정책 알림)
```
배경: Accent-Critical
텍스트: White
위치: 상단 고정
애니메이션: slide-down 0.3s ease-out
자동 숨김: 5초 후
```

### 8.5 SubscribeForm (구독 폼)
```
배경: Secondary
입력 필드: White 배경, Primary 테두리 (focus)
버튼: Accent-Positive 배경
유효성 검사: 실시간, 에러 시 Accent-Critical
```

### 8.6 Navigation (네비게이션)
```
높이: 64px
배경: White, 하단 1px Gray-200 보더
로고: Primary 색상, Pretendard Bold 20px
메뉴: Gray-600, 호버 시 Primary
모바일: 햄버거 메뉴, 24px 아이콘
```

### 8.7 SourceBadge (출처 배지)
```
배경: Secondary
텍스트: Primary, Pretendard Medium 12px
패딩: 4px 8px
테두리 반경: 4px
위치: 카운터 우상단
```

### 8.8 ProgressIndicator (로딩 상태)
```
스피너: Primary 색상, 24px
스켈레톤: Gray-200 배경, 애니메이션 pulse
에러 상태: Accent-Critical 배경, 재시도 버튼
```

이 디자인 가이드는 한국판 국가부채 시계의 신뢰성 있고 임팩트 있는 사용자 경험을 구현하기 위한 종합적인 지침을 제공합니다. 모든 컴포넌트와 스타일은 청년층 사용자의 직관적 이해와 적극적 공유를 촉진하도록 설계되었습니다.