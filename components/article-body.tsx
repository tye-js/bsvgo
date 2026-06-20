import { isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { SafeImage } from "@/components/safe-image";
import { createCoverArtDataUri, getRenderableImageSrc } from "@/lib/cover-art";
import type { CategorySlug } from "@/lib/content";
import { imageSizes } from "@/lib/image-sizes";
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
};

const leadImageMarker = "bsvgo-lead-image";

type ArticleTone = {
  link: string;
  h2Border: string;
  h3Accent: string;
  marker: string;
  quote: string;
  tableHead: string;
  tableBorder: string;
  tableRow: string;
  tableStripe: string;
  inlineCode: string;
  hr: string;
  imageBg: string;
};

const articleTones: Record<CategorySlug, ArticleTone> = {
  blockchain: {
    link: "text-emerald-700 decoration-emerald-200 hover:text-emerald-800 hover:decoration-emerald-400",
    h2Border: "border-emerald-200",
    h3Accent: "before:bg-emerald-400",
    marker: "marker:text-emerald-500",
    quote: "border-emerald-300 bg-emerald-50/80 text-emerald-950",
    tableHead: "bg-emerald-50 text-emerald-900",
    tableBorder: "border-emerald-100",
    tableRow: "border-emerald-100",
    tableStripe: "odd:bg-white even:bg-emerald-50/35",
    inlineCode: "border-emerald-100 bg-emerald-50 text-emerald-950",
    hr: "via-emerald-200",
    imageBg: "bg-emerald-50",
  },
  ai: {
    link: "text-cyan-700 decoration-cyan-200 hover:text-cyan-800 hover:decoration-cyan-400",
    h2Border: "border-cyan-200",
    h3Accent: "before:bg-cyan-400",
    marker: "marker:text-cyan-500",
    quote: "border-cyan-300 bg-cyan-50/80 text-cyan-950",
    tableHead: "bg-cyan-50 text-cyan-950",
    tableBorder: "border-cyan-100",
    tableRow: "border-cyan-100",
    tableStripe: "odd:bg-white even:bg-cyan-50/35",
    inlineCode: "border-cyan-100 bg-cyan-50 text-cyan-950",
    hr: "via-cyan-200",
    imageBg: "bg-cyan-50",
  },
  infrastructure: {
    link: "text-amber-700 decoration-amber-200 hover:text-amber-800 hover:decoration-amber-400",
    h2Border: "border-amber-200",
    h3Accent: "before:bg-amber-400",
    marker: "marker:text-amber-500",
    quote: "border-amber-300 bg-amber-50/80 text-amber-950",
    tableHead: "bg-amber-50 text-amber-950",
    tableBorder: "border-amber-100",
    tableRow: "border-amber-100",
    tableStripe: "odd:bg-white even:bg-amber-50/35",
    inlineCode: "border-amber-100 bg-amber-50 text-amber-950",
    hr: "via-amber-200",
    imageBg: "bg-amber-50",
  },
};

function getArticleTone(categorySlug?: string): ArticleTone {
  if (
    categorySlug === "blockchain" ||
    categorySlug === "ai" ||
    categorySlug === "infrastructure"
  ) {
    return articleTones[categorySlug];
  }

  return articleTones.blockchain;
}

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

function ArticleLeadFigure({
  image,
  tone,
}: {
  image: ArticleLeadImage;
  tone: ArticleTone;
}) {
  return (
    <figure className="my-10">
      <div
        className={`relative aspect-[16/9] overflow-hidden rounded-lg border border-slate-200 ${tone.imageBg} shadow-sm`}
      >
        <SafeImage
          src={image.src}
          fallbackSrc={image.fallbackSrc}
          alt={image.alt}
          fill
          sizes={imageSizes.articleBody}
          className="object-cover"
        />
      </div>
    </figure>
  );
}

function normalizeCollapsedMarkdownTables(content: string) {
  return content
    .split("\n")
    .map((line) => {
      if (!/\|\s*:?-{3,}:?\s*\|/.test(line)) {
        return line;
      }

      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean);
      const delimiterIndex = cells.findIndex((cell) =>
        /^:?-{3,}:?$/.test(cell)
      );

      if (delimiterIndex < 1) {
        return line;
      }

      let columnCount = 0;
      for (let index = delimiterIndex; index < cells.length; index += 1) {
        if (!/^:?-{3,}:?$/.test(cells[index])) {
          break;
        }

        columnCount += 1;
      }

      if (columnCount < 2 || cells.length % columnCount !== 0) {
        return line;
      }

      const rows: string[] = [];
      for (let index = 0; index < cells.length; index += columnCount) {
        rows.push(`| ${cells.slice(index, index + columnCount).join(" | ")} |`);
      }

      return rows.join("\n");
    })
    .join("\n");
}

