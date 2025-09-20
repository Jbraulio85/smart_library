import React from "react";

export const FormattedAIAnswer = ({ answer }) => {
  if (!answer) return null;

  const lines = answer.split(/\r?\n/).filter(line => line.trim().length);

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (/^\d+\./.test(line.trim())) {
          const items = [];
          let idx = i;
          while (idx < lines.length && /^\d+\./.test(lines[idx].trim())) {
            items.push(lines[idx].replace(/^\d+\.\s?/, ""));
            idx++;
          }

          if (items.length > 0 && i === 0) {
            return (
              <ol className="list-decimal list-inside ml-4" key={i}>
                {items.map((item, j) => (
                  <li className="mb-1" key={j}>{item}</li>
                ))}
              </ol>
            );
          }
        }

        if (/^-\s/.test(line.trim())) {
          const items = [];
          let idx = i;
          while (idx < lines.length && /^-\s/.test(lines[idx].trim())) {
            items.push(lines[idx].replace(/^- /, ""));
            idx++;
          }
          if (items.length > 0 && i === 0) {
            return (
              <ul className="list-disc list-inside ml-4" key={i}>
                {items.map((item, j) => (
                  <li className="mb-1" key={j}>{item}</li>
                ))}
              </ul>
            );
          }
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {line}
          </p>
        );
      })}
    </div>
  );
};
