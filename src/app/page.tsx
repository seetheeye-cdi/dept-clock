'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { ArrowUp, Clock3, PieChart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { DebtState } from '@/features/debt/types';

const STATIC_DEBT_STATE: DebtState = {
  baseTotal: 1_175_200_000_000_000,
  perSecondRate: 4_442_320,
  lastUpdatedAt: '2024-12-31T15:00:00+09:00',
  sourceName: '기획재정부 (2024 회계연도 결산)',
  population: 51_248_000,
};

const STATIC_GDP_TOTAL = 2_550_325_000_000_000;
const STATIC_ANNUAL_INTEREST_RATE = 0.028;
const SECONDS_PER_DAY = 86_400;
const DEFAULT_POPULATION = 50_000_000;

const formatNumber = new Intl.NumberFormat('ko-KR');
const formatPerCapitaNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDateTime = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
});

const getNow = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

export default function Home() {
  const debtState = STATIC_DEBT_STATE;
  const population = debtState.population > 0 ? debtState.population : DEFAULT_POPULATION;
  const [displayedDebt, setDisplayedDebt] = useState(debtState.baseTotal);
  const [perCapitaDebt, setPerCapitaDebt] = useState(debtState.baseTotal / population);

  const baselineRef = useRef({
    baseTotal: debtState.baseTotal,
    perSecondRate: debtState.perSecondRate,
    population,
    anchorTime: getNow(),
  });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    baselineRef.current = {
      baseTotal: debtState.baseTotal,
      perSecondRate: debtState.perSecondRate,
      population,
      anchorTime: getNow(),
    };
    setDisplayedDebt(debtState.baseTotal);
    setPerCapitaDebt(debtState.baseTotal / population);

    const tick = () => {
      const { baseTotal, perSecondRate, population, anchorTime } =
        baselineRef.current;

      const elapsedSeconds = (getNow() - anchorTime) / 1000;
      const currentTotal = baseTotal + perSecondRate * elapsedSeconds;
      const denominator = population > 0 ? population : DEFAULT_POPULATION;

      setDisplayedDebt(currentTotal);
      setPerCapitaDebt(currentTotal / denominator);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      const { baseTotal, perSecondRate, population, anchorTime } =
        baselineRef.current;
      const now = getNow();
      const elapsedSeconds = (now - anchorTime) / 1000;
      const currentTotal = baseTotal + perSecondRate * elapsedSeconds;

      baselineRef.current = {
        baseTotal: currentTotal,
        perSecondRate,
        population,
        anchorTime: now,
      };
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [debtState.baseTotal, debtState.perSecondRate, population]);

  const formattedTotalDebt = useMemo(
    () => formatNumber.format(Math.round(displayedDebt)),
    [displayedDebt],
  );
  const formattedPerCapita = useMemo(
    () => `${formatPerCapitaNumber.format(perCapitaDebt)}원`,
    [perCapitaDebt],
  );
  const formattedDailyChange = useMemo(
    () => `${formatNumber.format(Math.round(debtState.perSecondRate * SECONDS_PER_DAY))}원`,
    [debtState.perSecondRate],
  );
  const formattedGdpRatio = useMemo(() => {
    if (STATIC_GDP_TOTAL <= 0) {
      return '데이터 준비중';
    }

    const ratio = (debtState.baseTotal / STATIC_GDP_TOTAL) * 100;
    return `${ratio.toFixed(1)}%`;
  }, [debtState.baseTotal]);
  const formattedInterestPerSecond = useMemo(() => {
    const yearlyInterest = debtState.baseTotal * STATIC_ANNUAL_INTEREST_RATE;
    const perSecondInterest = yearlyInterest / (365 * 24 * 60 * 60);

    return `${formatNumber.format(Math.round(perSecondInterest))}원`;
  }, [debtState.baseTotal]);

  const footerSource = debtState.sourceName.trim() || '데이터 출처 준비중';
  const footerUpdatedAt = useMemo(() => {
    if (!debtState.lastUpdatedAt) {
      return '업데이트 대기중';
    }

    try {
      return formatDateTime.format(new Date(debtState.lastUpdatedAt));
    } catch {
      return debtState.lastUpdatedAt;
    }
  }, [debtState.lastUpdatedAt]);

  const formattedPerSecondIncrease = useMemo(
    () => `+${formatNumber.format(Math.round(debtState.perSecondRate))}원/초`,
    [debtState.perSecondRate],
  );
  const formattedPerCapitaDailyIncrease = useMemo(() => {
    const perCapitaDaily = (debtState.perSecondRate * SECONDS_PER_DAY) / population;
    return `+${formatPerCapitaNumber.format(perCapitaDaily)}원/일`;
  }, [debtState.perSecondRate, population]);
  const formattedPopulation = useMemo(
    () => `${formatNumber.format(population)}명`,
    [population],
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-4 pb-12 pt-8 md:px-8">
        <HeroSection
          totalDebt={formattedTotalDebt}
          perCapitaDebt={formattedPerCapita}
          perSecondIncrease={formattedPerSecondIncrease}
          perCapitaDailyIncrease={formattedPerCapitaDailyIncrease}
          populationLabel={formattedPopulation}
        />
        <ActionSection />
        <InfoGrid
          dailyChange={formattedDailyChange}
          gdpRatio={formattedGdpRatio}
          interestPerSecond={formattedInterestPerSecond}
        />
      </main>
      <Footer sourceName={footerSource} lastUpdatedLabel={footerUpdatedAt} />
    </div>
  );
}

