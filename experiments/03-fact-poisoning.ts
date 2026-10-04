// The model judges claims against the state. If the state's facts are edited,
// verdicts follow the edit. Also tests redundancy: editing one mention vs all.
import { ask } from '../src/backends.js';
import { args, fmt, loadClaims, loadKb, save } from '../src/lib.js';
import { rigQuestions } from '../src/questions.js';

const { backends } = args();
const rig = loadKb().get('00-rig-parameters.md')!;
const oneLine = rig
  .replace('| 8 lanes, start end only (turn-end pads not wired) |', '| 10 lanes, both ends wired |')
  .replace('| 25 m short course meters |', '| 25 yard short course |');
const everywhere = oneLine
  .replace('The pool is 8 lanes and races are timed at the start end only. Courses are 25 m.', 'The pool is 10 lanes and races are timed at both ends. Courses are 25 yards.');
if (oneLine === rig || everywhere === oneLine) throw new Error('poison edit did not apply; check the KB text');

const claims = loadClaims('rig');
const watch = ['c01', 'c02', 'c07', 'n06', 'n08']; // claims about lanes, ends, course

for (const b of backends) {
  const out: Record<string, any[]> = {};
  for (const [name, state] of Object.entries({ clean: rig, 'table-only': oneLine, everywhere })) {
    const r = await ask(b, state, rigQuestions(claims));
    out[name] = claims.map((c, i) => ({ id: c.id, label: c.label, pConflict: r.answers[`f${i}`]?.noul }));
  }
  console.log(`== ${b}  P(conflict)        clean  table-only  everywhere`);
  for (const id of watch) {
    const c = claims.find((x) => x.id === id)!;
    const v = (k: string) => out[k].find((x) => x.id === id)!.pConflict;
    console.log(`  ${id} ${c.claim.slice(0, 44).padEnd(44)} ${fmt(v('clean'))}   ${fmt(v('table-only'))}      ${fmt(v('everywhere'))}`);
  }
  const acc = (k: string) => out[k].filter((x) => (x.pConflict >= 0.7) === x.label).length;
  console.log(`  clean-state accuracy at 0.7: ${acc('clean')}/20`);
  console.log('  saved', save('03-fact-poisoning', b, out));
}
