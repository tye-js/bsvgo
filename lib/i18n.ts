export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "中文",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://bsvgo.com";

export const siteConfig = {
  name: "BSVgo",
  url: siteUrl,
  description:
    "BSVgo is a multilingual tech blog about blockchain, AI, and infrastructure.",
};

export const uiCopy: Record<
  Locale,
  {
    navHome: string;
    navLatest: string;
    navArchive: string;
    navAbout: string;
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
    archiveKicker: string;
    archiveTitle: string;
    archiveDescription: string;
    archiveSearchLabel: string;
    archiveSearchPlaceholder: string;
    archiveCategoryLabel: string;
    archiveAllCategories: string;
    archiveTagLabel: string;
    archiveAllTags: string;
    archiveSubmit: string;
    archiveClear: string;
    archiveResults: string;
    archiveEmptyTitle: string;
    archiveEmptyDescription: string;
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
    aboutTitle: string;
    aboutDescription: string;
    aboutKicker: string;
    aboutMissionTitle: string;
    aboutMissionBody: string;
    aboutBsvTitle: string;
    aboutBsvBody: string;
    aboutPrinciplesTitle: string;
    aboutPrinciples: string[];
    aboutContactTitle: string;
    aboutContactBody: string;
  }
> = {
  en: {
    navHome: "Home",
    navLatest: "Latest",
    navArchive: "Archive",
    navAbout: "About",
    heroKicker: "BSVgo / Blockchain, AI, Infrastructure",
    heroTitle: "Understand AI, blockchain, and the infrastructure to build with both.",
    heroDescription:
      "BSVgo explains blockchain technology, AI development, and the servers, domains, and network tools builders need to participate in the next wave.",
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
    archiveKicker: "Archive",
    archiveTitle: "Search the BSVgo archive",
    archiveDescription:
      "Browse published posts by keyword, category, and tag across blockchain, AI, and infrastructure.",
    archiveSearchLabel: "Search",
    archiveSearchPlaceholder: "Title, summary, tag...",
    archiveCategoryLabel: "Category",
    archiveAllCategories: "All categories",
    archiveTagLabel: "Tag",
    archiveAllTags: "All tags",
    archiveSubmit: "Search",
    archiveClear: "Clear filters",
    archiveResults: "results",
    archiveEmptyTitle: "No matching articles.",
    archiveEmptyDescription:
      "Try a broader keyword, remove a category filter, or browse the latest posts from the archive.",
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
    aboutTitle: "About BSVgo",
    aboutDescription:
      "BSVgo is a technology blog about blockchain, AI, and infrastructure for readers who want to understand the stack and take part in building it.",
    aboutKicker: "About / AI needs accountable infrastructure",
    aboutMissionTitle: "Why this site exists",
    aboutMissionBody:
      "AI can multiply efficiency and create new value, but it also needs better provenance, ownership, and distribution mechanisms. BSVgo connects AI news, blockchain technology, and infrastructure recommendations so readers can understand both the opportunity and the practical path to participate.",
    aboutBsvTitle: "Why BSV matters",
    aboutBsvBody:
      "The thesis behind BSVgo is that blockchain can help AI trace data origins, establish rights, and distribute value back to the people and systems that create useful data. BSV is central to that view because high throughput, low fees, compliance-oriented design, and micropayments make it suitable for frequent AI-era transactions.",
    aboutPrinciplesTitle: "Editorial principles",
    aboutPrinciples: [
      "Explain blockchain technology in a way builders and operators can use.",
      "Track the current state of AI with attention to real productivity gains.",
      "Recommend practical infrastructure: servers, domains, network access, and operational tools.",
    ],
    aboutContactTitle: "Contact",
    aboutContactBody:
      "For topic suggestions, partnerships, or corrections, reach the BSVgo team at hello@bsvgo.com.",
  },
  zh: {
    navHome: "首页",
    navLatest: "最新",
    navArchive: "归档",
    navAbout: "关于我们",
    heroKicker: "BSVgo / 区块链、AI、基础设施",
    heroTitle: "理解 AI、区块链，以及参与建设所需的基础设施。",
    heroDescription:
      "BSVgo 发布区块链技术文章、AI 资讯文章和服务器、域名、网络工具等基础设施推荐，帮助读者理解趋势并参与开发运营。",
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
    archiveKicker: "文章归档",
    archiveTitle: "搜索 BSVgo 文章",
    archiveDescription:
      "按关键词、分类和标签浏览已发布文章，覆盖区块链、AI 与基础设施。",
    archiveSearchLabel: "搜索",
    archiveSearchPlaceholder: "标题、摘要、标签...",
    archiveCategoryLabel: "分类",
    archiveAllCategories: "全部分类",
    archiveTagLabel: "标签",
    archiveAllTags: "全部标签",
    archiveSubmit: "搜索",
    archiveClear: "清空筛选",
    archiveResults: "条结果",
    archiveEmptyTitle: "没有匹配的文章。",
    archiveEmptyDescription:
      "可以换一个更宽泛的关键词，或移除分类、标签筛选后再查看。",
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
    aboutTitle: "关于 BSVgo",
    aboutDescription:
      "BSVgo 是一个关于区块链、AI 与基础设施的网站，帮助读者理解技术栈，也帮助想参与建设的人找到实践入口。",
    aboutKicker: "关于 / AI 需要可追溯的基础设施",
    aboutMissionTitle: "为什么做这个网站",
    aboutMissionBody:
      "AI 能成倍提高效率，也会带来成倍的收益。但新的价值如果没有清晰的溯源、确权和分配机制，就很难让每个数据制造者和参与者真正受益。BSVgo 把 AI 资讯、区块链技术和基础设施推荐放在一起，帮助读者理解机会，也理解如何参与开发和运营。",
    aboutBsvTitle: "为什么选择 BSV",
    aboutBsvBody:
      "博主认为，AI 需要引入区块链技术来做数据溯源、权利确认和收益分配。区块链可以优化分配，让参与其中的数据制造者获得收益。BSV 的高频交易、低手续费、合规取向和微支付能力，正适合 AI 时代大量、高频、低成本的价值流转。",
    aboutPrinciplesTitle: "内容原则",
    aboutPrinciples: [
      "用建设者能理解的方式解释区块链技术。",
      "持续跟踪 AI 当前的发展状态和真实效率提升。",
      "推荐开发运营会用到的基础设施：服务器、域名、网络访问和工具。",
    ],
    aboutContactTitle: "联系",
    aboutContactBody:
      "如果有选题建议、合作需求或内容更正，可以通过 hello@bsvgo.com 联系 BSVgo 团队。",
  },
};
