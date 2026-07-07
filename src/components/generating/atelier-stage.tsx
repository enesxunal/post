"use client";

import { motion } from "framer-motion";
import { Paintbrush, Palette, Sparkles, Wand2 } from "lucide-react";

const workers = [
  { Icon: Palette, label: "Renk", x: "8%", y: "18%", delay: 0 },
  { Icon: Paintbrush, label: "Fırça", x: "78%", y: "22%", delay: 0.35 },
  { Icon: Wand2, label: "AI", x: "12%", y: "72%", delay: 0.7 },
  { Icon: Sparkles, label: "Detay", x: "80%", y: "68%", delay: 1.05 },
];

const sparks = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  left: `${12 + index * 11}%`,
  top: `${20 + (index % 4) * 18}%`,
  delay: index * 0.25,
}));

type AtelierStageProps = {
  dayName: string;
  imageUrl?: string | null;
  progress?: number;
};

export function AtelierStage({ dayName, imageUrl, progress = 50 }: AtelierStageProps) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <motion.div
        className="absolute inset-0 rounded-[40px] border border-emerald-400/25 bg-gradient-to-br from-[#0a2a1c] via-[#071f15] to-[#04150d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        animate={{ boxShadow: ["inset 0 1px 0 rgba(255,255,255,0.06)", "inset 0 0 40px rgba(52,211,153,0.08)", "inset 0 1px 0 rgba(255,255,255,0.06)"] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Işık huzmeleri */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl"
        animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {/* Kıvılcımlar */}
      {sparks.map((spark) => (
        <motion.span
          key={spark.id}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-lime-300/80"
          style={{ left: spark.left, top: spark.top }}
          animate={{ opacity: [0, 1, 0], y: [0, -14, -28], scale: [0.6, 1, 0.4] }}
          transition={{
            duration: 2.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: spark.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Merkez tuval */}
      <div className="absolute left-1/2 top-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="relative overflow-hidden rounded-[28px] border-2 border-dashed border-emerald-400/40 bg-[#0c2419]/90 p-1 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          animate={{ borderColor: ["rgba(52,211,153,0.35)", "rgba(134,239,172,0.55)", "rgba(52,211,153,0.35)"] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          <div className="relative aspect-square overflow-hidden rounded-[22px] bg-gradient-to-br from-emerald-950 to-[#071a12]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={dayName} className="h-full w-full object-cover" />
            ) : (
              <>
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(134,239,172,0.12)_50%,transparent_65%)]"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                />
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <Palette className="mx-auto h-8 w-8 text-emerald-400/80" />
                  </motion.div>
                  <p className="mt-3 text-sm font-semibold leading-snug text-emerald-50">{dayName}</p>
                  <p className="mt-1 text-[11px] text-emerald-300/70">Tuval hazırlanıyor…</p>
                </div>
              </>
            )}
          </div>
          {!imageUrl ? (
            <motion.div
              className="absolute bottom-3 left-3 right-3 h-1 overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                animate={{ width: `${Math.min(100, Math.max(12, progress))}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </motion.div>
          ) : null}
        </motion.div>
      </div>

      {/* Minik atölye karakterleri */}
      {workers.map(({ Icon, label, x, y, delay }) => (
        <motion.div
          key={label}
          className="absolute z-10"
          style={{ left: x, top: y }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 1.8,
            repeat: Number.POSITIVE_INFINITY,
            delay,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={{ rotate: [-4, 4, -4] }}
            transition={{
              duration: 2.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: delay + 0.2,
              ease: "easeInOut",
            }}
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-500/15 shadow-lg backdrop-blur-sm">
              <div className="absolute -top-1 left-1/2 h-2 w-5 -translate-x-1/2 rounded-t-md bg-amber-400/90" />
              <Icon className="h-5 w-5 text-emerald-200" />
              <motion.span
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-lime-300"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, delay }}
              />
            </div>
            <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium text-emerald-100/90">
              {label}
            </span>
          </motion.div>
        </motion.div>
      ))}

      {/* Bant çizgisi */}
      <motion.div
        className="pointer-events-none absolute bottom-8 left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[30px] left-12 h-2 w-2 rounded-full bg-emerald-300"
        animate={{ x: ["0%", "880%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  );
}
