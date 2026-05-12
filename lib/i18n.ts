export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

export const siteConfig = {
  name: "BSVgo",
  url: "https://bsvgo.com",
  description:
    "BSVgo is a multilingual tech blog about blockchain, AI, and infrastructure.",
};

export const uiCopy: Record<
  Locale,
  {
    navHome: string;
    navLatest: string;
    heroKicker: string;
    heroTitle: string;
    heroDescription: string;
    heroPrimary: string;
    heroSecondary: string;
    latestTitle: string;
    latestDescription: string;
    sectionTitle: string;
    sectionDescription: string;
    relatedTitle: string;
    tagArchiveTitle: string;
    tagCountLabel: string;
    readMore: string;
    publishedOn: string;
    readingTime: string;
    backToHome: string;
    previousPost: string;
    nextPost: string;
  }
> = {
  en: {
    navHome: "Home",
    navLatest: "Latest",
    heroKicker: "BSVgo / Blockchain, AI, Infrastructure",
    heroTitle: "A forward-moving blog for the next wave of builders.",
    heroDescription:
      "English-first stories with Chinese support for readers tracking blockchain, AI systems, and the infrastructure behind them.",
    heroPrimary: "Read latest posts",
    heroSecondary: "Explore Infrastructure",
    latestTitle: "Latest articles",
    latestDescription:
      "Practical notes on chain design, AI workflows, and the infrastructure developers rely on.",
    sectionTitle: "Featured article",
    sectionDescription:
      "A highlighted read that reflects the site’s current direction.",
    relatedTitle: "Recommended articles",
    tagArchiveTitle: "Tag archive",
    tagCountLabel: "articles",
    readMore: "Read more",
    publishedOn: "Published",
    readingTime: "min read",
    backToHome: "Back to home",
    previousPost: "Previous",
    nextPost: "Next",
  },
  zh: {
    navHome: "首页",
    navLatest: "最新",
    heroKicker: "BSVgo / Blockchain, AI, Infrastructure",
    heroTitle: "面向下一波建设者的前进型博客。",
    heroDescription:
      "以 English 为主，支持中文切换，持续关注区块链、AI 系统以及支撑它们运行的基础设施。",
    heroPrimary: "查看最新文章",
    heroSecondary: "浏览基础设施",
    latestTitle: "最新文章",
    latestDescription: "围绕链上设计、AI 工作流与开发者基础设施的实践内容。",
    sectionTitle: "精选文章",
    sectionDescription: "代表站点当前方向的一篇重点阅读内容。",
    relatedTitle: "推荐文章",
    tagArchiveTitle: "标签归档",
    tagCountLabel: "篇文章",
    readMore: "阅读全文",
    publishedOn: "发布于",
    readingTime: "分钟阅读",
    backToHome: "返回首页",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
};
