import { useState } from "react";

const ReadMore = ({ text = "", lines = 1 }) => {
  const [expanded, setExpanded] = useState(false);

  const clampStyle = {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  };

  return (
    <div>
      <p
        className="text-sm text-gray-600"
        style={expanded ? undefined : clampStyle}
        aria-expanded={expanded}
      >
        {text || "—"}
      </p>

      {text && text.length > 150 && ( // small heuristic for whether to show the control
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="mt-1 text-xs text-blue-600 hover:underline"
          aria-controls="po-desc"
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};

export default ReadMore;