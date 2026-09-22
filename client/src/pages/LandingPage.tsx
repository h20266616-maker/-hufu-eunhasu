import { Receipt } from 'lucide-react';
import { useNav } from '../context/NavContext';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  const { reset } = useNav();
  return (
    <div className="page">
      <div className="spacer" />
      <span className="landing__logo">
        <Receipt size={36} aria-hidden="true" />
      </span>
      <h1 className="landing__title">
        화천에서 쓴 영수증,
        <br />
        다시 돌려받으세요
      </h1>
      <p className="sub">
        인증할수록 캐시백이 올라가고,
        <br />
        쌓인 캐시로 화천 특산물을 주문할 수 있어요.
      </p>
      <div className="spacer" />
      <Button onClick={() => reset({ name: 'receipt' }, 'receipt')}>둘러보기 시작</Button>
      <p className="sm center landing__foot">화천군 · 타운마이스 지역상생 영수증</p>
    </div>
  );
}
