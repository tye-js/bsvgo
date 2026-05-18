type CoverVariant = "hero" | "card" | "compact";

type CoverArtOptions = {
  title: string;
  label?: string;
  subtitle?: string;
  categorySlug?: string;
  variant?: CoverVariant;
};

type Palette = {
  start: string;
  end: string;
  accent: string;
  glow: string;
  label: string;
};

const palettes: Record<string, Palette> = {
  blockchain: {
    start: "#ecfdf5",
    end: "#f8fafc",
    accent: "#10b981",
    glow: "#86efac",
    label: "#047857",
  },
  ai: {
    start: "#eff6ff",
    end: "#f8fafc",
    accent: "#06b6d4",
    glow: "#67e8f9",
    label: "#0e7490",
  },
  infrastructure: {
    start: "#f7fee7",
    end: "#f8fafc",
    accent: "#84cc16",
    glow: "#bef264",
    label: "#3f6212",
  },
  sponsored: {
    start: "#f8fafc",
    end: "#ecfeff",
    accent: "#14b8a6",
    glow: "#5eead4",
    label: "#0f766e",
  },
  default: {
    start: "#f8fafc",
    end: "#eef2ff",
    accent: "#64748b",
    glow: "#cbd5e1",
    label: "#334155",
  },
};

const renderableRemoteHosts = new Set(["images.unsplash.com", "cms.bsvgo.com"]);

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isCjkText(value: string) {
  return /[^\u0000-\u007f]/.test(value);
}

function inferPaletteKey(options: CoverArtOptions) {
  const hint = `${options.categorySlug ?? ""} ${options.label ?? ""} ${options.title}`
    .toLowerCase()
    .trim();

  if (hint.includes("blockchain") || hint.includes("bsv") || hint.includes("链")) {
    return "blockchain";
  }

  if (
    hint.includes("ai") ||
    hint.includes("model") ||
    hint.includes("prompt") ||
    hint.includes("人工智能") ||
    hint.includes("模型")
  ) {
    return "ai";
  }

  if (
    hint.includes("infra") ||
    hint.includes("server") ||
    hint.includes("proxy") ||
    hint.includes("network") ||
    hint.includes("基础设施") ||
    hint.includes("服务器")
  ) {
    return "infrastructure";
  }

  if (hint.includes("sponsor") || hint.includes("promoted") || hint.includes("推广")) {
    return "sponsored";
  }

  return "default";
}

function wrapText(text: string, maxChars: number, maxLines: number) {
  const source = text.trim();

  if (!source) {
    return [""];
  }

  const units = isCjkText(source) ? Array.from(source) : source.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const unit of units) {
    const next = current ? (isCjkText(source) ? `${current}${unit}` : `${current} ${unit}`) : unit;

    if (next.length <= maxChars || !current) {
      current = next;
    } else {
      lines.push(current);
      current = unit;

      if (lines.length >= maxLines - 1) {
        break;
      }
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  const remainingCount = lines.join("").length < source.length ? source.length : 0;

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  if (lines.length === maxLines && remainingCount > 0) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = last.length > maxChars - 1 ? `${last.slice(0, maxChars - 1)}…` : `${last}…`;
  }

  return lines;
}

function buildSvgMarkup(options: CoverArtOptions) {
  const palette = palettes[inferPaletteKey(options)] ?? palettes.default;
  const variant = options.variant ?? "hero";
  const width = variant === "hero" ? 1600 : variant === "card" ? 1200 : 960;
  const height = variant === "hero" ? 900 : variant === "card" ? 780 : 640;
  const maxChars = variant === "hero" ? (isCjkText(options.title) ? 14 : 24) : isCjkText(options.title) ? 10 : 18;
  const titleLines = wrapText(options.title, maxChars, variant === "hero" ? 3 : 3);
  const subtitle = options.subtitle?.trim() ?? "";
  const label = (options.label?.trim() || options.categorySlug || "BSVgo").toUpperCase();
  const titleY = variant === "hero" ? 250 : variant === "card" ? 180 : 150;
  const titleSize = variant === "hero" ? 78 : variant === "card" ? 52 : 40;
  const titleGap = variant === "hero" ? 1.18 : variant === "card" ? 1.12 : 1.1;
  const subtitleY = variant === "hero" ? 778 : variant === "card" ? 668 : 548;
  const labelSize = variant === "hero" ? 27 : 20;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="${width}" y2="${height}">
          <stop offset="0%" stop-color="${palette.start}" />
          <stop offset="100%" stop-color="${palette.end}" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${width * 0.82} ${height * 0.18}) rotate(90) scale(${Math.max(width, height) * 0.5})">
          <stop offset="0%" stop-color="${palette.glow}" stop-opacity="0.72" />
          <stop offset="100%" stop-color="${palette.glow}" stop-opacity="0" />
        </radialGradient>
        <pattern id="grid" width="96" height="96" patternUnits="userSpaceOnUse">
          <path d="M 96 0 L 0 0 0 96" stroke="${palette.accent}" stroke-opacity="0.08" stroke-width="2" fill="none" />
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect width="${width}" height="${height}" fill="url(#grid)" opacity="0.8" />
      <circle cx="${width * 0.82}" cy="${height * 0.22}" r="${Math.min(width, height) * 0.22}" fill="url(#glow)" />
      <circle cx="${width * 0.08}" cy="${height * 0.82}" r="${Math.min(width, height) * 0.16}" fill="${palette.accent}" fill-opacity="0.12" />
      <rect x="${width * 0.56}" y="${height * 0.22}" width="${width * 0.24}" height="${height * 0.06}" rx="24" fill="${palette.accent}" fill-opacity="0.12" />
      <rect x="${width * 0.64}" y="${height * 0.66}" width="${width * 0.16}" height="${height * 0.04}" rx="20" fill="${palette.accent}" fill-opacity="0.16" />
      <text x="${width * 0.06}" y="${height * 0.17}" fill="${palette.label}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${labelSize}" font-weight="700" letter-spacing="8">${escapeXml(label)}</text>
      <text x="${width * 0.06}" y="${titleY}" fill="#0f172a" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${titleSize}" font-weight="800" letter-spacing="-1.2">
        ${titleLines
          .map((line, index) => `<tspan x="${width * 0.06}" dy="${index === 0 ? 0 : titleSize * titleGap}">${escapeXml(line)}</tspan>`)
          .join("")}
      </text>
      ${subtitle ? `<text x="${width * 0.06}" y="${subtitleY}" fill="#475569" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${variant === "hero" ? 28 : 20}" font-weight="500" letter-spacing="0.2">${escapeXml(subtitle)}</text>` : ""}
    </svg>
  `;
}

export function createCoverArtDataUri(options: CoverArtOptions) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildSvgMarkup(options))}`;
}

export function getRenderableImageSrc(
  source: string | null | undefined,
  options: CoverArtOptions
) {
  const value = source?.trim();

  if (!value) {
    return createCoverArtDataUri(options);
  }

  if (value.startsWith("data:") || value.startsWith("/") || value.startsWith("blob:")) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.protocol === "https:" && renderableRemoteHosts.has(url.hostname)) {
      return value;
    }
  } catch {
    return createCoverArtDataUri(options);
  }

  return createCoverArtDataUri(options);
}