function insertLeadImageMarker(content: string, leadImage?: ArticleLeadImage) {
  if (!leadImage) {
    return content;
  }

  const markerBlock = ["", `::${leadImageMarker}::`, ""];
  const lines = content.split("\n");
  const h2Indexes = lines
    .map((line, index) => (/^##\s+\S/.test(line.trim()) ? index : -1))
    .filter((index) => index >= 0);

  if (h2Indexes.length >= 2) {
    lines.splice(h2Indexes[1], 0, ...markerBlock);
    return lines.join("\n");
  }

  if (h2Indexes.length === 1) {
    lines.splice(h2Indexes[0] + 1, 0, ...markerBlock);
    return lines.join("\n");
  }

  const paragraphIndexes: number[] = [];
  let inFence = false;
  let paragraphStart: number | null = null;

  for (let index = 0; index <= lines.length; index += 1) {
    const line = lines[index] ?? "";
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      inFence = !inFence;
    }

    const isParagraphBoundary =
      index === lines.length ||
      trimmed === "" ||
      /^#{1,6}\s+/.test(trimmed) ||
      /^[-*+]\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed) ||
      /^>/.test(trimmed) ||
      /^\|/.test(trimmed) ||
      /^```/.test(trimmed);

    if (!inFence && paragraphStart === null && !isParagraphBoundary) {
      paragraphStart = index;
    }

    if (paragraphStart !== null && isParagraphBoundary) {
      paragraphIndexes.push(index);
      paragraphStart = null;
    }
  }

  const insertIndex = paragraphIndexes[1] ?? paragraphIndexes[0] ?? 0;
  lines.splice(insertIndex, 0, ...markerBlock);
  return lines.join("\n");
}

function prepareArticleContent(content: string, leadImage?: ArticleLeadImage) {
  return insertLeadImageMarker(
    normalizeCollapsedMarkdownTables(content),
    leadImage
  );
}

function createMarkdownComponents(
  leadImage: ArticleLeadImage | undefined,
  tone: ArticleTone
): Components {
  const headingCounts = new Map<string, number>();

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

    return (
      <h2
        id={id}
        className={`scroll-mt-28 mt-12 border-b ${tone.h2Border} pb-3 text-2xl font-semibold tracking-tight text-slate-950 first:mt-0 sm:text-[1.65rem]`}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const id = createHeadingId(flattenText(children), headingCounts);

    return (
      <h3
        id={id}
        className={`relative scroll-mt-28 mt-10 pl-4 text-xl font-semibold tracking-tight text-slate-950 before:absolute before:left-0 before:top-2 before:h-5 before:w-1 before:rounded-full ${tone.h3Accent}`}
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
    flattenText(children).trim() === `::${leadImageMarker}::` && leadImage ? (
      <ArticleLeadFigure image={leadImage} tone={tone} />
    ) : (
      <p className="my-5 leading-8 text-slate-700" {...props}>
        {children}
      </p>
    )
  ),
  a: ({ children, href, ...props }) => {
    const isExternal = isExternalHref(href);

    return (
      <a
        className={`font-medium underline underline-offset-4 transition ${tone.link}`}
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
    <ul className={`my-6 list-disc space-y-2 pl-6 text-slate-700 ${tone.marker}`} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className={`my-6 list-decimal space-y-2 pl-6 text-slate-700 ${tone.marker}`} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-2 leading-8 marker:font-semibold" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className={`my-8 rounded-lg border-l-4 px-5 py-4 shadow-sm sm:px-6 ${tone.quote}`}
      {...props}
    >
      <div className="text-[0.96rem] font-medium leading-8 [&_p]:my-0">
        {children}
      </div>
    </blockquote>
  ),
  hr: ({ ...props }) => (
    <hr
      className={`my-10 border-0 bg-gradient-to-r from-transparent ${tone.hr} to-transparent`}
      style={{ height: 1 }}
      {...props}
    />
  ),
  code: ({ children, className, ...props }) => (
    <code
      className={`rounded-md px-1.5 py-0.5 font-mono text-[0.88em] ${tone.inlineCode} ${className ?? ""}`}
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
      <figure className="my-8">
        <div
          className={`relative aspect-[16/9] overflow-hidden rounded-lg border border-slate-200 ${tone.imageBg} shadow-sm`}
        >
          <SafeImage
            src={getRenderableImageSrc(typeof src === "string" ? src : null, {
              title: alt ?? "BSVgo",
              label: "BSVgo",
              variant: "card",
            })}
            fallbackSrc={fallbackSrc}
            alt={alt ?? ""}
            fill
            sizes={imageSizes.articleBody}
            className="object-cover"
          />
        </div>
        {alt ? (
          <figcaption className="pt-3 text-sm leading-6 text-slate-500">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    );
  },
  table: ({ children, ...props }) => (
    <div
      className={`my-8 overflow-x-auto rounded-lg border ${tone.tableBorder} bg-white shadow-sm`}
    >
      <table className="min-w-[680px] w-full border-collapse text-left text-sm text-slate-700" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead
      className={`sticky top-0 z-10 text-xs uppercase tracking-[0.14em] ${tone.tableHead}`}
      {...props}
    >
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => (
    <tr
      className={`border-b ${tone.tableRow} ${tone.tableStripe} last:border-0`}
      {...props}
    >
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="whitespace-nowrap px-4 py-3 font-semibold" {...props}>
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
  categorySlug,
}: {
  content: string;
  leadImage?: ArticleLeadImage;
  categorySlug?: string;
}) {
  const preparedContent = prepareArticleContent(content, leadImage);
  const tone = getArticleTone(categorySlug);

  return (
    <div className="mx-auto max-w-[72ch] text-[17px] leading-8 text-slate-700 prose prose-slate prose-lg prose-headings:tracking-tight prose-headings:text-slate-950 prose-p:leading-8 prose-img:rounded-lg prose-img:shadow-sm">
      <ReactMarkdown
        components={createMarkdownComponents(leadImage, tone)}
        remarkPlugins={[remarkGfm]}
      >
        {preparedContent}
      </ReactMarkdown>
    </div>
  );
}
