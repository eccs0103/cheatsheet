"use strict";

import "adaptive-extender/web";
import { type ChangeEvent, type ReactElement } from "react";
import { type Case } from "../../library/models/case.js";

//#region Case editor
export interface CaseEditorProps {
	id: string;
	item: Case;
	onChange(): void;
	onRemove(item: Case): void;
}

export function CaseEditor({ id, item, onChange, onRemove }: CaseEditorProps): ReactElement {
	const toggle = (): void => {
		item.toggle();
		onChange();
	};

	const rewrite = (event: ChangeEvent<HTMLInputElement>): void => {
		item.text = event.currentTarget.value;
		onChange();
	};

	const remove = (): void => {
		if (!window.confirm("The case cannot be restored. Are you sure?")) return;
		onRemove(item);
	};

	return (
		<div className="case flex alt-center with-inline-gap small-gap">
			<input id={id} type="checkbox" hidden checked={item.correctness} onChange={toggle} />
			<label htmlFor={id} role="checkbox" aria-checked={item.correctness} className="check flex alt-center" title="Mark as correct">
				<span className="icon with-padding small-padding">Mark</span>
			</label>
			<input type="text" required placeholder="Case" className="depth rounded with-padding" value={item.text} onChange={rewrite} />
			<button type="button" className="remove flex alt-center" title="Delete case" onClick={remove}>
				<span className="icon with-padding small-padding">Delete case</span>
			</button>
		</div>
	);
}
//#endregion
