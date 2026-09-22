import { AlertTriangle, Compass, Globe } from 'lucide-react';
import { useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { formatPhoneInput } from '../utils/format';

type Mode = 'login' | 'signup';

const NAME_MIN_LENGTH = 2;
const PHONE_PATTERN = /^010-\d{4}-\d{4}$/;

interface FieldErrors {
  name?: string;
  phone?: string;
}

export function LoginPage() {
  const { firebaseReady, signInGoogle, signInEmail, signUpEmail, enterGuestMode } = useAuth();
  const { reset } = useNav();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const goHome = () => reset({ name: 'receipt' }, 'receipt');

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    const result = await signInGoogle();
    setLoading(false);
    if (result.ok) goHome();
    else setError(result.message);
  };

  const handleGuest = () => {
    enterGuestMode();
    goHome();
  };

  const validateSignupFields = (): FieldErrors => {
    const next: FieldErrors = {};
    if (name.trim().length < NAME_MIN_LENGTH) next.name = '이름을 2자 이상 입력해 주세요.';
    if (!PHONE_PATTERN.test(phone)) next.phone = '010으로 시작하는 11자리 번호를 입력해 주세요.';
    return next;
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === 'signup') {
      const nextFieldErrors = validateSignupFields();
      setFieldErrors(nextFieldErrors);
      if (Object.keys(nextFieldErrors).length > 0) return;
    } else {
      setFieldErrors({});
    }

    setLoading(true);
    const result =
      mode === 'login' ? await signInEmail(email, password) : await signUpEmail(email, password, name.trim(), phone);
    setLoading(false);
    if (result.ok) goHome();
    else setError(result.message);
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="page">
      <ScreenHeader title="로그인" />
      <p className="sub">
        로그인하면 인증 내역과 스탬프, 캐시가 계정에 안전하게 저장돼요.
        <br />
        홈 화면은 로그인 없이도 둘러볼 수 있어요.
      </p>

      {!firebaseReady ? (
        <div className="notice" role="note">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Firebase 설정이 아직 없어요</strong>
            <p className="sm">client/.env.local에 Firebase 값을 넣으면 로그인을 쓸 수 있어요.</p>
          </div>
        </div>
      ) : null}

      <Button icon={<Globe size={18} aria-hidden="true" />} onClick={() => void handleGoogle()} disabled={loading || !firebaseReady}>
        Google로 계속하기
      </Button>

      <div className="divider" role="separator">
        또는
      </div>

      <form className="form-stack" onSubmit={(event) => void handleSubmit(event)} noValidate>
        {mode === 'signup' ? (
          <>
            <Field
              label="이름"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={fieldErrors.name}
              autoComplete="name"
              placeholder="실명을 입력해 주세요"
              disabled={loading || !firebaseReady}
            />
            <Field
              label="전화번호"
              value={phone}
              onChange={(event) => setPhone(formatPhoneInput(event.target.value))}
              error={fieldErrors.phone}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="010-0000-0000"
              disabled={loading || !firebaseReady}
            />
          </>
        ) : null}
        <Field
          label="이메일"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          disabled={loading || !firebaseReady}
        />
        <Field
          label="비밀번호"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="6자 이상"
          disabled={loading || !firebaseReady}
        />
        {error ? <p className="field__error">{error}</p> : null}
        <Button type="submit" variant="line" disabled={loading || !firebaseReady}>
          {mode === 'login' ? '이메일로 로그인' : '이메일로 회원가입'}
        </Button>
      </form>

      <button type="button" className="link-btn" onClick={switchMode}>
        {mode === 'login' ? '처음이신가요? 이메일로 회원가입' : '이미 계정이 있으신가요? 로그인'}
      </button>

      <div className="spacer" />
      <Button variant="ghost" icon={<Compass size={16} aria-hidden="true" />} onClick={handleGuest}>
        게스트로 둘러보기
      </Button>
    </div>
  );
}
