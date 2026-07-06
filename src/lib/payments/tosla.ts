export interface PaymentSessionInput {
  orderId: string;
  amount: number;
  currency: "TRY";
  successUrl: string;
  cancelUrl: string;
}

export async function createPaymentSession(input: PaymentSessionInput) {
  // TODO: connect Tosla real API
  return {
    provider: "tosla",
    sessionId: `mock_tosla_${input.orderId}`,
    redirectUrl: `${input.successUrl}?orderId=${input.orderId}&mockPaid=true`,
  };
}

export async function verifyPaymentWebhook(rawBody: string) {
  // TODO: connect Tosla real API
  return {
    valid: true,
    payload: rawBody,
  };
}

export async function handlePaymentSuccess(orderId: string) {
  return {
    orderId,
    status: "paid" as const,
    message: "Mock payment succeeded and jobs should be created.",
  };
}

export async function handlePaymentFailure(orderId: string) {
  return {
    orderId,
    status: "failed" as const,
  };
}
