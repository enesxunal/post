import {
  getToslaBaseUrl,
  isToslaConfigured,
  toToslaAmountTry,
  TOSLA_CURRENCY_TRY,
} from "@/lib/payments/tosla-config";
import { buildToslaAuthFields, verifyToslaCallbackHash } from "@/lib/payments/tosla-hash";

export interface PaymentSessionInput {
  orderId: string;
  amount: number;
  currency: "TRY";
  successUrl: string;
  cancelUrl: string;
  description?: string;
}

type ToslaPaymentResponse = {
  Code: number;
  Message: string;
  ThreeDSessionId?: string;
  TransactionId?: string;
};

export type ToslaCallbackPayload = {
  Code?: string;
  Message?: string;
  OrderId?: string;
  BankResponseCode?: string;
  BankResponseMessage?: string;
  TransactionId?: string;
  Hash?: string;
  HashParameters?: string;
};

function mockSession(input: PaymentSessionInput) {
  return {
    provider: "tosla" as const,
    mode: "mock" as const,
    sessionId: `mock_tosla_${input.orderId}`,
    redirectUrl: `${input.successUrl}?orderId=${input.orderId}&mockPaid=true`,
  };
}

export async function createPaymentSession(input: PaymentSessionInput) {
  if (!isToslaConfigured()) {
    console.warn("Tosla credentials missing, using mock payment session");
    return mockSession(input);
  }

  const baseUrl = getToslaBaseUrl();
  const callbackUrl =
    process.env.TOSLA_CALLBACK_URL?.trim() ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/payments/tosla/callback`;

  const body = {
    ...buildToslaAuthFields(),
    callbackUrl,
    orderId: input.orderId.slice(0, 20),
    amount: toToslaAmountTry(input.amount),
    currency: TOSLA_CURRENCY_TRY,
    installmentCount: 0,
    description: input.description ?? "Özel gün post paketi",
    echo: input.orderId,
  };

  const response = await fetch(`${baseUrl}threeDPayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as ToslaPaymentResponse;

  if (!response.ok || data.Code !== 0 || !data.ThreeDSessionId) {
    throw new Error(data.Message || "Tosla ödeme oturumu başlatılamadı");
  }

  return {
    provider: "tosla" as const,
    mode: "live" as const,
    sessionId: data.ThreeDSessionId,
    transactionId: data.TransactionId,
    redirectUrl: `${baseUrl}threeDSecure/${data.ThreeDSessionId}`,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
  };
}

export function parseToslaCallbackPayload(
  formData: FormData | URLSearchParams,
): ToslaCallbackPayload {
  const payload: ToslaCallbackPayload = {};

  formData.forEach((value, key) => {
    const normalizedKey = key as keyof ToslaCallbackPayload;
    payload[normalizedKey] = String(value);
  });

  return payload;
}

export function verifyPaymentCallback(payload: ToslaCallbackPayload) {
  if (!isToslaConfigured()) {
    return { valid: false, paid: false, reason: "Tosla yapılandırılmamış" };
  }

  if (payload.Hash && payload.HashParameters) {
    const flatPayload = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, value ?? ""]),
    ) as Record<string, string>;

    const valid = verifyToslaCallbackHash(
      flatPayload,
      payload.HashParameters,
      payload.Hash,
    );

    if (!valid) {
      return { valid: false, paid: false, reason: "Hash doğrulaması başarısız" };
    }
  }

  const serviceOk = payload.Code === "0" || payload.Code === undefined;
  const bankOk = payload.BankResponseCode === "00";
  const paid = serviceOk && bankOk;

  return {
    valid: true,
    paid,
    orderId: payload.OrderId,
    transactionId: payload.TransactionId,
    bankMessage: payload.BankResponseMessage ?? payload.Message,
    reason: paid ? undefined : payload.BankResponseMessage ?? payload.Message ?? "Ödeme başarısız",
  };
}

export async function verifyPaymentWebhook(rawBody: string) {
  const params = new URLSearchParams(rawBody);
  const payload = parseToslaCallbackPayload(params);
  return {
    ...verifyPaymentCallback(payload),
    payload,
  };
}

export async function handlePaymentSuccess(orderId: string) {
  return {
    orderId,
    status: "paid" as const,
    message: "Ödeme başarılı, üretim işleri sıraya alınmalı.",
  };
}

export async function handlePaymentFailure(orderId: string, message?: string) {
  return {
    orderId,
    status: "failed" as const,
    message: message ?? "Ödeme tamamlanamadı.",
  };
}
