// Does the model read the whole state?
// (a) Sweep: a sentinel fact placed at increasing character offsets in the
//     whole KB; ask about it. A hard state cap shows as a cliff.
// (b) Realistic: every support claim checked against the whole KB in one
//     state. Claims whose evidence sits late in the KB fail under a cap.
import { ask } from '../src/backends.js';
import { args, fmt, loadClaims, loadKb, save, wholeKb } from '../src/lib.js';
import { noul, supportQuestions } from '../src/questions.js';

const { backends } = args();
const whole = wholeKb(loadKb());
const SENTINEL = ' The spare strobe bulb is kept in the red tin on the top shelf. ';
const q = { end: noul('Does the state say the spare strobe bulb is kept in the red tin on the top shelf?') };
const claims = loadClaims('support');

for (const b of backends) {
  const sweep: unknown[] = [];
  console.log(`\n== ${b}: sentinel sweep (whole KB = ${whole.length} chars)`);
  for (let off = 0; off <= whole.length; off += 1000) {
    const at = whole.lastIndexOf('\n', off) + 1; // insert at a line start
    const r = await ask(b, whole.slice(0, at) + SENTINEL + whole.slice(at), q);
    sweep.push({ charOffset: at, p: r.answers.end.noul, billed: r.inputTokens });
    console.log(`  sentinel at char ${String(at).padStart(6)}: P ${fmt(r.answers.end.noul)}  billed ${r.inputTokens}`);
  }
  const r = await ask(b, whole, supportQuestions(claims));
  const rows = claims.map((c, i) => ({ id: c.id, cite: c.cite, label: c.label, choice: r.answers[`r${i}`]?.choice, p: r.answers[`s${i}`]?.noul }));
  const ok = (x: (typeof rows)[number]) => (x.choice === 'supports') === x.label;
  console.log(`== ${b}: whole-KB support check, billed ${r.inputTokens}`);
  for (const f of [...new Set(claims.map((c) => c.cite!))]) {
    const fr = rows.filter((x) => x.cite === f);
    console.log(`  ${f.padEnd(28)} correct ${fr.filter(ok).length}/${fr.length}`);
  }
  console.log('  saved', save('01-truncation', b, { model: r.model, sweep, wholeKbCheck: rows }));
}
