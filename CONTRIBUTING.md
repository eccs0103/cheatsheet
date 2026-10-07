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
| `invalid.json`                   | A broken sheet; add it together with others to see the error report                                                                                             |
| `multilingual.json`              | 330 questions in English, Russian, Armenian, German, French and Spanish, with long texts and several correct answers                                            |
| `accents.json`                   | Diacritics and other scripts; try `missisipi`, `massachusets`, `tchaikovski`, `kirgizstan`, `guernika`, `rythm`, `lodz`, `tromso`, `istanbul`, `ελλαδας`, `еще` |
| `stress.json`                    | 14 000 giant questions (several long sentences, 4–8 answers each, 22 MB); on its own it exceeds what the old local-storage library could hold                   |
