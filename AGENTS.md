# libfy project guidance

- The user prefers dark mode. Keep the website dark by default and apply the theme consistently across all components and native controls.
- Make a meaningful commit and push it to `https://github.com/DroitXenon/libfy.git` after each completed development stage.
- Edit files in `src/`, then regenerate `dist/` with `node scripts/build.mjs` before committing.
- Run `node --test`, `node --check src/app.js`, and the production build for functional changes. Check desktop and mobile layouts for visual changes.
