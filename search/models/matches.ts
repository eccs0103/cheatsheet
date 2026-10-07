"use strict";

import "adaptive-extender/web";
import { type Mark } from "./mark.js";

//#region Matches
/** The questions that match a query, in sheet order, each with the marks to highlight. */
export class Matches {
	#marks: Map<number, readonly Mark[]> = new Map();

	static all(count: number): Matches {
		const matches = new Matches();
		for (let position = 0; position < count; position++) {
			matches.add(position, []);
		}
		return matches;
	}

	get count(): number { return this.#marks.size; }

	add(position: number, marks: readonly Mark[]): void {
		this.#marks.set(position, marks);
	}

	marks(position: number): readonly Mark[] {
		const marks = this.#marks.get(position);
		if (marks === undefined) throw new ReferenceError(`Question ${position} does not match`);
		return marks;
	}

	first(count: number): number[] {
		return this.#marks.keys().take(count).toArray();
	}
}
//#endregion
