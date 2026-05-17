import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Blocks,
  Flame,
  Newspaper,
  ServerCog,
} from "lucide-react";
import { getLocalizedCategories, getLocalizedPosts } from "@/lib/blog";
import { slugifyTag, type CategorySlug } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Locale, uiCopy } from "@/lib/i18n";

const sectionIcons = {
  blockchain: Blocks,
  ai: Brain,
  infrastructure: ServerCog,
} as const;

const topicStyles = {
  blockchain: {
    section: "bg-white",
    eyebrow: "text-emerald-700",
    icon: "bg-emerald-100 text-emerald-800",
    accent: "bg-emerald-200",
    card: "bg-[rgb(247,250,249)]",
    border: "border-emerald-900/10",
  },
  ai: {
    section: "bg-[rgb(240,249,255)]",
    eyebrow: "text-cyan-700",
    icon: "bg-cyan-100 text-cyan-800",
    accent: "bg-cyan-200",
    card: "bg-white/86",
    border: "border-cyan-900/10",
  },
  infrastructure: {
    section: "bg-[rgb(247,254,231)]",
    eyebrow: "text-lime-800",
    icon: "bg-lime-100 text-lime-800",
    accent: "bg-lime-200",
    card: "bg-white/86",
    border: "border-lime-900/10",
  },
} as const;

type ShowcaseArticle = {
  title: string;
  excerpt: string;
  image: string;
  publishedAt: string;
  tags: string[];
};

