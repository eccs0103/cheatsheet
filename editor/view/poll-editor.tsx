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
	onChange(): void;
	onRemove(poll: Poll): void;
}

export function PollEditor({ index, poll, onChange, onRemove }: PollEditorProps): ReactElement {
	const handleQuestion = (event: ChangeEvent<HTMLInputElement>): void => {
		poll.question = event.currentTarget.value;
		onChange();
	};

	const handleAppend = (text: string): void => {
		poll.append(text);
		onChange();
	};

	const handleRemoveCase = (item: Case): void => {
		poll.remove(item);
		onChange();
	};

	const handleRemove = (): void => {
		if (!window.confirm("The poll cannot be restored. Are you sure?")) return;
		onRemove(poll);
	};

	return (
		<>
			<div className="poll">
				<input type="text" required placeholder="Question" className="question with-padding" value={poll.question} onChange={handleQuestion} />
				<div className="cases">
					{poll.cases.map((item, position) => <CaseEditor key={position} id={`mark-${index}-${position}`} item={item} onChange={onChange} onRemove={handleRemoveCase} />)}
					<InsertRow placeholder="Input the case" title="Add case" small={true} onInsert={handleAppend} />
				</div>
			</div>
			<button type="button" className="remove flex alt-center" title="Delete poll" onClick={handleRemove}>
				<span className="icon with-padding small-padding">Delete poll</span>
			</button>
		</>
	);
}
//#endregion
