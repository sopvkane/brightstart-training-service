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

The postcode test uses a Supertest **agent**, which keeps cookies between requests like one browser
would. This lets the test submit a postcode and then request the confirmation page with the same
session. The setup remains visible in the test:

```typescript
const browser = request.agent(application);
```

### Run a focused frontend test

The frontend is an npm **workspace**: a project with its own `package.json` that is managed through
the repository's root npm installation.

Run only the postcode test file with:

```bash
npm test --workspace @brightstart/training-frontend -- test/address.test.ts
```

Run one named behaviour with:

```bash
npm test --workspace @brightstart/training-frontend -- -t "normalises and stores the postcode"
```

The `-t` option selects tests whose names match the text that follows it.

## API tests

From the repository root:

```bash
cd api
./mvnw test
cd ..
```

`HealthControllerTest` uses MockMvc, Spring's tool for sending a request through Spring MVC during a
test without starting the API on port 8080. It checks:

- the HTTP status;
- the media type, which identifies the response format as `application/json`; and
- the JSON response data.

A **mock** is a controlled replacement for something the code normally calls. The health controller
has no collaborators—other objects that it calls to do its work—so this test does not need mocks.

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
