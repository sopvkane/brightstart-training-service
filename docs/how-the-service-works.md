# How the service works

This guide helps you investigate behaviour by following a request from a URL to the code that
creates the response.

## Start with something you can observe

When you open a URL, the browser sends an **HTTP request** to an application. HTTP is the protocol
web browsers and web applications use to communicate. The application processes the request and
sends an HTTP response back.

Run the applications using the [README](../README.md), then try these requests:

- <http://localhost:3000> requests the frontend home page.
- <http://localhost:8080/api/health> requests the API health response.

These requests use the HTTP method `GET`, which asks an application for information. `/` and
`/api/health` are **paths**: the parts of the URL that identify the requested behaviour.

Before reading every file, choose one request and follow only the code involved in it.

## Code map

The tree below shows the files on each request path. A name ending in `.ts` is TypeScript, `.njk` is
a Nunjucks template and `.java` is Java.

```text
frontend/
├── src/
│   ├── server.ts              starts the HTTP server
│   ├── app.ts                 configures the frontend application
│   └── routes/home.ts         handles GET /
├── views/
│   ├── layout.njk             shared HTML page structure
│   └── home.njk               home page content
└── test/home.test.ts          checks the home page over HTTP

api/src/
├── main/java/com/example/brightstart/training/
│   ├── TrainingApiApplication.java       starts the Java application
│   └── health/
│       ├── HealthController.java         handles GET /api/health
│       └── HealthResponse.java           describes the response data
└── test/java/com/example/brightstart/training/health/
    └── HealthControllerTest.java         checks the health response
```

## Follow the frontend home-page request

A **framework** is reusable code that provides some of the structure and common behaviour needed to
build an application. Express is the Node.js web framework used by the frontend. A **route**
connects an HTTP method and path to a **handler**, the function that runs when the route matches a
request.

For `GET /`:

1. `server.ts` starts the Express application created by `app.ts`.
2. `app.ts` configures Express, Nunjucks, static assets and registers the home route. Static assets
   are files such as CSS and images that the application sends without generating them dynamically.
3. `routes/home.ts` contains the matching route and its handler.
4. The handler asks Nunjucks to render `home.njk`. **Render** means combine a template with its data
   to produce the final HTML.
5. `home.njk` supplies the page content and extends `layout.njk`, the shared page structure.
6. Express sends the resulting HTML response to the browser.

Nunjucks is a templating system. Its templates contain HTML plus instructions for inserting content
and reusing shared layouts.

### Pause or record the request

A **breakpoint** tells a debugger to pause when a line runs so you can inspect the current values.
If your editor's Node.js debugger is configured, place one inside the handler in `routes/home.ts`,
then refresh the page.

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

The current page does not use an interactive GOV.UK Frontend component, so the application does not
serve the library's browser JavaScript.

## When the behaviour is unclear

Write down the URL or command, the result you expected and the result you actually observed. Follow
the request one step at a time and run the most focused relevant test. The
[testing guide](testing.md) explains how to select a test, and the
[troubleshooting guide](troubleshooting.md) explains how to collect useful evidence before asking
for help.
