# Scenario 2: the frontend cannot reach the API

## Starting situation

The frontend opens, but address lookup cannot complete.

## Expected behaviour

`BT9 7EP` returns several fictional addresses.

## Observed behaviour

The browser displays the safe unavailable-service page.

## Task

Reproduce one lookup, use the frontend log, request ID and API health endpoint to locate the failed
boundary, then explain whether the cause is browser-facing code, frontend configuration or the API
process. Make the smallest justified correction and verify the lookup.

## Boundaries

- Do not replace the safe error page with raw technical details.
- Do not hard-code a second API URL in a route or client.
- Do not log postcode or session contents while investigating.
