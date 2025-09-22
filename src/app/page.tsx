'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { differenceInMinutes } from 'date-fns';
import { ArrowUp, Clock3, Loader2, PieChart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { DebtState } from '@/features/debt/types';
import { useDebtState } from '@/features/debt/hooks/use-debt-state';
import { useDebtStream } from '@/features/debt/hooks/use-debt-stream';
import { KakaoUnavailableError, shareViaKakao } from '@/lib/kakao';
import { cn } from '@/lib/utils';

const STATIC_DEBT_STATE: DebtState = {
  baseTotal: 6_222_000_000_000_000, // 6,222조원
  perSecondRate: 7_900_000, // 초당 790만원
  lastUpdatedAt: '2024-12-31T15:00:00+09:00',
  sourceName: '한국은행·금융감독원 (2024년 4분기)',
  population: 51_744_876,
};

const STATIC_GDP_TOTAL = 2_550_325_000_000_000;
const STATIC_ANNUAL_INTEREST_RATE = 0.028;
const SECONDS_PER_DAY = 86_400;
const DEFAULT_POPULATION = 50_000_000;
const SHARE_URL_BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dept-clock.vercel.app'
).replace(/\/$/, '');
const ONE_HOUR_IN_MINUTES = 60;
const KST_OFFSET_MINUTES = 9 * 60;

function toKst(date: Date) {
  const utcTimestamp = date.getTime() + date.getTimezoneOffset() * 60_000;
  return new Date(utcTimestamp + KST_OFFSET_MINUTES * 60_000);
}

