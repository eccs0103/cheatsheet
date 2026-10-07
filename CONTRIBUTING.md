# Contributing

## Development
```
npm install
npm run dev        # Vite dev server (the root redirect only works in preview and production)
npm run typecheck
npm run build
npm run preview    # production build served through the Cloudflare worker
npm run deploy     # build and deploy to cheatsheet.eccs.dev
```

## Example sheets
Ready-made sheets for manual testing live in `resources/examples/` and are served at `/examples/…`, e.g. `http://localhost:5173/examples/capitals.json` for *From a link*:

| File                             | What it tests                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `capitals.json`, `untitled.json` | A small sheet, and one without a title                                                                                                                          |
| `large.json`                     | About a hundred similar questions                                                                                                                               |
| `invalid.json`                   | A broken sheet; add it together with others to see the error report                                                                                             |
| `multilingual.json`              | 330 questions in English, Russian, Armenian, German, French and Spanish, with long texts and several correct answers                                            |
| `accents.json`                   | Diacritics and other scripts; try `missisipi`, `massachusets`, `tchaikovski`, `kirgizstan`, `guernika`, `rythm`, `lodz`, `tromso`, `istanbul`, `ελλαδας`, `еще` |
| `stress-10k.json`                | 10 000 questions                                                                                                                                                |
| `stress-14k.json`                | 14 220 questions; together with `stress-10k` it exceeds what the old local-storage library could hold                                                           |
