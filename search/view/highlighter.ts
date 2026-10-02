"use strict";

import "adaptive-extender/web";
import { type Token } from "../models/token.js";

//#region Highlighter
export class Highlighter {
	static #name: string = "search";
	#highlight: Highlight = new Highlight();

	paint(container: HTMLElement, results: readonly (readonly Token[] | null)[]): void {
		const highlight = this.#highlight;
		highlight.clear();
		CSS.highlights.set(Highlighter.#name, highlight);
		const spans = container.querySelectorAll("article.question > span.text");
		spans.forEach((span, index) => {
			const tokens = results[index];
			if (tokens === null) return;
			const node = span.firstChild;
			if (!(node instanceof Text)) return;
			for (const token of tokens) {
				highlight.add(token.range(node));
			}
		});
	}
}
//#endregion
