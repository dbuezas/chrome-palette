import "./Keyword.scss";

import { Show } from "solid-js";

export default function Keyword(props: { keyword?: string }) {
  return (
    <Show when={props.keyword}>
      {(keyword) => <span class="Keyword">{keyword()}</span>}
    </Show>
  );
}
