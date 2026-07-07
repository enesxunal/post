import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  /** full: yatay logo (ikon + yazı) | icon: sadece ikon + metin */
  variant?: "full" | "icon";
  showName?: boolean;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const iconSizes = {
  sm: { box: "h-9 w-9", icon: 28, text: "text-sm" },
  md: { box: "h-10 w-10", icon: 32, text: "text-sm" },
  lg: { box: "h-12 w-12", icon: 40, text: "text-base" },
} as const;

const fullLogoHeights = {
  sm: "h-8",
  md: "h-9 sm:h-10",
  lg: "h-11 sm:h-12",
} as const;

export function BrandLogo({
  href = "/",
  variant = "full",
  showName = true,
  tagline,
  size = "md",
  className,
}: BrandLogoProps) {
  const content =
    variant === "full" ? (
      <div className={cn("flex items-center", className)}>
        <Image
          src="/poust-logo.png"
          alt={`${APP_NAME} logosu`}
          width={160}
          height={48}
          className={cn("w-auto object-contain", fullLogoHeights[size])}
          priority
        />
      </div>
    ) : (
      <div className={cn("flex items-center gap-3", className)}>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-md shadow-emerald-500/15",
            iconSizes[size].box,
          )}
        >
          <Image
            src="/poust-favicon.png"
            alt={`${APP_NAME} logosu`}
            width={iconSizes[size].icon}
            height={iconSizes[size].icon}
            className="h-[85%] w-[85%] object-contain"
            priority
          />
        </div>
        {showName ? (
          <div>
            <p
              className={cn(
                "font-semibold lowercase tracking-tight text-slate-900",
                iconSizes[size].text,
              )}
            >
              {APP_NAME}
            </p>
            {tagline ? <p className="text-xs text-slate-500">{tagline}</p> : null}
          </div>
        ) : null}
      </div>
    );

  if (!href) return content;

  return (
    <Link href={href} className="transition opacity-95 hover:opacity-100">
      {content}
    </Link>
  );
}
