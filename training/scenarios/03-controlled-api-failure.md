# Scenario 3: a controlled API failure

## Starting situation

Both applications are running normally.

## Expected behaviour

Address lookup either returns fictional addresses or explains that none were found.

## Observed behaviour

The training postcode `ZZ9 9ZZ` produces a service-unavailable response.

## Task

Follow this one request from the browser through the frontend and Java logs. Use the shared request
ID and the API's Problem Details response to identify where the controlled failure begins. Explain
why the browser receives a safe message rather than the internal exception.

## Boundaries

- Do not remove the deterministic training condition.
- Do not expose stack traces or internal exception messages to the browser.
- Base your explanation on observable evidence from both applications.
