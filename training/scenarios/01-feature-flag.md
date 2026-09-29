# Scenario 1: unexpected document guidance

## Starting situation

The service starts successfully and the normal checks passed before the exercise.

## Expected behaviour

After selecting Passport, the guidance heading is **Get your passport ready**.

## Observed behaviour

The page instead says **Take a clear image of your passport**. Editing the obvious Nunjucks
template does not explain where that wording originates.

## Task

Trace the visible wording back through the route, domain code and application configuration. Explain
why this process shows alternate guidance and identify the smallest justified way to restore the
default behaviour.

## Boundaries

- Do not add a query parameter or store configuration in the session.
- Do not delete alternate guidance merely to make this run look correct.
- Use browser behaviour, startup configuration and tests as evidence.
