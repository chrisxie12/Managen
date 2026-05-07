import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const port = Number(process.env.PAYSTACK_API_PORT || 8787);
const envPath = resolve(process.cwd(), ".env.local");

if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!process.env[key]) {
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  }
}

const secretKey = process.env.PAYSTACK_SECRET_KEY;

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.PAYSTACK_ALLOWED_ORIGIN || "http://127.0.0.1:5174",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function isValidReference(reference) {
  return /^[A-Za-z0-9._=-]+$/.test(reference);
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(response, 200, { ok: true, service: "paystack-api" });
    return;
  }

  const verifyMatch = requestUrl.pathname.match(/^\/api\/paystack\/verify\/([^/]+)$/);
  if (request.method === "GET" && verifyMatch) {
    if (!secretKey) {
      sendJson(response, 500, {
        ok: false,
        error: "PAYSTACK_SECRET_KEY is not configured on the backend.",
      });
      return;
    }

    const reference = decodeURIComponent(verifyMatch[1]);
    if (!isValidReference(reference)) {
      sendJson(response, 400, { ok: false, error: "Invalid Paystack reference format." });
      return;
    }

    try {
      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      });
      const payload = await paystackResponse.json();
      const data = payload?.data;
      const verified =
        payload?.status === true &&
        data?.status === "success" &&
        data?.currency === "GHS";

      sendJson(response, paystackResponse.ok ? 200 : paystackResponse.status, {
        ok: verified,
        reference,
        status: data?.status,
        amount: data?.amount,
        currency: data?.currency,
        paidAt: data?.paid_at,
        customer: data?.customer,
        metadata: data?.metadata,
        gatewayResponse: data?.gateway_response,
        message: payload?.message,
      });
    } catch (error) {
      sendJson(response, 502, {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to verify Paystack transaction.",
      });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: "Not found." });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Paystack API listening on http://127.0.0.1:${port}`);
});
