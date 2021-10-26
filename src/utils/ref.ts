export type RefObject<T = any> = { current?: T };

export function createRef<T = any>(value?: T): RefObject<T> {
  return {
    current: value,
  };
}
