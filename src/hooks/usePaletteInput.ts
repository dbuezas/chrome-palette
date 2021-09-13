import React, { useMemo } from "react";


const usePaletteInput = (commandPaletteRef: React.MutableRefObject<any>) => {
  const element: HTMLInputElement | undefined =
  commandPaletteRef.current?.commandPaletteInput?.input;
  const inputValue = element?.value || ""
  return useMemo(
    () => ({
      element,
      setInputValue: (value: string) => {
        // https://stackoverflow.com/a/46012210
        var nativeInputValueSetter = Object!.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )!.set!;
        nativeInputValueSetter.call(element, value);
        var ev2 = new Event("input", { bubbles: true });
        element?.dispatchEvent(ev2);
      },
      inputValue,
    }),
    [element, inputValue]
  );
};
export default usePaletteInput;
