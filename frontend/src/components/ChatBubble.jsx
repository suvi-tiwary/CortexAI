import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const normalizeContent = (content) => {
  if (typeof content !== 'string') return '';

  return content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/<em[^>]*>/gi, '*')
    .replace(/<\/em>/gi, '*')
    .replace(/<[^>]+>/g, '')
    .trim();
};

const CodeBlockCard = ({ children, className, ...props }) => {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, '');
  const isInstallStyle = /npm|pnpm|yarn|pip|docker|brew|apt|git clone|cd\s+/i.test(codeText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
          {isInstallStyle ? 'Install / Command' : 'Code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] text-zinc-200 transition hover:bg-white/20"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-black/30 p-3 text-[13px] leading-6 text-zinc-100">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const ChatBubble = ({ role, content }) => {
  const isUser = role === 'user';
  const normalizedContent = normalizeContent(content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-3 px-5`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-tr-sm bg-gradient-to-br from-indigo-500 via-violet-700 to-purple-700'
            : 'rounded-tl-sm bg-white/[0.09]'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words text-sm leading-7 text-white">
            {normalizedContent}
          </div>
        ) : (
          <div className="text-sm leading-7 text-zinc-100">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-7">{children}</p>,
                ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-7">{children}</li>,
                h1: ({ children }) => <h1 className="mb-2 text-lg font-semibold">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-2 text-base font-semibold">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 text-sm font-semibold">{children}</h3>,
                code: ({ inline, className, children, ...props }) =>
                  inline ? (
                    <code className="rounded bg-black/20 px-1.5 py-0.5 text-[0.9em] text-violet-200" {...props}>
                      {children}
                    </code>
                  ) : (
                    <CodeBlockCard className={className} {...props}>
                      {children}
                    </CodeBlockCard>
                  ),
                a: ({ href, children }) => (
                  <a href={href} className="break-all text-violet-300 underline" target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-2 border-l-2 border-violet-400/50 pl-3 italic text-zinc-300">
                    {children}
                  </blockquote>
                ),
                hr: () => <hr className="my-3 border-white/10" />,
              }}
            >
              {normalizedContent}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;