"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrencyKR } from "@/lib/number";
import { cn } from "@/lib/utils";

type AccountCardProps = {
  value: number;
  subtitle?: string;
  className?: string;
};

export function AccountCard({ value, subtitle = "내가 2050년에 갚을 돈", className }: AccountCardProps) {
  return (
    <div className="sticky top-0 z-50 w-full max-w-mobile mx-auto">
      <Card
        className={cn(
          "bg-vaultGradient text-text-primary rounded-lg shadow-card border-none",
          className,
        )}
        aria-label="마이너스 통장 메인 카드"
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="text-xs font-medium opacity-80" aria-live="polite">
              {subtitle}
            </div>
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight tabular-nums text-text-primary">
              -{formatCurrencyKR(value)}
            </div>
            <AccountGauge value={value} />
            <Tabs defaultValue="summary" className="mt-2">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="summary">요약</TabsTrigger>
                <TabsTrigger value="details">상세</TabsTrigger>
              </TabsList>
              <TabsContent value="summary" className="text-xs text-text-secondary">
                오늘도 초당 790만원씩 늘어나고 있습니다.
              </TabsContent>
              <TabsContent value="details" className="text-xs text-text-secondary">
                정부·기업·가계 부채 총합 기준입니다.
              </TabsContent>
            </Tabs>
            <QuickActions />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountGauge({ value }: { value: number }) {
  // 단순 게이지: 값에 따라 가짜 한도 대비 비율
  const limit = 7_000_000_000_000_000; // 7,000조 (예시)
  const ratio = Math.min(100, Math.max(0, (value / limit) * 100));
  return (
    <div className="w-full" role="progressbar" aria-valuenow={Math.round(ratio)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-2 rounded-full bg-white/30">
        <div className="h-2 rounded-full bg-foreground/80" style={{ width: `${ratio}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-text-secondary">
        <span>0</span>
        <span>한도</span>
      </div>
    </div>
  );
}

function QuickActions() {
  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      <button className="h-9 rounded-md bg-secondary text-secondary-foreground text-xs">세이프박스</button>
      <button className="h-9 rounded-md bg-secondary text-secondary-foreground text-xs">이체</button>
      <button className="h-9 rounded-md bg-secondary text-secondary-foreground text-xs">공유</button>
    </div>
  );
}


