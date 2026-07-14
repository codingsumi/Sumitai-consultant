"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import type { Components } from "react-markdown";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="copy-btn">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

const components: Components = {
  code({ className, children, ...props }) {
    const isBlock = className?.startsWith("language-");
    const lang = className?.replace("language-", "") ?? "";
    const text = String(children).replace(/\n$/, "");

    if (!isBlock) {
      return <code className="inline-code" {...props}>{children}</code>;
    }

    return (
      <div className="code-block">
        <div className="code-header">
          {lang && <span className="code-lang">{lang}</span>}
          <CopyButton text={text} />
        </div>
        <div className="code-scroll">
          <code className={className}>{children}</code>
        </div>
      </div>
    );
  },
  pre({ children }) {
    return <pre className="code-pre">{children}</pre>;
  },
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
