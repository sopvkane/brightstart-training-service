# Contributing

This guide takes you from a ticket to a reviewed change. It uses the same Git and GitHub terms you
will meet on a development team and explains them when they first affect your work.

## Start from a ticket

A **ticket** is a small written piece of work that describes a change, problem or expected
behaviour. Read it before editing code. If the expected behaviour is unclear, ask before choosing an
interpretation that changes the scope of the work.

Use the ticket reference as the complete branch name:

A Git **branch** gives you a separate place to make one change. A **pull request**, often shortened
to **PR**, asks other developers to review that branch before it is merged into `main`.

A delivery ticket reference and a GitHub issue number are related but not interchangeable. For
example, `DEV-004` is the ticket reference and branch name, while `#4` means GitHub issue 4. Writing
`Closes #4` in a pull request links that issue; GitHub closes it when the pull request is merged
into the default branch.

```text
Issue:  DEV-123 Fix postcode validation
Branch: DEV-123
PR:     DEV-123: Fix postcode validation
```

Start from an up-to-date `main` branch and check that Git is not already showing work you need to
preserve:

```bash
git status
git checkout main
git pull
git checkout -b DEV-123
```

`git pull` updates your local `main` with changes from the shared repository. The final command
creates and switches to the new branch. If `git status` shows unexpected changes, stop and ask
before switching branches or removing anything.

Do not add `feature/`, `chore/` or a descriptive suffix to the branch name.

## Reproduce the current behaviour

Run the application before changing it. Record:

- what the ticket says should happen;
- what you did to reproduce it; and
- what actually happened.

This gives you a starting point and evidence that you can compare with the result after your change.

## Locate the relevant code

Start from the URL or request involved in the behaviour. Follow it through the route or controller,
response data and template. Use [how the service works](docs/how-the-service-works.md) as a map, but
read the code that is actually involved in your ticket.

Do not assume the first matching filename contains the whole behaviour. Follow the request until you
can explain where the current result comes from.

## Investigate before changing

Use existing tests, a debugger or temporary diagnostic output to test your understanding. A
diagnostic is information added temporarily to show what the application is doing, such as a
`console.log` value.

Remove temporary diagnostics before committing unless they have a lasting operational purpose.

## Make the smallest justified change

Change only what the ticket needs. Avoid unrelated cleanup that makes the review larger. Keep names
descriptive and introduce an abstraction—a shared function, class or layer—only when it represents a
real responsibility rather than hiding a few simple lines.

Never add real Deloitte or client data, code, endpoints or documentation.

## Run focused tests

Run the test file or named behaviour closest to your change while investigating. The
[testing guide](docs/testing.md) explains focused test commands and how to read failures.

Add or update a test when the expected observable behaviour changes.

## Run broader verification

For frontend and documentation changes, run from the repository root:

```bash
npm run format:check
npm run check:frontend
```

For API changes:

```bash
cd api
./mvnw verify
cd ..
```

Broader verification checks more than the one behaviour you changed. Update documentation when a
learner-facing command or behaviour changes.

## Inspect your changes

A **diff** is Git's line-by-line representation of what changed. Before selecting anything for a
commit, inspect the working tree—the files as they currently exist on your computer:

```bash
git status
git diff
```

Look for unrelated edits, generated files, credentials and real client information.

## Stage and commit the change

The Git **staging area** contains the changes selected for the next commit. A **commit** is a recorded
snapshot of those staged changes with a message explaining its purpose.

Stage each intended file explicitly, replacing the example path with a real changed file:

```bash
git add path/to/file
```

Then inspect the selection:

```bash
git status
git diff --staged
```

Only commit after the staged diff contains the intended change:

```bash
git commit -m "DEV-123: Fix postcode validation"
```

Git records your configured name and email in the commit. Follow the
[GitHub identity guide](docs/github-identity.md) before your first commit.

A pull request may contain several sensible commits; it does not need to contain exactly one.

## Push the branch and open a pull request

**Push** copies your local commits to the shared GitHub repository. `origin` is Git's usual short
name for that shared repository:

```bash
git push -u origin DEV-123
```

The `-u` option connects the local and remote branches so later pushes can use `git push`.

Open GitHub in your browser, create a pull request from `DEV-123` into `main` and use the ticket
reference and title:

```text
DEV-123: Fix postcode validation
```

Complete the pull request template. Explain the behaviour changed, why the change was needed, how
you tested it, then replace `Closes #` with the real GitHub issue number. Do not put the delivery
ticket number after `#` unless it is also the issue number.

## Read CI results

**Continuous integration**, usually shortened to **CI**, runs the repository's automated checks on
GitHub. A CI **job** groups related work, and each named **step** runs one action or command. The
commands are defined in files under `.github/workflows`:

- `ci.yml` runs the same frontend and API checks used locally;
- `dependency-review.yml` checks whether a pull request introduces a known vulnerable dependency;
  and
- `codeql.yml` examines JavaScript, TypeScript and Java for recognised security problems.

These checks support review; a green result does not prove that a change is correct or remove the
need to understand it.

If CI fails:

1. Open the failed job and find the first failed step.
2. Read the first meaningful error in that step's log.
3. Find the equivalent command in the workflow file and run it locally.
4. Fix the cause and rerun the local check.
5. Commit and push the focused follow-up change.

Do not repeatedly rerun CI without understanding why it failed. A local pass is useful evidence,
but compare tool versions and environment details when CI behaves differently.

### Repository rules maintained in GitHub

The workflow files define the checks, but a repository administrator must configure the rules that
decide when a pull request may be merged. The intended rules are:

- branch names use `DEV-[number]`;
- changes to `main` go through a pull request;
- frontend, API and security checks must pass;
- review conversations must be resolved;
- one approval is required when multiple reviewers are available; and
- force pushes to `main` are not allowed.

These rules belong in GitHub's repository settings. A file in this repository could describe them
but could not enforce them, so no pretend local configuration is included.

### Dependabot pull requests

Dependabot checks npm, Maven and GitHub Actions dependencies each week and may open update pull
requests. Treat one like any other proposed change: understand what is changing, read relevant
release notes, wait for CI and manually check affected behaviour when appropriate. Do not merge an
automated pull request solely because it was created by a bot.

## Respond to review

Code review is a conversation about the proposed change. Ask when a comment's intent is unclear,
make focused follow-up changes and explain a decision that may not be obvious from the code.

A useful technical question includes:

- the behaviour you expected;
- the behaviour you observed;
- relevant commands, errors or other evidence; and
- what you have already investigated or tried.

You do not need to solve the problem before asking. Clear evidence helps another developer join the
investigation.
