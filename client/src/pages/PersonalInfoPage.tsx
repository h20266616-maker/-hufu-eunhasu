import { Pencil } from 'lucide-react';
import { useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { SegmentControl } from '../components/ui/SegmentControl';
import { Toggle } from '../components/ui/Toggle';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { CONSENT_NOTICE } from '../data';
import type { Profile, Role } from '../types';
import { maskAccount } from '../utils/format';

type Draft = Pick<Profile, 'nickname' | 'name' | 'phone' | 'email' | 'bankName' | 'account'>;
type DraftErrors = Partial<Record<keyof Draft, string>>;

const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS: readonly { value: Role; label: string }[] = [
  { value: 'traveler', label: '여행자' },
  { value: 'owner', label: '상점 사장님' },
];

function toDraft(profile: Profile): Draft {
  const { nickname, name, phone, email, bankName, account } = profile;
  return { nickname, name, phone, email, bankName, account };
}

function validate(draft: Draft): DraftErrors {
  const errors: DraftErrors = {};
  const nicknameLength = draft.nickname.trim().length;
  if (nicknameLength < 2 || nicknameLength > 12) errors.nickname = '닉네임은 2~12자로 입력해 주세요.';
  if (draft.name.trim().length < 2) errors.name = '이름을 2자 이상 입력해 주세요.';
  if (!PHONE_PATTERN.test(draft.phone.trim())) errors.phone = '연락처 형식을 확인해 주세요. 예) 010-0000-0000';
  if (!EMAIL_PATTERN.test(draft.email.trim())) errors.email = '이메일 형식을 확인해 주세요.';
  if (draft.bankName.trim() === '') errors.bankName = '은행명을 입력해 주세요.';
  if (draft.account.replace(/\D/g, '').length < 8) errors.account = '계좌번호를 8자리 이상 입력해 주세요.';
  return errors;
}

export function PersonalInfoPage() {
  const { profile, updateProfile } = useApp();
  const showToast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile));
  const [errors, setErrors] = useState<DraftErrors>({});

  const setField = (key: keyof Draft) => (value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  const startEdit = () => {
    setDraft(toDraft(profile));
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setErrors({});
    setEditing(false);
  };

  const handleSave = (event: SubmitEvent) => {
    event.preventDefault();
    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    updateProfile({
      nickname: draft.nickname.trim(),
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      bankName: draft.bankName.trim(),
      account: draft.account.trim(),
    });
    setEditing(false);
    showToast('개인정보를 저장했어요');
  };

  const handleRoleChange = (role: Role) => {
    updateProfile({ role });
    showToast(role === 'owner' ? '사장님 회원으로 전환했어요' : '여행자 회원으로 전환했어요');
  };

  const handleConsentChange = (consent: boolean) => {
    updateProfile({ consent });
    showToast(consent ? '개인정보 수집·이용에 동의했어요' : '동의를 철회했어요');
  };

  return (
    <div className="page">
      <ScreenHeader
        title="개인정보 관리"
        right={
          editing ? null : (
            <Button variant="line" className="btn--small" icon={<Pencil size={16} aria-hidden="true" />} onClick={startEdit}>
              수정
            </Button>
          )
        }
      />

      {editing ? (
        <form className="form-stack" onSubmit={handleSave} noValidate>
          <Field label="닉네임" value={draft.nickname} onChange={(e) => setField('nickname')(e.target.value)} error={errors.nickname} maxLength={12} />
          <Field label="이름" value={draft.name} onChange={(e) => setField('name')(e.target.value)} error={errors.name} autoComplete="name" />
          <Field label="연락처" value={draft.phone} onChange={(e) => setField('phone')(e.target.value)} error={errors.phone} inputMode="numeric" autoComplete="tel" />
          <Field label="이메일" value={draft.email} onChange={(e) => setField('email')(e.target.value)} error={errors.email} inputMode="email" autoComplete="email" />
          <Field label="환급 은행" value={draft.bankName} onChange={(e) => setField('bankName')(e.target.value)} error={errors.bankName} />
          <Field label="환급 계좌번호" value={draft.account} onChange={(e) => setField('account')(e.target.value)} error={errors.account} inputMode="numeric" hint="시연용 더미 계좌를 입력해 주세요." />
          <div className="btn-pair">
            <Button variant="line" onClick={cancelEdit}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      ) : (
        <Card>
          <dl className="info-list">
            <div>
              <dt>닉네임</dt>
              <dd>{profile.nickname}</dd>
            </div>
            <div>
              <dt>이름</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>연락처</dt>
              <dd>{profile.phone}</dd>
            </div>
            <div>
              <dt>이메일</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>환급 계좌</dt>
              <dd>
                {profile.bankName} {maskAccount(profile.account)}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      <Card>
        <div className="row">
          <div>
            <strong>개인정보 수집·이용 동의</strong>
            <div className="sm">{profile.consent ? '동의함' : '동의하지 않음'}</div>
          </div>
          <Toggle checked={profile.consent} onChange={handleConsentChange} label="개인정보 수집·이용 동의" />
        </div>
        <ul className="notice-list">
          {CONSENT_NOTICE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {profile.consent ? null : <p className="sheet__warn">동의를 철회하면 캐시백 환급이 제한될 수 있어요.</p>}
      </Card>

      <Card>
        <strong>회원 유형</strong>
        <p className="sm">사장님 회원은 사장님 커뮤니티에 글쓰기·댓글을 남길 수 있어요. (시연용 즉시 전환, 실서비스는 사업자 인증 필요)</p>
        <SegmentControl options={ROLE_OPTIONS} value={profile.role} onChange={handleRoleChange} ariaLabel="회원 유형" />
      </Card>
    </div>
  );
}
