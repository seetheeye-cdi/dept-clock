"use client";

import Image from "next/image";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyKR } from "@/lib/number";
import { extractDomain } from "@/lib/url";
import { cn } from "@/lib/utils";

export type Receipt = {
  id: string;
  title: string;
  totalIncrease: number;
  myShare: number;
  sourceName: string;
  sourceUrl?: string;
  imageUrl?: string;
  publishedAt: string; // ISO
};

type Props = {
  item: Receipt;
  className?: string;
};

export function ReceiptCard({ item, className }: Props) {
  const domain = extractDomain(item.sourceUrl);
  const date = new Date(item.publishedAt);
  const dateLabel = isNaN(date.getTime()) ? '' : date.toLocaleDateString('ko-KR');

  return (
    <Card
      role="article"
      aria-label={item.title}
      className={cn(
        "border border-border bg-surface-base bg-receiptTexture text-foreground shadow-card",
        "focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
      tabIndex={-1}
    >
      <div className="flex gap-3 p-3">
        <ReceiptImage src={item.imageUrl} alt={item.title} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm leading-snug line-clamp-2" title={item.title}>
            {item.title}
          </h3>
          <div className="mt-1 font-mono text-base">
            +{formatCurrencyKR(item.totalIncrease)}
          </div>
          <div className="font-mono text-xs text-text-secondary">
            내 몫 {formatCurrencyKR(item.myShare)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-text-secondary">
            <Badge variant="outline" className="px-2 py-0.5">
              {item.sourceName || domain || '출처 미상'}
            </Badge>
            {dateLabel && <span aria-label="게시일">{dateLabel}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReceiptImage({ src, alt }: { src?: string; alt: string }) {
  const fallback = "https://picsum.photos/seed/debt/160/120"; // placeholder
  return (
    <div className="relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-md bg-muted">
      <Image
        src={src || fallback}
        alt={alt}
        fill
        sizes="96px"
        className="object-cover"
        priority={false}
      />
    </div>
  );
}


