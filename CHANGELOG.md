## 3.0.0 (05.10.2026)
- Rebuilt the whole site: the **Library**, **Search**, **Editor** and **Settings** pages, a new design, and a light or dark theme chosen in the settings (the system's by default).
- The library is kept in the browser's IndexedDB, one record per sheet, so it is limited only by the browser's storage quota instead of local storage. A library saved by 2.x is moved there on the first visit.
- Added sheets from a link (Add sheet → *From a link*); opening `?import=<address>` adds the sheet and opens it, and the same link later refreshes it instead of adding a copy.
- Several files can be added at once; a broken file is reported and skipped while the others are still added.
- Selected sheets can be downloaded or shared. Where the browser cannot share `.json` files, *Share* is disabled with a hint to download the sheets and send them yourself.
- Added the **Editor**: create a sheet from scratch or edit an existing one, add and remove questions and answers, and mark each answer as correct or wrong.
- Search now matches as you type and highlights the matched parts, with new settings: **Skip words**, **Typo tolerance**, **Case sensitive**, **Accent sensitive** and **Incorrect answers**.
- Press <kbd>Esc</kbd> to clear the search. Large sheets render the first 50 matches and add more while scrolling.
- The old `/finder/` address now redirects to `/search/`.
- **Breaking:** only the `title` / `polls` / `question` / `cases` / `text` / `correctness` sheet format is read; the legacy formats of earlier versions are no longer converted.

## 2.0.0 (24.02.2024)
- Core updated (Adaptive Core 2.6.0).
- Processes accelerated with asynchronous operations.
- Website structure improved.
- Image preloading added.
- Multiple correct answer support added in polls.
- New sheet format utilized. Old format will be automatically converted to the new one.

## 1.3.5 (13.04.2023)
- Improved list validation.
- Enhanced group management.

## 1.2.8 (04.04.2023)
- Core updated.
- Preparation for the introduction of a new structure.

## 1.2.5 (05.03.2023)
- Theme management added.
- Various errors fixed.

## 1.2.4 (15.02.2023)
- HTML structure improved.
- Group management functionality enhanced.
- Smartphone adaptability issue fixed.
- Case sensitivity control during search added.
- Quick search feature improved.
- Settings reset option added.
- Information list updated.
- CSS structure improved.
- Adaptive theme integrated.
- Modules rewritten.
- JavaScript structure optimized.
- Data loading from cloud and device improved.
- Unstable functions removed.
- Settings stability improved during updates.
- Error descriptions improved.

## 1.1.10 (13.01.2023)
- Search speed improved with data preloading.
- Sheet scanning accelerated with data preloading.
- Group management enhanced.
- Popup style changed.

## 1.1.7 (12.01.2023)
- Settings display error fixed.
- Sheet display improved; issue preventing sheet opening resolved.
- Ability to download local sheets added.
- Group management feature added.
- Multiple sheet upload from device enabled.

## 1.1.4 (11.01.2023)
- Single-choice questions can now be directly passed as a string in JSON format. The correct answer number should correspond to index 0.
- Sheet scanning method improved.
- Date input during sheet creation automated upon import.
- Question and answer display enhanced.
- Support for old sheet formats discontinued; automatic conversion to new format.

## 1.1.0 (02.01.2023)
- Design revamped.
- Ability to upload sheets from device added.
- Minor bugs fixed.
- Error handling system improved.

## 1.0.2 (24.12.2022)
- Metadata updated.
- Design slightly refreshed.

## 1.0.0 (21.12.2022)
- Design adapted for mobile devices, tablets, and computers.
- Ability to delete sheets added.
- Scroll bar style changed.
