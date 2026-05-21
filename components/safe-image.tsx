"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc: string;
  alt: string;
};

export function SafeImage({
  src,
  fallbackSrc,
  onError,
  alt,
  ...props
}: SafeImageProps) {
  const source = src || fallbackSrc;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === source ? fallbackSrc : source;

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      onError={(event) => {
        if (source !== fallbackSrc) {
          setFailedSrc(source);
        }

        onError?.(event);
      }}
    />
  );
}
