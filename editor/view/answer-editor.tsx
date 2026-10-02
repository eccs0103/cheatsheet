"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement } from "react";
import { type Answer } from "../../library/models/answer.js";

//#region Answer editor
export interface AnswerEditorProps {
	id: string;
	answer: Answer;
	onChange(): void;
	onRemove(answer: Answer): void;
}

export function AnswerEditor({ id, answer, onChange, onRemove }: AnswerEditorProps): ReactElement {
	const toggle = (): void => {
		answer.toggle();
		onChange();
	};

	const rewrite = (event: ChangeEvent<HTMLInputElement>): void => {
		answer.text = event.currentTarget.value;
		onChange();
	};

	const remove = (): void => {
		if (!window.confirm("The answer cannot be restored. Are you sure?")) return;
		onRemove(answer);
	};

	return (
		<div className="answer flex alt-center with-inline-gap small-gap">
			<input id={id} type="checkbox" hidden checked={answer.correct} onChange={toggle} />
			<label htmlFor={id} role="checkbox" aria-checked={answer.correct} className="check flex alt-center" title="Mark as correct">
				<span className="icon with-padding small-padding">Mark</span>
			</label>
			<input type="text" required placeholder="Answer" className="depth rounded with-padding" value={answer.text} onChange={rewrite} />
			<button type="button" className="remove flex alt-center" title="Delete answer" onClick={remove}>
				<span className="icon with-padding small-padding">Delete answer</span>
			</button>
		</div>
	);
}
//#endregion
