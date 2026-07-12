import { addonOptions } from "@/lib/mock-data";
import {
  BASE_PACKAGE_PRICE,
  CAPTION_ADDON_PRICE,
  CALENDAR_ADDON_PRICE,
  STORY_ADDON_PRICE,
} from "@/lib/config";
import { estimateAiCostForJobs, getUnitCosts } from "@/lib/admin/unit-costs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type OrderRow = {
  id: string;
  user_id: string;
  amount_total: number;
  status: string;
  payment_provider: string;
  addons: string[] | null;
  created_at: string;
  profiles:
    | { email: string; full_name: string | null }
    | { email: string; full_name: string | null }[]
    | null;
};

function normalizeProfile(
  profiles: OrderRow["profiles"],
): { email: string; full_name: string | null } | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
}

type ProjectRow = {
  id: string;
  package_type: string;
  user_id: string;
  brand_name: string;
  status: string;
  created_at: string;
};

type JobRow = {
  id: string;
  project_id: string;
  status: string;
  provider: string | null;
  retry_count: number | null;
  image_url: string | null;
  caption_text: string | null;
  story_image_url: string | null;
  created_at: string;
};

export type OrderEconomicsRow = {
  id: string;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  amountTotal: number;
  status: string;
  paymentProvider: string;
  packageLabel: string;
  listPrice: number;
  projectId: string | null;
  projectBrand: string | null;
  jobCount: number;
  readyJobs: number;
  estimatedAiCostTry: number;
  estimatedProfitTry: number | null;
  marginPercent: number | null;
};

export type AdminEconomicsReport = {
  summary: {
    totalRevenueTry: number;
    pendingRevenueTry: number;
    paidOrderCount: number;
    pendingOrderCount: number;
    totalOrderCount: number;
    estimatedAiCostTry: number;
    estimatedGrossProfitTry: number;
    marginPercent: number | null;
    totalJobs: number;
    readyJobs: number;
    totalFeedImages: number;
    totalStories: number;
    totalCaptions: number;
  };
  costBreakdownTry: {
    images: number;
    stories: number;
    captions: number;
    qualityChecks: number;
  };
  unitCosts: ReturnType<typeof getUnitCosts>;
  qualityCheckEnabled: boolean;
  orders: OrderEconomicsRow[];
  unlinkedProjects: Array<{
    id: string;
    brandName: string;
    status: string;
    jobCount: number;
    estimatedAiCostTry: number;
    createdAt: string;
  }>;
};

const ADDON_PRICES: Record<string, number> = {
  caption: CAPTION_ADDON_PRICE,
  story: STORY_ADDON_PRICE,
  calendar: CALENDAR_ADDON_PRICE,
};

const ADDON_LABELS: Record<string, string> = Object.fromEntries(
  addonOptions.map((item) => [item.key, item.label]),
);

function orderIdFromPackageType(packageType: string | null | undefined) {
  if (!packageType?.startsWith("order:")) return null;
  return packageType.slice("order:".length);
}

function listPriceForAddons(addons: string[] | null) {
  const extra = (addons ?? []).reduce((sum, key) => sum + (ADDON_PRICES[key] ?? 0), 0);
  return BASE_PACKAGE_PRICE + extra;
}

function packageLabel(addons: string[] | null) {
  const keys = addons ?? [];
  if (!keys.length) return "Ana paket (299 ₺)";
  const names = keys.map((key) => ADDON_LABELS[key] ?? key);
  return `Ana paket + ${names.join(", ")}`;
}

function paymentLabel(provider: string) {
  if (provider === "eft") return "EFT / Havale";
  if (provider === "tosla") return "Kart (Tosla)";
  return provider;
}

function statusLabel(status: string) {
  if (status === "paid") return "Ödendi";
  if (status === "pending") return "Bekliyor";
  if (status === "failed") return "Başarısız";
  if (status === "refunded") return "İade";
  return status;
}

