import { Locale } from "./i18n";

export const categorySlugs = ["blockchain", "ai", "infrastructure"] as const;
export type CategorySlug = (typeof categorySlugs)[number];

export function isCategorySlug(slug: string): slug is CategorySlug {
  return categorySlugs.includes(slug as CategorySlug);
}

export function slugifyTag(tag: string) {
  const slug = tag
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/(^-|-$)/g, "");

  return slug || encodeURIComponent(tag.trim()).toLowerCase();
}

export function tagToReference(tag: string) {
  return {
    slug: slugifyTag(tag),
    name: tag,
  };
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getAllTagNames() {
  return [...new Set(posts.flatMap((post) => post.tags))];
}

export function getAllTagSlugs() {
  return getAllTagNames().map((tag) => slugifyTag(tag));
}

export type CategoryContent = {
  slug: CategorySlug;
  translations: Record<
    Locale,
    {
      name: string;
      description: string;
    }
  >;
};

export type PostContent = {
  slug: string;
  categorySlug: CategorySlug;
  featured: boolean;
  coverImage: string;
  tags: string[];
  publishedAt: string;
  translations: Record<
    Locale,
    {
      title: string;
      excerpt: string;
      content: string;
      readingMinutes: number;
      seoTitle: string;
      seoDescription: string;
    }
  >;
};

export const categories: CategoryContent[] = [
  {
    slug: "blockchain",
    translations: {
      en: {
        name: "Blockchain",
        description: "On-chain architecture, token design, and ecosystem moves.",
      },
      zh: {
        name: "区块链",
        description: "链上架构、代币设计与生态变化。",
      },
    },
  },
  {
    slug: "ai",
    translations: {
      en: {
        name: "AI",
        description: "Model workflows, applied AI, and the tools that ship.",
      },
      zh: {
        name: "人工智能",
        description: "模型工作流、AI 应用与落地工具。",
      },
    },
  },
  {
    slug: "infrastructure",
    translations: {
      en: {
        name: "Infrastructure",
        description: "Servers, home IP, proxies, and the developer stack.",
      },
      zh: {
        name: "基础设施",
        description: "服务器、家宽 IP、代理与开发者栈。",
      },
    },
  },
];

const englishLongform = [
  "This issue examines how builder-oriented products keep momentum when the stack is changing fast.",
  "The emphasis is practical: what to deploy, what to monitor, and where teams can keep a clean operating surface.",
  "For BSVgo, the goal is not to narrate the industry from a distance. It is to ship a useful lens for people who build across blockchain, AI, and infrastructure.",
].join(" ");

const chineseLongform = [
  "这篇文章关注的是，在技术栈快速变化时，面向建设者的产品如何保持持续推进。",
  "重点是可执行的实践：该部署什么、该监控什么，以及团队如何维持清晰的操作面。",
  "对于 BSVgo 来说，目标不是从远处描述行业，而是为同时关注区块链、AI 与基础设施的开发者提供一个实用视角。",
].join("");

export const posts: PostContent[] = [
  {
    slug: "chain-state-and-builder-momentum",
    categorySlug: "blockchain",
    featured: true,
    coverImage:
      "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1600&q=80",
    tags: ["BSV", "On-chain data", "Builders"],
    publishedAt: "2026-05-01T09:00:00.000Z",
    translations: {
      en: {
        title: "Chain State and Builder Momentum",
        excerpt:
          "A practical view of how blockchain projects stay useful when attention moves quickly.",
        content: englishLongform,
        readingMinutes: 6,
        seoTitle: "Chain State and Builder Momentum | BSVgo",
        seoDescription:
          "A practical blockchain article about project momentum, infrastructure, and design choices.",
      },
      zh: {
        title: "链上状态与建设者动能",
        excerpt: "在注意力快速迁移时，区块链项目如何保持实用性。",
        content: chineseLongform,
        readingMinutes: 6,
        seoTitle: "链上状态与建设者动能 | BSVgo",
        seoDescription: "一篇关于区块链项目动能、基础设施与设计选择的实践文章。",
      },
    },
  },
  {
    slug: "why-bsv-still-matters-for-long-term-settlement",
    categorySlug: "blockchain",
    featured: false,
    coverImage:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1600&q=80",
    tags: ["BSV", "Settlement", "Data permanence"],
    publishedAt: "2026-04-30T09:00:00.000Z",
    translations: {
      en: {
        title: "Why BSV Still Matters for Long-Term Settlement",
        excerpt:
          "A compact note on settlement design, data permanence, and why builders keep looking at BSV.",
        content: [
          "BSV keeps showing up in discussions about settlement because it pushes on a simple question: what happens when applications need a durable base layer instead of a short-lived demo chain?",
          "For builder teams, the point is not ideology. It is whether the network gives them a predictable surface for value transfer, records, and system integration.",
          "That is why BSVgo treats BSV as part of the long-term infrastructure conversation rather than a passing headline.",
        ].join(" "),
        readingMinutes: 5,
        seoTitle: "Why BSV Still Matters for Long-Term Settlement | BSVgo",
        seoDescription:
          "A short blockchain article on settlement, permanence, and why BSV remains relevant for builders.",
      },
      zh: {
        title: "为什么 BSV 仍然值得关注",
        excerpt: "关于结算设计、数据持久性，以及为什么建设者仍在关注 BSV。",
        content: [
          "BSV 经常出现在结算相关讨论中，因为它回答的是一个很实际的问题：当应用需要的是一个长期稳定的底层，而不是短命的演示链时，会发生什么？",
          "对于建设者来说，关键并不是立场，而是网络是否能为价值传递、记录和系统集成提供可预测的表面。",
          "这也是为什么 BSVgo 会把 BSV 视为长期基础设施讨论的一部分，而不是短暂的新闻热点。",
        ].join(""),
        readingMinutes: 5,
        seoTitle: "为什么 BSV 仍然值得关注 | BSVgo",
        seoDescription: "一篇关于结算、持久性与 BSV 价值的简短区块链文章。",
      },
    },
  },
  {
    slug: "shipping-ai-with-clear-operational-boundaries",
    categorySlug: "ai",
    featured: true,
    coverImage:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
    tags: ["AI operations", "Guardrails", "Workflow"],
    publishedAt: "2026-04-24T09:00:00.000Z",
    translations: {
      en: {
        title: "Shipping AI With Clear Operational Boundaries",
        excerpt:
          "Good AI teams define what gets automated, what stays manual, and what needs guardrails.",
        content: englishLongform,
        readingMinutes: 7,
        seoTitle: "Shipping AI With Clear Operational Boundaries | BSVgo",
        seoDescription:
          "Applied AI guidance on deployment boundaries, team workflows, and operational discipline.",
      },
      zh: {
        title: "在清晰边界下交付 AI",
        excerpt: "好的 AI 团队会定义哪些自动化、哪些保留人工、哪些需要护栏。",
        content: chineseLongform,
        readingMinutes: 7,
        seoTitle: "在清晰边界下交付 AI | BSVgo",
        seoDescription: "关于部署边界、团队工作流与运营纪律的 AI 实践文章。",
      },
    },
  },
  {
    slug: "choosing-the-right-servers-for-ai-workloads",
    categorySlug: "infrastructure",
    featured: false,
    coverImage:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80",
    tags: ["AI servers", "Inference", "GPU"],
    publishedAt: "2026-04-15T09:00:00.000Z",
    translations: {
      en: {
        title: "Choosing the Right Servers for AI Workloads",
        excerpt:
          "A practical checklist for selecting machines that can carry real AI work instead of benchmark theater.",
        content: [
          "AI infrastructure gets expensive when people pick hardware by habit instead of workload shape.",
          "For training, inference, and automation pipelines, the useful question is always the same: what latency, memory, and throughput profile do you actually need?",
          "A good stack starts with the workload, then maps to instances, network access, storage, and rotation strategy.",
        ].join(" "),
        readingMinutes: 6,
        seoTitle: "Choosing the Right Servers for AI Workloads | BSVgo",
        seoDescription:
          "A practical infrastructure guide for choosing servers for AI workflows, training, and inference.",
      },
      zh: {
        title: "如何为 AI 工作负载选择服务器",
        excerpt: "一份面向真实 AI 工作而不是跑分表演的选型清单。",
        content: [
          "当人们不是按工作负载来挑硬件，而是按习惯来挑时，AI 基础设施就会变得昂贵。",
          "无论是训练、推理还是自动化流水线，真正有价值的问题始终是一样的：你到底需要什么样的延迟、内存和吞吐量？",
          "一个好的栈要先从工作负载出发，再映射到实例、网络访问、存储和轮换策略。",
        ].join(""),
        readingMinutes: 6,
        seoTitle: "如何为 AI 工作负载选择服务器 | BSVgo",
        seoDescription: "面向 AI 工作流、训练与推理的服务器选型实践文章。",
      },
    },
  },
  {
    slug: "infrastructure-for-ai-builders",
    categorySlug: "infrastructure",
    featured: false,
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
    tags: ["Servers", "Home IP", "Proxies"],
    publishedAt: "2026-04-18T09:00:00.000Z",
    translations: {
      en: {
        title: "Infrastructure for AI Builders",
        excerpt:
          "Servers, home IP, and proxy choices that matter when AI work becomes operational.",
        content: englishLongform,
        readingMinutes: 8,
        seoTitle: "Infrastructure for AI Builders | BSVgo",
        seoDescription:
          "A practical infrastructure article for developers working with AI, servers, home IP, and proxies.",
      },
      zh: {
        title: "面向 AI 建设者的基础设施",
        excerpt: "当 AI 工作进入实操阶段，服务器、家宽 IP 与代理选择都变得重要。",
        content: chineseLongform,
        readingMinutes: 8,
        seoTitle: "面向 AI 建设者的基础设施 | BSVgo",
        seoDescription: "面向 AI 开发者的基础设施实践文章，涵盖服务器、家宽 IP 与代理。",
      },
    },
  },
  {
    slug: "home-ip-and-proxy-patterns-for-applied-ai",
    categorySlug: "infrastructure",
    featured: false,
    coverImage:
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1600&q=80",
    tags: ["Home IP", "Residential proxy", "Automation"],
    publishedAt: "2026-04-10T09:00:00.000Z",
    translations: {
      en: {
        title: "Home IP and Proxy Patterns for Applied AI",
        excerpt:
          "How builders think about home IP, residential routes, and safe proxy use in AI-heavy workflows.",
        content: [
          "When workflows touch scraping, browser automation, or model-facing services, network identity matters almost as much as compute.",
          "Home IP and proxy patterns are not about hiding bad behavior. They are about making access patterns stable, compliant, and less fragile.",
          "Teams that treat networking as a first-class concern usually ship with fewer surprises.",
        ].join(" "),
        readingMinutes: 6,
        seoTitle: "Home IP and Proxy Patterns for Applied AI | BSVgo",
        seoDescription:
          "A practical guide to home IP, residential routing, and proxy usage for AI workflows.",
      },
      zh: {
        title: "家宽 IP 与代理在 AI 场景中的用法",
        excerpt: "关于家宽 IP、住宅线路与安全代理使用的实战思路。",
        content: [
          "当工作流涉及爬取、浏览器自动化或面向模型的服务时，网络身份的重要性几乎不亚于算力本身。",
          "家宽 IP 和代理模式不是为了掩盖不当行为，而是为了让访问模式更稳定、更合规，也更不容易出问题。",
          "把网络当作一等公民来对待的团队，通常更少踩坑。",
        ].join(""),
        readingMinutes: 6,
        seoTitle: "家宽 IP 与代理在 AI 场景中的用法 | BSVgo",
        seoDescription: "面向 AI 工作流的家宽 IP、住宅线路与代理实践指南。",
      },
    },
  },
];
