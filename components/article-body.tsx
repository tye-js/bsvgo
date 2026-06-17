import { isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { SafeImage } from "@/components/safe-image";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import { siteConfig } from "@/lib/i18n";

export type ArticleTocItem = {
  id: string;
  level: 2 | 3;
  title: string;
};

type ArticleLeadImage = {
  src: string;
  fallbackSrc: string;
  alt: string;
  caption?: string;
};

function flattenText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }

  if (isValidElement(node)) {
    return flattenText((node as ReactElement<{ children?: ReactNode }>).props.children);
  }

  return "";
}

function slugifyHeading(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "section";
}

function createHeadingId(title: string, counts: Map<string, number>) {
  const base = slugifyHeading(title);
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);

  return count === 0 ? base : `${base}-${count + 1}`;
}

export function getArticleToc(content: string): ArticleTocItem[] {
  const counts = new Map<string, number>();

  return content
    .split("\n")
    .map((line) => {
      const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line.trim());

      if (!match) {
        return null;
      }

      const title = match[2]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[`*_~]/g, "")
        .trim();

      if (!title) {
        return null;
      }

      return {
        id: createHeadingId(title, counts),
        level: match[1].length as 2 | 3,
        title,
      };
    })
    .filter(Boolean) as ArticleTocItem[];
}

function getLanguageLabel(className?: string) {
  const match = className?.match(/language-([a-z0-9+-]+)/i);

  if (!match) {
    return "Code";
  }

  const language = match[1].toLowerCase();
  const labels: Record<string, string> = {
    bash: "Shell",
    sh: "Shell",
    shell: "Shell",
    ts: "TypeScript",
    tsx: "TSX",
    js: "JavaScript",
    jsx: "JSX",
    json: "JSON",
    css: "CSS",
    html: "HTML",
    md: "Markdown",
    yaml: "YAML",
    yml: "YAML",
    sql: "SQL",
    go: "Go",
    py: "Python",
    rs: "Rust",
  };

  return labels[language] ?? language.toUpperCase();
}

function isExternalHref(href: string | undefined) {
  if (!href) {
    return false;
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return false;
  }

  try {
    const target = new URL(href, siteConfig.url);
    const site = new URL(siteConfig.url);

    return target.origin !== site.origin;
  } catch {
    return false;
  }
}

function ArticleLeadFigure({ image }: { image: ArticleLeadImage }) {
  return (
    <figure className="my-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-emerald-50">
        <SafeImage
          src={image.src}
          fallbackSrc={image.fallbackSrc}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, 760px"
          className="object-cover"
        />
      </div>
      {image.caption ? (
        <figcaption className="px-4 py-3 text-sm leading-6 text-slate-500">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function createMarkdownComponents(leadImage?: ArticleLeadImage): Components {
  const headingCounts = new Map<string, number>();
  let h2Count = 0;
  let leadImageInserted = false;

  return {
  h1: ({ children, ...props }) => (
    <h1
      className="mt-10 text-3xl font-semibold tracking-tight text-slate-950 first:mt-0 sm:text-4xl"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => {
    const id = createHeadingId(flattenText(children), headingCounts);
    h2Count += 1;
    const shouldInsertLeadImage =
      leadImage && !leadImageInserted && h2Count === 2;

    if (shouldInsertLeadImage) {
      leadImageInserted = true;
    }

    return (
      <>
        {shouldInsertLeadImage ? <ArticleLeadFigure image={leadImage} /> : null}
        <h2
          id={id}
          className="scroll-mt-28 mt-12 border-b border-emerald-900/10 pb-3 text-2xl font-semibold tracking-tight text-slate-950 first:mt-0 sm:text-[1.65rem]"
          {...props}
        >
          {children}
        </h2>
      </>
    );
  },
  h3: ({ children, ...props }) => {
    const id = createHeadingId(flattenText(children), headingCounts);

    return (
      <h3
        id={id}
        className="scroll-mt-28 mt-10 text-xl font-semibold tracking-tight text-slate-950"
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => (
    <h4
      className="mt-8 text-lg font-semibold tracking-tight text-slate-950"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="my-5 leading-8 text-slate-700" {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }) => {
    const isExternal = isExternalHref(href);

    return (
      <a
        className="font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-4 transition hover:text-emerald-800 hover:decoration-emerald-400"
        href={href}
        rel={isExternal ? "noreferrer noopener" : undefined}
        target={isExternal ? "_blank" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-slate-950" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-slate-700" {...props}>
      {children}
    </em>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-6 list-disc space-y-2 pl-6 text-slate-700" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-6 list-decimal space-y-2 pl-6 text-slate-700" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1 leading-8" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-8 rounded-lg border border-emerald-900/10 bg-emerald-50/70 px-5 py-4 text-slate-700 shadow-sm sm:px-6"
      {...props}
    >
      <div className="text-[0.95rem] leading-8">{children}</div>
    </blockquote>
  ),
  hr: ({ ...props }) => (
    <hr
      className="my-10 border-0 bg-gradient-to-r from-transparent via-emerald-200 to-transparent"
      style={{ height: 1 }}
      {...props}
    />
  ),
  code: ({ children, className, ...props }) => (
    <code
      className={`rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-900 ${className ?? ""}`}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => {
    const codeElement = isValidElement(children)
      ? (children as ReactElement<{
          className?: string;
          children?: ReactNode;
        }>)
      : null;
    const className = codeElement?.props.className;
    const rawCode = flattenText(codeElement?.props.children ?? children)
      .replace(/\n$/, "")
      .trimEnd();
    const codeLines = rawCode.length > 0 ? rawCode.split("\n") : [" "];

    return (
      <div className="my-8 overflow-hidden rounded-lg border border-[#2d2d2d] bg-[#1e1e1e] shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#252526] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9f9f9f]">
            {getLanguageLabel(className)}
          </span>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-full py-4 text-[14px] leading-7 text-[#d4d4d4]">
            {codeLines.map((line, index) => (
              <div
                key={`${index}-${line}`}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-4 px-4 transition-colors hover:bg-white/[0.03]"
              >
                <span className="select-none pt-px text-right font-mono text-[12px] leading-7 text-[#858585]">
                  {index + 1}
                </span>
                <span
                  className="whitespace-pre font-mono"
                  style={{ tabSize: 2 }}
                >
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
  img: ({ alt, src }) => {
    const fallbackSrc = createCoverArtDataUri({
      title: alt ?? "BSVgo",
      label: "BSVgo",
      variant: "card",
    });

    return (
      <figure className="my-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative aspect-[16/9] bg-emerald-50">
          <SafeImage
            src={getRenderableImageSrc(typeof src === "string" ? src : null, {
              title: alt ?? "BSVgo",
              label: "BSVgo",
              variant: "card",
            })}
            fallbackSrc={fallbackSrc}
            alt={alt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 760px"
            className="object-cover"
          />
        </div>
        {alt ? (
          <figcaption className="px-4 py-3 text-sm leading-6 text-slate-500">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    );
  },
  table: ({ children, ...props }) => (
    <div className="my-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-slate-700" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => (
    <tr className="border-b border-slate-200 last:border-0" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 font-semibold text-slate-600" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 align-top leading-7" {...props}>
      {children}
    </td>
  ),
  };
}

export function ArticleBody({
  content,
  leadImage,
}: {
  content: string;
  leadImage?: ArticleLeadImage;
}) {
  return (
    <div className="mx-auto max-w-[72ch] text-[17px] leading-8 text-slate-700 prose prose-slate prose-lg prose-headings:tracking-tight prose-headings:text-slate-950 prose-p:leading-8 prose-a:text-emerald-700 prose-img:rounded-lg prose-img:shadow-sm">
      <ReactMarkdown
        components={createMarkdownComponents(leadImage)}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
