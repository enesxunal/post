"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GENERATING_MESSAGES } from "@/lib/config";

const floatingPosts = ["29 Ekim", "Kandil", "Cuma", "Bayram", "Anneler Günü"];

export function CreativeWorkshopLoader() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setIndex((current) => (current + 1) % GENERATING_MESSAGES.length);
    }, 2200);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.random() * 8, 96));
    }, 1400);

    return () => {
      window.clearInterval(messageTimer);
      window.clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04150d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-lime-400/10 blur-[100px]" />
        <GridOverlay />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 text-center lg:text-left">
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
            Dijital atölye çalışıyor
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Markanız için postlar üretiliyor
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100/80 sm:text-base">
            Sayfadan çıksanız bile üretim devam eder. Hazır olduğunda size e-posta göndeririz.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-emerald-200">İlerleme</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  Şu an
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {GENERATING_MESSAGES[index]}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="grid gap-2">
              {GENERATING_MESSAGES.map((message, messageIndex) => (
                <div
                  key={message}
                  className={`rounded-2xl border px-4 py-3 text-sm transition ${
                    index === messageIndex
                      ? "border-emerald-400/40 bg-white/10 text-white"
                      : "border-white/5 bg-white/[0.02] text-white/45"
                  }`}
                >
                  {message}
                </div>
              ))}
            </div>

            <Link href="/dashboard">
              <Button variant="secondary" className="w-full sm:w-auto">
                Postlarıma git
              </Button>
            </Link>
          </div>

          <WorkshopStage activeIndex={index} />
        </div>
      </div>
    </div>
  );
}

function WorkshopStage({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <motion.div
        className="absolute inset-0 rounded-[40px] border border-emerald-400/20 bg-white/[0.03] backdrop-blur"
        animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/30"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 shadow-[0_0_60px_rgba(52,211,153,0.45)]"
        animate={{ scale: activeIndex === 3 ? [1, 1.12, 1] : [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="flex h-full items-center justify-center text-sm font-bold text-emerald-950">
          AI
        </div>
      </motion.div>

      <motion.div
        className="absolute left-8 top-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur"
        animate={{ x: [0, 8, 120, 140], opacity: [1, 1, 1, 0] }}
        transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        LOGO
      </motion.div>

      {floatingPosts.map((label, postIndex) => {
        const angle = (postIndex / floatingPosts.length) * Math.PI * 2;
        const radius = 150;

        return (
          <motion.div
            key={label}
            className="absolute left-1/2 top-1/2 w-28 -translate-x-1/2 -translate-y-1/2"
            animate={{
              x: Math.cos(angle + activeIndex * 0.4) * radius,
              y: Math.sin(angle + activeIndex * 0.4) * radius,
              rotate: [0, 6, 0],
            }}
            transition={{
              duration: 3 + postIndex * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="rounded-2xl border border-emerald-300/30 bg-[#0f2f22]/90 p-3 text-center text-xs font-medium shadow-lg backdrop-blur">
              {label}
            </div>
          </motion.div>
        );
      })}

      <ConveyorCards />

      {Array.from({ length: 18 }).map((_, particleIndex) => (
        <motion.span
          key={particleIndex}
          className="absolute h-1.5 w-1.5 rounded-full bg-emerald-300/80"
          style={{
            left: `${8 + particleIndex * 5}%`,
            top: `${12 + (particleIndex % 5) * 16}%`,
          }}
          animate={{
            opacity: [0.1, 1, 0.1],
            y: [0, -18, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + particleIndex * 0.08,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      ))}
    </div>
  );
}

function ConveyorCards() {
  return (
    <div className="absolute bottom-8 left-6 right-6 overflow-hidden rounded-2xl border border-white/10 bg-black/20 py-3">
      <motion.div
        className="flex gap-3 px-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        {[...floatingPosts, ...floatingPosts].map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/80 to-emerald-700/80 text-xs font-semibold"
          >
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function GridOverlay() {
  return (
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}
