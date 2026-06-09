import type { CSSProperties, ReactNode } from "react";

const ulStyle: CSSProperties = { margin: "4px 0 8px", paddingLeft: 18 };
const olStyle: CSSProperties = { margin: "4px 0 8px", paddingLeft: 20 };
const liStyle: CSSProperties = { margin: "2px 0" };
const pStyle: CSSProperties = { margin: "0 0 8px" };
const quoteStyle: CSSProperties = {
  margin: "4px 0 8px",
  padding: "4px 10px",
  borderLeft: "3px solid var(--green)",
  background: "var(--field)",
  borderRadius: 6,
};
const codeStyle: CSSProperties = {
  background: "rgba(0,0,0,.08)",
  borderRadius: 4,
  padding: "1px 5px",
  fontSize: "0.9em",
};

// Inline: **bold**, *italic* / _italic_, `code`
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) out.push(<strong key={`${key}-${i}`}>{m[2]}</strong>);
    else if (m[3] !== undefined) out.push(<em key={`${key}-${i}`}>{m[3]}</em>);
    else if (m[4] !== undefined) out.push(<em key={`${key}-${i}`}>{m[4]}</em>);
    else if (m[5] !== undefined)
      out.push(
        <code key={`${key}-${i}`} style={codeStyle}>
          {m[5]}
        </code>
      );
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ text }: { text: string }) {
  const lines = (text ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (!para.length) return;
    const k = `p${key++}`;
    blocks.push(
      <p key={k} style={pStyle}>
        {para.map((l, i) => (
          <span key={i}>
            {inline(l, `${k}-${i}`)}
            {i < para.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
    para = [];
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushPara();
      continue;
    }

    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushPara();
      const level = h[1].length;
      const k = `h${key++}`;
      const size = [20, 18, 16, 15][level - 1] ?? 15;
      blocks.push(
        <div key={k} style={{ fontWeight: 700, fontSize: size, margin: "6px 0 4px" }}>
          {inline(h[2], k)}
        </div>
      );
      continue;
    }

    // blockquote — gabung baris berurutan
    if (/^>\s?/.test(trimmed)) {
      flushPara();
      const quote: string[] = [];
      while (idx < lines.length && /^>\s?/.test(lines[idx].trim())) {
        quote.push(lines[idx].trim().replace(/^>\s?/, ""));
        idx++;
      }
      idx--;
      const k = `q${key++}`;
      blocks.push(
        <blockquote key={k} style={quoteStyle}>
          {quote.map((q, i) => (
            <span key={i}>
              {inline(q, `${k}-${i}`)}
              {i < quote.length - 1 && <br />}
            </span>
          ))}
        </blockquote>
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (idx < lines.length && /^[-*]\s+/.test(lines[idx].trim())) {
        items.push(lines[idx].trim().replace(/^[-*]\s+/, ""));
        idx++;
      }
      idx--;
      const k = `ul${key++}`;
      blocks.push(
        <ul key={k} style={ulStyle}>
          {items.map((it, i) => (
            <li key={i} style={liStyle}>
              {inline(it, `${k}-${i}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      while (idx < lines.length && /^\d+\.\s+/.test(lines[idx].trim())) {
        items.push(lines[idx].trim().replace(/^\d+\.\s+/, ""));
        idx++;
      }
      idx--;
      const k = `ol${key++}`;
      blocks.push(
        <ol key={k} style={olStyle}>
          {items.map((it, i) => (
            <li key={i} style={liStyle}>
              {inline(it, `${k}-${i}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    para.push(trimmed);
  }
  flushPara();

  return <>{blocks}</>;
}
