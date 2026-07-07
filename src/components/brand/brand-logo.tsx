import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  showName?: boolean;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { box: "h-9 w-9", icon: 28, text: "text-sm" },
  md: { box: "h-10 w-10", icon: 32, text: "text-sm" },
  lg: { box: "h-12 w-12", icon: 40, text: "text-base" },
} as const;

export function BrandLogo({
  href = "/",
  showName = true,
  tagline = "Özel gün postları",
  size = "md",
  className,
}: BrandLogoProps) {
  const dim = sizes[size];

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black shadow-md shadow-emerald-500/15",
          dim.box,
        )}
      >
        <Image
          src="/poust-favicon.png"
          alt={`${APP_NAME} logosu`}
          width={dim.icon}
          height={dim.icon}
          className="h-[85%] w-[85%] object-contain"
          priority
        />
      </div>
      {showName ? (
        <div>
          <p className={cn("font-semibold lowercase tracking-tight text-slate-900", dim.text)}>
            {APP_NAME}
          </p>
          <p className="text-xs text-slate-500">{tagline}</p>
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