export async function getAdminEconomicsReport(): Promise<AdminEconomicsReport> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Admin muhasebe için SUPABASE_SECRET_KEY gerekli");
  }

  const [{ data: orders, error: ordersError }, { data: projects, error: projectsError }, { data: jobs, error: jobsError }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, user_id, amount_total, status, payment_provider, addons, created_at, profiles(email, full_name)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("projects")
        .select("id, package_type, user_id, brand_name, status, created_at"),
      supabase
        .from("generation_jobs")
        .select(
          "id, project_id, status, provider, retry_count, image_url, caption_text, story_image_url, created_at",
        ),
    ]);

  if (ordersError) throw new Error(ordersError.message);
  if (projectsError) throw new Error(projectsError.message);
  if (jobsError) throw new Error(jobsError.message);

  const orderList = (orders ?? []) as OrderRow[];
  const projectList = (projects ?? []) as ProjectRow[];
  const jobList = (jobs ?? []) as JobRow[];

  const jobsByProject = new Map<string, JobRow[]>();
  for (const job of jobList) {
    const bucket = jobsByProject.get(job.project_id) ?? [];
    bucket.push(job);
    jobsByProject.set(job.project_id, bucket);
  }

  const projectByOrderId = new Map<string, ProjectRow>();
  for (const project of projectList) {
    const orderId = orderIdFromPackageType(project.package_type);
    if (orderId) projectByOrderId.set(orderId, project);
  }

  const linkedProjectIds = new Set<string>();

  const orderRows: OrderEconomicsRow[] = orderList.map((order) => {
    const project = projectByOrderId.get(order.id) ?? null;
    if (project) linkedProjectIds.add(project.id);

    const projectJobs = project ? (jobsByProject.get(project.id) ?? []) : [];
    const ai = estimateAiCostForJobs(projectJobs);
    const revenue = order.status === "paid" ? order.amount_total : 0;
    const profit = order.status === "paid" ? revenue - ai.totalTry : null;
    const margin =
      order.status === "paid" && revenue > 0
        ? Math.round(((revenue - ai.totalTry) / revenue) * 1000) / 10
        : null;

    const profile = normalizeProfile(order.profiles);

    return {
      id: order.id,
      createdAt: order.created_at,
      customerEmail: profile?.email ?? "—",
      customerName: profile?.full_name?.trim() || profile?.email || "Kullanıcı",
      amountTotal: order.amount_total,
      status: order.status,
      paymentProvider: paymentLabel(order.payment_provider),
      packageLabel: packageLabel(order.addons),
      listPrice: listPriceForAddons(order.addons),
      projectId: project?.id ?? null,
      projectBrand: project?.brand_name ?? null,
      jobCount: projectJobs.length,
      readyJobs: projectJobs.filter((job) => job.status === "ready").length,
      estimatedAiCostTry: ai.totalTry,
      estimatedProfitTry: profit,
      marginPercent: margin,
    };
  });

  const unlinkedProjects = projectList
    .filter((project) => !linkedProjectIds.has(project.id))
    .map((project) => {
      const projectJobs = jobsByProject.get(project.id) ?? [];
      const ai = estimateAiCostForJobs(projectJobs);
      return {
        id: project.id,
        brandName: project.brand_name,
        status: project.status,
        jobCount: projectJobs.length,
        estimatedAiCostTry: ai.totalTry,
        createdAt: project.created_at,
      };
    })
    .filter((project) => project.jobCount > 0);

  const globalAi = estimateAiCostForJobs(jobList);
  const totalRevenueTry = orderList
    .filter((order) => order.status === "paid")
    .reduce((sum, order) => sum + order.amount_total, 0);
  const pendingRevenueTry = orderList
    .filter((order) => order.status === "pending")
    .reduce((sum, order) => sum + order.amount_total, 0);

  const paidOrderCount = orderList.filter((order) => order.status === "paid").length;
  const pendingOrderCount = orderList.filter((order) => order.status === "pending").length;
  const estimatedGrossProfitTry = Math.round((totalRevenueTry - globalAi.totalTry) * 100) / 100;
  const marginPercent =
    totalRevenueTry > 0
      ? Math.round(((totalRevenueTry - globalAi.totalTry) / totalRevenueTry) * 1000) / 10
      : null;

  return {
    summary: {
      totalRevenueTry,
      pendingRevenueTry,
      paidOrderCount,
      pendingOrderCount,
      totalOrderCount: orderList.length,
      estimatedAiCostTry: globalAi.totalTry,
      estimatedGrossProfitTry,
      marginPercent,
      totalJobs: jobList.length,
      readyJobs: jobList.filter((job) => job.status === "ready").length,
      totalFeedImages: globalAi.feedImages,
      totalStories: globalAi.stories,
      totalCaptions: globalAi.captions,
    },
    costBreakdownTry: globalAi.breakdownTry,
    unitCosts: getUnitCosts(),
    qualityCheckEnabled: process.env.QUALITY_CHECK_ENABLED?.trim() !== "false",
    orders: orderRows,
    unlinkedProjects,
  };
}

export { statusLabel };