function formatKst(date: Date | null) {
  if (!date || Number.isNaN(date.getTime())) {
    return '업데이트 대기중';
  }

  const kstDate = toKst(date);
  const year = kstDate.getFullYear();
  const month = String(kstDate.getMonth() + 1).padStart(2, '0');
  const day = String(kstDate.getDate()).padStart(2, '0');
  const hours = String(kstDate.getHours()).padStart(2, '0');
  const minutes = String(kstDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

type StatusVariant = 'info' | 'warning' | 'error';

type StatusDescriptor = {
  variant: StatusVariant;
  message: string;
  allowRetry?: boolean;
};

const formatNumber = new Intl.NumberFormat('ko-KR');
const formatPerCapitaNumber = new Intl.NumberFormat('ko-KR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getNow = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

export default function Home() {
  const { data, isPending, isError, refetch } = useDebtState();
  useDebtStream(!isError);

  const hasLiveData = Boolean(data);
  const debtState = data ?? STATIC_DEBT_STATE;
  const population =
    debtState.population > 0 ? debtState.population : DEFAULT_POPULATION;
  const [displayedDebt, setDisplayedDebt] = useState(() => debtState.baseTotal);
  const [perCapitaDebt, setPerCapitaDebt] = useState(
    () => debtState.baseTotal / population,
  );
  const [isSharing, setIsSharing] = useState(false);

  // localStorage에서 최초 방문 시점 읽기 (절대 시간 사용)
  const getInitialAnchorTime = () => {
    if (typeof window === 'undefined') return Date.now();
    
    const storedTime = window.localStorage.getItem('debt-clock-start-date');
    if (storedTime) {
      // 저장된 시작 시점부터 현재까지의 경과 시간 계산
      const startDate = parseFloat(storedTime);
      const elapsedMs = Date.now() - startDate;
      // performance.now()를 사용하는 경우를 위해 현재 시점에서 경과 시간을 뺀 값 반환
      return getNow() - elapsedMs;
    }
    
    // 최초 방문 시 현재 날짜 저장
    window.localStorage.setItem('debt-clock-start-date', Date.now().toString());
    return getNow();
  };

  const baselineRef = useRef({
    baseTotal: debtState.baseTotal,
    perSecondRate: debtState.perSecondRate,
    population,
    anchorTime: getInitialAnchorTime(),
  });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // anchorTime은 유지하고 나머지만 업데이트
    const currentAnchorTime = baselineRef.current.anchorTime;
    baselineRef.current = {
      baseTotal: debtState.baseTotal,
      perSecondRate: debtState.perSecondRate,
      population,
      anchorTime: currentAnchorTime,
    };
    
    // 현재까지 경과한 시간을 반영한 값으로 초기화
    const elapsedSeconds = (getNow() - currentAnchorTime) / 1000;
    const currentTotal = debtState.baseTotal + debtState.perSecondRate * elapsedSeconds;
    setDisplayedDebt(currentTotal);
    setPerCapitaDebt(currentTotal / population);

    const tick = () => {
      const {
        baseTotal,
        perSecondRate,
        population: statePopulation,
        anchorTime,
      } = baselineRef.current;

      const elapsedSeconds = (getNow() - anchorTime) / 1000;
      const currentTotal = baseTotal + perSecondRate * elapsedSeconds;
      const denominator =
        statePopulation > 0 ? statePopulation : DEFAULT_POPULATION;

      setDisplayedDebt(currentTotal);
      setPerCapitaDebt(currentTotal / denominator);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      // 탭 전환 시에도 anchorTime을 유지하여 계속 누적되도록 함
      // 아무 작업도 하지 않음
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [debtState.baseTotal, debtState.perSecondRate, population]);

  const statusInfo = useMemo<StatusDescriptor | null>(() => {
    if (isError) {
      return {
        variant: 'error',
        message: '실시간 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        allowRetry: true,
      };
    }

    if (isPending) {
      return {
        variant: 'info',
        message: '실시간 데이터를 불러오는 중입니다...',
      };
    }

    if (!hasLiveData) {
      return {
        variant: 'warning',
        message: '실시간 데이터가 준비되지 않아 예시 데이터를 보여드리고 있습니다.',
        allowRetry: true,
      };
    }

    return null;
  }, [hasLiveData, isError, isPending]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

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

  const sourceName = debtState.sourceName.trim() || '데이터 출처 준비중';
  const lastUpdatedDate = useMemo(() => {
    if (!debtState.lastUpdatedAt) {
      return null;
    }

    const parsed = new Date(debtState.lastUpdatedAt);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [debtState.lastUpdatedAt]);
  const lastUpdatedLabel = useMemo(
    () => formatKst(lastUpdatedDate),
    [lastUpdatedDate],
  );
  const hasTimestamp = Boolean(lastUpdatedDate);
  const isDelayed = useMemo(() => {
    if (!lastUpdatedDate) {
      return false;
    }

    const diffInMinutes = differenceInMinutes(new Date(), lastUpdatedDate);
    return diffInMinutes >= ONE_HOUR_IN_MINUTES;
  }, [lastUpdatedDate]);

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

  const handleNativeShare = useCallback(
    async (shareUrl: string, shareTitle: string, shareText: string) => {
      if (typeof window === 'undefined') {
        return;
      }

      if (
        typeof navigator.share === 'function' &&
        (!navigator.canShare ||
          navigator.canShare({ url: shareUrl, title: shareTitle, text: shareText }))
      ) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
          toast({
            title: '공유 완료',
            description: '친구와 가족에게 현실을 알렸어요.',
          });
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          toast({
            variant: 'destructive',
            title: '공유에 실패했습니다',
            description: '네트워크 상태를 확인하고 다시 시도해주세요.',
          });
        }
        return;
      }

      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: '링크를 복사했어요',
            description: '원하는 곳에 붙여넣어 공유해주세요.',
          });
        } catch {
          toast({
            variant: 'destructive',
            title: '링크 복사에 실패했습니다',
            description: '브라우저 권한을 확인하고 다시 시도해주세요.',
          });
        }
        return;
      }

      toast({
        variant: 'destructive',
        title: '공유 기능을 사용할 수 없어요',
        description: '주소창의 링크를 직접 복사해 공유해주세요.',
      });
    },
    [],
  );

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const shareUrl = `${SHARE_URL_BASE}/?utm_source=kakao&utm_medium=share&utm_campaign=debt_clock`;
    const shareTitle = '국가부채시계';
    const shareText = `지금 대한민국 국가부채는 ${formattedTotalDebt}원, 1인당 부담은 ${formattedPerCapita}입니다.`;

    try {
      setIsSharing(true);
      await shareViaKakao({
        text: `${shareText} 지금 바로 확인해 보세요!`,
        url: shareUrl,
        buttonTitle: '국가부채 확인하기',
      });
      toast({
        title: '카카오톡으로 공유했어요',
        description: '친구와 가족에게 현실을 알렸어요.',
      });
    } catch (error) {
      if (error instanceof KakaoUnavailableError) {
        try {
          await handleNativeShare(shareUrl, shareTitle, shareText);
        } catch (nativeError) {
          if (
            nativeError instanceof DOMException &&
            nativeError.name === 'AbortError'
          ) {
            return;
          }

          toast({
            variant: 'destructive',
            title: '공유에 실패했습니다',
            description: '네트워크 상태를 확인하고 다시 시도해주세요.',
          });
        }
        return;
      }

      toast({
        variant: 'destructive',
        title: '카카오톡 공유에 실패했습니다',
        description: '네트워크 상태를 확인하고 다시 시도해주세요.',
      });
    } finally {
      setIsSharing(false);
    }
  }, [formattedPerCapita, formattedTotalDebt, handleNativeShare]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-12 pt-8 md:gap-12 md:px-8">
        <SourceMeta
          className="w-full max-w-5xl justify-center text-center text-xs sm:justify-between sm:text-left md:text-sm"
          sourceName={sourceName}
          lastUpdatedLabel={lastUpdatedLabel}
          isDelayed={isDelayed}
          hasTimestamp={hasTimestamp}
        />
        {statusInfo ? (
          <StatusBanner
            variant={statusInfo.variant}
            message={statusInfo.message}
            onRetry={statusInfo.allowRetry ? handleRetry : undefined}
          />
        ) : null}
        <HeroSection
          totalDebt={formattedTotalDebt}
          perCapitaDebt={formattedPerCapita}
          perSecondIncrease={formattedPerSecondIncrease}
          perCapitaDailyIncrease={formattedPerCapitaDailyIncrease}
          populationLabel={formattedPopulation}
        />
        <ActionSection onShare={handleShare} isSharing={isSharing} />
        <InfoGrid
          dailyChange={formattedDailyChange}
          gdpRatio={formattedGdpRatio}
          interestPerSecond={formattedInterestPerSecond}
        />
      </main>
      <Footer
        sourceName={sourceName}
        lastUpdatedLabel={lastUpdatedLabel}
        isDelayed={isDelayed}
        hasTimestamp={hasTimestamp}
      />
    </div>
  );
}

