"use client";

import { motion } from "framer-motion";

import { ShowcasePostImage } from "@/components/marketing/showcase-post-image";
import { APP_NAME, BASE_PACKAGE_PRICE } from "@/lib/config";
import { heroShowcase } from "@/lib/marketing-showcase";
import { formatCurrency } from "@/lib/utils";

export function HeroVisual() {
  const [main, second, third] = heroShowcase;

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-xl">
      <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl" />
      <div className="absolute -right-8 bottom-4 h-44 w-44 rounded-full bg-lime-300/30 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-20 mx-auto w-[78%] shadow-2xl"
        >
          <ShowcasePostImage
            post={main}
            size="lg"
            showBadge={`Tek ödeme ${formatCurrency(BASE_PACKAGE_PRICE)}`}
            priority
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, y: [0, 5, 0] }}
          transition={{
            opacity: { delay: 0.2, duration: 0.5 },
            x: { delay: 0.2, duration: 0.5 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
          }}
          className="absolute -right-2 top-16 z-10 w-[38%] rotate-6"
        >
          <ShowcasePostImage post={second} size="sm" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
          transition={{
            opacity: { delay: 0.35, duration: 0.5 },
            x: { delay: 0.35, duration: 0.5 },
            y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
          className="absolute -left-2 bottom-10 z-30 w-[36%] -rotate-6"
        >
          <ShowcasePostImage post={third} size="sm" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute -bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-emerald-200 bg-white/95 px-4 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur"
      >
        <span className="text-emerald-600">{APP_NAME}</span> • 30 post • Markanıza özel
      </motion.div>
    </div>
  );
}
