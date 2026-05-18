# Local Go Links — Raycast Extension

Open URLs from short aliases stored in a JSON file you own.

**Fully local.** No network calls. No sync. No account. The extension reads
your JSON file from disk at invocation time and resolves the alias entirely
in memory before opening the URL in your default browser.

## One-time setup

### 1. Install pnpm

Pick one:

- Homebrew: `brew install pnpm`
- Corepack (ships with Node 16+): `corepack enable && corepack prepare pnpm@latest --activate`

Verify: `pnpm --version`

> Why pnpm only: this project intentionally avoids `npm` and `yarn` to reduce
> exposure to recent npm-ecosystem supply-chain attacks. If you see Raycast
> docs say `npm install`, translate to `pnpm install`.

### 2. Create your local go-links file

The default location is `~/go-links.json`. A starter is included at
`examples/go-links.example.json`:

```
cp examples/go-links.example.json ~/go-links.json
```

Or open `~/go-links.json` in your editor and paste:

```json
{
  "short": "https://somefullurl.com",
  "j": "https://jira.com?ticket={0}",
  "other": "https://{0}.otherfullurl.com"
}
```

You can change the file location later in Raycast → Settings → Extensions →
Local Go Links → "Go Links File".

## Run in development mode

From this directory:

```
pnpm install
pnpm dev
```

`pnpm dev` runs `ray develop` under the hood. Raycast picks up the extension,
registers the two commands, and hot-reloads on every save.

Stop dev mode with `Ctrl+C`.

## Commands provided

| Command | Mode | What it does |
|---|---|---|
| **Open Local Go Link** | `no-view` | Type `alias arg1 arg2`, browser opens. Fastest path. |
| **List Local Go Links** | `view` | Searchable list of all aliases; shows the source file path. |

## Template syntax

| JSON entry | Type `j PROJ-123` | Resulting URL |
|---|---|---|
| `"j": "https://jira.com?ticket={0}"` | one arg | `https://jira.com?ticket=PROJ-123` |
| `"other": "https://{0}.otherfullurl.com"` | one arg | `https://foo.otherfullurl.com` |
| `"gh": "https://github.com/{0}/{1}"` | two args | `https://github.com/user/repo` |
| `"short": "https://somefullurl.com"` | no args | `https://somefullurl.com` |

Placeholders are positional: `{0}` is the first whitespace-separated token
after the alias, `{1}` is the second, and so on. Each argument value is
URL-encoded; the URL template itself is not.

## Errors you might see

| Toast | What it means |
|---|---|
| "Local go-links file not found" | Create the file at the path shown. |
| "is not valid JSON" | Usually a trailing comma or unquoted key. |
| "No local alias 'xyz'" | Add the alias to your JSON file. |
| "needs more arguments" | Type more whitespace-separated values after the alias. |
| "Refusing to open non-HTTP URL" | The resolved URL didn't start with `http://` or `https://`. |

## Build, lint, format

```
pnpm build      # bundled production build
pnpm lint       # report problems
pnpm fix-lint   # auto-fix what can be fixed
```

## Why "Local"?

Many organizations run a "go links" service (Google's internal `go/`,
Trotto, GoLinks.com, etc.) that resolves aliases server-side. This extension
deliberately does the opposite: your aliases live in a single JSON file you
edit yourself, with zero network involvement. The "Local" prefix on every
command title makes the contract visible.
