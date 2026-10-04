// Under a hard state cap, text added to the START of the state pushes facts at
// the END out of view. No instruction is needed. Neutral filler is prepended
// to the rig file; claims about its last lines are checked as filler grows.
import { ask } from '../src/backends.js';
import { args, fmt, loadKb, save } from '../src/lib.js';
import { noul } from '../src/questions.js';

const { backends } = args();
const kb = loadKb();
const rig = kb.get('00-rig-parameters.md')!;
// Neutral filler that states none of the rig's values (an earlier version used
// other KB files, which repeat some rig facts and so kept them visible).
const PARAGRAPH = 'Deck safety: keep walkways clear of bags and cables, wipe up standing water, and keep the first aid kit stocked and visible. Volunteers should wear the club shirt so swimmers can find help quickly. Spectators stay behind the barrier during races. ';
const filler = PARAGRAPH.repeat(Math.ceil(10000 / PARAGRAPH.length)).slice(0, 12000);
// Each fact appears exactly once in the rig file, at the char offset noted.
const q = {
  early: noul('Does the state say the console model is the Tempo T5-L?'), // char 424 of 1,657
  mid: noul('Does the state say swimmer names are carried on a USB key?'), // char 1,093
  late: noul('Does the state say meets and events are built on the setup laptop?'), // char 1,365
};

for (const b of backends) {
  const rows: unknown[] = [];
  console.log(`== ${b}: prepended chars -> P(early) P(mid) P(late) billed`);
  // Coarse steps, then 250-char steps where a 2,048 token cap would bite.
  const steps = [0, 2000, 4000, 6000, ...Array.from({ length: 21 }, (_, i) => 7000 + i * 250)].filter((n) => n <= filler.length);
  for (const n of steps) {
    const r = await ask(b, filler.slice(0, n) + '\n\n' + rig, q);
    rows.push({ prepended: n, early: r.answers.early.noul, mid: r.answers.mid.noul, late: r.answers.late.noul, billed: r.inputTokens });
    console.log(`  ${String(n).padStart(5)}  ${fmt(r.answers.early.noul)}  ${fmt(r.answers.mid.noul)}  ${fmt(r.answers.late.noul)}  ${r.inputTokens}`);
  }
  console.log('  saved', save('04-prepend-eviction', b, rows));
}
