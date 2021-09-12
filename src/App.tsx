import React, { useCallback, useEffect, useRef, useState } from "react";
import useDefaultCommands, { Command } from "./commands";
//@ts-expect-error
import CommandPalette from "react-command-palette";
import "react-command-palette/dist/themes/chrome.css";
import "react-command-palette/dist/themes/atom.css";
import "react-command-palette/dist/themes/sublime.css";
import "./App.css";
import Header from "./Header";
import SampleAtomCommand from "./SampleAtomCommand";
import {
  useHistorySuggestions,
  useSwitchTabSuggestions,
  useTemplatedSuggestions,
} from "./searchCommands";

import { sortByUsed, storeLastUsed } from "./last-used";
function App() {
  const [, forceRender] = useState({});
  const commandPalette = useRef<any>(null);

  const input: HTMLInputElement | undefined =
    commandPalette.current?.commandPaletteInput?.input;

  const inputValue = input?.value || "";
  const setInputValue = useCallback(
    (newValue: string) => {
      setTimeout(() => {
        // https://stackoverflow.com/a/46012210
        var nativeInputValueSetter = Object!.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )!.set!;
        nativeInputValueSetter.call(input, newValue);
        var ev2 = new Event("input", { bubbles: true });
        input?.dispatchEvent(ev2);
      });
    },
    [input]
  );
  (window as any).setInputValue = setInputValue;
  const switchTabSuggestions = useSwitchTabSuggestions(
    setInputValue,
    inputValue
  );
  const historySuggestions = useHistorySuggestions(setInputValue, inputValue);
  const templatedSuggestions = useTemplatedSuggestions(
    setInputValue,
    inputValue
  );
  const defaultCommands = useDefaultCommands(setInputValue, inputValue);

  const newCommands = sortByUsed([
    ...switchTabSuggestions,
    ...historySuggestions,
    ...defaultCommands,
    ...templatedSuggestions,
  ]);
  // hack here to keep array reference, otherwise the CommandPalette library breaks
  // The bug seems to be that when commands change, fuzzy matching is not rerun
  // and all commands are shown without filtering.
  // without this, the UI flickers
  let commands = useRef<Command[]>([]).current;
  commands.length = 0;
  commands.push(...newCommands);

  useEffect(() => {
    // blur + focus hack to let the lib know that it should recompute the matches
    // even after changing commands
    input?.blur();
    input?.focus();
  });
  return (
    <CommandPalette
      ref={commandPalette}
      commands={commands}
      display="inline"
      filterSearchQuery={(inputValue: string) => {
        const query = inputValue.match(/^[a-z]{1,2}>(.*)/)?.[1];
        if (query !== undefined) return query;
        return inputValue;
      }}
      onChange={() => {
        // force rerender in case commands are input dependant
        forceRender({});
      }}
      getSuggestionValue={() => {
        // hack to avoid that highlighting changes the value of the input
        return commandPalette.current.commandPaletteInput.input.value;
      }}
      options={{
        threshold: -10000,
        // threshold: -Infinity, // Don't return matches worse than this (higher is faster)
        limit: 100, // Don't return more results than this (lower is faster)
        // allowTypo: true, // Allwos a snigle transpoes (false is faster)
        allowTypo: false, // Allwos a snigle transpoes (false is faster)
        key: "name", // For when targets are objects (see its example usage)
        keys: ["name"], // For when targets are objects (see its example usage)
        scoreFn: null, // For use with `keys` (see its example usage)
      }}
      header={<Header />}
      maxDisplayed={100}
      onRequestClose={() => {
        window.close();
      }}
      onSelect={(command: Command) => {
        storeLastUsed(command);
      }}
      placeholder="Search for a commands"
      renderCommand={SampleAtomCommand}
      showSpinnerOnSelect={false}
    />
  );
}

export default App;