const topicShowcaseArticles = {
  en: {
    blockchain: [
      {
        title: "Settlement Layers for App Builders",
        excerpt:
          "How product teams compare permanence, fees, and integration cost before picking a chain surface.",
        image:
          "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-12T09:00:00.000Z",
        tags: ["Settlement", "Builders"],
      },
      {
        title: "Token Utility Without Dashboard Theater",
        excerpt:
          "A practical look at token design that starts with workflows instead of speculative interface noise.",
        image:
          "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-09T09:00:00.000Z",
        tags: ["Tokens", "Product"],
      },
      {
        title: "Readable Chain Data for Operators",
        excerpt:
          "Why explorer data, event streams, and product metrics need one shared language for teams.",
        image:
          "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-06T09:00:00.000Z",
        tags: ["Data", "Operations"],
      },
      {
        title: "BSV Notes for Long-Term Records",
        excerpt:
          "Where durable records, small payments, and application traces still matter for builders.",
        image:
          "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-03T09:00:00.000Z",
        tags: ["BSV", "Records"],
      },
      {
        title: "Wallet UX for Infrastructure Products",
        excerpt:
          "The wallet patterns that keep onboarding clear when blockchain is only one layer of the product.",
        image:
          "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-04-29T09:00:00.000Z",
        tags: ["Wallets", "UX"],
      },
    ],
    ai: [
      {
        title: "AI Guardrails That Survive Launch Week",
        excerpt:
          "Production AI needs boring controls: clear fallbacks, review paths, and incident-ready prompts.",
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-13T09:00:00.000Z",
        tags: ["Guardrails", "Launch"],
      },
      {
        title: "Model Routing for Lean Teams",
        excerpt:
          "How small teams decide when to use fast models, deep reasoning, retrieval, and human review.",
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-10T09:00:00.000Z",
        tags: ["Models", "Workflow"],
      },
      {
        title: "Prompt Systems as Product Surface",
        excerpt:
          "Prompts become operational assets when teams version, test, and observe them like code.",
        image:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-07T09:00:00.000Z",
        tags: ["Prompts", "Testing"],
      },
      {
        title: "Human Handoffs in AI Support Flows",
        excerpt:
          "The highest-value automation often depends on knowing exactly when a person should take over.",
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-04T09:00:00.000Z",
        tags: ["Support", "Operations"],
      },
      {
        title: "Evaluation Sets Before New Features",
        excerpt:
          "A lightweight testing habit can catch drift before model updates quietly change product behavior.",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-04-28T09:00:00.000Z",
        tags: ["Evaluation", "QA"],
      },
    ],
    infrastructure: [
      {
        title: "Choosing Servers by Workload Shape",
        excerpt:
          "The useful server shortlist starts with latency, memory, throughput, and deployment rhythm.",
        image:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-11T09:00:00.000Z",
        tags: ["Servers", "Capacity"],
      },
      {
        title: "Home IP Patterns for Stable Access",
        excerpt:
          "Residential routes become infrastructure when browser workflows need durable identity.",
        image:
          "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-08T09:00:00.000Z",
        tags: ["Home IP", "Network"],
      },
      {
        title: "Proxy Hygiene for Automation Teams",
        excerpt:
          "Clean routing, rotation discipline, and observability matter more than raw proxy volume.",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-05T09:00:00.000Z",
        tags: ["Proxies", "Automation"],
      },
      {
        title: "Observability for Builder Infrastructure",
        excerpt:
          "Logs, traces, and cost signals should tell the same story before a system becomes expensive.",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-02T09:00:00.000Z",
        tags: ["Monitoring", "Cost"],
      },
      {
        title: "Deployment Checklists for Small Teams",
        excerpt:
          "Simple release routines keep projects moving without turning infrastructure into a second product.",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-04-27T09:00:00.000Z",
        tags: ["Deploy", "Ops"],
      },
    ],
  },
  zh: {
    blockchain: [
      {
        title: "面向应用建设者的结算层选择",
        excerpt: "产品团队如何在选链前比较持久性、费用与集成成本。",
        image:
          "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-12T09:00:00.000Z",
        tags: ["结算", "建设者"],
      },
      {
        title: "不依赖噱头界面的代币效用",
        excerpt: "从真实工作流出发，而不是从投机界面出发设计 token。",
        image:
          "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-09T09:00:00.000Z",
        tags: ["代币", "产品"],
      },
      {
        title: "给运营团队看的链上数据",
        excerpt: "浏览器数据、事件流与产品指标需要用同一种语言表达。",
        image:
          "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-06T09:00:00.000Z",
        tags: ["数据", "运营"],
      },
      {
        title: "面向长期记录的 BSV 观察",
        excerpt: "持久记录、小额支付与应用轨迹在哪些场景仍然重要。",
        image:
          "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-03T09:00:00.000Z",
        tags: ["BSV", "记录"],
      },
      {
        title: "基础设施产品里的钱包体验",
        excerpt: "当区块链只是产品一层时，钱包体验应该如何降低上手成本。",
        image:
          "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-04-29T09:00:00.000Z",
        tags: ["钱包", "体验"],
      },
    ],
    ai: [
      {
        title: "能撑过上线周的 AI 护栏",
        excerpt: "生产环境里的 AI 更需要清晰回退、审核路径与可处理事故的提示词。",
        image:
          "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-13T09:00:00.000Z",
        tags: ["护栏", "上线"],
      },
      {
        title: "精简团队的模型路由策略",
        excerpt: "小团队如何选择快速模型、深度推理、检索增强与人工审核。",
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-10T09:00:00.000Z",
        tags: ["模型", "工作流"],
      },
      {
        title: "把提示词系统当作产品表面",
        excerpt: "当团队像管理代码一样版本化、测试与观察提示词时，它才成为运营资产。",
        image:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-07T09:00:00.000Z",
        tags: ["提示词", "测试"],
      },
      {
        title: "AI 客服流程里的人工交接",
        excerpt: "最有价值的自动化，往往取决于能否准确知道什么时候交给人。",
        image:
          "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-04T09:00:00.000Z",
        tags: ["客服", "运营"],
      },
      {
        title: "新功能之前先准备评测集",
        excerpt: "轻量测试习惯可以在模型更新悄悄改变产品行为前发现问题。",
        image:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-04-28T09:00:00.000Z",
        tags: ["评测", "质量"],
      },
    ],
    infrastructure: [
      {
        title: "按工作负载形态选择服务器",
        excerpt: "真正有用的服务器清单，从延迟、内存、吞吐与部署节奏开始。",
        image:
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-11T09:00:00.000Z",
        tags: ["服务器", "容量"],
      },
      {
        title: "稳定访问所需的家宽 IP 模式",
        excerpt: "当浏览器工作流需要稳定身份时，住宅线路就变成了基础设施。",
        image:
          "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-08T09:00:00.000Z",
        tags: ["家宽 IP", "网络"],
      },
      {
        title: "自动化团队的代理卫生",
        excerpt: "清晰路由、轮换纪律与可观测性，比单纯的代理数量更重要。",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-05T09:00:00.000Z",
        tags: ["代理", "自动化"],
      },
      {
        title: "建设者基础设施的可观测性",
        excerpt: "日志、链路追踪与成本信号应该在系统变贵之前讲同一个故事。",
        image:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-05-02T09:00:00.000Z",
        tags: ["监控", "成本"],
      },
      {
        title: "小团队的部署检查清单",
        excerpt: "简单发布流程能让项目持续前进，而不是让基础设施变成第二个产品。",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
        publishedAt: "2026-04-27T09:00:00.000Z",
        tags: ["部署", "运维"],
      },
    ],
  },
} satisfies Record<Locale, Record<CategorySlug, ShowcaseArticle[]>>;

