// Can one extra question in the same request detect an injection?
// Compares the tripwire's score on clean states with injected ones.
import { ask } from '../src/backends.js';
import { args, fmt, loadClaims, loadKb, save } from '../src/lib.js';
import { supportQuestions, tripwire } from '../src/questions.js';
import { INJECTIONS } from '../src/injections.js';

const { backends, only } = args();
const kb = loadKb();
const claims = loadClaims('support');

for (const b of backends) {
  const out: any[] = [];
  for (const [name, text] of Object.entries(INJECTIONS).filter(([n]) => n === 'base' || !only || only.includes(n)))
    for (const place of name === 'base' ? ['none'] : only ? ['start', 'end'] : ['start']) {
      const scores: number[] = [];
      for (const [f, body] of kb) {
        const cs = claims.filter((c) => c.cite === f);
        const state = place === 'start' ? `${text}\n\n${body}` : place === 'end' ? `${body}\n\n${text}` : body;
        const r = await ask(b, state, { ...supportQuestions(cs), t: tripwire() });
        scores.push(r.answers.t.noul!);
        out.push({ injection: name, place, file: f, tripwire: r.answers.t.noul });
      }
      console.log(`${b} ${name.padEnd(16)} ${place.padEnd(5)} tripwire fired ${scores.filter((s) => s >= 0.5).length}/${scores.length}  scores ${scores.map(fmt).join(' ')}`);
    }
  console.log('saved', save('05-tripwire', b, out));
}