function Header() {
  return (
    <header className="flex w-full items-center justify-between px-4 py-4 md:px-8 md:py-6">
      <div className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
        국가부채시계
      </div>
      <Button asChild variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground md:text-base">
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
        <h1 className="text-2xl font-semibold text-foreground leading-tight md:text-4xl">
          지금 이 순간에도 증가하는<br className="md:hidden"/><span className="hidden md:inline"> </span>대한민국 국가부채
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
          className="text-3xl font-bold tabular-nums md:text-5xl lg:text-6xl"
        >
          {totalDebt}
        </CardTitle>
        <CardDescription className="text-sm text-primary-foreground/80 md:text-base">
          정부·기업·가계 부채 총합
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6 text-left">
        <div className="rounded-xl bg-primary-foreground/10 px-4 py-3 text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
            초당 증가 속도
          </p>
          <p className="text-2xl font-semibold tabular-nums md:text-3xl">
            {perSecondIncrease}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
          <div className="rounded-lg bg-primary-foreground/5 px-3 py-2">
            <p className="text-primary-foreground/70">정부부채</p>
            <p className="font-semibold">1,141조원</p>
          </div>
          <div className="rounded-lg bg-primary-foreground/5 px-3 py-2">
            <p className="text-primary-foreground/70">기업부채</p>
            <p className="font-semibold">2,798조원</p>
          </div>
          <div className="rounded-lg bg-primary-foreground/5 px-3 py-2">
            <p className="text-primary-foreground/70">가계부채</p>
            <p className="font-semibold">2,283조원</p>
          </div>
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
        <CardDescription className="text-sm text-primary md:text-base">
          1인당 국가부채
        </CardDescription>
        <CardTitle
          aria-live="polite"
          aria-label="1인당 국가부채"
          className="text-2xl font-bold tabular-nums md:text-3xl lg:text-4xl"
        >
          {perCapitaDebt}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground md:text-base">
          대한민국 국민 1인이 부담해야 할 평균 부채 금액
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-6 text-sm text-muted-foreground">
        <div className="space-y-2">
          <div className="rounded-lg border border-destructive/15 bg-destructive/5 px-4 py-3 text-foreground">
            <p className="text-xs font-medium uppercase tracking-wide text-destructive">
              4인 가구 기준
            </p>
            <p className="text-lg font-semibold text-destructive tabular-nums md:text-xl">
              약 5억원
            </p>
          </div>
          <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-foreground">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              1인당 일일 증가량
            </p>
            <p className="text-lg font-semibold text-primary tabular-nums md:text-xl">
              {perCapitaDailyIncrease}
            </p>
          </div>
        </div>
        <p className="text-xs">계산 기준 인구: {populationLabel}</p>
      </CardContent>
    </Card>
  );
}

