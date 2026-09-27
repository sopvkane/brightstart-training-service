# Git and GitHub identity

Git records who created each change. GitHub also needs to know who you are and whether you may
access a repository. These three related ideas are easy to confuse:

- Your GitHub account is the account used on github.com.
- Git authentication proves that you may download changes from, or upload changes to, a
  repository.
- Git commit identity is the name and email written into each commit, which is a saved set of
  changes in the repository's history.

Changing one does not automatically change the others.

Authentication may use a browser sign-in, an access token or an SSH key, depending on how your
machine is set up. Access tokens and the private part of an SSH key are credentials: they prove your
identity and must be kept secret. Ask your facilitator which sign-in method your team uses.

## Inspect the identity for this repository

From the repository root, run:

```bash
git config --local --get user.name
git config --local --get user.email
```

`--local` means the setting applies only to this repository. If either command prints nothing, Git
may use your global identity. A global setting is the default for all repositories used by your
computer account. See where a value comes from:

```bash
git config --show-origin --get user.name
git config --show-origin --get user.email
```

## Set a repository-specific identity

Use your own details, not the example values below:

```bash
git config --local user.name "Example Apprentice"
git config --local user.email "apprentice@example.com"
```

A clone is the local copy created when you download a Git repository. Repository-local settings
affect only this clone. They are useful when your work and personal projects require different
identities.

Choose an email address associated with your GitHub account if you want GitHub to connect commits
to that account. You may use a GitHub-provided private `noreply` address if appropriate for your
account and organisation.

Never copy another person's identity. Never put credentials, access tokens or private keys in files
that will be committed to the repository.

## Check before committing

```bash
git config user.name
git config user.email
git status
```

The author shown by `git log -1 --format='%an <%ae>'` describes an existing commit. It does not prove
that your next commit will use the same identity.

Return to [Contributing](../CONTRIBUTING.md) when these checks show your own name and email address.
