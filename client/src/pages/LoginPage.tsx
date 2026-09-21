import { useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';

const PHONE_PATTERN = /^01[016789]-?\d{3,4}-?\d{4}$/;

export function LoginPage() {
  const { profile, updateProfile } = useApp();
  const { reset } = useNav();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const next: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) next.name = '이름을 2자 이상 입력해 주세요.';
    if (!PHONE_PATTERN.test(phone.trim())) next.phone = '전화번호 형식을 확인해 주세요. 예) 010-0000-0000';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    updateProfile({ name: name.trim(), phone: phone.trim() });
    reset({ name: 'receipt' }, 'receipt');
  };

  return (
    <form className="page" onSubmit={handleSubmit} noValidate>
      <ScreenHeader title="간편 시작" />
      <p className="sub">
        이름과 전화번호만 입력하면 됩니다.
        <br />
        가입 절차도, 앱 설치도 없습니다.
      </p>
      <Field
        label="이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
        autoComplete="name"
        placeholder="이름"
      />
      <Field
        label="전화번호"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        error={errors.phone}
        inputMode="numeric"
        autoComplete="tel"
        placeholder="010-0000-0000"
      />
      <div className="spacer" />
      <Button type="submit">확인</Button>
    </form>
  );
}
