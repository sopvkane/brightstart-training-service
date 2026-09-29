# Investigation exercises

These scenarios use the completed service to practise investigating behaviour with the browser,
code, configuration, logs, tests and CI. Start with one scenario rather than reading all of them.

## Confirm the healthy baseline

From the repository root, run:

```bash
npm run doctor
npm run check:frontend
cd api
./mvnw verify
cd ..
npm run test:browser
```

`npm run verify` is a shorter local baseline for the environment, formatting and frontend. It does
not install Playwright, run Maven or start the complete browser journey.

If the full baseline passes, the repository itself starts healthy. Record any failure before an
exercise rather than assuming it is part of the scenario.

## Scenarios

1. [Unexpected document guidance](scenarios/01-feature-flag.md)
2. [The frontend cannot reach the API](scenarios/02-api-boundary.md)
3. [A controlled API failure](scenarios/03-controlled-api-failure.md)
4. [A focused test fails](scenarios/04-failing-test.md)
5. [Local checks and CI disagree](scenarios/05-ci-environment.md)

Each exercise asks you to establish expected behaviour, reproduce what happened, collect evidence,
explain the cause, make only the smallest justified change where one is needed, and verify the
result.

## Return to a known-good state

First inspect your work:

```bash
git status
git diff
```

Do not discard changes you want to keep. Commit them on your exercise branch, or ask a facilitator
whether to use `git stash`. To discard one exercise edit only after reviewing it, use:

```bash
git restore path/to/file
```

Replace the example with the exact file shown by `git status`; never use a broad path without
checking what it contains. Environment changes take effect only when a process starts, so stop and
restart the frontend after changing or removing an environment variable. Then rerun the baseline.

## Facilitator material

The [facilitator guide](facilitator/README.md) describes preparation and intended evidence paths.
It is convenient, not secret: anyone with this repository can read committed files and history.
For assessed exercises, facilitators should keep final patches outside the learner repository or on
separately controlled branches.
