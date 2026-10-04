// One `ask` for every backend. All speak the System One request shape
// ({ state, questions }); only the endpoint and the response wrapper differ.
export type Backend = 'jev' | 'clef-flash' | 'clef';
export const BACKENDS: Backend[] = ['jev', 'clef-flash', 'clef'];

export interface Answer {
  noul?: number;
  choice?: string;
  probabilities?: Record<string, number>;
}
export interface AskResult {
  answers: Record<string, Answer>;
  inputTokens: number;
  model: string;
}

import path from 'path';
import { pathToFileURL } from 'url';

/** Model ids returned by the APIs during this process, saved with results. */
export const seenModels = new Set<string>();

let fetchImpl: typeof fetch | undefined;
async function getFetch(): Promise<typeof fetch> {
  if (fetchImpl) return fetchImpl;
  // Optional: route through a credential proxy that injects the keys.
  const mod = process.env.FETCH_MODULE;
  fetchImpl = mod ? await (await import(pathToFileURL(path.resolve(mod)).href)).createFetch() : fetch;
  return fetchImpl!;
}

function key(name: string): string {
  // With FETCH_MODULE the proxy injects the real key; the placeholder is replaced.
  return process.env[name] || (process.env.FETCH_MODULE ? 'proxy-managed' : missing(name));
}
function missing(name: string): never {
  throw new Error(`${name} is not set (see .env.example)`);
}

export async function ask(backend: Backend, state: unknown, questions: Record<string, unknown>): Promise<AskResult> {
  // One retry for timeouts and rate limits; anything else fails the run.
  try {
    return await askOnce(backend, state, questions);
  } catch (e) {
    if (!/ (408|429|5\d\d):/.test(String(e))) throw e;
    await new Promise((r) => setTimeout(r, 3000));
    return askOnce(backend, state, questions);
  }
}

async function askOnce(backend: Backend, state: unknown, questions: Record<string, unknown>): Promise<AskResult> {
  const f = await getFetch();
  if (backend === 'jev') {
    const model = process.env.JEV_MODEL || 'jev-1.13.0';
    const r = await f('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key('TYPESAFE_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, state, questions }),
    });
    const j: any = await r.json();
    if (!r.ok) throw new Error(`jev ${r.status}: ${JSON.stringify(j).slice(0, 300)}`);
    seenModels.add(j.model ?? model);
    return { answers: j.answers, inputTokens: j.usage?.input_tokens ?? 0, model: j.model ?? model };
  }
  const account = process.env.CLOUDFLARE_ACCOUNT_ID || missing('CLOUDFLARE_ACCOUNT_ID');
  const r = await f(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/@cf/cloudflare/${backend}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key('CLOUDFLARE_API_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: backend, state, questions }),
  });
  const j: any = await r.json();
  if (!r.ok || !j.success) throw new Error(`${backend} ${r.status}: ${JSON.stringify(j.errors ?? j).slice(0, 300)}`);
  seenModels.add(`${j.result.model ?? backend} (api-version ${r.headers.get('api-version') ?? 'unknown'})`);
  return { answers: j.result.answers, inputTokens: j.result.usage?.input_tokens ?? 0, model: j.result.model ?? backend };
}
