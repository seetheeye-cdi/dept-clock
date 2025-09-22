import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dept-clock.vercel.app').replace(/\/$/, '');
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA || '20250122';
const OG_IMAGE_URL = `https://og-image.vercel.app/${encodeURIComponent('💸 **6,222조원** 💸')}.png?theme=dark&md=1&fontSize=125px&images=${encodeURIComponent('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><text x="12" y="12" text-anchor="middle" font-size="16">💰</text></svg>')}&widths=350&heights=350`;
const OG_TITLE = '💸 6,222조원 💸 대한민국 부채 실시간';
const OG_DESCRIPTION =
  '🚨 충격! 1인당 1.2억원, 4인 가구 5억원의 빚! 초당 790만원씩 늘어나는 대한민국 총 부채 6,222조원의 실시간 카운터. 정부+기업+가계 부채의 충격적 현실을 확인하세요.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: OG_TITLE,
    template: '%s ｜ 국가부채 시계',
  },
  description: OG_DESCRIPTION,
  keywords: [
    '국가부채',
    '국가부채시계',
    '대한민국부채',
    '정부부채',
    '기업부채',
    '가계부채',
    '실시간부채',
    '부채카운터',
    '6222조원',
    '1인당부채',
    '경제지표',
  ],
  authors: [{ name: '국가부채 시계' }],
  creator: '국가부채 시계',
  publisher: '국가부채 시계',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: '/',
    siteName: '국가부채 시계',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: '대한민국 국가부채 6,222조원 실시간 카운터',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [OG_IMAGE_URL],
    creator: '@dept_clock',
  },
  other: {
    'kakaotalk:title': OG_TITLE,
    'kakaotalk:description': OG_DESCRIPTION,
    'kakaotalk:image': OG_IMAGE_URL,
    'telegram:title': OG_TITLE,
    'telegram:description': OG_DESCRIPTION,
    'telegram:image': OG_IMAGE_URL,
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
