import { Locale } from "./i18n";

export type PromotionArticle = {
  title: string;
  sponsor: string;
  category: string;
  description: string;
  image: string;
};

export const promotedArticles: Record<Locale, PromotionArticle[]> = {
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
};
