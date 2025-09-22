import crypto from 'crypto';

const E164_RE = /^\+[1-9]\d{6,14}$/; // E.164 basic validation

export function toE164(raw: string): string {
  const digits = (raw ?? '').replace(/[^\d+]/g, '');
  // 한국 번호 정규화: +82로 치환, 선행 0 제거
  if (digits.startsWith('+')) return digits;
  // 010-XXXX-XXXX 형태
  const onlyDigits = digits.replace(/\D/g, '');
  if (onlyDigits.startsWith('0')) {
    return `+82${onlyDigits.slice(1)}`;
  }
  // 그 외는 한국 기본국가코드 가정
  return `+82${onlyDigits}`;
}

export function assertE164(e164: string): void {
  if (!E164_RE.test(e164)) {
    throw new Error('Invalid phone format (E.164 required)');
  }
}

export function phoneHash(e164: string): string {
  const salt = process.env.KAKAO_PHONE_SALT;
  if (!salt) throw new Error('Missing environment variable: KAKAO_PHONE_SALT');
  return crypto.createHmac('sha256', salt).update(e164).digest('hex');
}


