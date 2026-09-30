"use strict";

import "adaptive-extender/web";
import { type Poll } from "../../library/models/poll.js";
import { type Query } from "../services/query.js";

//#region Poll card
class PollCard {
	#poll: Poll;
	#articlePoll: HTMLElement;
	#bQuestion: HTMLElement;

	constructor(parent: Element, poll: Poll, incorrect: boolean) {
		this.#poll = poll;
		const articlePoll = this.#articlePoll = parent.appendChild(document.createElement("article"));
		articlePoll.classList.add("poll", "layer", "rounded", "with-padding", "flex", "column", "with-gap");
		const bQuestion = this.#bQuestion = articlePoll.appendChild(document.createElement("b"));
		bQuestion.textContent = poll.question;
		const ulCases = articlePoll.appendChild(document.createElement("ul"));
		ulCases.classList.add("flex", "column", "small-gap", "with-gap");
		for (const { text, correctness } of poll.visible(incorrect)) {
			const liCase = ulCases.appendChild(document.createElement("li"));
			liCase.classList.toggle("highlight", correctness);
			liCase.classList.toggle("alert", !correctness);
			liCase.textContent = text;
		}
	}

	filter(query: Query): void {
		const { question } = this.#poll;
		this.#articlePoll.hidden = !query.matches(question);
		this.#bQuestion.replaceChildren(...query.split(question).map(segment => {
			if (!segment.marked) return document.createTextNode(segment.text);
			const markSegment = document.createElement("mark");
			markSegment.textContent = segment.text;
			return markSegment;
		}));
	}
}
//#endregion
//#region Finder view
export class FinderView {
	#cards: PollCard[];

	constructor(parent: Element, polls: readonly Poll[], incorrect: boolean) {
		this.#cards = polls.map(poll => new PollCard(parent, poll, incorrect));
	}

	filter(query: Query): void {
		for (const card of this.#cards) {
			card.filter(query);
		}
	}
}
//#endregion
