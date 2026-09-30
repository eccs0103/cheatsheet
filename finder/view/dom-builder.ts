"use strict";

import "adaptive-extender/web";

//#region DOM builder
export class DOMBuilder {
	static newCard(parent: Element): HTMLElement {
		const articleCard = parent.appendChild(document.createElement("article"));
		articleCard.classList.add("poll", "layer", "rounded", "with-padding", "flex", "column", "with-gap");
		return articleCard;
	}

	static newQuestion(parent: Element, text: string): HTMLElement {
		const bQuestion = parent.appendChild(document.createElement("b"));
		bQuestion.textContent = text;
		return bQuestion;
	}

	static newCases(parent: Element): HTMLUListElement {
		const ulCases = parent.appendChild(document.createElement("ul"));
		ulCases.classList.add("flex", "column", "small-gap", "with-gap");
		return ulCases;
	}

	static newCase(parent: HTMLUListElement, text: string, correctness: boolean): HTMLLIElement {
		const liCase = parent.appendChild(document.createElement("li"));
		liCase.classList.toggle("highlight", correctness);
		liCase.classList.toggle("alert", !correctness);
		liCase.textContent = text;
		return liCase;
	}
}
//#endregion
