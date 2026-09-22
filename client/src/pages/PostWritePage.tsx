import { Lock, LogIn } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Field } from '../components/ui/Field';
import { ErrorState } from '../components/ui/StateMessage';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { BOARD_CATEGORIES, BOARD_LABELS, OWNER_READONLY_NOTICE } from '../data';
import type { Board } from '../types';

const MAX_TITLE_LENGTH = 40;
const MAX_BODY_LENGTH = 500;
const MIN_BODY_LENGTH = 5;

export function PostWritePage({ board }: { board: Board }) {
  const { uid, profile, addPost } = useApp();
  const { push, back } = useNav();
  const showToast = useToast();
  const categories = BOARD_CATEGORIES[board];
  const [category, setCategory] = useState<string>(categories[0] ?? '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const bodyId = useId();

  if (!uid) {
    return (
      <div className="page">
        <ScreenHeader title="글쓰기" />
        <ErrorState
          icon={LogIn}
          title="로그인이 필요해요"
          description="글을 쓰려면 먼저 로그인해 주세요."
          action={<Button onClick={() => push({ name: 'login' })}>로그인하기</Button>}
        />
      </div>
    );
  }

  if (board === 'owner' && profile.role !== 'owner') {
    return (
      <div className="page">
        <ScreenHeader title="글쓰기" />
        <ErrorState
          icon={Lock}
          title={OWNER_READONLY_NOTICE}
          description="개인정보 관리에서 회원 유형을 사장님으로 바꾸면 글을 쓸 수 있어요."
          action={<Button onClick={back}>돌아가기</Button>}
        />
      </div>
    );
  }

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    const next: { title?: string; body?: string } = {};
    if (title.trim().length < 2) next.title = '제목을 2자 이상 입력해 주세요.';
    if (body.trim().length < MIN_BODY_LENGTH) next.body = `내용을 ${MIN_BODY_LENGTH}자 이상 입력해 주세요.`;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    try {
      await addPost({ board, category, title: title.trim(), body: body.trim(), author: profile.nickname });
      showToast('글을 올렸어요');
      back();
    } catch {
      setSubmitting(false);
      showToast('글을 올리지 못했어요. 다시 시도해 주세요.');
    }
  };

  return (
    <form className="page" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <ScreenHeader title={`${BOARD_LABELS[board]} 글쓰기`} />

      <div className="field">
        <span className="field__label">카테고리</span>
        <div className="chips chips--wrap" role="group" aria-label="카테고리 선택">
          {categories.map((item) => (
            <Chip key={item} selected={category === item} onClick={() => setCategory(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </div>

      <Field
        label="제목"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
        maxLength={MAX_TITLE_LENGTH}
        placeholder="제목을 입력하세요"
        hint={`${title.length} / ${MAX_TITLE_LENGTH}`}
        disabled={submitting}
      />

      <div className="field">
        <label className="field__label" htmlFor={bodyId}>
          내용
        </label>
        <textarea
          id={bodyId}
          className={`field__input field__textarea${errors.body ? ' field__input--error' : ''}`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={MAX_BODY_LENGTH}
          rows={8}
          placeholder="화천에서의 경험을 자유롭게 적어주세요"
          aria-invalid={errors.body ? true : undefined}
          disabled={submitting}
        />
        {errors.body ? <p className="field__error">{errors.body}</p> : <p className="field__hint">{body.length} / {MAX_BODY_LENGTH}</p>}
      </div>

      <div className="spacer" />
      <Button type="submit" disabled={submitting}>
        {submitting ? '올리는 중…' : '올리기'}
      </Button>
    </form>
  );
}
