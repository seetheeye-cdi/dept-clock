// 통화/숫자 포맷 유틸 - 한국식 억/조 지원

export function formatKRWCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_0000_0000_0000) {
    // 조 단위 (1조 = 10^12)
    return `${sign}${(abs / 1_0000_0000_0000).toFixed(3).replace(/\.0+$/, '')}조`;
  }
  if (abs >= 1_0000_0000) {
    // 억 단위 (1억 = 10^8)
    return `${sign}${(abs / 1_0000_0000).toFixed(2).replace(/\.0+$/, '')}억`;
  }
  return `${sign}${abs.toLocaleString('ko-KR')}`;
}

export function formatCurrencyKR(amount: number): string {
  return `${formatKRWCompact(amount)}원`;
}


