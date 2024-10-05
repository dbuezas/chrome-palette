// render inside top level Solid component
import "./Entry.scss";

import { Show, createEffect, createMemo } from "solid-js";
import twas from "twas";

import { runCommand } from "./App";
import Keyword from "./Keyword";
import Shortcut from "./Shortcut";
import { Command } from "./commands/general";
import { parsedInput } from "./util/signals";

export function faviconURL(u?: string) {
  if (!u) return u;
  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u);
  url.searchParams.set("size", "32");
  return url.toString();
}

export default function Entry(props: {
  isSelected: boolean;
  command: Command;
  keyResults: Fuzzysort.KeysResult<Command>;
}) {
  const title = createMemo(() => {
    const txt = props.command.title || "";
    if (!parsedInput().query) return txt;
    const r = props.keyResults[0].highlight((t) => <b>{t}</b>);
    if (r.length === 0) return txt;
    return r;
  });
  const subtitle = createMemo(() => {
    const txt = props.command.subtitle || "";
    if (!parsedInput().query) return txt;
    const r = props.keyResults[1].highlight((t) => <b>{t}</b>);
    if (r.length === 0) return txt;
    return r;
  });
  const url = createMemo(() => {
    if (!("url" in props.command)) return "";
    const txt = props.command.url;
    if (!parsedInput().query) return txt;
    const r = props.keyResults[2].highlight((t) => <b>{t}</b>);
    if (r.length === 0) return txt;
    return r;
  });
  return (
    <li
      class="Entry"
      classList={{
        selected: props.isSelected,
      }}
      onclick={() => {
        runCommand(props.command);
      }}
      ref={(el) => {
        createEffect(() => {
          if (props.isSelected) {
            el.scrollIntoView({ behavior: "auto", block: "nearest" });
          }
        });
      }}
    >
      <Show when={props.command.icon || faviconURL(props.command.url)}>
        {(icon) => (
          <img
            classList={{
              img: true,
              img_big: !!(subtitle() || url()),
            }}
            src={icon()}
            alt=""
            loading="lazy"
          />
        )}
      </Show>

      <div class="text">
        <div class="title">
          <Show when={parsedInput().query} fallback={props.command.title}>
            {title()}
          </Show>
        </div>
        <div class="subtitle">
          <Show when={parsedInput().query} fallback={props.command.subtitle}>
            {subtitle()}
          </Show>
        </div>
        <div class="subtitle">
          <Show when={parsedInput().query} fallback={props.command.url}>
            {url()}
          </Show>
          <Show when={props.command.lastVisitTime}>
            {(time) => <span class="time_ago">{twas(time())}</span>}
          </Show>
        </div>
      </div>
      <Shortcut keys={props.command.shortcut} />
      <Keyword keyword={props.command.keyword} />
    </li>
  );
}
