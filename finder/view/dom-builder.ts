"use strict";

import "adaptive-extender/web";

//#region DOM builder
export class DOMBuilder {
	static newCard(parent: Element): HTMLElement {
		const articleCard = parent.appendChild(document.createElement("article"));
		articleCard.classList.add("poll", "layer", "rounded", "with-padding", "with-inline-gap");
		return articleCard;
	}

	static newQuestion(parent: Element, text: string): HTMLElement {
		const spanQuestion = parent.appendChild(document.createElement("span"));
		spanQuestion.classList.add("question");
		spanQuestion.textContent = text;
		return spanQuestion;
	}

	static newCases(parent: Element): HTMLUListElement {
		const ulCases = parent.appendChild(document.createElement("ul"));
		ulCases.classList.add("cases");
		return ulCases;
	}

	static newCase(parent: HTMLUListElement, text: string, correctness: boolean): HTMLLIElement {
		const liCase = parent.appendChild(document.createElement("li"));
		liCase.classList.add("case", "with-inline-gap");
		const spanText = liCase.appendChild(document.createElement("span"));
		spanText.classList.toggle("highlight", correctness);
		spanText.classList.toggle("alert", !correctness);
		spanText.textContent = text;
		return liCase;
	}
}
//#endregion
