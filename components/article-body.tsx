import ReactMarkdown from "react-markdown";

export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-lg prose-headings:tracking-tight prose-headings:text-slate-950 prose-p:leading-8 prose-a:text-emerald-700 prose-img:rounded-lg prose-img:shadow-sm">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
