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
    featuredKicker: string;
    viewAll: string;
    sectionTitle: string;
    sectionDescription: string;
    popularTitle: string;
    popularDescription: string;
    latestTitle: string;
    latestDescription: string;
    categoryFeaturedTitle: string;
    categoryArchiveTitle: string;
    categoryArchiveDescription: string;
    relatedTitle: string;
    tagArchiveTitle: string;
    tagCountLabel: string;
    readMore: string;
    publishedOn: string;
    readingTime: string;
    backToHome: string;
    previousPost: string;
    nextPost: string;
    notFoundKicker: string;
    notFoundTitle: string;
    notFoundDescription: string;
    notFoundHint: string;
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
    heroSecondary: "Browse by topic",
    featuredKicker: "Latest read",
    viewAll: "View all",
    sectionTitle: "By topic",
    sectionDescription: "Each major topic gets its own lane.",
    popularTitle: "Popular articles",
    popularDescription:
      "Promoted builder reads across infrastructure, AI workflows, and blockchain services.",
    latestTitle: "Latest articles",
    latestDescription:
      "Recent notes across blockchain, AI, and infrastructure, kept in a clean reading order.",
    categoryFeaturedTitle: "Featured in this category",
    categoryArchiveTitle: "More in this category",
    categoryArchiveDescription:
      "The strongest recent posts from the same topic, ordered by freshness.",
    relatedTitle: "Recommended articles",
    tagArchiveTitle: "Tag archive",
    tagCountLabel: "articles",
    readMore: "Read more",
    publishedOn: "Published",
    readingTime: "min read",
    backToHome: "Back to home",
    previousPost: "Previous",
    nextPost: "Next",
    notFoundKicker: "404 / Route not found",
    notFoundTitle: "This page is off the current route.",
    notFoundDescription:
      "The article, category, or tag may have moved, or the address may be incomplete.",
    notFoundHint:
      "Return to the latest posts or use the navigation to continue exploring blockchain, AI, and infrastructure notes.",
  },
  zh: {
    navHome: "首页",
    navLatest: "最新",
    heroKicker: "BSVgo / Blockchain, AI, Infrastructure",
    heroTitle: "面向下一波建设者的前进型博客。",
    heroDescription:
      "以 English 为主，支持中文切换，持续关注区块链、AI 系统以及支撑它们运行的基础设施。",
    heroPrimary: "查看最新文章",
    heroSecondary: "按主题浏览",
    featuredKicker: "最新阅读",
    viewAll: "查看全部",
    sectionTitle: "按主题",
    sectionDescription: "每个大类都单独成栏，方便快速扫描。",
    popularTitle: "热门文章",
    popularDescription: "面向建设者的推广内容，聚焦基础设施、AI 工作流与区块链服务。",
    latestTitle: "最新文章",
    latestDescription: "围绕区块链、AI 与基础设施的近期内容，按清晰顺序排列。",
    categoryFeaturedTitle: "本分类精选",
    categoryArchiveTitle: "本分类更多文章",
    categoryArchiveDescription: "同一主题下最新、最值得读的文章，按时间排序。",
    relatedTitle: "推荐文章",
    tagArchiveTitle: "标签归档",
    tagCountLabel: "篇文章",
    readMore: "阅读全文",
    publishedOn: "发布于",
    readingTime: "分钟阅读",
    backToHome: "返回首页",
    previousPost: "上一篇",
    nextPost: "下一篇",
    notFoundKicker: "404 / 页面不存在",
    notFoundTitle: "这个页面暂时无法抵达。",
    notFoundDescription: "文章、分类或标签可能已经移动，也可能是链接地址不完整。",
    notFoundHint: "你可以返回最新文章，或通过导航继续浏览区块链、AI 与基础设施内容。",
  },
};
