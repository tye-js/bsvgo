import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Blocks,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  DatabaseZap,
  Globe2,
  Mail,
  Network,
  RadioTower,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { buildAnalyticsAttrs, buildSectionViewAttrs } from "@/lib/analytics";
import { Locale, locales, siteConfig, uiCopy } from "@/lib/i18n";

export const revalidate = 300;

type AboutCopy = {
  kicker: string;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  signalTitle: string;
  signalDescription: string;
  stackTitle: string;
  stackDescription: string;
  missionLabel: string;
  missionTitle: string;
  missionBody: string;
  thesisLabel: string;
  thesisTitle: string;
  thesisBody: string;
  mapLabel: string;
  mapTitle: string;
  mapDescription: string;
  lanes: Array<{
    title: string;
    description: string;
    points: string[];
  }>;
  operatingTitle: string;
  operatingDescription: string;
  operatingPoints: Array<{
    title: string;
    description: string;
  }>;
  timelineTitle: string;
  timelineDescription: string;
  timeline: Array<{
    step: string;
    title: string;
    description: string;
  }>;
  contactTitle: string;
  contactBody: string;
};

const aboutCopy: Record<Locale, AboutCopy> = {
  en: {
    kicker: "BSVgo / Signal for builders",
    title: "A field guide for the AI, blockchain, and infrastructure stack.",
    description:
      "BSVgo tracks the technologies that make digital value usable: machine intelligence, accountable data, scalable transactions, and the operational layer that keeps everything online.",
    primaryAction: "Start reading",
    secondaryAction: "Explore archive",
    signalTitle: "Built for operators",
    signalDescription:
      "Clear enough for fast scanning, deep enough for people who actually deploy, test, and maintain systems.",
    stackTitle: "Three-layer lens",
    stackDescription:
      "AI creates demand, blockchain records and settles value, infrastructure makes the experience reliable.",
    missionLabel: "Mission",
    missionTitle: "Make the next technical cycle easier to understand and use.",
    missionBody:
      "AI is changing how software is written, how knowledge is produced, and how value moves. That shift needs more than headlines. It needs provenance, rights, micropayments, servers, networks, and practical workflows. BSVgo connects those layers so readers can move from curiosity to implementation.",
    thesisLabel: "Thesis",
    thesisTitle: "AI needs accountable infrastructure, not just bigger models.",
    thesisBody:
      "Useful AI depends on data, attribution, and distribution. Blockchain can help trace origins, confirm ownership, and return value to the people and systems that create useful inputs. BSV matters in this view because low fees, high throughput, and micropayments fit frequent AI-era transactions.",
    mapLabel: "Content map",
    mapTitle: "What BSVgo covers",
    mapDescription:
      "The site is organized around three practical lanes that often overlap in real projects.",
    lanes: [
      {
        title: "Blockchain",
        description:
          "BSV, micropayments, data provenance, tokenized workflows, and scalable transaction design.",
        points: ["BSV basics", "Data ownership", "Value distribution"],
      },
      {
        title: "AI",
        description:
          "Model capabilities, agent workflows, product patterns, and where automation actually saves time.",
        points: ["AI tools", "Agent workflows", "Builder productivity"],
      },
      {
        title: "Infrastructure",
        description:
          "Servers, domains, networks, deployment, monitoring, and the operational details behind reliable products.",
        points: ["VPS setup", "Deployments", "Network access"],
      },
    ],
    operatingTitle: "Editorial operating system",
    operatingDescription:
      "Every article should help readers decide, build, or verify something.",
    operatingPoints: [
      {
        title: "Explain the mechanism",
        description:
          "The goal is to show how a technology works, not only report that it exists.",
      },
      {
        title: "Prefer useful context",
        description:
          "Articles connect market signals, developer workflows, and infrastructure constraints.",
      },
      {
        title: "Stay implementation-minded",
        description:
          "The best BSVgo posts point toward tools, architecture, or operational decisions.",
      },
      {
        title: "Keep the archive navigable",
        description:
          "Topics, tags, and collections are designed for continued reading instead of one-off browsing.",
      },
    ],
    timelineTitle: "How to read BSVgo",
    timelineDescription:
      "Use the site as a path from big-picture understanding to practical deployment.",
    timeline: [
      {
        step: "01",
        title: "Scan the trend",
        description: "Start with AI and blockchain explainers to understand why a shift matters.",
      },
      {
        step: "02",
        title: "Follow a collection",
        description: "Use ordered collections for a structured path through a larger topic.",
      },
      {
        step: "03",
        title: "Check the tooling",
        description: "Use infrastructure notes to evaluate what needs to be deployed or monitored.",
      },
      {
        step: "04",
        title: "Build with evidence",
        description: "Connect the idea, transaction model, and runtime environment before shipping.",
      },
    ],
    contactTitle: "Send a signal",
    contactBody:
      "For topic suggestions, corrections, partnerships, or infrastructure notes worth testing, contact the BSVgo team.",
  },
  zh: {
    kicker: "BSVgo / 面向建设者的技术信号",
    title: "写给 AI、区块链与基础设施建设者的技术导航。",
    description:
      "BSVgo 关注数字价值真正落地所需的技术：机器智能、可信数据、可扩展交易，以及让系统稳定在线的基础设施层。",
    primaryAction: "开始阅读",
    secondaryAction: "浏览归档",
    signalTitle: "为实践者而写",
    signalDescription:
      "足够清晰，方便快速扫描；也足够深入，服务真正会部署、测试和维护系统的人。",
    stackTitle: "三层视角",
    stackDescription:
      "AI 创造需求，区块链记录并结算价值，基础设施让体验稳定可靠。",
    missionLabel: "使命",
    missionTitle: "让下一轮技术周期更容易理解，也更容易参与。",
    missionBody:
      "AI 正在改变软件生产、知识生产和价值流转方式。但这不只是模型能力的竞争，还涉及数据溯源、权利确认、微支付、服务器、网络与真实工作流。BSVgo 把这些层连接起来，帮助读者从看懂趋势走向实际建设。",
    thesisLabel: "判断",
    thesisTitle: "AI 需要可追溯的基础设施，而不只是更大的模型。",
    thesisBody:
      "真正有用的 AI 离不开数据、归属和分配。区块链可以帮助追踪数据来源、确认权利，并把价值分配给创造有效输入的人和系统。BSV 的低手续费、高吞吐和微支付能力，适合 AI 时代大量、高频、低成本的价值流转。",
    mapLabel: "内容地图",
    mapTitle: "BSVgo 写什么",
    mapDescription:
      "网站围绕三个经常在真实项目里交叉出现的方向组织内容。",
    lanes: [
      {
        title: "区块链",
        description:
          "BSV、微支付、数据溯源、通证化工作流，以及可扩展交易设计。",
        points: ["BSV 基础", "数据确权", "价值分配"],
      },
      {
        title: "人工智能",
        description:
          "模型能力、Agent 工作流、产品模式，以及自动化真正提升效率的地方。",
        points: ["AI 工具", "智能体流程", "建设者效率"],
      },
      {
        title: "基础设施",
        description:
          "服务器、域名、网络、部署、监控，以及可靠产品背后的运维细节。",
        points: ["VPS 配置", "部署流程", "网络访问"],
      },
    ],
    operatingTitle: "内容操作系统",
    operatingDescription:
      "每篇文章都应该帮助读者判断、构建或验证一件具体事情。",
    operatingPoints: [
      {
        title: "解释机制",
        description: "重点不是只说某个技术存在，而是说明它如何工作。",
      },
      {
        title: "提供有用上下文",
        description: "把市场信号、开发流程和基础设施限制放在同一张图里看。",
      },
      {
        title: "保持工程视角",
        description: "好的文章应该能指向工具、架构或运营决策。",
      },
      {
        title: "让归档可继续阅读",
        description: "分类、标签和专题不是装饰，而是让读者形成连续路径。",
      },
    ],
    timelineTitle: "如何阅读 BSVgo",
    timelineDescription:
      "可以把网站当作一条从理解趋势到实践部署的路径。",
    timeline: [
      {
        step: "01",
        title: "先看趋势",
        description: "从 AI 和区块链解释文章开始，判断一项变化为什么重要。",
      },
      {
        step: "02",
        title: "进入专题",
        description: "用有顺序的专题文章，系统理解一个更大的主题。",
      },
      {
        step: "03",
        title: "检查工具链",
        description: "用基础设施内容评估需要部署、配置或监控的部分。",
      },
      {
        step: "04",
        title: "带着证据构建",
        description: "在发布之前，把想法、交易模型和运行环境连接起来。",
      },
    ],
    contactTitle: "发送信号",
    contactBody:
      "如果有选题建议、内容更正、合作需求，或值得测试的基础设施线索，可以联系 BSVgo 团队。",
  },
};

