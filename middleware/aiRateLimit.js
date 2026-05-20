const store = new Map();

const SCHOOL_LIMIT = 20;
const SCHOOL_WINDOW = 60_000;

const PARENT_LIMIT = 5;
const PARENT_WINDOW = 3_600_000;

function prune() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

setInterval(prune, 60_000);

function checkLimit(key, max, windowMs) {
  prune();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.expiresAt) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}

function aiRateLimit(req, res, next) {
  const schoolId = req.tenant?.id || req.body?.school_id || 'unknown';
  const parentPhone = req.body?.parent_phone;

  const schoolResult = checkLimit(`school:${schoolId}`, SCHOOL_LIMIT, SCHOOL_WINDOW);
  if (!schoolResult.allowed) {
    console.warn(`[AI RateLimit] School ${schoolId} exceeded ${SCHOOL_LIMIT} req/min`);
    return res.status(429).json({ error: 'Too many AI requests. Try again in a moment.', retryAfter: schoolResult.retryAfter });
  }

  if (parentPhone) {
    const parentResult = checkLimit(`parent:${parentPhone}`, PARENT_LIMIT, PARENT_WINDOW);
    if (!parentResult.allowed) {
      console.warn(`[AI RateLimit] Parent ${parentPhone} exceeded ${PARENT_LIMIT} msg/hr`);
      return res.status(429).json({ error: 'Too many messages. Please wait an hour before sending more.', retryAfter: parentResult.retryAfter });
    }
  }

  next();
}

module.exports = { aiRateLimit };
