import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface MarkdownTextProps {
  children: string;
  className?: string;
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc ml-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal ml-4">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="ml-2">{children}</li>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="bg-gray-100 px-1 rounded text-xs">{children}</code>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
};

export const MarkdownText = ({
  children,
  className = '',
}: MarkdownTextProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={`prose prose-sm max-w-none ${className}`}
      components={markdownComponents}
    >
      {children}
    </ReactMarkdown>
  );
};
