# BrightStart Training Service

Welcome to the BrightStart Training Service.

This is a small practice application that you can run and change on your own laptop. You will use
it in the same way you would use a real project at work:

- find your way around code you have not seen before;
- work out where a behaviour comes from;
- make a small change;
- run tests;
- use Git to record your work;
- open a pull request, which asks another developer to review your change; and
- understand what happened when an automated check passed or failed.

You are not expected to know how all of this works already. This project gives you somewhere safe
to learn it.

> This is a fictional training service, not a real government service. It must never contain real
> client, Deloitte or personal data.

## Start here

The folder containing this project's code, tests and documentation is called a **repository**, or
**repo**. Open a **terminal** in the main `brightstart-training-service` folder. A terminal is the
application where you type the commands in this guide.

### 1. Check your laptop is ready

Run:

```bash
node --version
npm --version
java -version
git --version
```

You need Node.js 22, npm 10, Java 17 and Git. If a command is missing or shows a different major
version, use the [setup guide](docs/setup.md) before continuing.

### 2. Install the Node.js dependencies

Run this from the main repository folder:

```bash
npm ci
```

A **dependency** is a package of code or a development tool that this project relies on. npm reads
the project's package files and installs its Node.js dependencies. When the command finishes
without an error, continue to the next step.

### 3. Start the frontend

The **frontend** is the application that produces the page a user sees in their web browser. Start
it with:

```bash
npm run dev:frontend
```

Leave that terminal running and open <http://localhost:3000> in a browser. You should see the
BrightStart Training Service page.

`localhost` means the application is running on your own computer rather than on the internet.
`3000` is the **port** that identifies this running application.

### 4. Start the Java API application

An **API** defines how software can request data or behaviour from another piece of software. This
project has a Java application that exposes an API.

Open a second terminal in the main repository folder and run:

```bash
cd api
./mvnw spring-boot:run
```

`cd api` moves that terminal into the `api` folder. `./mvnw` is the Maven Wrapper script included
with the project; it downloads and runs the required Maven version for you.

Open <http://localhost:8080/api/health>. You should see:

```json
{ "status": "UP" }
```

When you open that URL, the browser sends a **request** to the API and receives a **response**. The
response is JSON, a text format used to represent structured data. This response tells you that the
Java application is running.

### 5. Try the service journey

Return to <http://localhost:3000>, select **Start now** and enter one of these training postcodes:

- `BT9 7EP` returns several fictional addresses;
- `ZZ1 1ZZ` returns one fictional address; or
- any other postcode returns no addresses.

Choose an address and continue to the confirmation page. The addresses are fixed training data:
the service never contacts a real address provider.

Stop either application by returning to its terminal and pressing <kbd>Ctrl</kbd>+<kbd>C</kbd>.

## What have you started?

There are two applications running on your laptop:

| Application          | What it does                                         | Address                 |
| -------------------- | ---------------------------------------------------- | ----------------------- |
| Frontend             | Produces the page shown in the browser               | <http://localhost:3000> |
| Java API application | Provides data through URLs that software can request | <http://localhost:8080> |

```text
Your browser → Frontend application → Java API application
                  localhost:3000       localhost:8080
```

The browser sends page requests and form submissions to the frontend. When an address is needed,
the frontend asks the Java API for fictional address data. Follow
[how the service works](docs/how-the-service-works.md) to trace that request through both
applications.

## When you are given a ticket

On a development team, a **ticket** is a small written piece of work describing a change or problem.
Do not begin by changing code immediately.

1. Read what the ticket says should happen.
2. Run the application and observe what happens now.
3. Find the part of the code involved.
4. Investigate until you understand enough to make a change.
5. Make the smallest change that solves the problem.
6. Test it and inspect exactly what you changed.
7. Ask another developer to review it.

The complete process is in [CONTRIBUTING.md](CONTRIBUTING.md).

## When you get stuck

Getting stuck is normal. You do not need to solve a problem before asking for help. First collect:

- what you were trying to do;
- what you expected to happen;
- what actually happened;
- the command you ran and the first useful error; and
- what you have already tried.

Being able to explain what you know is an important engineering skill. The
[troubleshooting guide](docs/troubleshooting.md) will help you collect useful evidence.

## Useful guides

Use these when you need them rather than trying to read everything at once:

- [Set up the project or fix a missing tool](docs/setup.md)
- [Follow a request through the code](docs/how-the-service-works.md)
- [Understand and run tests](docs/testing.md)
- [Set up your GitHub identity](docs/github-identity.md)
- [Work on a ticket and open a pull request](CONTRIBUTING.md)
- [Troubleshoot a problem](docs/troubleshooting.md)
