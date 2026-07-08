"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { ShowcasePostImage } from "@/components/marketing/showcase-post-image";
import { APP_NAME, BASE_PACKAGE_PRICE } from "@/lib/config";
import { heroShowcase } from "@/lib/marketing-showcase";
import { formatCurrency } from "@/lib/utils";

const softSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 20,
  mass: 0.9,
};

export function HeroVisual() {
  const [main, second, third] = heroShowcase;
  const [focused, setFocused] = useState<"right" | "left" | null>(null);

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
        {/* Ana kart — yan kart öne gelince hafif geriler */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto w-[78%]"
          style={{ zIndex: focused ? 15 : 20 }}
        >
          <motion.div
            animate={{
              scale: focused ? 0.95 : 1,
              opacity: focused ? 0.86 : 1,
              filter: focused ? "blur(0.4px)" : "blur(0px)",
            }}
            transition={softSpring}
            className="shadow-2xl"
          >
            <ShowcasePostImage
              post={main}
              size="lg"
              showBadge={`Tek ödeme ${formatCurrency(BASE_PACKAGE_PRICE)}`}
              priority
            />
          </motion.div>
        </motion.div>

        {/* Sağ kart */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -right-2 top-16 w-[38%]"
          style={{ zIndex: focused === "right" ? 40 : 10 }}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: 1,
              x: focused === "right" ? -14 : 0,
              y: focused === "right" ? -18 : 0,
              scale: focused === "right" ? 1.48 : 1,
              rotate: focused === "right" ? -1.5 : 6,
            }}
            transition={{
              opacity: { delay: 0.2, duration: 0.5 },
              ...softSpring,
            }}
            onHoverStart={() => setFocused("right")}
            onHoverEnd={() => setFocused(null)}
            className="cursor-pointer"
            style={{
              filter:
                focused === "right"
                  ? "drop-shadow(0 28px 36px rgba(15,23,42,0.32))"
                  : "drop-shadow(0 10px 18px rgba(15,23,42,0.16))",
              transition: "filter 0.4s ease",
            }}
          >
            <ShowcasePostImage post={second} size="sm" />
          </motion.div>
        </motion.div>

        {/* Sol kart */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -left-2 bottom-10 w-[36%]"
          style={{ zIndex: focused === "left" ? 40 : 30 }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: focused === "left" ? 14 : 0,
              y: focused === "left" ? -16 : 0,
              scale: focused === "left" ? 1.48 : 1,
              rotate: focused === "left" ? 1.5 : -6,
            }}
            transition={{
              opacity: { delay: 0.35, duration: 0.5 },
              ...softSpring,
            }}
            onHoverStart={() => setFocused("left")}
            onHoverEnd={() => setFocused(null)}
            className="cursor-pointer"
            style={{
              filter:
                focused === "left"
                  ? "drop-shadow(0 28px 36px rgba(15,23,42,0.32))"
                  : "drop-shadow(0 10px 18px rgba(15,23,42,0.16))",
              transition: "filter 0.4s ease",
            }}
          >
            <ShowcasePostImage post={third} size="sm" />
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute -bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-200 bg-white/95 px-4 py-2 text-xs font-medium text-slate-700 shadow-lg backdrop-blur"
      >
        <span className="text-emerald-600">{APP_NAME}</span> • 30 post • Markanıza özel
      </motion.div>
    </div>
  );
}
