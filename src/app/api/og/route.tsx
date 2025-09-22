import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* 배경 패턴 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 35px,
                  rgba(255,255,255,.01) 35px,
                  rgba(255,255,255,.01) 70px
                )
              `,
            }}
          />
          
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              zIndex: 10,
            }}
          >
            {/* 충격 문구 */}
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                color: '#ef4444',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              💸 실시간 증가중 💸
            </div>
            
            {/* 메인 금액 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{ fontSize: '36px', opacity: 0.9 }}>대한민국 총 부채</div>
              <div
                style={{
                  fontSize: '120px',
                  fontWeight: 'bold',
                  letterSpacing: '-4px',
                  background: 'linear-gradient(to bottom, #ffffff, #fbbf24)',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 0 40px rgba(251, 191, 36, 0.5)',
                }}
              >
                6,222조원
              </div>
            </div>
            
            {/* 충격적인 통계 */}
            <div
              style={{
                display: 'flex',
                gap: '80px',
                fontSize: '36px',
                marginTop: '20px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '48px' }}>1.2억원</div>
                <div style={{ opacity: 0.8, fontSize: '28px' }}>1인당 부채</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '48px' }}>790만원</div>
                <div style={{ opacity: 0.8, fontSize: '28px' }}>초당 증가</div>
              </div>
            </div>
            
            {/* 부채 구성 */}
            <div
              style={{
                display: 'flex',
                gap: '40px',
                fontSize: '28px',
                marginTop: '20px',
                padding: '20px 40px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: '#60a5fa' }}>●</div>
                <div>정부 1,141조</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: '#a78bfa' }}>●</div>
                <div>기업 2,798조</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: '#f472b6' }}>●</div>
                <div>가계 2,283조</div>
              </div>
            </div>
            
            {/* 경고 메시지 */}
            <div
              style={{
                fontSize: '32px',
                color: '#fbbf24',
                fontWeight: 'bold',
                marginTop: '20px',
                textAlign: 'center',
              }}
            >
              🚨 4인 가구당 5억원의 빚 🚨
            </div>
          </div>
          
          {/* URL */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              fontSize: '24px',
              opacity: 0.7,
              letterSpacing: '1px',
            }}
          >
            dept-clock.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
