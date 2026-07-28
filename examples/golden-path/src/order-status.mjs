const ORDER_ID = /^ORD-\d{6}$/;
const ORDER_LIKE_TOKEN = /\bORD-[A-Za-z0-9-]+\b/i;
const FRAUD_LANGUAGE = [
  /\bfraud\b/i,
  /\bunauthori[sz]ed\b/i,
  /\bunrecognized\s+(?:order|purchase|charge)\b/i,
  /\bdo(?:n't| not)\s+recognize\b/i,
  /\bstolen\s+(?:account|card|identity)\b/i,
  /\baccount\s+(?:takeover|hacked|compromised)\b/i,
];

function fraudSuspected(message) {
  return FRAUD_LANGUAGE.some((pattern) => pattern.test(message));
}

function extractCandidate(message, suppliedOrderNumber) {
  if (typeof suppliedOrderNumber === "string" && suppliedOrderNumber.trim()) {
    return suppliedOrderNumber.trim().toUpperCase();
  }

  const token = message.match(ORDER_LIKE_TOKEN)?.[0];
  return token ? token.toUpperCase() : null;
}

function result(action, message, extra = {}) {
  return {
    action,
    message,
    toolCalls: [],
    ...extra,
  };
}

export async function handleOrderStatus({
  message = "",
  orderNumber,
  lookupOrder,
} = {}) {
  if (typeof message !== "string") {
    throw new TypeError("message must be a string");
  }

  if (typeof lookupOrder !== "function") {
    throw new TypeError("lookupOrder must be an injected function");
  }

  if (fraudSuspected(message)) {
    return result(
      "escalate_fraud",
      "I’m escalating this to a support specialist. Do not send a password or other secret.",
      {
        escalation: {
          queue: "human-review",
          reason: "suspected_fraud_or_account_takeover",
        },
      },
    );
  }

  const candidate = extractCandidate(message, orderNumber);

  if (!candidate) {
    return result(
      "request_order_number",
      "Please provide the order number in the format ORD-123456. Do not send a password.",
    );
  }

  if (!ORDER_ID.test(candidate)) {
    return result(
      "invalid_order_number",
      "That order number is not in the expected ORD-123456 format. Please check it and try again.",
    );
  }

  const record = await lookupOrder(candidate);

  if (!record) {
    return result(
      "order_not_found",
      "I could not find that order. Please check the order number or ask for human support.",
      {
        toolCalls: [{ name: "lookupOrder", input: { orderNumber: candidate } }],
      },
    );
  }

  if (record.status === "shipped") {
    if (typeof record.trackingUrl !== "string" || !record.trackingUrl.startsWith("https://")) {
      throw new Error("A shipped order must include an HTTPS tracking URL");
    }

    return result(
      "show_shipped_order",
      `Order ${candidate} has shipped. Track it at ${record.trackingUrl}`,
      {
        order: {
          orderNumber: candidate,
          status: "shipped",
          trackingUrl: record.trackingUrl,
        },
        toolCalls: [{ name: "lookupOrder", input: { orderNumber: candidate } }],
      },
    );
  }

  return result(
    "show_order_status",
    `Order ${candidate} is currently ${record.status}.`,
    {
      order: {
        orderNumber: candidate,
        status: record.status,
      },
      toolCalls: [{ name: "lookupOrder", input: { orderNumber: candidate } }],
    },
  );
}
