"use strict";

import "adaptive-extender/core";
import { Case } from "../../library/models/case.js";
import { Poll } from "../../library/models/poll.js";
import { Sheet } from "../../library/models/sheet.js";

//#region Draft line
class DraftLine {
	static #pattern: RegExp = /^(\d+)\.\s*(.+)$/;
	#number: number;
	#content: string;

	constructor(number: number, content: string) {
		this.#number = number;
		this.#content = content;
	}

	get empty(): boolean {
		return this.#content.length === 0;
	}

	toQuestion(): string {
		return this.#content;
	}

	toCase(): Case {
		const match = DraftLine.#pattern.exec(this.#content);
		if (match === null) throw new SyntaxError(`Line ${this.#number}: expected an answer like "1. Correct answer" or "0. Wrong answer"`);
		const [, mark, text] = match;
		return new Case(text.trim(), Number(mark) !== 0);
	}

	toPoll(cases: readonly DraftLine[]): Poll {
		if (cases.length === 0) throw new SyntaxError(`Line ${this.#number}: the question "${this.#content}" has no answers`);
		return new Poll(this.toQuestion(), cases.map(line => line.toCase()));
	}
}
//#endregion
//#region Sheet draft
/**
 * A sheet written in the plain text format: polls are separated by blank lines, the first line of a poll is its question, and every next line is an answer marked `1.` (correct) or `0.` (wrong).
 */
export class SheetDraft {
	#title: string;
	#text: string;

	constructor(title: string, text: string) {
		this.#title = title;
		this.#text = text;
	}

	static from(sheet: Sheet): SheetDraft {
		return new SheetDraft(sheet.title, sheet.polls.map(poll => SheetDraft.#format(poll)).join("\n\n"));
	}

	static #format(poll: Poll): string {
		const answers = poll.cases.map(item => `${Number(item.correctness)}. ${SheetDraft.#flatten(item.text)}`);
		return [SheetDraft.#flatten(poll.question), ...answers].join("\n");
	}

	static #flatten(text: string): string {
		return text.replace(/\s*\n\s*/g, " ").trim();
	}

	static #blocks(text: string): DraftLine[][] {
		const blocks: DraftLine[][] = [];
		let block: DraftLine[] = [];
		for (const [index, content] of text.split(/\r?\n/).entries()) {
			const line = new DraftLine(index + 1, content.trim());
			if (!line.empty) {
				block.push(line);
				continue;
			}
			if (block.length === 0) continue;
			blocks.push(block);
			block = [];
		}
		if (block.length > 0) blocks.push(block);
		return blocks;
	}

	get title(): string {
		return this.#title;
	}

	get text(): string {
		return this.#text;
	}

	get problem(): string | null {
		try {
			this.toSheet();
			return null;
		} catch (reason) {
			if (!(reason instanceof SyntaxError)) throw reason;
			return reason.message;
		}
	}

	get sheet(): Sheet | null {
		if (this.problem !== null) return null;
		return this.toSheet();
	}

	toSheet(): Sheet {
		const polls = SheetDraft.#blocks(this.#text).map(([question, ...cases]) => question.toPoll(cases));
		return new Sheet(this.#title.trim(), polls);
	}
}
//#endregion
