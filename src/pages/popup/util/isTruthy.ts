export function isTruthy<T>(value?: T | undefined | null | false): value is T {
  return !!value;
}