type SourceMetaProps = {
  sourceName: string;
  lastUpdatedLabel: string;
  isDelayed: boolean;
  hasTimestamp: boolean;
  className?: string;
};

function SourceMeta({
  sourceName,
  lastUpdatedLabel,
  isDelayed,
  hasTimestamp,
  className,
}: SourceMetaProps) {
  const badgeVariant = isDelayed ? 'destructive' : 'muted';
  const badgeLabel = isDelayed ? '추정' : '실시간';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <span className="flex items-center gap-1">
        출처:
        <span className="font-medium text-foreground">{sourceName}</span>
      </span>
      <span className="hidden sm:inline">·</span>
      <span>마지막 갱신: {lastUpdatedLabel}</span>
      {hasTimestamp ? <Badge variant={badgeVariant}>{badgeLabel}</Badge> : null}
    </div>
  );
}

type StatusBannerProps = {
  variant: StatusVariant;
  message: string;
  onRetry?: () => void;
};

const STATUS_STYLE_MAP: Record<StatusVariant, string> = {
  info: 'border border-primary/20 bg-primary/10 text-primary',
  warning: 'border border-amber-200 bg-amber-50 text-amber-900',
  error: 'border border-destructive/40 bg-destructive/10 text-destructive',
};

function StatusBanner({ variant, message, onRetry }: StatusBannerProps) {
  const ariaLive = variant === 'error' ? 'assertive' : 'polite';
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${STATUS_STYLE_MAP[variant]}`}
    >
      <span className="flex-1 text-left">{message}</span>
      {onRetry ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="whitespace-nowrap"
        >
          다시 시도
        </Button>
      ) : null}
    </div>
  );
}

type ActionSectionProps = {
  onShare: () => void;
  isSharing: boolean;
};

function ActionSection({ onShare, isSharing }: ActionSectionProps) {
  return (
    <section className="flex w-full max-w-5xl flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold md:text-2xl">함께 위기 의식을 나눠주세요</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          한 번의 공유로 더 많은 친구들과 현실을 알리고 변화를 촉구할 수 있습니다.
        </p>
      </div>
      <Button
        type="button"
        size="lg"
        className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={onShare}
        disabled={isSharing}
        aria-busy={isSharing}
      >
        {isSharing ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Share2 className="h-5 w-5" aria-hidden />
        )}
        {isSharing ? '공유 준비중...' : '공유하기'}
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
        <CardTitle className="text-sm font-medium text-muted-foreground md:text-base">
          {title}
        </CardTitle>
        <div className="rounded-full bg-secondary/40 p-2">{icon}</div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xl font-semibold tabular-nums text-foreground md:text-2xl">{value}</p>
        <p className="text-xs text-muted-foreground md:text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

type FooterProps = {
  sourceName: string;
  lastUpdatedLabel: string;
  isDelayed: boolean;
  hasTimestamp: boolean;
};

function Footer({ sourceName, lastUpdatedLabel, isDelayed, hasTimestamp }: FooterProps) {
  return (
    <footer className="flex flex-col gap-1 px-4 py-6 text-center text-xs text-muted-foreground md:px-8 md:text-sm">
      <SourceMeta
        className="justify-center"
        sourceName={sourceName}
        lastUpdatedLabel={lastUpdatedLabel}
        isDelayed={isDelayed}
        hasTimestamp={hasTimestamp}
      />
      <a className="underline" href="#">개인정보처리방침</a>
    </footer>
  );
}
