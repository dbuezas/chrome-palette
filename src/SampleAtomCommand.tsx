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
  const __html = (highlight ? highlight : name).replace(/\n/g, "<br />");
  return (
    <div className="atom-item">
      <span className={`atom-category ${category}`}>{category}</span>
      {icon && <img className={"atom-icon"} src={icon} alt=""></img>}
      {
        <span
          dangerouslySetInnerHTML={{
            __html,
          }}
        />
      }
      <span className="atom-shortcut">
        {shortcut === "unset" ? "" : shortcut}
      </span>
      <span className="atom-keyword">{keyword}</span>
      <span className="atom-timeAgo">{timeAgo}</span>
    </div>
  );
}
