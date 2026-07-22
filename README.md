# GitHub PR Linker

An [Obsidian](https://obsidian.md) plugin that turns GitHub pull request references into Markdown links.

Write a reference like `repo#1234`, select it, run the **Link GitHub pull request** command, and it becomes:

```md
[repo#1234](https://github.com/owner/repo/pull/1234)
```

## Supported formats

```text
repo#123
owner/repo#123
```

- `repo#123` uses the **Default GitHub owner** from the plugin settings.
- `owner/repo#123` links to that owner directly, ignoring the default.
- Owner and repository names may contain letters, numbers, hyphens, underscores, and periods.
- The pull request number must contain only digits.

The selected text is preserved as the link label, so `octocat/hello-world#789` becomes:

```md
[octocat/hello-world#789](https://github.com/octocat/hello-world/pull/789)
```

If nothing is selected, the selection does not match a supported format, or no default owner is configured for an ownerless reference, the plugin shows a notice and leaves your text untouched.

## Installation

### Manual installation

1. Download `main.js` and `manifest.json` from the latest release (or build them yourself, see below).
2. Create the folder `<your-vault>/.obsidian/plugins/github-pr-linker/`.
3. Copy `main.js` and `manifest.json` into that folder.
4. In Obsidian, open **Settings → Community plugins**, refresh the list of installed plugins, and enable **GitHub PR Linker**.

## Usage

1. Open **Settings → GitHub PR Linker** and set your **Default GitHub owner** (your GitHub username or organization, e.g. `thequietmind`).
2. In a note, type a pull request reference such as `today#123` or `owner/repo#456`.
3. Select the reference.
4. Open the command palette (`Cmd/Ctrl+P`) and run **Link GitHub pull request**.

The selection is replaced with a Markdown link to the pull request on GitHub.

### Assigning a keyboard shortcut

1. Open **Settings → Hotkeys**.
2. Search for `Link GitHub pull request`.
3. Click the plus icon next to the command and press your preferred key combination, e.g. `Cmd+Shift+L`.

## Development

Requires [Node.js](https://nodejs.org) and npm.

```bash
npm install
```

- `npm run dev` — build in watch mode with inline sourcemaps.
- `npm run build` — typecheck and produce a minified production `main.js`.
- `npm test` — run the unit tests with Vitest.

To test the plugin in a vault, clone this repository into `<your-vault>/.obsidian/plugins/github-pr-linker/`, run `npm install` and `npm run build`, then enable the plugin in Obsidian.

## License

[MIT](LICENSE) © [Quiet Mind Creative, Inc.](https://quietmindcreative.com)
