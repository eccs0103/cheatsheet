"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement } from "react";
import { type Case } from "../../library/models/case.js";
import { type Poll } from "../../library/models/poll.js";
import { CaseEditor } from "./case-editor.js";
import { InsertRow } from "./insert-row.js";

//#region Poll editor
export interface PollEditorProps {
	index: number;
	poll: Poll;
	focused: boolean;
	onChange(): void;
	onRemove(poll: Poll): void;
}

export function PollEditor({ index, poll, focused, onChange, onRemove }: PollEditorProps): ReactElement {
	const rephrase = (event: ChangeEvent<HTMLInputElement>): void => {
		poll.question = event.currentTarget.value;
		onChange();
	};

	const append = (text: string): void => {
		poll.append(text);
		onChange();
	};

	const drop = (item: Case): void => {
		poll.remove(item);
		onChange();
	};

	const discard = (): void => {
		if (!window.confirm("The poll cannot be restored. Are you sure?")) return;
		onRemove(poll);
	};

	return (
		<article className="poll layer rounded with-padding">
			<span className="number description">{index + 1}</span>
			<input type="text" required placeholder="Question" className="question depth rounded with-padding" value={poll.question} onChange={rephrase} />
			<button type="button" className="remove alert flex alt-center" title="Delete poll" onClick={discard}>
				<span className="icon with-padding small-padding">Delete poll</span>
			</button>
			<div className="cases flex column with-block-gap small-gap">
				{poll.cases.map((item, position) => <CaseEditor key={position} id={`mark-${index}-${position}`} item={item} onChange={onChange} onRemove={drop} />)}
				<InsertRow placeholder="Input the case" title="Add case" small={true} focused={focused} onInsert={append} />
			</div>
		</article>
	);
}
//#endregion