const laneIcons = [Blocks, BrainCircuit, ServerCog] as const;
const laneTones = [
  {
    panel: "border-emerald-200 bg-emerald-50/70",
    icon: "bg-emerald-200 text-emerald-900",
    tag: "bg-white text-emerald-800",
  },
  {
    panel: "border-cyan-200 bg-cyan-50/80",
    icon: "bg-cyan-200 text-cyan-900",
    tag: "bg-white text-cyan-800",
  },
  {
    panel: "border-lime-200 bg-lime-50/80",
    icon: "bg-lime-200 text-lime-900",
    tag: "bg-white text-lime-800",
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    return {};
  }

  const copy = uiCopy[locale];

  return {
    title: copy.aboutTitle,
    description: copy.aboutDescription,
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        en: "/en/about",
        zh: "/zh/about",
      },
    },
    openGraph: {
      title: `${copy.aboutTitle} | BSVgo`,
      description: copy.aboutDescription,
      url: `${siteConfig.url}/${locale}/about`,
    },
  };
}

function TechSignalPanel({ copy }: { copy: AboutCopy }) {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-emerald-900/10 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(45,212,191,0.34),transparent_32%),radial-gradient(circle_at_18%_78%,rgba(132,204,22,0.22),transparent_30%)]" />
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-emerald-300/30" />
      <div className="absolute right-10 top-12 h-32 w-32 rounded-full border border-cyan-200/25" />
      <div className="absolute bottom-10 left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />

      <div className="relative flex h-full min-h-[420px] flex-col justify-between p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur-md">
            <RadioTower className="h-4 w-4" />
            BSVgo Signal
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-md bg-emerald-300 text-slate-950">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-sm gap-3 py-8">
          {[
            { icon: BrainCircuit, label: "AI", value: "Intelligence layer" },
            { icon: Blocks, label: "BSV", value: "Value layer" },
            { icon: ServerCog, label: "Infra", value: "Runtime layer" },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-3 backdrop-blur-md"
                style={{ transform: `translateX(${index === 1 ? "24px" : "0"})` }}
              >
                <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-300/18 text-emerald-100">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">
                    {item.label}
                  </span>
                  <span className="block text-xs text-slate-300">
                    {item.value}
                  </span>
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
              {copy.signalTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {copy.signalDescription}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
              {copy.stackTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {copy.stackDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const globalCopy = uiCopy[locale];
  const copy = aboutCopy[locale];

  return (
    <main className="overflow-hidden bg-[rgb(249,251,250)] text-slate-900">
      <section
        className="relative border-b border-emerald-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.98),rgba(240,249,255,0.96)_48%,rgba(247,254,231,0.94))]"
        {...buildSectionViewAttrs("about-hero")}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.72fr)] lg:items-center lg:py-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md border border-emerald-900/10 bg-white/72 px-3 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <Waypoints className="h-4 w-4" />
              {copy.kicker}
            </p>
            <h1 className="mt-6 max-w-5xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
              {copy.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/${locale}`}
                {...buildAnalyticsAttrs({
                  eventName: "nav_click",
                  label: copy.primaryAction,
                  href: `/${locale}`,
                  targetType: "nav",
                })}
                className="inline-flex items-center justify-center rounded-md bg-emerald-200 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-100"
              >
                {copy.primaryAction}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href={`/${locale}/archive`}
                {...buildAnalyticsAttrs({
                  eventName: "nav_click",
                  label: copy.secondaryAction,
                  href: `/${locale}/archive`,
                  targetType: "nav",
                })}
                className="inline-flex items-center justify-center rounded-md border border-teal-900/15 bg-white/75 px-5 py-3 font-semibold text-slate-700 transition hover:bg-white hover:text-emerald-700"
              >
                {copy.secondaryAction}
              </Link>
            </div>
          </div>

          <TechSignalPanel copy={copy} />
        </div>
      </section>

      <section className="border-b border-emerald-900/10 bg-white py-12 sm:py-14">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 lg:grid-cols-2">
          <article className="rounded-lg border border-emerald-900/10 bg-[rgb(249,251,250)] p-6 shadow-sm sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <Cpu className="h-4 w-4" />
              {copy.missionLabel}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              {copy.missionTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-700">
              {copy.missionBody}
            </p>
          </article>

          <article className="rounded-lg border border-cyan-900/10 bg-[rgb(240,249,255)] p-6 shadow-sm sm:p-8">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              <ShieldCheck className="h-4 w-4" />
              {copy.thesisLabel}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              {copy.thesisTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-700">
              {copy.thesisBody}
            </p>
          </article>
        </div>
      </section>

      <section
        className="border-b border-emerald-900/10 bg-[rgb(249,251,250)] py-12 sm:py-14"
        {...buildSectionViewAttrs("about-content-map")}
      >
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {copy.mapLabel}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {copy.mapTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {copy.mapDescription}
            </p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-3">
            {copy.lanes.map((lane, index) => {
              const Icon = laneIcons[index] ?? Blocks;
              const tone = laneTones[index] ?? laneTones[0];

              return (
                <article
                  key={lane.title}
                  className={`rounded-lg border p-6 shadow-sm ${tone.panel}`}
                >
                  <div className={`grid h-12 w-12 place-items-center rounded-md ${tone.icon}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                    {lane.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    {lane.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {lane.points.map((point) => (
                      <span
                        key={point}
                        className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tone.tag}`}
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="border-b border-emerald-900/10 bg-white py-12 sm:py-14"
        {...buildSectionViewAttrs("about-operating-system")}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[minmax(260px,0.55fr)_minmax(0,1fr)]">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <DatabaseZap className="h-4 w-4" />
              BSVgo OS
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {copy.operatingTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {copy.operatingDescription}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.operatingPoints.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-teal-900/10 bg-[rgb(249,251,250)] p-5 shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-b border-emerald-900/10 bg-[rgb(240,253,250)] py-12 sm:py-14"
        {...buildSectionViewAttrs("about-reading-path")}
      >
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.5fr)_minmax(0,1fr)]">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <Network className="h-4 w-4" />
                Reading path
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {copy.timelineTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {copy.timelineDescription}
              </p>
            </div>
            <ol className="grid gap-4">
              {copy.timeline.map((item) => (
                <li
                  key={item.step}
                  className="grid gap-4 rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm sm:grid-cols-[4rem_minmax(0,1fr)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-md bg-emerald-100 text-sm font-bold text-emerald-800">
                    {item.step}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold tracking-tight text-slate-950">
                      {item.title}
                    </span>
                    <span className="mt-2 block text-sm leading-7 text-slate-600">
                      {item.description}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-5 rounded-lg border border-teal-900/10 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(240,249,255,0.9))] p-6 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                <Globe2 className="h-4 w-4" />
                {copy.contactTitle}
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                hello@bsvgo.com
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                {copy.contactBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a
                href="mailto:hello@bsvgo.com"
                {...buildAnalyticsAttrs({
                  eventName: "outbound_click",
                  label: "hello@bsvgo.com",
                  href: "mailto:hello@bsvgo.com",
                  targetType: "email",
                })}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-200 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100"
              >
                <Mail className="h-4 w-4" />
                hello@bsvgo.com
              </a>
              <Link
                href={`/${locale}`}
                {...buildAnalyticsAttrs({
                  eventName: "nav_click",
                  label: globalCopy.backToHome,
                  href: `/${locale}`,
                  targetType: "nav",
                })}
                className="inline-flex items-center gap-2 rounded-md border border-teal-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                {globalCopy.backToHome}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