function Header() {
  return (
    <header className="flex w-full items-center justify-between px-4 py-6 md:px-8">
      <div className="text-lg font-semibold tracking-tight text-foreground">
        국가부채시계
      </div>
      <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
        <Link href="/methodology">방법론</Link>
      </Button>
    </header>
  );
}

type HeroSectionProps = {
  totalDebt: string;
  perCapitaDebt: string;
  perSecondIncrease: string;
  perCapitaDailyIncrease: string;
  populationLabel: string;
};

function HeroSection({
  totalDebt,
  perCapitaDebt,
  perSecondIncrease,
  perCapitaDailyIncrease,
  populationLabel,
}: HeroSectionProps) {
  return (
    <section className="flex w-full max-w-5xl flex-col items-center gap-6 text-center md:gap-8">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-foreground md:text-4xl">
          지금 이 순간에도 증가하는 대한민국 국가부채
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          실시간으로 늘어나는 부채 규모를 확인하고, 우리의 미래를 함께 지켜주세요.
        </p>
      </div>

      <div className="grid w-full gap-4 md:grid-cols-3">
        <TotalDebtCard
          totalDebt={totalDebt}
          perSecondIncrease={perSecondIncrease}
        />
        <PerCapitaDebtCard
          perCapitaDebt={perCapitaDebt}
          perCapitaDailyIncrease={perCapitaDailyIncrease}
          populationLabel={populationLabel}
        />
      </div>
    </section>
  );
}

type TotalDebtCardProps = {
  totalDebt: string;
  perSecondIncrease: string;
};

function TotalDebtCard({ totalDebt, perSecondIncrease }: TotalDebtCardProps) {
  return (
    <Card className="md:col-span-2 flex h-full flex-col justify-between overflow-hidden border-none bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-primary-foreground shadow-xl">
      <CardHeader className="space-y-4 text-left">
        <span className="inline-flex w-fit items-center rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">
          총 국가부채
        </span>
        <CardTitle
          aria-live="polite"
          aria-label="총 국가부채"
          className="text-4xl font-bold tabular-nums md:text-6xl"
        >
          {totalDebt}
        </CardTitle>
        <CardDescription className="text-primary-foreground/80">
          현재 추정된 중앙정부 및 지방정부 부채 총액
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6 text-left">
        <div className="rounded-xl bg-primary-foreground/10 px-4 py-3 text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
            초당 증가 속도
          </p>
          <p className="text-2xl font-semibold tabular-nums md:text-3xl">
            {perSecondIncrease}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type PerCapitaDebtCardProps = {
  perCapitaDebt: string;
  perCapitaDailyIncrease: string;
  populationLabel: string;
};

function PerCapitaDebtCard({
  perCapitaDebt,
  perCapitaDailyIncrease,
  populationLabel,
}: PerCapitaDebtCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between border border-primary/20 bg-card text-left shadow-lg">
      <CardHeader className="space-y-3">
        <CardDescription className="text-primary">
          1인당 국가부채
        </CardDescription>
        <CardTitle
          aria-live="polite"
          aria-label="1인당 국가부채"
          className="text-3xl font-bold tabular-nums md:text-4xl"
        >
          {perCapitaDebt}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          대한민국 국민 1인이 부담해야 할 평균 부채 금액
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-6 text-sm text-muted-foreground">
        <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-foreground">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            1인당 일일 증가량
          </p>
          <p className="text-lg font-semibold text-primary tabular-nums md:text-xl">
            {perCapitaDailyIncrease}
          </p>
        </div>
        <p>계산 기준 인구: {populationLabel}</p>
      </CardContent>
    </Card>
  );
}

function ActionSection() {
  return (
    <section className="flex w-full max-w-5xl flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold md:text-2xl">함께 위기 의식을 나눠주세요</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          한 번의 공유로 더 많은 친구들과 현실을 알리고 변화를 촉구할 수 있습니다.
        </p>
      </div>
      <Button
        size="lg"
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Share2 className="h-5 w-5" />
        공유하기
      </Button>
    </section>
  );
}

type InfoGridProps = {
  dailyChange: string;
  gdpRatio: string;
  interestPerSecond: string;
};

function InfoGrid({ dailyChange, gdpRatio, interestPerSecond }: InfoGridProps) {
  return (
    <section className="w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          icon={<ArrowUp className="h-5 w-5 text-primary" aria-hidden />}
          title="전일 대비 증가"
          value={dailyChange}
          description="어제보다 증가한 국가부채 규모"
        />
        <InfoCard
          icon={<PieChart className="h-5 w-5 text-accent" aria-hidden />}
          title="GDP 대비 비율"
          value={gdpRatio}
          description="국내총생산 대비 국가부채 비율"
        />
        <InfoCard
          icon={<Clock3 className="h-5 w-5 text-secondary-foreground" aria-hidden />}
          title="초당 이자 비용"
          value={interestPerSecond}
          description="매초 늘어나는 국가부채 이자 비용"
        />
      </div>
    </section>
  );
}

type InfoCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
};

function InfoCard({ icon, title, value, description }: InfoCardProps) {
  return (
    <Card className="border border-border bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-full bg-secondary/40 p-2">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

type FooterProps = {
  sourceName: string;
  lastUpdatedLabel: string;
};

function Footer({ sourceName, lastUpdatedLabel }: FooterProps) {
  return (
    <footer className="flex flex-col gap-1 px-4 py-6 text-center text-xs text-muted-foreground md:px-8 md:text-sm">
      <span>{sourceName}</span>
      <span>최종 업데이트: {lastUpdatedLabel}</span>
      <a className="underline" href="#">개인정보처리방침</a>
    </footer>
  );
}
