# Scenario 5: local checks and CI disagree

## Starting situation

Focused tests pass locally, but a pull request check is red.

## Expected behaviour

The same committed change should pass the repository's required CI checks.

## Observed behaviour

The CI formatting step reports a file that does not match repository formatting, or the environment
doctor reports an unsupported tool major version.

## Task

Read the first failed CI step, find its equivalent repository command, compare local tool versions
and committed files, then reproduce the failure locally. Correct the cause and verify the same
command before updating the pull request.

## Boundaries

- Do not weaken or remove the CI check.
- Do not use `--force` to bypass supported versions.
- Do not repeatedly rerun CI without collecting new evidence.
