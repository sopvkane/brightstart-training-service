# How the service works

This guide helps you investigate behaviour by following a request from a URL to the code that
creates the response.

## Start with something you can observe

When you open a URL, the browser sends an **HTTP request** to an application. HTTP is the protocol
web browsers and web applications use to communicate. The application processes the request and
sends an HTTP response back.

Run the applications using the [README](../README.md), then try these requests:

- <http://localhost:3000> requests the frontend home page.
- <http://localhost:3000/before-you-start> requests the next page in the service journey.
- <http://localhost:3000/address> requests the postcode-entry page.
- <http://localhost:8080/api/health> requests the API health response.

These requests use the HTTP method `GET`, which asks an application for information. `/`,
`/before-you-start`, `/address` and `/api/health` are **paths**: the parts of the URL that identify
the requested behaviour.

Before reading every file, choose one request and follow only the code involved in it.

## Code map

The tree below shows the files on each request path. A name ending in `.ts` is TypeScript, `.njk` is
a Nunjucks template and `.java` is Java.

```text
frontend/
├── src/
│   ├── server.ts              starts the HTTP server
│   ├── app.ts                 configures the frontend application
│   ├── routes/
│   │   ├── home.ts            handles GET /
│   │   ├── before-you-start.ts handles GET /before-you-start
│   │   └── address.ts         handles the postcode routes
│   └── types/
│       └── express-session.d.ts describes the stored session data
├── views/
│   ├── layout.njk             shared HTML page structure
│   ├── home.njk               start page content
│   ├── before-you-start.njk   Before you start page content
│   ├── address.njk            postcode form and validation errors
│   └── address-confirmed.njk  temporary confirmation page
└── test/
    ├── home.test.ts           checks the start page over HTTP
    ├── before-you-start.test.ts checks the Before you start page over HTTP
    └── address.test.ts        checks postcode entry and stored state

api/src/
├── main/java/com/example/brightstart/training/
│   ├── TrainingApiApplication.java       starts the Java application
│   └── health/
│       ├── HealthController.java         handles GET /api/health
│       └── HealthResponse.java           describes the response data
└── test/java/com/example/brightstart/training/health/
    └── HealthControllerTest.java         checks the health response
```

## Follow a frontend request

A **framework** is reusable code that provides some of the structure and common behaviour needed to
build an application. Express is the Node.js web framework used by the frontend. A **route**
connects an HTTP method and path to a **handler**, the function that runs when the route matches a
request.

For a frontend page:

1. `server.ts` starts the Express application created by `app.ts`.
2. `app.ts` configures Express, Nunjucks, sessions and static assets, then registers the routes.
   Static assets are files such as CSS and images that the application sends without generating
   them dynamically.
3. Express selects the route whose path matches the request.
4. The route's handler asks Nunjucks to render the corresponding template. **Render** means combine
   a template with its data to produce the final HTML.
5. The page template supplies the content and extends `layout.njk`, the shared page structure.
6. Express sends the resulting HTML response to the browser.

| Request                  | Route                        | Template                                        |
| ------------------------ | ---------------------------- | ----------------------------------------------- |
| `GET /`                  | `routes/home.ts`             | `home.njk`                                      |
| `GET /before-you-start`  | `routes/before-you-start.ts` | `before-you-start.njk`                          |
| `GET /address`           | `routes/address.ts`          | `address.njk`                                   |
| `POST /address`          | `routes/address.ts`          | Redirect or `address.njk` when validation fails |
| `GET /address-confirmed` | `routes/address.ts`          | `address-confirmed.njk`                         |

Nunjucks is a templating system. Its templates contain HTML plus instructions for inserting content
and reusing shared layouts.

## Follow a postcode submission

An HTML **form** sends values entered by the user to an application. The postcode form uses the
HTTP method `POST`, which sends the form data to `POST /address` for processing.

```text
GET /address
    ↓
postcode form
    ↓ POST /address
trim spaces and convert letters to uppercase
    ↓
store postcode in the session
    ↓ 303 redirect
GET /address-confirmed
    ↓
display the stored postcode
```

A **session** is server-side state kept for one browser journey. `express-session` stores the
postcode in the frontend's memory and gives the browser a cookie containing only the session
identifier. A cookie is a small value that the browser returns with later requests. This training
service does not store the postcode in a database, so restarting the frontend clears it.

If the postcode is empty, the handler renders `address.njk` again with a `400` response, an error
summary and an error attached to the input. If it is present, the handler normalises and stores it,
then sends a `303` **redirect**. A redirect tells the browser to make a new request to another URL.

This produces the POST/Redirect/GET pattern: the browser submits once with `POST`, then displays the
result using `GET`. Refreshing the confirmation page repeats only the final `GET`, not the form
submission.

### Pause or record the request

A **breakpoint** tells a debugger to pause when a line runs so you can inspect the current values.
If your editor's Node.js debugger is configured, place one inside the handler for the page you are
investigating, then refresh the page.

You can also add a temporary `console.log` inside the handler. Refresh the page and look in the
terminal running the frontend. Remove temporary diagnostic output before committing unless it has a
lasting operational purpose.

### Why `app.ts` and `server.ts` are separate

`app.ts` configures the application without opening a fixed port. `server.ts` takes that configured
application and starts the real server. The frontend tests can therefore use the same application
configuration without starting another server on port 3000.

## Follow the API health request

Spring Boot is the framework that starts and configures the Java API application. Its embedded web
server is included in the application rather than installed and started separately.

For `GET /api/health`:

1. `TrainingApiApplication` starts Spring Boot and the embedded web server.
2. Spring finds the matching mapping in `HealthController`. A **controller** is a Java class that
   handles HTTP requests; the mapping connects the method and path to a Java method.
3. `getHealth` returns a `HealthResponse` record. A Java **record** is a concise class used here to
   describe the response data.
4. Spring **serialises** the record: it converts the Java value into the JSON text sent in the HTTP
   response.

If your editor's Java debugger is configured, place a breakpoint on the first line of
`HealthController.getHealth`. Request the health URL, inspect the returned record and compare it with
the JSON response.

## Reference: GOV.UK Frontend and service assets

You can skip this section unless you are changing templates, styles or frontend asset configuration.

GOV.UK Frontend is the component and styling library used by the frontend. This service uses its
supported Sass and Nunjucks APIs with generic, non-GOV.UK branding:

- **Node module resolution** finds an installed package by following Node.js package lookup rules.
  It works whether npm installs the package beside the frontend or **hoists** it to the repository
  root to share it across workspaces.
- Nunjucks loads the Generic header **macro** from the resolved package. A macro is a reusable
  template component.
- Sass uses its Node package importer to load GOV.UK Frontend and apply the service's font and colour
  choices.
- Service-owned static assets live in `frontend/public` and are available under `/assets`.
- The Start now link uses the GOV.UK Frontend button component. `app.ts` makes the library's browser
  JavaScript and source map available at two specific `/assets/govuk` paths, and `layout.njk`
  initialises it. This provides the component's expected keyboard behaviour without exposing the
  rest of the installed package as static files.

## When the behaviour is unclear

Write down the URL or command, the result you expected and the result you actually observed. Follow
the request one step at a time and run the most focused relevant test. The
[testing guide](testing.md) explains how to select a test, and the
[troubleshooting guide](troubleshooting.md) explains how to collect useful evidence before asking
for help.
