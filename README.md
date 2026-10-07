# Cheatsheet
A program for solving tests. Live at [cheatsheet.eccs.dev](https://cheatsheet.eccs.dev/).

[Changelog](./CHANGELOG.md) · [Contributing](./CONTRIBUTING.md)

## Guide
To use the program, a sheet is required. The sheet must be a JSON file with the following structure:
```ts
interface Answer {
	text: string;
	correctness: boolean;
}

interface Question {
	question: string;
	cases: Answer[];
}

interface Sheet {
	title: string;
	polls: Question[];
}
```
Example of a valid JSON structure:
```json
{
	"title": "Sheet title",
	"polls": [
		{
			"question": "Question 1",
			"cases": [
				{ "text": "Answer 1 for question 1", "correctness": true },
				{ "text": "Answer 2 for question 1", "correctness": false },
				{ "text": "Answer 3 for question 1", "correctness": true },
				{ "text": "Answer 4 for question 1", "correctness": false }
			]
		},
		{
			"question": "Question 2",
			"cases": [
				{ "text": "Answer 1 for question 2", "correctness": true },
				{ "text": "Answer 2 for question 2", "correctness": false },
				{ "text": "Answer 3 for question 2", "correctness": false },
				{ "text": "Answer 4 for question 2", "correctness": false },
				{ "text": "Answer 5 for question 2", "correctness": true },
				{ "text": "Answer 6 for question 2", "correctness": false }
			]
		}
	]
}
```
...and can be added in the **Library** (Add sheet → *From device* or *From a link*). Several files can be added at once; a broken file is reported and skipped while the others are still added. The sheets are kept in the browser's IndexedDB, one record per sheet, so their size is limited only by the browser's storage quota, and the list of sheets is kept in local storage, so the library opens without reading the sheets themselves. A library saved by an older version is moved there on the first visit.

Only this format is supported; the legacy formats of earlier versions are no longer read.

Sheets can also be created and edited in the **Editor** (Add sheet → *From scratch*, or edit mode → mark one sheet → *Edit*): add and remove questions and answers, and mark each answer as correct or wrong.

Selected sheets can be downloaded or shared. Where the browser cannot share `.json` files, *Share* is disabled with a hint to download the sheets and send them yourself.

Opening a sheet leads to the **Search** page. It searches the questions as you type, highlights the matched parts, and the settings tune how:
- **Skip words** (on by default): the typed words must appear in the typed order, other words may stand between them. Off: the typed text must match as one phrase.
- **Typo tolerance** (on by default): a word may be misspelled; longer words tolerate more typos (one per 4 letters beyond the first), counting missing, extra, wrong and swapped letters.
- **Case sensitive** and **Accent sensitive** (off by default): `ё` finds `е`, `sao` finds `São`, `lodz` finds `Łódź`.
- **Incorrect answers** (on by default): show the incorrect answers next to the correct ones.

Press <kbd>Esc</kbd> to clear the search. Large sheets render the first 50 matches and add more while scrolling.
