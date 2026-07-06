"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GENERATING_MESSAGES } from "@/lib/config";

export function CreativeWorkshopLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % GENERATING_MESSAGES.length);
    }, 1800);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_38%)]" />
      <Card className="relative w-full overflow-hidden border-emerald-200 p-8 sm:p-10">
        <Badge>Dijital atölye aktif</Badge>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Postlarınız arka planda hazırlanıyor
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Sayfadan çıksanız bile üretim devam eder. Hazır olduğunda size e-posta göndeririz.
            </p>

            <div className="mt-8 space-y-3">
              {GENERATING_MESSAGES.map((message, messageIndex) => (
                <div
                  key={message}
                  className={`rounded-2xl border px-4 py-3 text-sm transition ${
                    index === messageIndex
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-100 bg-white text-slate-500"
                  }`}
                >
                  {message}
                </div>
              ))}
            </div>
          </div>

          <WorkshopScene activeIndex={index} />
        </div>
      </Card>
    </div>
  );
}

function WorkshopScene({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="relative h-[360px] rounded-[32px] border border-emerald-100 bg-[linear-gradient(180deg,_#f7fff9_0%,_#ecfdf5_100%)] p-6">
      <motion.div
        className="absolute left-8 top-8 h-16 w-16 rounded-[20px] bg-emerald-500"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute right-8 top-10 h-14 w-14 rounded-full border-4 border-emerald-200 bg-white"
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      <div className="absolute left-1/2 top-8 h-44 w-[2px] -translate-x-1/2 bg-emerald-200" />
      <div className="absolute bottom-16 left-6 right-6 h-3 rounded-full bg-emerald-100" />

      <motion.div
        className="absolute left-10 top-28 h-20 w-20 rounded-[28px] border border-emerald-200 bg-white"
        animate={{ x: [0, 20, 120, 180], y: [0, 6, -4, 0] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="flex h-full items-center justify-center text-sm font-semibold text-emerald-700">
          Logo
        </div>
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-300 bg-white"
        animate={{ scale: activeIndex === 3 ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-300" />
      </motion.div>

      {["29 Ekim", "Kandil", "Cuma", "Bayram"].map((label, index) => (
        <motion.div
          key={label}
          className="absolute right-6 flex h-16 w-28 items-center justify-center rounded-[22px] border border-emerald-200 bg-white text-sm font-medium text-slate-700"
          style={{ top: `${92 + index * 56}px` }}
          animate={{ x: [0, -6, 0] }}
          transition={{ duration: 2 + index * 0.3, repeat: Number.POSITIVE_INFINITY }}
        >
          {label}
        </motion.div>
      ))}

      {Array.from({ length: 10 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-2 w-2 rounded-full bg-emerald-300"
          style={{
            left: `${12 + index * 8}%`,
            top: `${20 + (index % 4) * 18}%`,
          }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -8, 0] }}
          transition={{ duration: 1.8 + index * 0.1, repeat: Number.POSITIVE_INFINITY }}
        />
      ))}
    </div>
  );
}
