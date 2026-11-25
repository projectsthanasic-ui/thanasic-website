const crypto = require("crypto");

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed" });
  }

  const host = req.headers.host;
  const origin = req.headers.origin;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return send(res, 403, { error: "Cross-origin request blocked" });
    } catch (_) {
      return send(res, 403, { error: "Invalid request origin" });
    }
  }

  const expectedToken = process.env.DASHBOARD_ACCESS_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!expectedToken || !openaiKey) {
    return send(res, 503, { error: "Server setup incomplete. Add DASHBOARD_ACCESS_TOKEN and OPENAI_API_KEY in Vercel Environment Variables, then redeploy." });
  }

  const auth = req.headers.authorization || "";
  const suppliedToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!safeEqual(suppliedToken, expectedToken)) return send(res, 401, { error: "Unauthorized. Check the dashboard access token." });

  let raw = "";
  try {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 16000) return send(res, 413, { error: "Request too large" });
    }
  } catch (_) {
    return send(res, 400, { error: "Could not read request body" });
  }

  let payload;
  try { payload = JSON.parse(raw || "{}"); }
  catch (_) { return send(res, 400, { error: "Invalid JSON body" }); }

  const metrics = payload.metrics || {};
  const safeContext = {
    business: "Thanasic Company W.L.L.",
    location: "Al Khor, Qatar",
    website: "https://thanasiccompany.vercel.app/",
    focus: String(metrics.focus || "AC Repair Al Khor").slice(0, 120),
    reportingPeriod: String(metrics.period || "Last 28 days").slice(0, 40),
    ownerEnteredMetrics: {
      googleReviews: String(metrics.reviews || "").slice(0, 20),
      profileViews: String(metrics.views || "").slice(0, 20),
      calls: String(metrics.calls || "").slice(0, 20),
      websiteClicks: String(metrics.clicks || "").slice(0, 20),
      mapGridKeyword: String(metrics.rankKeyword || "").slice(0, 120),
      mapGridPositions: metrics.ranks || {},
      completedChecklistItems: Array.isArray(metrics.checklist) ? metrics.checklist.slice(0, 30) : [],
      notes: String(metrics.notes || "").slice(0, 2500)
    }
  };

  const instructions = [
    "You are a careful local SEO consultant for a small HVAC and property-maintenance business in Qatar.",
    "Prepare a practical audit in clear English for the owner of Thanasic Company W.L.L., focused first on AC repair in Al Khor.",
    "Use only the supplied facts. Distinguish owner-entered figures from Google-verified data. Do not invent search volumes, competitor positions, ranking promises, review counts, or Google metrics.",
    "Explain that local map visibility varies by searcher's location and depends on relevance, distance, and prominence.",
    "Prioritize profile accuracy, relevant services, genuine customer reviews without incentives, original job photos, useful location-specific website content, and Search Console measurement.",
    "Do not recommend keyword stuffing, fake reviews, false business locations, fake service areas, or adding keywords to the GBP business name.",
    "Return concise sections: Snapshot, Top 5 actions, keyword/content plan, 7-day tasks, and missing data needed for a stronger audit."
  ].join(" ");

  try {
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": "Bearer " + openaiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        instructions,
        input: JSON.stringify(safeContext),
        max_output_tokens: 1400
      })
    });
    const result = await upstream.json();
    if (!upstream.ok) {
      const message = result && result.error && result.error.message ? result.error.message : "OpenAI request failed";
      return send(res, upstream.status >= 500 ? 502 : upstream.status, { error: message.slice(0, 400) });
    }
    const audit = result.output_text || (result.output || []).flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text).join("\n");
    if (!audit) return send(res, 502, { error: "The AI service returned no text. Please try again." });
    return send(res, 200, { audit, model: result.model || process.env.OPENAI_MODEL || "gpt-5.5" });
  } catch (error) {
    return send(res, 502, { error: "Could not reach the AI service. Please try again later." });
  }
};
