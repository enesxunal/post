"use client";

import { UserRound } from "lucide-react";

import { buildBrandBannerGradient } from "@/lib/profile/brand-gradient";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  imageUrl?: string | null;
  fallbackInitial: string;
  brandColors?: string[];
  primaryColor: string;
  className?: string;
  imageClassName?: string;
  withGradientRing?: boolean;
};

export function ProfileAvatar({
  imageUrl,
  fallbackInitial,
  brandColors,
  primaryColor,
  className,
  imageClassName,
  withGradientRing = false,
}: ProfileAvatarProps) {
  const gradient = buildBrandBannerGradient(brandColors, primaryColor);
  const hasImage = Boolean(imageUrl?.trim());

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl text-white",
        className,
      )}
      style={
        withGradientRing
          ? { background: gradient }
          : { backgroundColor: primaryColor }
      }
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt="Profil"
          className={cn("h-full w-full object-contain p-1.5", imageClassName)}
        />
      ) : (
        <span className="text-lg font-bold">{fallbackInitial}</span>
      )}
    </div>
  );
}

type ProfileBannerProps = {
  brandColors?: string[];
  primaryColor: string;
  className?: string;
};

export function ProfileBanner({ brandColors, primaryColor, className }: ProfileBannerProps) {
  return (
    <div
      className={cn("rounded-none", className)}
      style={{ background: buildBrandBannerGradient(brandColors, primaryColor) }}
    />
  );
}

export function ProfileAvatarPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl bg-slate-200 text-slate-500",
        className,
      )}
    >
      <UserRound className="h-5 w-5" />
    </div>
  );
}
