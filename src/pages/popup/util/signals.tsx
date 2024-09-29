import { Setter, createEffect, createMemo, createSignal } from "solid-js";

export const inputSignal = createSignal("");

export const [input, setInput] = inputSignal;

export const parsedInput = createMemo(() => {
  const [match, keyword, query] = input().match(/^([a-zA-Z]+)>(.*)/) || [];
  return {
    isCommand: match !== undefined,
    keyword: keyword?.toLowerCase() || "",
    query: match !== undefined ? query : input(),
  };
});

export const matchCommand = (keyword: string) => {
  const parsed = parsedInput();
  return {
    isMatch: keyword === parsed.keyword,
    isCommand: parsed.keyword,
    query: parsed.query,
  };
};

export const createLazyResource = <T,>(
  initialValue: T,
  fetcher: (setVal: Setter<T>) => Promise<T>
) => {
  const [val, setVal] = createSignal(initialValue);
  let fetched = false;
  return () => {
    if (!fetched) {
      fetched = true;
      new Promise((r) => requestAnimationFrame(r)).then(() =>
        fetcher(setVal).then(setVal)
      );
    }
    return val();
  };
};

export const createStoredSignal = <T,>(key: string, defaultValue: T) => {
  let initial = defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) initial = JSON.parse(stored);
  } catch (e) {}
  const signal = createSignal(initial);
  createEffect(() => {
    localStorage.setItem(key, JSON.stringify(signal[0]()));
  }, true);
  return signal;
};
