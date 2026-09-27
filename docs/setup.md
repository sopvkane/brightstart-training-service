# Set up the repository

Use this guide if one of the tool checks in the README is missing or reports the wrong version. If
all four checks pass, return to the [README](../README.md) and continue the quick start.

## Check where your terminal is

A terminal runs commands inside a particular folder. Most commands in this repository must run
from the **repository root**: the main `brightstart-training-service` folder containing `README.md`,
`package.json`, `frontend` and `api`.

On macOS or Linux, show the current folder and its contents with:

```bash
pwd
ls
```

On Windows PowerShell, use:

```powershell
Get-Location
Get-ChildItem
```

If you opened the project in VS Code, use **Terminal → New Terminal** to open a terminal in the
workspace. Confirm its contents before running installation commands.

## Required tools

| Tool                       | Version                   | Why this project needs it                                   |
| -------------------------- | ------------------------- | ----------------------------------------------------------- |
| Node.js                    | 22                        | Runs the TypeScript frontend and its development tools      |
| npm                        | 10                        | Installs Node.js dependencies and runs frontend commands    |
| Java Development Kit (JDK) | 17                        | Compiles, tests and runs the Java API application           |
| Git                        | Current supported version | Records changes and supports the branch and review workflow |

The known-good versions are Node.js 22.23.3, npm 10.9.9 and Eclipse Temurin Java 17. Temurin is a
distribution of the Java Development Kit; other supported Java 17 distributions should also work.

Check the installed versions:

```bash
node --version
npm --version
java -version
git --version
```

The Node.js output should begin with `v22.`, the npm output with `10.`, and the Java output should
identify version 17.

If a managed training laptop has a missing or incorrect tool, follow the installation instructions
provided by your organisation or ask the facilitator. Do not install a different version or bypass
the repository's version checks without understanding why.

## Continue when the checks pass

Once `node --version`, `npm --version`, `java -version` and `git --version` show the expected
versions, return to [Start here → Step 2](../README.md#2-install-the-nodejs-dependencies) in the
README.

If a check still fails, use the [troubleshooting guide](troubleshooting.md) to collect useful
evidence before asking for help.