const promotedArticles = {
  en: [
    {
      title: "Dedicated AI Servers for Lean Builder Teams",
      sponsor: "Compute partner",
      category: "Infrastructure",
      description:
        "GPU-ready machines, clean network access, and predictable monthly capacity for teams shipping model-backed products.",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Residential IP Access for Browser Automation",
      sponsor: "Network partner",
      category: "Infrastructure",
      description:
        "Stable routes for compliant testing, data collection, and AI-assisted workflows that depend on realistic network identity.",
      image:
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "AI Workflow Audits Before You Scale",
      sponsor: "AI operations",
      category: "AI",
      description:
        "A focused review of prompts, guardrails, and handoff points before automation turns into production pressure.",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "On-chain Data APIs for Product Teams",
      sponsor: "Data partner",
      category: "Blockchain",
      description:
        "Readable endpoints for explorers, dashboards, and settlement-aware products that need dependable chain context.",
      image:
        "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Launch Support for Builder-Focused Campaigns",
      sponsor: "BSVgo media",
      category: "Sponsored",
      description:
        "Editorial packages for infrastructure, AI, and blockchain products that need a practical builder audience.",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  zh: [
    {
      title: "面向精简团队的 AI 专用服务器",
      sponsor: "算力合作",
      category: "基础设施",
      description:
        "支持 GPU 的机器、清晰的网络访问与可预测月度容量，适合正在交付模型产品的团队。",
      image:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "浏览器自动化所需的住宅 IP 接入",
      sponsor: "网络合作",
      category: "基础设施",
      description:
        "面向合规测试、数据采集与 AI 辅助工作流的稳定线路，帮助团队保持真实网络身份。",
      image:
        "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "规模化之前的 AI 工作流审计",
      sponsor: "AI 运营",
      category: "人工智能",
      description:
        "在自动化进入生产压力之前，集中检查提示词、护栏与人工交接点。",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "面向产品团队的链上数据 API",
      sponsor: "数据合作",
      category: "区块链",
      description:
        "为浏览器、看板与结算相关产品提供清晰接口，让链上上下文更稳定可用。",
      image:
        "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "面向建设者产品的发布推广支持",
      sponsor: "BSVgo 媒体",
      category: "推广",
      description:
        "为基础设施、AI 与区块链产品提供编辑型推广方案，触达更实用的建设者读者。",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    },
  ],
} satisfies Record<
  Locale,
  {
    title: string;
    sponsor: string;
    category: string;
    description: string;
    image: string;
  }[]
>;

export async function HomePage({ locale }: { locale: Locale }) {
  const copy = uiCopy[locale];
  const [categories, posts] = await Promise.all([
    getLocalizedCategories(locale),
    getLocalizedPosts(locale),
  ]);

  const featured = posts.find((post) => post.featured) ?? posts[0] ?? null;
  const latestPosts = posts.slice(0, 5);
  const promotions = promotedArticles[locale].slice(0, 4);

  return (
    <main className="bg-[rgb(249,251,250)] text-slate-900">
      <section className="relative isolate overflow-hidden border-b border-emerald-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(250,252,255,0.96))]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.78fr)] lg:items-end lg:py-14">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              {copy.heroKicker}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-tight text-slate-950 md:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
              {copy.heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/${locale}#latest`}
                className="inline-flex items-center justify-center rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-900 transition hover:bg-emerald-100"
              >
                {copy.heroPrimary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/category/blockchain`}
                className="inline-flex items-center justify-center rounded-md border border-teal-900/15 bg-white/70 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white"
              >
                {copy.heroSecondary}
              </Link>
            </div>
          </div>

          {featured ? (
            <aside className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm">
              <Link href={`/${locale}/posts/${featured.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                  <img
                    src={featured.coverImage}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.78)_0%,rgba(2,6,23,0.28)_42%,rgba(2,6,23,0.05)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="rounded-lg bg-slate-950/72 px-4 py-4 text-white backdrop-blur-md">
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          {copy.featuredKicker}
                        </span>
                        <span className="rounded-md bg-emerald-200 px-3 py-1.5 text-xs font-semibold text-slate-950">
                          {featured.categoryName}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl font-bold leading-tight text-white">
                        {featured.title}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-100/90">
                        {featured.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="border-b border-emerald-900/10 bg-white py-8">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-[24px_auto_minmax(0,1fr)] items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-emerald-100 text-emerald-800">
              <Flame className="h-3 w-3" />
            </div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-950">
              {copy.popularTitle}
            </h2>
            <p className="min-w-0 truncate text-xs leading-5 text-slate-500">
              {copy.popularDescription}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {promotions.map((article) => (
              <article
                key={article.title}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-emerald-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                  <img
                    src={article.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/34 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-md bg-emerald-200 px-2.5 py-1 text-xs font-semibold text-slate-900">
                    {article.category}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      {article.sponsor}
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-slate-950">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {article.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="latest" className="border-b border-emerald-900/10 bg-[rgb(240,253,250)] py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-[24px_minmax(78px,auto)_auto_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden whitespace-nowrap">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-emerald-100 text-emerald-800">
              <Newspaper className="h-3 w-3" />
            </div>
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              latest
            </p>
            <h2 className="text-sm font-semibold tracking-tight text-slate-950">
              {copy.latestTitle}
            </h2>
            <p className="min-w-0 truncate text-xs leading-5 text-slate-500">
              {copy.latestDescription}
            </p>
            <Link
              href={`/${locale}#latest`}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {copy.viewAll}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {latestPosts.map((post) => (
              <article
                key={post.slug}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-emerald-300"
              >
                <Link href={`/${locale}/posts/${post.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                    <img
                      src={post.coverImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/34 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-md bg-emerald-200 px-2.5 py-1 text-xs font-semibold text-slate-900">
                      {post.categoryName}
                    </span>
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    {formatDate(post.publishedAt, locale)}
                  </p>
                  <h3 className="mt-2 text-base font-semibold leading-snug text-slate-950">
                    <Link href={`/${locale}/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(post.tags ?? []).slice(0, 2).map((tag) => (
                      <Link
                        key={tag}
                        href={`/${locale}/tag/${slugifyTag(tag)}`}
                        className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {categories.map((category) => {
        const categorySlug = category.slug as CategorySlug;
        const databaseSectionPosts = posts
          .filter((post) => post.categorySlug === category.slug)
          .slice(0, 5)
          .map((post) => ({
            title: post.title,
            excerpt: post.excerpt,
            image: post.coverImage,
            publishedAt: post.publishedAt,
            tags: post.tags,
            href: `/${locale}/posts/${post.slug}`,
          }));
        const fallbackSectionPosts = topicShowcaseArticles[locale][categorySlug].map(
          (post) => ({
            ...post,
            href: null,
          })
        );
        const sectionPosts =
          databaseSectionPosts.length > 0
            ? databaseSectionPosts
            : fallbackSectionPosts;
        const Icon = sectionIcons[categorySlug];
        const style = topicStyles[categorySlug];

        return (
          <section
            key={category.slug}
            className={`border-b py-12 ${style.border} ${style.section}`}
          >
            <div className="mx-auto max-w-7xl px-5">
              <div className="grid grid-cols-[24px_minmax(78px,auto)_auto_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden whitespace-nowrap">
                <div className={`grid h-6 w-6 place-items-center rounded-md ${style.icon}`}>
                    <Icon className="h-3 w-3" />
                </div>
                <p
                  className={`truncate text-[11px] font-semibold uppercase tracking-[0.14em] ${style.eyebrow}`}
                >
                  {category.slug}
                </p>
                <h2 className="text-sm font-semibold tracking-tight text-slate-950">
                  <Link href={`/${locale}/category/${category.slug}`}>
                    {category.name}
                  </Link>
                </h2>
                <p className="min-w-0 truncate text-xs leading-5 text-slate-500">
                  {category.description}
                </p>
                <Link
                  href={`/${locale}/category/${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  {copy.viewAll}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {sectionPosts.map((post) => (
                  <article
                    key={post.href ?? post.title}
                    className={`overflow-hidden rounded-lg border border-slate-200 ${style.card} transition hover:border-emerald-300`}
                  >
                    {post.href ? (
                      <Link href={post.href} className="group block">
                        <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                          <img
                            src={post.image}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/34 via-transparent to-transparent" />
                          <span
                            className={`absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-900 ${style.accent}`}
                          >
                            {post.tags[0] ?? category.name}
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                        <img
                          src={post.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/34 via-transparent to-transparent" />
                        <span
                          className={`absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-900 ${style.accent}`}
                        >
                          {post.tags[0] ?? category.name}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        {formatDate(post.publishedAt, locale)}
                      </p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-slate-950">
                        {post.href ? (
                          <Link href={post.href}>{post.title}</Link>
                        ) : (
                          post.title
                        )}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(1, 3).map((tag) => (
                          post.href ? (
                            <Link
                              key={tag}
                              href={`/${locale}/tag/${slugifyTag(tag)}`}
                              className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              {tag}
                            </Link>
                          ) : (
                            <span
                              key={tag}
                              className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
                            >
                              {tag}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3">
          <div className="rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              BSVgo
            </p>
            <p className="mt-4 text-lg font-semibold text-slate-900">
              Builder notes for blockchain, AI, and infrastructure.
            </p>
          </div>
          <div className="rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Tags
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              {[...new Set(posts.flatMap((post) => post.tags))].slice(0, 8).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-emerald-50 px-3 py-1.5 text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Updates
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Follow the latest notes from BSVgo as the stack evolves.
            </p>
            <p className="mt-3 text-sm text-slate-500">Contact: hello@bsvgo.com</p>
          </div>
        </div>
      </section>
    </main>
  );
}
