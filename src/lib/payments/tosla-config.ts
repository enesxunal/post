export type ToslaEnvironment = "sandbox" | "production";

const TOSLA_BASE_URLS: Record<ToslaEnvironment, string> = {
  sandbox: "https://prepentegrasyon.tosla.com/api/Payment/",
  production: "https://entegrasyon.tosla.com/api/Payment/",
};

export function getToslaEnvironment(): ToslaEnvironment {
  return process.env.TOSLA_ENV === "sandbox" ? "sandbox" : "production";
}

export function getToslaBaseUrl() {
  const custom = process.env.TOSLA_BASE_URL?.trim();
  if (custom) return custom.endsWith("/") ? custom : `${custom}/`;
  return TOSLA_BASE_URLS[getToslaEnvironment()];
}

export function getToslaClientId() {
  return process.env.TOSLA_CLIENT_ID?.trim() ?? "";
}

export function getToslaApiUser() {
  return process.env.TOSLA_API_USER?.trim() ?? "";
}

export function getToslaApiPass() {
  return process.env.TOSLA_API_PASS?.trim() ?? "";
}

export function isToslaConfigured() {
  return Boolean(getToslaClientId() && getToslaApiUser() && getToslaApiPass());
}

/** TL tutarını Tosla formatına çevirir: 299 TL → 29900 */
export function toToslaAmountTry(amountTry: number) {
  return Math.round(amountTry * 100);
}

export const TOSLA_CURRENCY_TRY = 949;
