import type { NextConfig } from "next";

const projectId =
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID?.trim() ||
  process.env.SUPABASE_PROJECT_ID?.trim() ||
  "";

const resolvedSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.SUPABASE_URL?.trim() ||
  (projectId ? `https://${projectId}.supabase.co` : "");

const resolvedAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: resolvedSupabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolvedAnonKey,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
      resolvedAnonKey,
    NEXT_PUBLIC_SUPABASE_PROJECT_ID: projectId,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "poust.app" }],
        destination: "https://www.poust.app/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
