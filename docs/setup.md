# Set up your development environment

Use this guide when preparing a new laptop or setting up professional development tools for the
first time. Work through the milestones in order. If your organisation manages your laptop, follow
its software-installation and security policies where they differ from this guide.

## Before you begin

You will meet four related tools:

- **GitHub** is the website where the shared repository, tickets and pull requests live.
- **Git** records changes on your laptop and exchanges them with GitHub.
- An **editor** or **integrated development environment (IDE)** is where you read, change and
  navigate code.
- A **terminal** is an application where you type commands. VS Code and IntelliJ both include one.

You do not need previous experience with these tools. Complete each verification command before
moving on; it gives you a known point to return to if something later fails.

## Prepare your GitHub account

Every learner needs their own GitHub account. If you do not have one, follow GitHub's
[getting-started account guide](https://docs.github.com/en/get-started/onboarding/getting-started-with-your-github-account).
Use an email address permitted by your organisation, verify it and enable two-factor authentication
(2FA). Your username appears on your GitHub profile and in its URL.

Ask your facilitator for the training repository link and confirm that you can open it while signed
in. Seeing the repository proves account access; it does not yet prove that Git on your laptop can
authenticate when you later push work.

Keep these distinctions clear:

```text
GitHub account      who you are on github.com
Git authentication proof that this laptop may access GitHub
Git commit identity the name and email recorded with a change
```

The [Git and GitHub identity guide](github-identity.md) explains the last two before your first
commit.

## Choose an editor

You need one editor, not both.

### Visual Studio Code — recommended starting point

VS Code is lightweight and works well across this TypeScript and Java repository. Use Microsoft's
[official setup instructions](https://code.visualstudio.com/docs/setup/setup-overview) for Windows
or macOS.

The useful extensions for this repository are ESLint, Prettier and Extension Pack for Java. Install
them from the editor's Extensions view; a large extension catalogue is unnecessary.

### IntelliJ IDEA

IntelliJ IDEA is particularly strong for Java and can also open the whole repository. JetBrains now
provides [one unified IntelliJ IDEA distribution](https://www.jetbrains.com/help/idea/installation-guide.html),
with core Java features available without a paid subscription. You do not need to search for a
separate “Community Edition”.

## Install Git

Git records your local changes and connects the cloned repository to GitHub.

### Windows

Download **Git for Windows** from the [official Git download page](https://git-scm.com/download/win)
and use the installer defaults unless your organisation tells you otherwise. It includes Git
Credential Manager, which can open a browser for secure HTTPS authentication.

### macOS

Use one of the options on the [official Git for macOS page](https://git-scm.com/download/mac). On a
managed laptop, use the route approved by your organisation. Running `git --version` may offer to
install Apple's command-line developer tools if Git is absent.

Open a new terminal and verify the installation:

```bash
git --version
```

A successful result begins with `git version` followed by a version number.

## Install Node.js and npm

Node.js runs the TypeScript frontend and its development tools. npm is installed with Node.js and
downloads this repository's Node packages.

This repository supports Node.js 22 and npm 10. `.node-version` records the precise version used by
CI and known to work, while `package.json` accepts any compatible patch in those major versions.

### Windows and macOS

Use the [official Node.js download page](https://nodejs.org/en/download) and select a Node.js 22
installer for your operating system. Do not choose a newer major version. A version manager can be
useful when several projects require different Node versions, but it is not required for this
course; follow organisational guidance if one is already provided.

Open a new terminal after installation and run:

```bash
node --version
npm --version
```

The first result must begin with `v22.` and the second with `10.`. A different patch number is fine.

## Install Java

The API needs a Java 17 **Java Development Kit (JDK)**. A JDK includes the tools required to compile
and run Java code. Eclipse Temurin is a supported OpenJDK distribution for Windows and macOS.

Download a Java 17 JDK for your operating system from the
[Eclipse Temurin releases page](https://adoptium.net/temurin/releases/?version=17) and follow its
[installation instructions](https://adoptium.net/installation/). If your organisation supplies an
approved Java 17 JDK, use that instead.

Open a new terminal and run:

```bash
java -version
```

The output may begin with `openjdk version`, but its major version must be `17`.

You do **not** need to install Maven separately. The repository contains a **Maven Wrapper** that
downloads and runs the required Maven version:

- macOS: `./mvnw`
- Windows PowerShell or Command Prompt: `mvnw.cmd`

## Clone the repository

**Cloning** downloads the repository and its history into a new folder on your laptop while keeping
a connection to the shared GitHub repository.

1. Open the training repository on GitHub.
2. Select **Code**, choose **HTTPS**, and copy the displayed URL.
3. In a terminal, move to the parent folder where you keep development work.
4. Run the following, replacing the placeholder with the copied URL:

```bash
git clone <repository-url>
cd brightstart-training-service
```

HTTPS is the simplest starting point. Git may open a browser so Git Credential Manager can sign in
to GitHub. Never paste a password, token or private key into a repository file. GitHub's
[cloning guide](https://docs.github.com/en/get-started/using-git/getting-changes-from-a-remote-repository#cloning-a-repository)
shows where to find the HTTPS URL.

If cloning says that the repository does not exist or access is denied, first confirm that the same
account can open it in a browser. Then use
[repository access troubleshooting](troubleshooting.md#repository-access-or-cloning-fails).

## Configure your commit identity

Set an identity for this repository after cloning. Use your own name and an email connected to your
GitHub account:

```bash
git config --local user.name "Your Name"
git config --local user.email "your-email@example.com"
git config --local --get user.name
git config --local --get user.email
```

Repository-local configuration is safer when future work, client and personal repositories may use
different identities. Read [Git and GitHub identity](github-identity.md) before committing.

## Install repository dependencies

From the repository root—the folder containing `README.md`, `package.json`, `frontend` and `api`—run:

```bash
npm ci
```

`npm ci` installs the exact versions recorded in `package-lock.json`. It does not choose newer
versions or alter the lockfile. A successful run finishes without an npm error.

## Install Playwright Chromium

The browser journey tests control a repository-managed copy of Chromium. This is a test browser,
not a replacement for the browser you normally use.

```bash
npm run install:browser
```

Playwright downloads the browser version expected by this repository. This command needs network
access and may take a few minutes.

## Check the environment

Run the repository's read-only diagnostic:

```bash
npm run doctor
```

It checks Git, Node.js, npm, Java, installed Node dependencies and Playwright Chromium. It does not
install anything or modify your laptop. Fix each item marked `✗` using the linked section, then run
it again. A ready environment ends with:

```text
Your environment is ready.
```

## Run the applications

The service contains two applications, so keep two terminals open in the repository root.

### Terminal 1 — frontend

```bash
npm run dev:frontend
```

Open <http://localhost:3000>. **localhost** means your own laptop; port **3000** identifies the
frontend process running on it.

### Terminal 2 — Java API

macOS:

```bash
cd api
./mvnw spring-boot:run
```

Windows PowerShell or Command Prompt:

```bat
cd api
mvnw.cmd spring-boot:run
```

Open <http://localhost:8080/api/health>. Port **8080** identifies the separate API process. A healthy
response is:

```json
{ "status": "UP" }
```

The frontend produces HTML pages and calls the Java API for data and behaviour. Stop either process
with <kbd>Ctrl</kbd>+<kbd>C</kbd> in its terminal.

## Verify the complete environment

Use this checklist before starting a ticket:

- [ ] `git --version` succeeds.
- [ ] `node --version` begins with `v22.`.
- [ ] `npm --version` begins with `10.`.
- [ ] `java -version` reports Java 17.
- [ ] The repository is cloned and `git status` works inside it.
- [ ] `npm ci` succeeds.
- [ ] `npm run install:browser` succeeds.
- [ ] `npm run doctor` says the environment is ready.
- [ ] The frontend opens at <http://localhost:3000>.
- [ ] The API health endpoint returns `UP` at <http://localhost:8080/api/health>.
- [ ] `npm run check:frontend` passes.
- [ ] `cd api` followed by `./mvnw verify` (macOS) or `mvnw.cmd verify` (Windows) passes.
- [ ] From the repository root, `npm run test:browser` passes.

## Optional: run with Docker

Docker is not required for the initial setup or course exercises. Use the manual setup first so you
understand the two applications. A **container** is an isolated process packaged with the runtime
and files it needs, giving different laptops a consistent way to run an application.

Install Docker Desktop only if permitted, using Docker's official instructions for
[Windows](https://docs.docker.com/desktop/setup/install/windows-install/) or
[macOS](https://docs.docker.com/desktop/setup/install/mac-install/). Docker Desktop includes Docker
Compose.

From the repository root, build and start both containers:

```bash
docker compose up --build
```

Then open <http://localhost:3000> and <http://localhost:8080/api/health>. In this mode the connection
is:

```text
Your browser → localhost:3000 → frontend container → api:8080
```

`api` is the Compose service name resolved inside Docker's private network. In manual mode the
frontend process instead calls `localhost:8080` on your laptop.

Useful commands are:

```bash
docker compose logs -f
docker compose down
docker compose up --build
```

The first follows logs until <kbd>Ctrl</kbd>+<kbd>C</kbd>, the second stops and removes the local
containers, and the third rebuilds after code or dependency changes. If Docker cannot connect, see
[Docker troubleshooting](troubleshooting.md#docker-is-not-running).
