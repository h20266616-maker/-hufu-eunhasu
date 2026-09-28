import { Camera, Coins, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';
import { Button } from './ui/Button';

interface Slide {
  Icon: typeof Camera;
  title: string;
  description: string;
}

const SLIDES: readonly Slide[] = [
  { Icon: Camera, title: '영수증 찍기', description: '화천에서 쓴 영수증을 카메라로 찍거나 앨범에서 올려요.' },
  { Icon: Coins, title: '캐시백 쌓기', description: '인증할 때마다 캐시백이 쌓이고, 인증할수록 적립률도 올라가요.' },
  { Icon: ShoppingBag, title: '화천에서 쓰기', description: '쌓인 캐시백은 온라인 상점과 화천 곳곳 가맹점에서 바로 쓸 수 있어요.' },
];

/** 최초 진입 시 한 번만 보여주는 3장 온보딩. 게스트를 포함해 localStorage에 완료 여부를 저장한다 */
export function Onboarding() {
  const [done, setDone] = usePersistentState('onboarding-done', () => false);
  const [step, setStep] = useState(0);

  if (done) return null;

  const slide = SLIDES[step];
  if (!slide) return null;
  const isLast = step === SLIDES.length - 1;
  const finish = () => setDone(true);

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-label="앱 소개">
      <button type="button" className="onboarding__skip" onClick={finish}>
        건너뛰기
      </button>
      <div className="onboarding__body">
        <span className="onboarding__icon">
          <slide.Icon size={44} aria-hidden="true" />
        </span>
        <h2 className="onboarding__title">{slide.title}</h2>
        <p className="onboarding__desc">{slide.description}</p>
      </div>
      <div className="onboarding__dots" role="tablist" aria-label="온보딩 진행 단계">
        {SLIDES.map((item, index) => (
          <span
            key={item.title}
            className={`onboarding__dot${index === step ? ' onboarding__dot--on' : ''}`}
            role="presentation"
          />
        ))}
      </div>
      <Button onClick={() => (isLast ? finish() : setStep((current) => current + 1))}>{isLast ? '시작하기' : '다음'}</Button>
    </div>
  );
}
