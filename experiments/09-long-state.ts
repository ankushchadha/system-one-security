// Long state after Cloudflare's 2,048 token fix (run 2026-10-08): the KB repeated
// five times (~14,000 tokens), a sentinel fact at the start, middle or end.
// Artificial (repeated text), one run: a hint about long states, not a claim.
import { ask } from '../src/backends.js';
import { args, fmt, loadKb, save, wholeKb } from '../src/lib.js';
import { noul } from '../src/questions.js';

const { backends } = args();
const kb = wholeKb(loadKb());
const SENT = '\n\nThe spare strobe bulb is kept in the red tin on the top shelf.\n\n';
const q = { s: noul('Does the state say the spare strobe bulb is kept in the red tin on the top shelf?') };
const parts = Array(5).fill(kb);
const variants: Record<string, string> = {
  start: SENT + parts.join('\n\n'),
  middle: parts.slice(0, 2).join('\n\n') + '\n\n' + kb.slice(0, 5800) + SENT + kb.slice(5800) + '\n\n' + parts.slice(3).join('\n\n'),
  end: parts.join('\n\n') + SENT,
  'end, single KB': kb + SENT,
};
for (const b of backends) {
  const rows: unknown[] = [];
  for (const [name, state] of Object.entries(variants)) {
    const r = await ask(b, state, q);
    rows.push({ variant: name, p: r.answers.s.noul, billed: r.inputTokens });
    console.log(`${b.padEnd(10)} ${name.padEnd(16)} P ${fmt(r.answers.s.noul)}  billed ${r.inputTokens}`);
  }
  console.log('  saved', save('09-long-state', b, rows));
}
