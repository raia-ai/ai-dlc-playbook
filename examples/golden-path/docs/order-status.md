# Checking an order’s status

To check an order, provide the order number in the format `ORD-123456`. A support experience should not request a password or another secret to look up an order.

| Situation | Expected response |
|---|---|
| No order number | Ask for an order number and do not perform a lookup |
| Invalid order-number format | Explain the expected format and do not perform a lookup |
| Order has shipped | Provide the shipped status and the secure tracking link returned by the approved lookup function |
| Order is still processing | Provide the current status |
| Customer reports fraud, account takeover, or an unrecognized purchase | Stop the lookup and escalate to a human support specialist |

This feature cannot authenticate a customer, issue a refund, modify an order, or resolve suspected fraud. Those actions remain in approved customer-support processes.
