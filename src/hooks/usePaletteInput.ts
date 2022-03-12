import React, { useMemo } from "react";

const usePaletteInput = (commandPaletteRef: React.MutableRefObject<any>) => {
  const element: HTMLInputElement | undefined =
    commandPaletteRef.current?.commandPaletteInput?.input;
  const inputValue = element?.value || "";

  const setInputValue = useMemo(() => {
    return (value: string) => {
      const element: HTMLInputElement | undefined =
        commandPaletteRef.current?.commandPaletteInput?.input;
      if (!element) return;
      // https://stackoverflow.com/a/46012210
      var nativeInputValueSetter = Object!.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )!.set!;
      nativeInputValueSetter.call(element, value);
      var ev2 = new Event("input", { bubbles: true });
      element.dispatchEvent(ev2);
    };
  }, []);
  return {
    setInputValue,
    inputValue,
  };
};
export default usePaletteInput;
