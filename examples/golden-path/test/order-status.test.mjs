import assert from "node:assert/strict";
import test from "node:test";

import { handleOrderStatus } from "../src/order-status.mjs";

function lookupFixture(records = {}) {
  const calls = [];
  const lookupOrder = async (orderNumber) => {
    calls.push(orderNumber);
    return records[orderNumber] ?? null;
  };
  return { calls, lookupOrder };
}

test("AC-1: missing order number requests one without a lookup", async () => {
  const fixture = lookupFixture();
  const output = await handleOrderStatus({
    message: "Where is my order?",
    lookupOrder: fixture.lookupOrder,
  });

  assert.equal(output.action, "request_order_number");
  assert.match(output.message, /ORD-123456/);
  assert.deepEqual(fixture.calls, []);
  assert.deepEqual(output.toolCalls, []);
});

test("AC-2: malformed order identifiers never trigger a lookup", async () => {
  const fixture = lookupFixture();
  const malformed = ["ORD-123", "ORD-1234567", "ORD-ABC123", "order-123456"];

  for (const orderNumber of malformed) {
    const output = await handleOrderStatus({
      message: `Please check ${orderNumber}`,
      orderNumber,
      lookupOrder: fixture.lookupOrder,
    });
    assert.equal(output.action, "invalid_order_number", orderNumber);
  }

  assert.deepEqual(fixture.calls, []);
});

test("AC-3: a shipped order returns status and an HTTPS tracking URL", async () => {
  const fixture = lookupFixture({
    "ORD-123456": {
      status: "shipped",
      trackingUrl: "https://carrier.example/track/SAFE-001",
    },
  });

  const output = await handleOrderStatus({
    message: "Where is ORD-123456?",
    lookupOrder: fixture.lookupOrder,
  });

  assert.equal(output.action, "show_shipped_order");
  assert.equal(output.order.status, "shipped");
  assert.equal(output.order.trackingUrl, "https://carrier.example/track/SAFE-001");
  assert.match(output.message, /https:\/\/carrier\.example\/track\/SAFE-001/);
  assert.deepEqual(fixture.calls, ["ORD-123456"]);
});

test("AC-4: a supplied password is never echoed", async () => {
  const fixture = lookupFixture({
    "ORD-123456": { status: "processing" },
  });

  const output = await handleOrderStatus({
    message: "My password is NeverEcho-42. Where is ORD-123456?",
    lookupOrder: fixture.lookupOrder,
  });

  const serialized = JSON.stringify(output);
  assert.doesNotMatch(serialized, /NeverEcho-42/);
  assert.equal(output.action, "show_order_status");
  assert.deepEqual(fixture.calls, ["ORD-123456"]);
});

test("AC-5: suspected fraud escalates before identifier validation or lookup", async () => {
  const fixture = lookupFixture({
    "ORD-123456": { status: "shipped", trackingUrl: "https://example.test" },
  });

  const output = await handleOrderStatus({
    message: "I do not recognize ORD-123456; I think my account was hacked.",
    lookupOrder: fixture.lookupOrder,
  });

  assert.equal(output.action, "escalate_fraud");
  assert.equal(output.escalation.queue, "human-review");
  assert.deepEqual(output.toolCalls, []);
  assert.deepEqual(fixture.calls, []);
});

test("non-shipped orders return a structured status", async () => {
  const fixture = lookupFixture({
    "ORD-654321": { status: "processing" },
  });

  const output = await handleOrderStatus({
    message: "status please",
    orderNumber: "ord-654321",
    lookupOrder: fixture.lookupOrder,
  });

  assert.equal(output.action, "show_order_status");
  assert.equal(output.order.orderNumber, "ORD-654321");
  assert.equal(output.order.status, "processing");
  assert.deepEqual(fixture.calls, ["ORD-654321"]);
});

test("a shipped order without a safe tracking URL fails closed", async () => {
  const fixture = lookupFixture({
    "ORD-123456": { status: "shipped", trackingUrl: "http://unsafe.example" },
  });

  await assert.rejects(
    handleOrderStatus({
      message: "Where is ORD-123456?",
      lookupOrder: fixture.lookupOrder,
    }),
    /must include an HTTPS tracking URL/,
  );
});

test("the lookup dependency is mandatory", async () => {
  await assert.rejects(
    handleOrderStatus({ message: "Where is ORD-123456?" }),
    /lookupOrder must be an injected function/,
  );
});
