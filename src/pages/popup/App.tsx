import "./App.scss";

import fuzzysort from "fuzzysort";
import InfiniteScroll from "solid-infinite-scroll";
import {
  Show,
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from "solid-js";
import { tinykeys } from "tinykeys";

import Entry from "./Entry";
import Shortcut from "./Shortcut";
import audibleTabSuggestions from "./commands/audio";
import bookmarkThisSuggestions from "./commands/bookmark-this";
import bookmarkSuggestions from "./commands/bookmarks";
import extenionsSuggestions from "./commands/extensions";
import generalSuggestions, { Command } from "./commands/general";
import historySuggestions from "./commands/history";
import switchTabSuggestions from "./commands/tabs";
import themeSuggestions from "./commands/themes";
import websitesSuggestions from "./commands/website-search";
import { sortByUsed, storeLastUsed } from "./util/last-used";
import { createStoredSignal, inputSignal, parsedInput } from "./util/signals";

const [shortcut, setShortcut] = createStoredSignal("_execute_action", "?");

chrome.commands.getAll().then((commands) => {
  const mainCommand = commands.find(({ name }) => name === "_execute_action");
  if (mainCommand?.shortcut) setShortcut(mainCommand.shortcut);
  else setShortcut("?");
});

const [inputValue, setInputValue] = inputSignal;

const allCommands = createMemo(() => {
  let commands: Command[] = [
    ...generalSuggestions(),
    ...audibleTabSuggestions(),
    ...bookmarkThisSuggestions(),
    ...switchTabSuggestions(),
    ...historySuggestions(),
    ...bookmarkSuggestions(),
    ...extenionsSuggestions(),
    ...websitesSuggestions(),
    ...themeSuggestions(),
  ];
  sortByUsed(commands);
  return commands;
});

const commandsLimit = 75;

const [scrollIndex, setScrollIndex] = createSignal(commandsLimit);

const matches = createMemo(() => {
  return fuzzysort.go(parsedInput().query, allCommands(), {
    threshold: -10000, // don't return bad results
    limit: scrollIndex(), // Don't return more results than this (lower is faster)
    all: true, // If true, returns all results for an empty search
    keys: ["title", "subtitle", "url"], // For when targets are objects (see its example usage)
    // keys: null, // For when targets are objects (see its example usage)
    // scoreFn: null, // For use with `keys` (see its example usage)
  });
});

const filteredCommands = createMemo(() => {
  /* The filtered commands are contained in matches and are stable references.
   * This means they don't change while you type, and this allows the
   * <Each /> component (or <InfiniteScroll />) to use them as keys,
   * and not re-create dom elements.
   */
  return matches().map((match) => match.obj);
});

const [selectedI_internal, setSelectedI] = createSignal(0);

const selectedI = createMemo(() => {
  const n = filteredCommands().length;
  return ((selectedI_internal() % n) + n) % n;
});

createEffect(() => {
  inputValue();
  setSelectedI(0);
});

export const runCommand = async (command: Command) => {
  storeLastUsed(command);
  if ("url" in command) chrome.tabs.create({ url: command.url });
  command.command?.();
};

tinykeys(window, {
  ArrowUp: (e) => {
    e.preventDefault();
    setSelectedI((i) => i - 1);
  },
  ArrowDown: (e) => {
    e.preventDefault();
    setSelectedI((i) => i + 1);
  },
  Enter: (e) => {
    e.preventDefault();
    const selected = filteredCommands()[selectedI()];
    runCommand(selected);
  },
});

const PinWarning = () => {
  const [userSettings] = createResource(() => chrome.action.getUserSettings());
  const isNotPinned = createMemo(
    () => userSettings() && userSettings()?.isOnToolbar === false
  );
  return (
    <Show when={isNotPinned()}>
      <div style={{ color: "red", padding: "10px" }}>
        Pin the extension to the toolbar for faster load
      </div>
    </Show>
  );
};
const App = () => {
  createEffect(() => {
    inputValue();
    setScrollIndex(commandsLimit);
  });
  return (
    <>
      <div
        class="App"
        onBlur={(e) => {
          window.close();
        }}
      >
        <div class="input_wrap">
          <input
            class="input"
            autofocus
            placeholder="Type to search..."
            value={inputValue()}
            onInput={(e) => {
              setInputValue(e.target.value);
              setSelectedI(0);
            }}
          />
          <Shortcut
            onClick={() =>
              chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
            }
            keys={shortcut()}
          />
        </div>
        <ul class="list">
          <InfiniteScroll
            loadingMessage={<></>}
            each={filteredCommands()}
            hasMore={true}
            next={() => setScrollIndex(scrollIndex() * 2)}
          >
            {(command, i) => {
              const isSelected = createMemo(() => i() === selectedI());
              return (
                <Entry
                  isSelected={isSelected()}
                  keyResults={matches()[i()]}
                  command={command}
                />
              );
            }}
          </InfiniteScroll>
        </ul>
      </div>
      <PinWarning />
    </>
  );
};

export default App;
