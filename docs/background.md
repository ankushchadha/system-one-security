# Background (private KB, not reproduced here)

These experiments were first run in a production citation checker on a
private KB that cannot be published. Observations that shaped this repo:

- Jev: convention notes (inverted scale, swapped labels) rarely moved verdicts;
  a swapped-label note split one choice to about 0.56/0.43 while the noul stayed
  supported. Editing facts in the state moved verdicts as expected; repeating a
  fact elsewhere in the state partly protected it.
- A same-request tripwire fired on 12 of 15 clean files, so it did not
  separate injected from clean state.
- Hosted Clef and Clef-flash: state cut at 2,048 tokens, with no warning in the
  response; prepending about 50 tokens evicted evidence at the boundary.
- Further findings are withheld pending coordinated disclosure with a vendor.
