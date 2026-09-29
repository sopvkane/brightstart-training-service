# Testing

A test describes behaviour the software must provide and checks whether the current code provides
it. Tests give you evidence that a change works and that existing behaviour still works.

This guide uses three related terms:

- **Observable behaviour** is a result visible outside the internal implementation, such as an HTTP
  status, a heading or a JSON value.
- A **focused test** is one test file or named scenario relevant to the behaviour you are changing.
- **Broader checks** run the full tests plus tools that check formatting, types and the production
  build.

Run focused tests while investigating. Run the broader checks before opening a pull request.

## Read a test

The tests in this repository follow a three-part shape:

1. **Arrange** the application or test context.
2. **Request** the behaviour being tested. This is the action in an HTTP test.
3. **Assert** the expected observable result.

For example, the home-page test contains the same pattern:

```typescript
const application = createApplication();

const response = await request(application).get('/');

expect(response.status).toBe(200);
```

The first line arranges the Express application, the second sends the request, and the third is an
**assertion**: a statement about the result the test requires. See the complete
[home-page test](../frontend/test/home.test.ts).

Test names should describe the behaviour that failed, not the method used to implement it.

## Frontend tests

From the repository root, run all frontend tests:

```bash
npm run test:frontend
```

The frontend tests use Supertest, a library for sending HTTP requests to a Node.js application
during a test. The requests pass through the configured Express application, so the tests exercise
the routes and templates together.

They prove that pages respond successfully, forms validate submitted values, redirects go to the
expected location and stored journey state appears on a later page. They assert what a browser
receives rather than inspecting private Express or session details.

The address and identity-document journey tests use a Supertest **agent**, which keeps cookies
between requests like one browser would. This lets a test submit forms and request later pages with
the same session. The setup remains visible in the test:

```typescript
const browser = request.agent(application);
```

### Run a focused frontend test

The frontend is an npm **workspace**: a project with its own `package.json` that is managed through
the repository's root npm installation.

Run only the address-journey test file with:

```bash
npm test --workspace @brightstart/training-frontend -- test/address.test.ts
```

Run one named behaviour with:

```bash
npm test --workspace @brightstart/training-frontend -- -t "stores and displays the selected address"
```

The `-t` option selects tests whose names match the text that follows it.

`identity-document.test.ts` checks the document form, constrained-value validation, journey
prerequisites and all three guidance variants. It also proves that guidance comes from the stored
selection rather than a browser query parameter. These behaviours belong in frontend tests because
this step uses only the Express session and does not call the Java API.

`document-upload.test.ts` sends tiny synthetic buffers through the real multipart parser. It checks
the visible validation, size and single-file limits, redirect and stored receipt behaviour without
using a real identity document. `document-upload-client.test.ts` checks the separate HTTP boundary:
multipart field names, receipt validation, controlled API responses, network failures and timeout.

`check-answers-view-model.test.ts` checks the meaningful transformation from canonical state to
display text. `check-answers.test.ts` checks the rendered summary, prerequisite redirects and the
state transitions behind Change actions. It also checks submission, duplicate-submit protection,
the result page and the session-bound image route. Keeping those combinations at the route layer
makes a failure easier to locate than repeating every state transition through the full browser
journey.

`submission-journey-service.test.ts` proves that the submission is built from canonical journey
state. `submission-api-client.test.ts` checks the JSON contract, malformed responses, network
failures and timeout. `document-image-client.test.ts` checks the separate binary response boundary,
including trusted media types, missing images and unavailable responses.

## API tests

From the repository root:

```bash
cd api
./mvnw test
cd ..
```

`HealthControllerTest`, `AddressControllerTest`, `DocumentUploadControllerTest` and
`SubmissionControllerTest` use MockMvc,
Spring's tool for sending a request through Spring MVC during a test without starting the API on
port 8080. They check:

- the HTTP status;
- the media type, which identifies the response format as `application/json`; and
- the JSON response data.

The address controller test includes the real `AddressLookupService` and `SyntheticAddressSource`.
It therefore checks the HTTP contract, Problem Details failure response and synthetic lookup
behaviour together without duplicating the fixed examples in another Java test.

The document-upload controller test builds very small byte arrays with recognisable JPEG and PNG
signatures. It checks the successful receipt plus missing, empty, oversized, unsupported and invalid
document-type requests. It also retrieves accepted bytes and checks trusted content types, missing
uploads and no-store caching. A declared filename or media type does not make unsupported bytes
valid. `InMemoryDocumentUploadStoreTest` checks that the storage boundary makes a defensive copy of
mutable file bytes.

The submission controller test first stores a synthetic upload, then submits JSON that references
it. It checks the successful contract and rejects malformed submissions, unsupported document
types, missing upload IDs and document-type mismatches. This keeps the relationship between upload
and submission visible in the test setup.

