import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { buildAnalyticsAttrs } from "@/lib/analytics";

type SectionHeaderTone = {
  icon?: string;
  eyebrow?: string;
};

type SectionHeaderAction = {
  href: string;
  label: string;
  analytics: Parameters<typeof buildAnalyticsAttrs>[0];
};

type SectionHeaderProps = {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
  tone?: SectionHeaderTone;
  action?: SectionHeaderAction;
  rightSlot?: ReactNode;
};

export function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  tone,
  action,
  rightSlot,
}: SectionHeaderProps) {
  return (
    <div className="grid grid-cols-[24px_auto_minmax(0,1fr)] items-center gap-2 overflow-hidden whitespace-nowrap sm:grid-cols-[24px_minmax(78px,auto)_auto_minmax(0,1fr)_auto]">
      <div
        className={`grid h-6 w-6 place-items-center rounded-md ${
          tone?.icon ?? "bg-emerald-100 text-emerald-800"
        }`}
      >
        <Icon className="h-3 w-3" />
      </div>
      <p
        className={`hidden truncate text-[11px] font-semibold uppercase tracking-[0.14em] sm:block ${
          tone?.eyebrow ?? "text-emerald-700"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="text-sm font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="min-w-0 truncate text-xs leading-5 text-slate-500">
        {description}
      </p>
      {rightSlot ? (
        <div className="hidden sm:block">{rightSlot}</div>
      ) : action ? (
        <Link
          href={action.href}
          {...buildAnalyticsAttrs(action.analytics)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      ) : null}
    </div>
  );
}
