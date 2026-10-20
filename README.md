# system-one-security

Rerunnable security experiments on System One decision models: TypeSafe Jev
and Cloudflare Clef / Clef-flash. These models read a `state` and answer typed
questions (`noul`: a yes/no probability; `choice`: one of named options)
instead of generating text.

## What I found (one synthetic KB, hosted APIs, from 2026-10-03)

- **The models believe the state.** Edit a fact in the state and the verdict follows it (03).
- **Hosted Clef ignored everything after about 2,048 tokens of state** when tested on 2026-10-03 to 05, with no sign in the response. Cloudflare confirmed it was a bug and fixed it; a rerun on 2026-10-08 shows it gone. I found it independently, and while checking prior work came across earlier public reports from a day or two before (haystackeditor/stop-rules PR #1, matthewyjiang/rho PR #1388). Claims whose evidence sat past the cut failed, and text added at the start pushed facts at the end out of view (01, 04, historical).
- **Instruction-style injections mostly failed.** No wrong claim passed on the choice answer in any condition; on the yes/no answer, two injections let one wrong claim through in every run. On Jev, a "labels are swapped" note at the end of the state pushed nearly every correct claim below 0.5 on the yes/no answer (02).
- **On Jev, a fake empty state hides the real one.** Text after the evidence that looks like the end of a section, followed by an empty `STATE:` header, makes Jev answer says_nothing for true claims. No instruction is needed. A bare `STATE:` line does nothing. No false claim was accepted on the choice answer, the yes/no answer kept saying supported, and a same-request injection alarm missed it (02, 11 to 15).
- **It got stronger on jev-1.14.0.** Measured back to back with jev-1.13.0 on 2026-10-15: plain text appended after the evidence now moves most true claims, and the swap note at the end lets several false claims through on the yes/no answer, all just over 0.5 (16).

Details, scope and n for every claim: [`docs/CLAIMS.md`](docs/CLAIMS.md).
Predictions were written before the runs, with outcomes and design changes
recorded under each: [`PREDICTIONS.md`](PREDICTIONS.md).

The setting is a citation checker: claims an agent made are checked against a
small knowledge base. The KB is synthetic (a fictional pool timing rig),
loosely modeled on a real setup, written for these tests.

**Status: draft.** 01, 02, 04 and 05 ran on all three models; 03 on Jev and
Clef-flash. 02 ran three times on Jev and Clef-flash, once on Clef; everything
else once. Raw results are in `results/`.

**Coordinated disclosure:** some experiments, claims and results are withheld
while a vendor reviews a report; they are marked "withheld" and will be added
after the vendor responds. This public history starts fresh for that reason.
The predictions were committed before each run in the working repository,
whose full history will be published with the withheld material.

## Experiments

| # | Question | Script |
|---|---|---|
| 01 | Does the model read the whole state? | `experiments/01-truncation.ts` |
| 02 | Can text in the state that talks to the model change verdicts? | `experiments/02-instruction-injection.ts` |
| 03 | Do verdicts follow edited facts in the state? Does repeating a fact protect it? | `experiments/03-fact-poisoning.ts` |
| 04 | Under a state cap, can prepended text push facts out of view? | `experiments/04-prepend-eviction.ts` |
| 05 | Can one extra question in the same request detect an injection? | `experiments/05-tripwire.ts` |
| 09 | After the fix, does the model use a much longer state? | `experiments/09-long-state.ts` |
| 10 | Does asking both question types change the swap note's effect? | `experiments/10-question-mix.ts` |
| 11 | Does wrapping the whole state in fake system markers hide it? | `experiments/11-whole-state-wrap.ts` |
| 12 | Does a bare empty `STATE:` line move Jev? | `experiments/12-bare-empty-state.ts` |
| 13 | What does the fake empty state need? | `experiments/13-empty-state-ingredients.ts` |
| 14 | In plain words, is it the structure or the note? | `experiments/14-plain-section-note.ts` |
| 15 | Does the same-request alarm catch the fake empty state? | `experiments/15-alarm-vs-empty-state.ts` |
| 16 | Does jev-1.14.0 behave the same? | reruns of 02, 03, 05 and 11 to 15 with `JEV_MODEL=jev-1.14.0` |

## Repro scripts (2026-10-19)

Short, self-contained requests, 3 runs each on jev-1.13.0 and jev-1.14.0.
Output logs are in `results/repro/`. Predictions, where made, are in each
script header with the outcome below them.

| Script | Result |
|---|---|
| `repro/minimal.ts` | A 4-sentence state plus the appended fake empty `STATE:` moves one true claim to says_nothing on both versions. Controls do not. |
| `repro/refund-policy.ts` | The same text on an approve / deny / needs_review choice changes no answer. |
| `repro/cookbook-shape.ts` | In the citation check cookbook's exact request shape, nothing changes. |
| `repro/wording-isolation.ts` | The question wording is what matters. Questions that say "the state" flip. The cookbook's "the section" does not. A structured state and one claim per request still flip. |

Experiments 02 and 11 to 16 all use questions that say "the state".

## Run

```bash
npm install
cp .env.example .env   # add the keys for the backends you use
set -a; . ./.env; set +a
npx tsx experiments/01-truncation.ts --backend jev --backend clef-flash
npx tsx experiments/02-instruction-injection.ts --backend clef-flash --runs 3
```

Raw results go to `results/<experiment>/` (not committed by default).

Tested on Node 22 (`.nvmrc`). Jev is pinned to `jev-1.13.0` (override with
`JEV_MODEL`); every result file records the model ids the APIs returned. With
`JEV_MODEL` set, result file names start with the version (`jev-1.14.0-...`).

Cost (prices checked 2026-10-03): TypeSafe $0.042 per million input tokens
([models](https://docs.typesafe.ai)); Workers AI Clef $0.24 and Clef-flash
$0.09 per million input tokens, with 10,000 free neurons a day, about 0.46M
Clef or 1.2M Clef-flash tokens
([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)).
One run of all five experiments is roughly 0.3M to 0.5M input tokens per
backend: under $0.03 on Jev, inside one day's free tier on Clef-flash.

## Notes

- The Workers AI request includes `model`, which the input schema lists as required.
- Until a fix confirmed by Cloudflare (rerun 2026-10-08), hosted Clef truncated
  state at 2,048 tokens (reported before me). Every
  KB file here is under that, so experiments 02, 03 and 05 were not affected by
  it; 01 and 04 measured it, and 09 checks longer states after the fix.
- Hosted APIs include whatever wrapping the vendor applies. Results compare
  products as served, not bare models.

## License

MIT for the code and the synthetic KB.
