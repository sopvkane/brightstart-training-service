# Troubleshooting

Getting stuck is normal. An error is evidence about what happened, not proof that you should already
know the answer.

For a new laptop, begin with the [first-time setup guide](setup.md). Run `npm run doctor` after
installing the repository dependencies to turn common environment problems into specific next
steps.

## Collect useful evidence

Write down:

1. The exact command or URL you used.
2. The result you expected.
3. The result you actually received.
4. The first meaningful error, not only the final summary line.
5. The checks or fixes you have already tried and what each one changed.

Try to reproduce the problem consistently and check one assumption at a time. A useful technical
question includes these five points. You do not need to solve the problem before asking for help.

## A command is not found

An error such as `command not found: npm` or `java is not recognized` means the terminal cannot find
that tool.

Check each required tool:

```bash
node --version
npm --version
java -version
git --version
```

If a managed training laptop is missing a tool, use your organisation's installation instructions
or ask the facilitator. Installing another copy without understanding the existing setup can make
the problem harder to diagnose.

## A command cannot find `package.json` or the `api` folder

You are probably in the wrong directory. Commands run relative to the terminal's current folder.

On macOS or Linux, check it with:

```bash
pwd
ls
```

On Windows PowerShell:

```powershell
Get-Location
Get-ChildItem
```

The repository root contains `README.md`, `package.json`, `frontend` and `api`. Move into that folder
before retrying the command.

## npm reports an unsupported engine

An npm **engine** requirement describes the supported Node.js and npm versions. Check yours:

```bash
node --version
npm --version
```

This repository supports Node.js 22 and npm 10. Install or select those major versions, then run
`npm ci` again. Do not use `--force` to bypass the check.

