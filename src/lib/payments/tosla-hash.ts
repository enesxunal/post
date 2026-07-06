import { createHash, randomBytes } from "node:crypto";

import { getToslaApiPass, getToslaApiUser, getToslaClientId } from "@/lib/payments/tosla-config";

export function createToslaTimeSpan(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

export function createToslaRnd() {
  return randomBytes(8).toString("hex").slice(0, 24);
}

/** ApiPass + ClientId + ApiUser + Rnd + TimeSpan → SHA512 → Base64 */
export function createToslaRequestHash(rnd: string, timeSpan: string) {
  const apiPass = getToslaApiPass();
  const clientId = getToslaClientId();
  const apiUser = getToslaApiUser();
  const hashString = `${apiPass}${clientId}${apiUser}${rnd}${timeSpan}`;
  return createHash("sha512").update(hashString, "utf8").digest("base64");
}

/** Callback: ApiPass + HashParameters sırasındaki değerler */
export function verifyToslaCallbackHash(
  payload: Record<string, string>,
  hashParameters: string,
  receivedHash: string,
) {
  const apiPass = getToslaApiPass();
  const keys = hashParameters.split(",").map((key) => key.trim()).filter(Boolean);
  const values = keys.map((key) => payload[key] ?? "");
  const hashString = `${apiPass}${values.join("")}`;
  const expected = createHash("sha512").update(hashString, "utf8").digest("base64");
  return expected === receivedHash;
}

export function buildToslaAuthFields() {
  const rnd = createToslaRnd();
  const timeSpan = createToslaTimeSpan();
  const hash = createToslaRequestHash(rnd, timeSpan);

  return {
    clientId: Number(getToslaClientId()),
    apiUser: getToslaApiUser(),
    rnd,
    timeSpan,
    hash,
  };
}
