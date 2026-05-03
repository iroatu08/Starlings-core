/**
 * Parses the hostname from a Postgres connection URL for SSL heuristics.
 *
 * @param databaseUrl - e.g. `postgresql://user:pass@host:5432/db`
 * @returns Hostname or null when missing or invalid
 */
function postgresUrlHostname(databaseUrl: string | null | undefined): string | null {
  if (!databaseUrl?.trim()) return null;
  try {
    const normalized = databaseUrl.trim().replace(/^postgres(ql)?:/i, 'http:');
    const parsed = new URL(normalized);
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

/** SSL options passed through to TypeORM / node-pg. */
export type PgTlsOption = boolean | { rejectUnauthorized: boolean };

/**
 * Decides whether the Postgres client must use TLS. Hosted providers (Railway, etc.)
 * often require SSL even when NODE_ENV is not production — local Docker Postgres does not.
 *
 * Precedence:
 * - `DB_SSL=false` disables TLS regardless of URL.
 * - `DB_SSL=true` forces TLS (self-signed tolerated via `rejectUnauthorized: false`).
 * - `NODE_ENV=production` forces TLS for managed deploys.
 * - Otherwise if `DATABASE_URL` host is non-localhost, TLS is enabled.
 *
 * @param options.environment - Typical source: `process.env` or Nest `ConfigService` getters.
 */
export function resolvePostgresSsl(options: {
  databaseUrl?: string | null | undefined;
  nodeEnv?: string | null | undefined;
  dbSsl?: string | null | undefined;
}): PgTlsOption {
  const { databaseUrl, nodeEnv, dbSsl } = options;
  const flag = dbSsl?.trim().toLowerCase();

  if (flag === 'false') return false;
  if (flag === 'true') return { rejectUnauthorized: false };
  if (nodeEnv === 'production') return { rejectUnauthorized: false };

  const host = postgresUrlHostname(databaseUrl ?? undefined);
  if (!host) return false;

  const h = host.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return false;
  // Default Postgres images in Docker Compose rarely enable TLS on the internal service name.
  if (h === 'postgres' || h === 'db' || h === 'database') return false;

  return { rejectUnauthorized: false };
}
