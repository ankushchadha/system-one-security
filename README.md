# system-one-security

Rerunnable security experiments on System One decision models: TypeSafe Jev
and Cloudflare Clef / Clef-flash. These models read a `state` and answer typed
questions (`noul`: a yes/no probability; `choice`: one of named options)
instead of generating text.

## What we found (one synthetic KB, hosted APIs, 2026-10-03)

- **The models believe the state.** Edit a fact in the state and the verdict follows it (03).
- **Hosted Clef ignores everything after about 2,048 tokens of state**, with no sign in the response. We found this independently; checking prior work showed it had already been reported publicly a day or two earlier (see `docs/prior-work.md`). Claims whose evidence sits past the cut fail, and text added at the start pushes facts at the end out of view (01, 04).
- **Instruction-style injections mostly failed.** No wrong claim passed on the choice answer in any condition; on the yes/no answer, two injections let one wrong claim through in every run. On Jev, a "labels are swapped" note at the end of the state pushed nearly every correct claim below 0.5 on the yes/no answer (02).

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
`JEV_MODEL`); every result file records the model ids the APIs returned.

Cost (prices checked 2026-10-03): TypeSafe $0.042 per million input tokens
([models](https://docs.typesafe.ai)); Workers AI Clef $0.24 and Clef-flash
$0.09 per million input tokens, with 10,000 free neurons a day, about 0.46M
Clef or 1.2M Clef-flash tokens
([pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)).
One run of all five experiments is roughly 0.3M to 0.5M input tokens per
backend: under $0.03 on Jev, inside one day's free tier on Clef-flash.

## Notes

- The Workers AI request includes `model`, which the input schema lists as required.
- Hosted Clef truncates state at 2,048 tokens (reported before us; see
  `docs/prior-work.md`). Every KB file here is under that, so experiments 02,
  03 and 05 are not affected by it; 01 and 04 measure it.
- Hosted APIs include whatever wrapping the vendor applies. Results compare
  products as served, not bare models.

## License

MIT for the code and the synthetic KB.
