import ReactMarkdown from 'react-markdown';

const MessageContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        // Custom styling for different markdown elements
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-gray-900">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-bold mb-1 text-gray-900">{children}</h3>,
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--brand-default)] hover:text-[var(--brand-muted)] underline"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-gray-900">{children}</li>,
        code: ({ children }) => (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">{children}</pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MessageContent; 