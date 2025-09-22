const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';

declare global {
  interface Window {
    Kakao?: KakaoNamespace;
  }
}

type KakaoShareLink = {
  mobileWebUrl: string;
  webUrl: string;
};

type KakaoShareTextTemplate = {
  objectType: 'text';
  text: string;
  link: KakaoShareLink;
  buttonTitle?: string;
};

type KakaoShareAPI = {
  sendDefault(options: KakaoShareTextTemplate): void;
};

type KakaoNamespace = {
  init(apiKey: string): void;
  isInitialized(): boolean;
  Share: KakaoShareAPI;
};

let scriptPromise: Promise<void> | null = null;

export class KakaoUnavailableError extends Error {
  constructor(message = 'Kakao SDK is not available') {
    super(message);
    this.name = 'KakaoUnavailableError';
  }
}

async function loadKakaoScript() {
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new KakaoUnavailableError());
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${KAKAO_SDK_URL}"]`,
    );

    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new KakaoUnavailableError('Failed to load Kakao SDK')),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.defer = true;
    script.dataset.loaded = 'false';

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });

    script.addEventListener('error', () => {
      reject(new KakaoUnavailableError('Failed to load Kakao SDK'));
    });

    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function ensureKakao(): Promise<KakaoNamespace | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  if (!apiKey) {
    console.warn('NEXT_PUBLIC_KAKAO_JS_KEY is not configured');
    return null;
  }

  if (window.Kakao && window.Kakao.isInitialized()) {
    return window.Kakao;
  }

  try {
    await loadKakaoScript();
  } catch (error) {
    if (error instanceof Error || typeof error === 'string') {
      console.warn('Failed to load Kakao SDK:', error);
    }
    return null;
  }

  if (!window.Kakao) {
    return null;
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(apiKey);
  }

  return window.Kakao;
}

type ShareToKakaoParams = {
  text: string;
  url: string;
  buttonTitle?: string;
};

export async function shareViaKakao({
  text,
  url,
  buttonTitle = '자세히 보기',
}: ShareToKakaoParams) {
  const kakao = await ensureKakao();

  if (!kakao) {
    throw new KakaoUnavailableError();
  }

  try {
    kakao.Share.sendDefault({
      objectType: 'text',
      text,
      buttonTitle,
      link: {
        mobileWebUrl: url,
        webUrl: url,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown Kakao share error';
    throw new Error(message);
  }
}
