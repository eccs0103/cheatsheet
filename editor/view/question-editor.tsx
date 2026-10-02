"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement } from "react";
import { type Answer } from "../../library/models/answer.js";
import { type Question } from "../../library/models/question.js";
import { AnswerEditor } from "./answer-editor.js";
import { InsertRow } from "./insert-row.js";
import { type Keys } from "./keys.js";

//#region Question editor
export interface QuestionEditorProps {
	number: number;
	question: Question;
	keys: Keys;
	focused: boolean;
	onChange(): void;
	onRemove(question: Question): void;
}

export function QuestionEditor({ number, question, keys, focused, onChange, onRemove }: QuestionEditorProps): ReactElement {
	const rephrase = (event: ChangeEvent<HTMLInputElement>): void => {
		question.text = event.currentTarget.value;
		onChange();
	};

	const append = (text: string): void => {
		question.append(text);
		onChange();
	};

	const drop = (answer: Answer): void => {
		question.remove(answer);
		onChange();
	};

	const discard = (): void => {
		if (!window.confirm("The question cannot be restored. Are you sure?")) return;
		onRemove(question);
	};

	return (
		<article className="question layer rounded with-padding">
			<span className="number description">{number}</span>
			<input type="text" required placeholder="Question" className="text depth rounded with-padding" value={question.text} onChange={rephrase} />
			<button type="button" className="remove alert flex alt-center" title="Delete question" onClick={discard}>
				<span className="icon with-padding small-padding">Delete question</span>
			</button>
			<div className="answers flex column with-block-gap small-gap">
				{question.answers.map(answer => <AnswerEditor key={keys.of(answer)} id={`mark-${keys.of(answer)}`} answer={answer} onChange={onChange} onRemove={drop} />)}
				<InsertRow placeholder="Input the answer" title="Add answer" small={true} focused={focused} onInsert={append} />
			</div>
		</article>
	);
}
//#endregion
