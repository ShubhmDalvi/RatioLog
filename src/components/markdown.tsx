import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-8 mb-3 text-2xl font-semibold tracking-tight text-ink first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-7 mb-2.5 text-xl font-semibold tracking-tight text-ink first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-base font-semibold tracking-tight text-ink first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-5 mb-2 text-[15px] font-semibold tracking-tight text-ink first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="my-3.5 first:mt-0 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-3.5 list-disc space-y-1.5 pl-5 first:mt-0 last:mb-0 marker:text-ink-faint">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3.5 list-decimal space-y-1.5 pl-5 first:mt-0 last:mb-0 marker:text-ink-faint">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-md border-l-[3px] border-brand bg-brand-soft/50 px-4 py-2.5 text-ink-muted first:mt-0 last:mb-0">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-lg bg-[#262625] p-4 text-[13px] leading-relaxed text-[#e9e8e6] first:mt-0 last:mb-0">
      {children}
    </pre>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-brand">
        {children}
      </code>
    ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:text-brand-hover"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-line" />,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
};

export function Markdown({ content }: { content: string }) {
  if (!content.trim()) {
    return null;
  }

  return (
    <div className="text-[15px] leading-relaxed text-ink">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
