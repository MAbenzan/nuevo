import sql from 'mssql';
import { log } from '../utils/logger';

type ParamSpec = { type?: sql.ISqlTypeFactory; value: unknown };

const config: sql.config = {
  server: process.env.SQL_SERVER || '',
  database: process.env.SQL_DATABASE || '',
  user: process.env.SQL_USER || '',
  password: process.env.SQL_PASSWORD || '',
  port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : undefined,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_TRUST_CERT === 'true',
    instanceName: process.env.SQL_INSTANCE || undefined,
    enableArithAbort: process.env.SQL_ARITH_ABORT === 'true',
    requestTimeout: process.env.SQL_REQUEST_TIMEOUT ? parseInt(process.env.SQL_REQUEST_TIMEOUT, 10) : undefined,
  },
  pool: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;
let connecting: Promise<sql.ConnectionPool> | null = null;

function ensureConfig() {
  if (!config.server || !config.database || !config.user || !config.password) {
    throw new Error('SQL_SERVER/SQL_DATABASE/SQL_USER/SQL_PASSWORD no configurados');
  }
}

export async function getPool() {
  ensureConfig();
  if (pool && pool.connected) return pool;
  if (connecting) return connecting;
  connecting = (async () => {
    const start = Date.now();
    const p = await new sql.ConnectionPool(config).connect();
    const dur = Date.now() - start;
    log(`pool_connected server=${config.server} db=${config.database} duration_ms=${dur}`);
    pool = p;
    connecting = null;
    return p;
  })();
  return connecting;
}

function inferType(value: unknown): sql.ISqlTypeFactory {
  if (typeof value === 'number') return sql.Int;
  if (typeof value === 'boolean') return sql.Bit;
  return sql.NVarChar;
}

export async function query<T = any>(text: string, params?: Record<string, ParamSpec | unknown>, timeoutMs?: number) {
  const p = await getPool();
  const req = new sql.Request(p);
  if (timeoutMs) (req as any).timeout = timeoutMs;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === 'object' && v !== null && 'value' in (v as any)) {
        const spec = v as ParamSpec;
        const factory = spec.type || inferType(spec.value);
        const t = (factory as any)();
        req.input(k, t, spec.value as any);
      } else {
        const factory = inferType(v);
        const t = (factory as any)();
        req.input(k, t, v as any);
      }
    }
  }
  const start = Date.now();
  try {
    const result = await req.query<T>(text);
    const dur = Date.now() - start;
    log(`query_ok duration_ms=${dur} rows=${result.recordset?.length ?? 0}`);
    return result;
  } catch (err: any) {
    const dur = Date.now() - start;
    log(`query_error duration_ms=${dur} error=${err?.message || err}`);
    throw err;
  }
}

export async function closePool() {
  if (pool) {
    await pool.close();
    log('pool_closed');
    pool = null;
  }
}