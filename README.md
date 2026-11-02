# libfy

Find suitable open-source libraries for your next project.

## Development

Requires Node.js 22 or newer. No dependencies to install.

```sh
node scripts/serve.mjs
```

Open http://localhost:3000.

## Build

```sh
node scripts/build.mjs
```

The static website is generated in `dist/`.

## Features

- Search 12 curated libraries by name, use case, category, and language.
- Describe a project to find relevant libraries using local keyword matching.
- Bookmark libraries in a collection saved in this browser.
- Compare up to three libraries, including use cases and tradeoffs.
- Read library details, copy installation commands, and open official documentation.

The catalog lives in `src/catalog.js`. It is a curated starting point; package metadata is not fetched live. Project matching runs locally and does not call an AI service. Collections use localStorage and are not synchronized between devices.

## Verification

```sh
node --test
node --check src/app.js
node scripts/build.mjs
```

## Project structure

- `src/`: editable HTML, CSS, JavaScript, and catalog data.
- `scripts/serve.mjs`: dependency-free development server.
- `scripts/build.mjs`: copies application assets to `dist/`.
- `tests/`: catalog search and matching checks.
- `dist/`: generated static site, ready for static hosting.
