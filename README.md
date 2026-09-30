# Cheatsheet
A program for solving tests. Live at [cheatsheet.eccs.dev](https://cheatsheet.eccs.dev/).
- - -
## Guide
To use the program, a sheet is required. The sheet must be a JSON file with the following structure:
```ts
interface Case {
	text: string;
	correctness: boolean;
}

interface Poll {
	question: string;
	cases: Case[];
}

interface Sheet {
	title: string;
	polls: Poll[];
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
...and can be loaded from the device or imported using a link.

Polls in the legacy formats are still read and converted: `{ "question", "answer": 1, "cases": ["a", "b"] }` (the case at index `answer` is correct) and `{ "question", "answer": 0, "cases": "a" }` (a single case, correct when `answer` is 0).

Sheets can also be written in the **Editor** (library → Add → *Write in editor*, or edit mode → mark one sheet → *Edit selection*) using a plain text format: polls are separated by blank lines, the first line is the question, and every next line is an answer marked `1.` (correct) or `0.` (wrong):
```
What is the capital of Armenia?
1. Yerevan
0. Gyumri

Which of these numbers are prime?
1. 2
1. 3
0. 4
```
Ready-made sheets for manual testing live in `resources/examples/` and are served at `/examples/…`, e.g. `http://localhost:5173/examples/capitals.json` for *Import from cloud*.
- - -
## Development
```
npm install
npm run dev        # Vite dev server (the root redirect only works in preview and production)
npm run typecheck
npm run build
npm run preview    # production build served through the Cloudflare worker
npm run deploy     # build and deploy to cheatsheet.eccs.dev
```
- - -
## Feed
### Update 2.0.0 (24.02.2024) : Adaptive Core 2.6.0
- Core updated.
- Processes accelerated with asynchronous operations.
- Website structure improved.
- Image preloading added.
- Multiple correct answer support added in polls.
- New sheet format utilized. Old format will be automatically converted to the new one.

### Update 1.3.5 (13.04.2023)
- Improved list validation.
- Enhanced group management.

### Update 1.2.8 (04.04.2023)
- Core updated.
- Preparation for the introduction of a new structure.

### Update 1.2.5 (05.03.2023)
- Theme management added.
- Various errors fixed.

### Update 1.2.4 (15.02.2023)
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

### Update 1.1.10 (13.01.2023)
- Search speed improved with data preloading.
- Sheet scanning accelerated with data preloading.
- Group management enhanced.
- Popup style changed.

### Update 1.1.7 (12.01.2023)
- Settings display error fixed.
- Sheet display improved; issue preventing sheet opening resolved.
- Ability to download local sheets added.
- Group management feature added.
- Multiple sheet upload from device enabled.

### Update 1.1.4 (11.01.2023)
- Single-choice questions can now be directly passed as a string in JSON format. The correct answer number should correspond to index 0.
- Sheet scanning method improved.
- Date input during sheet creation automated upon import.
- Question and answer display enhanced.
- Support for old sheet formats discontinued; automatic conversion to new format.

### Update 1.1.0 (02.01.2023)
- Design revamped.
- Ability to upload sheets from device added.
- Minor bugs fixed.
- Error handling system improved.

### Update 1.0.2 (24.12.2022)
- Metadata updated.
- Design slightly refreshed.

### Update 1.0.0 (21.12.2022)
- Design adapted for mobile devices, tablets, and computers.
- Ability to delete sheets added.
- Scroll bar style changed.

