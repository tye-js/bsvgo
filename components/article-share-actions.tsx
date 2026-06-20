"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
  Twitter,
  X,
} from "lucide-react";
import { buildAnalyticsAttrs } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";

type ArticleShareActionsProps = {
  locale: Locale;
  title: string;
  description: string;
  url: string;
  articleSlug: string;
  categorySlug: string;
};

const shareCopy: Record<
  Locale,
  {
    label: string;
    native: string;
    copy: string;
    copied: string;
    x: string;
    linkedin: string;
    telegram: string;
    wechat: string;
    wechatTitle: string;
    wechatHint: string;
    close: string;
  }
> = {
  en: {
    label: "Share",
    native: "Share article",
    copy: "Copy link",
    copied: "Copied",
    x: "Share on X",
    linkedin: "Share on LinkedIn",
    telegram: "Share on Telegram",
    wechat: "Share on WeChat",
    wechatTitle: "Scan with WeChat",
    wechatHint: "Use WeChat to scan this QR code, then share the article from WeChat.",
    close: "Close",
  },
  zh: {
    label: "分享",
    native: "分享文章",
    copy: "复制链接",
    copied: "已复制",
    x: "分享到 X",
    linkedin: "分享到 LinkedIn",
    telegram: "分享到 Telegram",
    wechat: "分享到微信",
    wechatTitle: "微信扫码分享",
    wechatHint: "用微信扫描二维码打开文章，然后在微信内转发给好友或朋友圈。",
    close: "关闭",
  },
};

function createShareUrl(platform: "x" | "linkedin" | "telegram", url: string, title: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  if (platform === "x") {
    return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  }

  if (platform === "linkedin") {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }

  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
}

export function ArticleShareActions({
  locale,
  title,
  description,
  url,
  articleSlug,
  categorySlug,
}: ArticleShareActionsProps) {
  const copy = shareCopy[locale];
  const [copied, setCopied] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const shareLinks = useMemo(
    () => [
      {
        key: "x",
        label: copy.x,
        href: createShareUrl("x", url, title),
        icon: Twitter,
      },
      {
        key: "linkedin",
        label: copy.linkedin,
        href: createShareUrl("linkedin", url, title),
        icon: Linkedin,
      },
      {
        key: "telegram",
        label: copy.telegram,
        href: createShareUrl("telegram", url, title),
        icon: Send,
      },
    ],
    [copy.linkedin, copy.telegram, copy.x, title, url]
  );

  useEffect(() => {
    if (!wechatOpen || qrCodeUrl) {
      return;
    }

    let cancelled = false;

    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((value) => {
        if (!cancelled) {
          setQrCodeUrl(value);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrCodeUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [qrCodeUrl, url, wechatOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch {
        return;
      }
    }

    await copyLink();
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={copy.label}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {copy.label}
      </span>
      <button
        type="button"
        onClick={shareNative}
        {...buildAnalyticsAttrs({
          eventName: "outbound_click",
          label: copy.native,
          href: url,
          articleSlug,
          categorySlug,
          targetType: "share",
        })}
        className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        aria-label={copy.native}
        title={copy.native}
      >
        <Share2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={copyLink}
        {...buildAnalyticsAttrs({
          eventName: "outbound_click",
          label: copy.copy,
          href: url,
          articleSlug,
          categorySlug,
          targetType: "share",
        })}
        className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        aria-label={copied ? copy.copied : copy.copy}
        title={copied ? copy.copied : copy.copy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
      {shareLinks.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            {...buildAnalyticsAttrs({
              eventName: "outbound_click",
              label: item.label,
              href: item.href,
              articleSlug,
              categorySlug,
              targetType: "share",
            })}
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            aria-label={item.label}
            title={item.label}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
      <button
        type="button"
        onClick={() => setWechatOpen(true)}
        {...buildAnalyticsAttrs({
          eventName: "outbound_click",
          label: copy.wechat,
          href: url,
          articleSlug,
          categorySlug,
          targetType: "share",
        })}
        className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        aria-label={copy.wechat}
        title={copy.wechat}
      >
        <MessageCircle className="h-4 w-4" />
      </button>

      {wechatOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-5"
          role="dialog"
          aria-modal="true"
          aria-label={copy.wechatTitle}
          onClick={() => setWechatOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-lg border border-emerald-900/10 bg-white p-5 text-center shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 text-left">
              <h2 className="text-base font-semibold text-slate-950">
                {copy.wechatTitle}
              </h2>
              <button
                type="button"
                onClick={() => setWechatOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                aria-label={copy.close}
                title={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-3">
              {qrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCodeUrl}
                  alt={copy.wechatTitle}
                  className="mx-auto h-56 w-56"
                />
              ) : (
                <div className="grid h-56 w-full place-items-center text-sm text-slate-500">
                  {copy.wechatTitle}
                </div>
              )}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {copy.wechatHint}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