### Test the boundary without starting both applications

The Express route tests provide a small `AddressJourney` replacement. Each test controls whether
the journey returns several addresses, one address, no addresses, a selected address or an error.
The rest of the request still goes through the real route, session and Nunjucks template.

`address-journey-service.test.ts` checks the meaningful application decision: only an address
returned for the current postcode can be selected. `address-api-client.test.ts` checks the next
boundary: URL encoding, JSON requests, unsuccessful HTTP responses, malformed responses, network
failures and timeouts. Together, these focused tests identify whether a failure belongs to browser
behaviour, journey decisions or HTTP communication. Playwright then checks that the real frontend
and API contracts connect.

Run just the Java address tests from the `api` folder:

```bash
./mvnw -Dtest=AddressControllerTest test
```

## Browser journey tests

The Playwright tests control a real Chromium browser. They check a small number of complete user
journeys through the frontend and Java API together. This is slower than a focused frontend or API
test, so browser tests complement those tests rather than replacing them.

Install the test browser once after running `npm ci`:

```bash
npm run install:browser
```

Playwright starts both applications automatically. You do not need to start the frontend or API in
separate terminals before running:

```bash
npm run test:browser
```

This runs Chromium without opening a visible window. Use this mode for a quick complete check and
in continuous integration.

By default, Playwright reuses this training service if it is already running on ports 3000 and 8080. If those ports contain an older build or another application, use unused test ports so that
Playwright starts the code in your current branch:

```bash
PLAYWRIGHT_FRONTEND_PORT=3100 PLAYWRIGHT_API_PORT=8180 npm run test:browser
```

On Windows PowerShell, set the two environment variables before running the command. A health check
can only prove that an API is running; it cannot prove that the process contains your latest code.

### Watch the tests use the service

Run the browser visibly and watch each journey happen:

```bash
npm run test:browser:headed
```

The tests use one worker, so the journeys run one after another instead of opening several browser
windows at once.

For an interactive view, run:

```bash
npm run test:browser:ui
```

Playwright UI mode lets you select one test, run it again and inspect each action. Close the UI when
you finish; Playwright will stop the applications it started.

The browser tests live in `browser-tests/address-journey.spec.ts`. The successful journey covers
postcode entry, address selection, identity-document selection, passport guidance, a synthetic
file upload, review, submission, synthetic result and displayed image across the real running
applications. The fixture is a generated one-pixel PNG containing no identity information. Focused
tests cover validation and state-transition variants without repeating the entire browser journey.
The tests use labels and roles such as `getByLabel` and `getByRole`, matching how a user or assistive
technology finds controls. Avoid replacing these with CSS selectors tied to visual styling.

### Investigate a browser-test failure

Start with the first failed action and compare it with what you can see in the page. Playwright
saves a screenshot and trace for a failure. The trace records browser actions, page snapshots and
network requests.

Open the HTML report locally with:

```bash
npm run test:browser:report
```

In GitHub Actions, the **Browser journey** job uploads its Playwright report after a failure. Open
the failed workflow run and download the `playwright-report` artifact. An **artifact** is a file
saved by a workflow so that you can investigate it after the job has finished.

## Interpret a failure

Start with the failing test name and the first assertion error:

- **Expected** shows the behaviour the assertion requires.
- **Received** or **Actual** shows what the application returned.
- A **stack trace** lists the function or method calls active when the failure occurred. It points to
  where the problem was observed, which is not always where the underlying problem began.

Reproduce the failure with the narrowest command, then follow the request through the code using
[how the service works](how-the-service-works.md). Change an expectation only when the required
behaviour has deliberately changed—not simply to make a failure disappear.

Prefer assertions about status codes, response data, semantic HTML elements and visible content.
Semantic HTML describes an element's purpose, such as a heading or main content area. Avoid coupling
a test to private functions, framework internals, whitespace or CSS classes unless those details are
themselves required behaviour.

## Run the complete checks

From the repository root:

| Command                  | What it checks                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `npm run format:check`   | Consistent formatting in supported code, documentation and workflow files                        |
| `npm run check:frontend` | ESLint, strict TypeScript checking, Vitest, Sass compilation and the production TypeScript build |
| `npm run test:browser`   | Complete user journeys through a real browser, the frontend and the Java API                     |

ESLint finds likely TypeScript mistakes. Type checking checks that values are used in ways their
declared types allow. A production build confirms that the frontend can be compiled into the files
used to run it outside the development tools.

Nunjucks templates are formatted manually because the repository does not add a template-formatting
plugin.

For API changes:

```bash
cd api
./mvnw verify
cd ..
```

Maven runs the API tests and packages the Java application. A successful run ends with
`BUILD SUCCESS`.