Return to [Install Node.js and npm](setup.md#install-nodejs-and-npm) if either major version is
wrong.

## Repository access or cloning fails

If `git clone` reports that the repository was not found or that access was denied:

1. Open the repository URL in a browser while signed in to GitHub.
2. Check that you are using the GitHub account your facilitator expects.
3. Confirm that your invitation to the repository or organisation has been accepted.
4. Copy the HTTPS URL again from the repository's **Code** menu.

If browser access works but Git still cannot authenticate, follow GitHub's
[HTTPS credential guidance](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git)
or ask which organisation-managed authentication method to use. Do not put a token in the clone URL
or save credentials in this repository.

## `npm ci` cannot download dependencies

Read the first npm error rather than only the final `npm error` summary. Check that:

- the terminal has network access;
- you are in the repository root;
- Node.js 22 and npm 10 are active; and
- any organisation-managed npm proxy or registry configuration is available.

Do not change `package-lock.json`, disable certificate checks or use `--force` to bypass the failure.
Return to [Install repository dependencies](setup.md#install-repository-dependencies), then share the
first error with your facilitator if the download still fails.

## `npm ci` says the lockfile is out of date

`package.json` is the npm **manifest** listing the direct dependencies. `package-lock.json` is the
**lockfile** recording the exact resolved versions. `npm ci` stops when those files disagree rather
than changing the lockfile automatically.

Inspect both files:

```bash
git diff -- package.json package-lock.json
```

If you did not intend to change dependencies, ask before restoring files when you have other work in
progress. If you deliberately changed a dependency, use the supported Node.js and npm versions, run
`npm install`, review both files, then run `npm ci` before asking for review.

## The terminal does not return after starting an application

This is expected. A web server is a running **process** that waits for requests, so the command keeps
control of that terminal.

Leave it running while using the application. Open another terminal for other commands, and press
<kbd>Ctrl</kbd>+<kbd>C</kbd> when you want to stop the server.

## The browser cannot connect

Check:

- the terminal running the application is still open;
- the terminal shows a successful startup message rather than an earlier error;
- the URL starts with `http://`, not `https://`;
- the frontend URL uses port 3000; and
- the API URL uses port 8080 and the path `/api/health`.

Restart the relevant application after fixing the first error shown in its terminal.

## The page says it cannot find addresses right now

The frontend shows this message when it cannot get a successful response from the Java API. Check
that the API terminal is still running and that <http://localhost:8080/api/health> returns
`{"status":"UP"}`.

The frontend uses `http://localhost:8080` by default. If you deliberately started the API on a
different address, set `ADDRESS_API_BASE_URL` before starting the frontend. For example, on macOS
or Linux:

```bash
ADDRESS_API_BASE_URL=http://localhost:8081 npm run dev:frontend
```

Use the environment-variable syntax for your shell if you are using Windows. Do not change the
application's default merely to work around an API process that has stopped.

## The page says it could not upload your image

The frontend sends the selected training image to the Java API. Check that the API terminal is
running and that <http://localhost:8080/api/health> returns `{"status":"UP"}`. Then check that the
file is one JPEG or PNG image that is 5 MB or smaller.

Renaming a text file to end in `.jpg` does not turn it into a JPEG. The API checks the file's leading
bytes instead of trusting its name or the media type reported by the browser. Use only a synthetic
training image, never a real identity document. If the API terminal shows an unexpected failure,
record the first meaningful error before retrying.

## Submission fails or the result image is missing

The frontend journey and the uploaded image live in two different processes. The frontend keeps
journey metadata in its in-memory session, while the Java API keeps accepted image bytes in its
in-memory upload store.

Check that both applications are still running. If the Java API was restarted after you uploaded
the image, it no longer has the bytes referenced by the frontend session. Start again at the upload
page and upload a new synthetic image. If the frontend was restarted, begin the journey again
because its session state has been cleared.

This short lifetime is intentional in the local training service. Do not add a database or copy
image bytes into the frontend session to work around it.

## Browser tests cannot find Chromium

Playwright needs its own known browser version. Installing the Node.js dependencies does not
download that browser. From the repository root, run:

```bash
npm run install:browser
```

Then run `npm run test:browser` again. Do not change the test to use an unrelated browser already
installed on the laptop; using Playwright's expected Chromium version keeps local and CI results
consistent.

See [Install Playwright Chromium](setup.md#install-playwright-chromium) for its role in the project.

## Browser tests say a web server is already running

Browser tests start the frontend and Java API automatically, and normally reuse applications that
you already started locally. An older copy can pass the health check but lack the behaviour in your
current branch. Stop it, or run the test on unused ports:

```bash
PLAYWRIGHT_FRONTEND_PORT=3100 PLAYWRIGHT_API_PORT=8180 npm run test:browser
```

The port troubleshooting below explains how the two normal application ports are used.

## Port 3000 or 8080 is already in use

A **port** is the local number identifying which running process should receive a request. This
error means another process is already using the required port.

Stop the other process if you recognise it, or use another port temporarily.

Frontend on macOS or Linux:

```bash
PORT=3001 npm run dev:frontend
```

Frontend in Windows PowerShell:

```powershell
$env:PORT=3001
npm run dev:frontend
```

Frontend in Windows Command Prompt:

```bat
set PORT=3001 && npm run dev:frontend
```

Then open <http://localhost:3001>.

API, from the repository root:

```bash
cd api
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

On Windows, use `mvnw.cmd` instead of `./mvnw`. Open
<http://localhost:8081/api/health>, then run `cd ..` after stopping the API.

## Styles are missing or look unchanged

From the repository root, compile the SCSS source into CSS again:

```bash
npm run build:styles:frontend
```

Reload the page without using the browser's cached copy. Use <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>
on Windows or Linux, or <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> on macOS.

The generated `frontend/public/application.css` file is not committed. A successful style build
finishes without an error.

## Java has the wrong version

Check:

```bash
java -version
```

Install or select a Java 17 JDK. The **JDK**, or Java Development Kit, includes the compiler needed
to build the code. A Java Runtime Environment alone can run some Java programs but cannot compile
this project.

## `./mvnw` reports permission denied

Run the wrapper from the `api` folder and check its permissions:

```bash
cd api
ls -l mvnw
```

The repository records `mvnw` as executable. If a fresh Git clone has lost that permission, show the
command and output to the facilitator before changing the generated wrapper file.

## The Maven Wrapper cannot download Maven or dependencies

Maven Central is an online package repository from which Maven downloads Java tools and libraries.
It is different from this Git repository. The first wrapper run requires network access to it.

Check your network connection and your organisation's documented proxy settings. A **proxy** is an
organisation-managed service through which network traffic may need to pass. Do not commit personal
proxy credentials or edit the wrapper to use an unapproved download location.

After connectivity is restored, run this from the repository root:

```bash
cd api
./mvnw verify
cd ..
```

A successful verification finishes with `BUILD SUCCESS`.

## Docker is not running

An error such as `Cannot connect to the Docker daemon` means the Docker command is installed but the
Docker engine is not available. Start Docker Desktop and wait until it reports that the engine is
running, then check:

```bash
docker version
docker compose version
```

If either still fails, use your organisation's approved support route or Docker's installation
guide linked from [Optional: run with Docker](setup.md#optional-run-with-docker). Docker is optional;
you can continue with the manual two-terminal setup without it.
