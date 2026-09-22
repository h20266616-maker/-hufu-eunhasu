export function formatWon(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatRelative(timestamp: number, now: number = Date.now()): string {
  const diffMinutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatShortDate(new Date(timestamp).toISOString());
}

export function formatElapsed(totalSeconds: number): string {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** 마지막 4자리 숫자만 남기고 나머지 숫자를 가린다 */
export function maskAccount(account: string): string {
  const totalDigits = account.replace(/\D/g, '').length;
  let seen = 0;
  return account.replace(/\d/g, (digit) => {
    seen += 1;
    return seen > totalDigits - 4 ? digit : '*';
  });
}

export function parseAmount(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  return digits === '' ? 0 : Number.parseInt(digits, 10);
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

/** 숫자만 남기고 010-XXXX-XXXX 형태로 입력 중인 값을 즉시 포맷한다 */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}
