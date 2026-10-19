import fs from 'fs';
import path from 'path';
import { BACKENDS, seenModels, type Backend } from './backends.js';
import type { Claim } from './questions.js';

export const ROOT = path.resolve(import.meta.dirname, '..');

export function loadKb(): Map<string, string> {
  const dir = path.join(ROOT, 'kb');
  return new Map(fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort().map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf-8')]));
}
/** All files in one string, in file order (a common "send the whole KB" integration). */
export const wholeKb = (kb: Map<string, string>) => [...kb.values()].join('\n\n');

export function loadClaims(name: 'support' | 'rig'): Claim[] {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'claims', `${name}.json`), 'utf-8')).claims;
}

/** --backend jev|clef-flash|clef (repeatable), --runs N */
/** --backend jev|clef-flash|clef (repeatable), --runs N, --only a,b (injection names) */
export function args(): { backends: Backend[]; runs: number; only?: string[] } {
  const a = process.argv.slice(2);
  const backends = a.flatMap((x, i) => (x === '--backend' ? [a[i + 1] as Backend] : []));
  for (const b of backends) if (!BACKENDS.includes(b)) throw new Error(`unknown backend ${b}`);
  const r = a.indexOf('--runs');
  const o = a.indexOf('--only');
  return { backends: backends.length ? backends : ['jev'], runs: r >= 0 ? Number(a[r + 1]) : 1, only: o >= 0 ? a[o + 1].split(',') : undefined };
}

export function save(experiment: string, backend: string, data: unknown): string {
  const dir = path.join(ROOT, 'results', experiment);
  fs.mkdirSync(dir, { recursive: true });
  // With JEV_MODEL set, the file name carries the version so runs of different versions never mix.
  const tag = backend === 'jev' && process.env.JEV_MODEL ? process.env.JEV_MODEL : backend;
  const file = path.join(dir, `${tag}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, JSON.stringify({ ranAt: new Date().toISOString(), models: [...seenModels], data }, null, 1));
  return path.relative(ROOT, file);
}

export const fmt = (n: number | undefined) => (n === undefined ? ' -  ' : n.toFixed(2));
