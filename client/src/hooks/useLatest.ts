import { useLayoutEffect, useRef, type MutableRefObject } from 'react';

/** 비동기 콜백 안에서 항상 최신 값을 읽기 위한 ref */
export function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
