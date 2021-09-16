import React from "react";
import "./SampleAtomCommand.css";

type Props = {
  name: string;
  highlight: string;
  shortcut?: string;
  keyword?: string;
  category: string;
  timeAgo?: string;
  icon?: string;
};
export default function SampleAtomCommand({
  name,
  highlight,
  shortcut,
  keyword,
  timeAgo,
  category,
  icon,
}: Props) {
  return (
    <div className="atom-item">
      <span className={`atom-category ${category}`}>{category}</span>
      {icon && <img className={"atom-icon"} src={icon} alt=""></img>}
      {highlight ? (
        <span dangerouslySetInnerHTML={{ __html: highlight }} />
      ) : (
        <span>{name}</span>
      )}
      <span className="atom-shortcut">{shortcut}</span>
      <span className="atom-keyword">{keyword}</span>
      <span className="atom-timeAgo">{timeAgo}</span>
    </div>
  );
}
