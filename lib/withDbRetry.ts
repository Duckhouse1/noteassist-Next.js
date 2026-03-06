type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

type PrismaLikeError = {
  code?: string;
  message?: string;
};

function isPrismaLikeError(err: unknown): err is PrismaLikeError {
  return typeof err === "object" && err !== null;
}

export function isDbConnectionWakingError(err: unknown): boolean {
  if (!isPrismaLikeError(err)) return false;

  const code = err.code;
  const msg = err.message ?? "";

  if (code === "P1001") return true;

  const needles = [
    "Failed to connect",
    "ETIMEDOUT",
    "ECONNRESET",
    "ECONNREFUSED",
    "Login timeout expired",
    "server was not found",
  ];

  return needles.some((n) => msg.includes(n));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const retries = opts.retries ?? 6;
  const baseDelayMs = opts.baseDelayMs ?? 400;
  const maxDelayMs = opts.maxDelayMs ?? 8000;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (!isDbConnectionWakingError(err) || attempt === retries) {
        break;
      }

      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      await sleep(delay);
    }
  }

  throw lastError;
}