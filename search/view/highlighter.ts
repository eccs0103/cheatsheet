"use strict";

import "adaptive-extender/web";
import { type Mark } from "../models/mark.js";

//#region Highlighter
export class Highlighter {
	static #name: string = "search";
	#highlight: Highlight = new Highlight();

	paint(container: HTMLElement, results: readonly (readonly Mark[] | null)[]): void {
		const highlight = this.#highlight;
		highlight.clear();
		CSS.highlights.set(Highlighter.#name, highlight);
		for (const article of container.getElements(HTMLElement, "article.question:not([hidden])")) {
			const marks = results[Number(article.dataset.index)];
			if (marks === null) continue;
			const node = article.getElement(HTMLElement, "span.text").firstChild;
			if (!(node instanceof Text)) continue;
			for (const mark of marks) {
				highlight.add(mark.range(node));
			}
		}
	}
}
//#endregion
