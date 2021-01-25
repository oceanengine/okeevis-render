
export type Ref<T> = { current?: T };

export function createRef<T = any>(value?: T): Ref<T> {
  return {
    current: value
  }
}