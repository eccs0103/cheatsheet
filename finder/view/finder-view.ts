"use strict";

import "adaptive-extender/web";
import { type Poll } from "../../library/models/poll.js";
import { type Query } from "../services/query.js";
import { DOMBuilder } from "./dom-builder.js";

//#region Poll card
class PollCard {
	#poll: Poll;
	#articleCard: HTMLElement;
	#bQuestion: HTMLElement;

	constructor(parent: Element, poll: Poll, incorrect: boolean) {
		this.#poll = poll;
		const articleCard = this.#articleCard = DOMBuilder.newCard(parent);
		this.#bQuestion = DOMBuilder.newQuestion(articleCard, poll.question);
		const ulCases = DOMBuilder.newCases(articleCard);
		for (const { text, correctness } of poll.visible(incorrect)) {
			DOMBuilder.newCase(ulCases, text, correctness);
		}
	}

	filter(query: Query): void {
		const { question } = this.#poll;
		this.#articleCard.hidden = !query.matches(question);
		this.#bQuestion.replaceChildren(...query.split(question).map(segment => segment.toNode()));
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
