# Scenario 4: a focused test fails

## Starting situation

A facilitator has made one deliberate expectation change in a focused frontend test. Application
code has not been changed.

## Expected behaviour

The test should describe the behaviour the service currently provides.

## Observed behaviour

The focused test reports different expected and received text.

## Task

Run only the failing test, reproduce the relevant behaviour in the application, and decide whether
the product code or the changed expectation is wrong. Explain your evidence, make the smallest
justified change and rerun both focused and broader checks.

## Boundaries

- Do not update product code solely to satisfy an unexplained expectation.
- Do not delete or skip the test.
- Check the ticket or expected behaviour before changing either side.
