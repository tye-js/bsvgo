import ReactMarkdown from "react-markdown";

export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:tracking-tight prose-a:text-emerald-700">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
