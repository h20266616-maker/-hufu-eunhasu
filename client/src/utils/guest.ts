/** uid로부터 "체험 손님 123" 같은 닉네임을 만든다. 같은 uid면 항상 같은 닉네임이 나온다 */
export function guestNicknameFor(uid: string): string {
  let hash = 0;
  for (let i = 0; i < uid.length; i += 1) hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  const digits = 100 + (hash % 900);
  return `체험 손님 ${digits}`;
}
